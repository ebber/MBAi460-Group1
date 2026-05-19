output "invoke_url" {
  description = "API Gateway stage URL without trailing slash"
  value       = trimsuffix(aws_api_gateway_stage.this.invoke_url, "/")
}

output "rest_api_id" {
  value = aws_api_gateway_rest_api.this.id
}
