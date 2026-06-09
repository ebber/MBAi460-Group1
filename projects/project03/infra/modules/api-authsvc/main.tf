# REST API Gateway: single POST /auth -> authenticate Lambda (AWS_PROXY).
resource "aws_api_gateway_rest_api" "this" {
  name = var.api_name
  tags = merge(var.tags, { Name = var.api_name })
}

resource "aws_api_gateway_resource" "auth" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "auth"
}

resource "aws_api_gateway_method" "auth_post" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.auth.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_post" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.auth.id
  http_method             = aws_api_gateway_method.auth_post.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = var.authenticate_invoke_arn
}

resource "aws_lambda_permission" "auth" {
  statement_id  = "AllowAPIGatewayInvokeAuthenticate"
  action        = "lambda:InvokeFunction"
  function_name = var.authenticate_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.this.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.auth.id,
      aws_api_gateway_method.auth_post.id,
      aws_api_gateway_integration.auth_post.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.auth_post,
    aws_lambda_permission.auth,
  ]
}

resource "aws_api_gateway_stage" "this" {
  deployment_id = aws_api_gateway_deployment.this.id
  rest_api_id   = aws_api_gateway_rest_api.this.id
  stage_name    = var.stage_name
  tags          = var.tags
}
