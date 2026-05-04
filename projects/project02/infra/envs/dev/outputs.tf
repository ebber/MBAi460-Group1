output "rds_address" {
  description = "RDS hostname — paste into photoapp-config.ini [rds] endpoint"
  value       = module.rds.address
}

output "rds_endpoint" {
  description = "Full RDS endpoint (host:port)"
  value       = module.rds.endpoint
}

output "s3_bucket_name" {
  description = "S3 bucket name — paste into photoapp-config.ini [s3] bucket_name"
  value       = module.s3.bucket_name
}

output "s3readonly_access_key_id" {
  description = "Access key ID for s3readonly — paste into photoapp-config.ini [s3readonly]"
  value       = module.iam.s3readonly_access_key_id
  sensitive   = true
}

output "s3readonly_secret_access_key" {
  value     = module.iam.s3readonly_secret_access_key
  sensitive = true
}

output "s3readwrite_access_key_id" {
  description = "Access key ID for s3readwrite — paste into photoapp-config.ini [s3readwrite]"
  value       = module.iam.s3readwrite_access_key_id
  sensitive   = true
}

output "s3readwrite_secret_access_key" {
  value     = module.iam.s3readwrite_secret_access_key
  sensitive = true
}

output "cloudwatch_server_log_group" {
  value = module.cloudwatch.server_log_group_name
}
