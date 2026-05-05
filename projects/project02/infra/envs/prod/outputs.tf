output "rds_address" {
  value = module.rds.address
}

output "rds_endpoint" {
  value = module.rds.endpoint
}

output "s3_bucket_name" {
  value = module.s3.bucket_name
}

output "s3readonly_access_key_id" {
  value     = module.iam.s3readonly_access_key_id
  sensitive = true
}

output "s3readonly_secret_access_key" {
  value     = module.iam.s3readonly_secret_access_key
  sensitive = true
}

output "s3readwrite_access_key_id" {
  value     = module.iam.s3readwrite_access_key_id
  sensitive = true
}

output "s3readwrite_secret_access_key" {
  value     = module.iam.s3readwrite_secret_access_key
  sensitive = true
}

output "cloudwatch_server_log_group" {
  value = module.cloudwatch.server_log_group_name
}
