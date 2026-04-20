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

# IAM access keys — Project 01 Part 02
# sensitive = true: values hidden in plan/apply output; read via: terraform output -json
output "s3readonly_access_key_id" {
  description = "Access key ID for s3readonly IAM user — write to photoapp-config.ini [s3readonly]"
  value       = aws_iam_access_key.s3readonly.id
  sensitive   = true
}

output "s3readonly_secret_access_key" {
  description = "Secret access key for s3readonly IAM user"
  value       = aws_iam_access_key.s3readonly.secret
  sensitive   = true
}

output "s3readwrite_access_key_id" {
  description = "Access key ID for s3readwrite IAM user — write to photoapp-config.ini [s3readwrite]"
  value       = aws_iam_access_key.s3readwrite.id
  sensitive   = true
}

output "s3readwrite_secret_access_key" {
  description = "Secret access key for s3readwrite IAM user"
  value       = aws_iam_access_key.s3readwrite.secret
  sensitive   = true
}
