output "endpoint" {
  description = "Full RDS endpoint (host:port)"
  value       = aws_db_instance.photoapp.endpoint
}

output "address" {
  description = "RDS hostname (no port) — use in photoapp-config.ini [rds] endpoint"
  value       = aws_db_instance.photoapp.address
}

output "port" {
  description = "RDS port"
  value       = aws_db_instance.photoapp.port
}
