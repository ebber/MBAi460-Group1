resource "aws_api_gateway_rest_api" "this" {
  name = var.api_name
  tags = merge(var.tags, { Name = var.api_name })
}

resource "aws_api_gateway_resource" "analysis" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "analysis"
}

resource "aws_api_gateway_method" "analysis_put" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.analysis.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "analysis_put" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.analysis.id
  http_method             = aws_api_gateway_method.analysis_put.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = var.analyze_invoke_arn
}

resource "aws_api_gateway_resource" "weather" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "weather"
}

resource "aws_api_gateway_resource" "country" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.weather.id
  path_part   = "{country}"
}

resource "aws_api_gateway_resource" "city" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.country.id
  path_part   = "{city}"
}

resource "aws_api_gateway_method" "weather_get" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.city.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "weather_get" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.city.id
  http_method             = aws_api_gateway_method.weather_get.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = var.weather_invoke_arn
}

resource "aws_lambda_permission" "analyze" {
  statement_id  = "AllowAPIGatewayInvokeAnalyze"
  action        = "lambda:InvokeFunction"
  function_name = var.analyze_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.this.execution_arn}/*/*"
}

resource "aws_lambda_permission" "weather" {
  statement_id  = "AllowAPIGatewayInvokeWeather"
  action        = "lambda:InvokeFunction"
  function_name = var.weather_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.this.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.analysis.id,
      aws_api_gateway_method.analysis_put.id,
      aws_api_gateway_integration.analysis_put.id,
      aws_api_gateway_resource.weather.id,
      aws_api_gateway_resource.country.id,
      aws_api_gateway_resource.city.id,
      aws_api_gateway_method.weather_get.id,
      aws_api_gateway_integration.weather_get.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.analysis_put,
    aws_api_gateway_integration.weather_get,
    aws_lambda_permission.analyze,
    aws_lambda_permission.weather,
  ]
}

resource "aws_api_gateway_stage" "this" {
  deployment_id = aws_api_gateway_deployment.this.id
  rest_api_id   = aws_api_gateway_rest_api.this.id
  stage_name    = var.stage_name
  tags          = var.tags
}
