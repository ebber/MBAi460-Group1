output "s3readonly_access_key_id" {
  description = "Access key ID for s3readonly — write to photoapp-config.ini [s3readonly]"
  value       = aws_iam_access_key.s3readonly.id
  sensitive   = true
}

output "s3readonly_secret_access_key" {
  description = "Secret key for s3readonly"
  value       = aws_iam_access_key.s3readonly.secret
  sensitive   = true
}

output "s3readwrite_access_key_id" {
  description = "Access key ID for s3readwrite — write to photoapp-config.ini [s3readwrite]"
  value       = aws_iam_access_key.s3readwrite.id
  sensitive   = true
}

output "s3readwrite_secret_access_key" {
  description = "Secret key for s3readwrite"
  value       = aws_iam_access_key.s3readwrite.secret
  sensitive   = true
}
