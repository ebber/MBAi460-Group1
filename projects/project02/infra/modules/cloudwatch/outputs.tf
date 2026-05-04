output "server_log_group_name" {
  description = "CloudWatch log group for server application logs"
  value       = aws_cloudwatch_log_group.server.name
}

output "access_log_group_name" {
  description = "CloudWatch log group for HTTP access logs"
  value       = aws_cloudwatch_log_group.access.name
}
