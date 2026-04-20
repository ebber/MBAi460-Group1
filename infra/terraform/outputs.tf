output "s3_bucket_name" {
  description = "S3 bucket name — use in photoapp-config.ini [s3] bucket_name"
  value       = aws_s3_bucket.photoapp.bucket
}

output "s3_bucket_url" {
  description = "S3 bucket base URL"
  value       = "https://${aws_s3_bucket.photoapp.bucket}.s3.${var.aws_region}.amazonaws.com"
}

output "s3_test_image_url" {
  description = "Public URL for smoke-testing — paste in browser to confirm public read"
  value       = "https://${aws_s3_bucket.photoapp.bucket}.s3.${var.aws_region}.amazonaws.com/test/degu.jpg"
}

output "rds_endpoint" {
  description = "Full RDS endpoint (host:port) — use for mysql client connections"
  value       = aws_db_instance.photoapp.endpoint
}

output "rds_address" {
  description = "RDS hostname only (no port) — use in photoapp-config.ini [rds] endpoint"
  value       = aws_db_instance.photoapp.address
}

output "rds_port" {
  description = "RDS port"
  value       = aws_db_instance.photoapp.port
}
