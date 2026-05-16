output "rds_address" {
  description = "RDS hostname — paste into photoapp-config.ini [rds] endpoint"
  value       = try(module.rds[0].address, null)
}

output "rds_endpoint" {
  description = "Full RDS endpoint (host:port)"
  value       = try(module.rds[0].endpoint, null)
}

output "s3_bucket_name" {
  description = "S3 bucket name — paste into photoapp-config.ini [s3] bucket_name"
  value       = try(module.s3[0].bucket_name, null)
}

output "s3readonly_access_key_id" {
  description = "Access key ID for s3readonly — paste into photoapp-config.ini [s3readonly]"
  value       = try(module.iam[0].s3readonly_access_key_id, null)
  sensitive   = true
}

output "s3readonly_secret_access_key" {
  value     = try(module.iam[0].s3readonly_secret_access_key, null)
  sensitive = true
}

output "s3readwrite_access_key_id" {
  description = "Access key ID for s3readwrite — paste into photoapp-config.ini [s3readwrite]"
  value       = try(module.iam[0].s3readwrite_access_key_id, null)
  sensitive   = true
}

output "s3readwrite_secret_access_key" {
  value     = try(module.iam[0].s3readwrite_secret_access_key, null)
  sensitive = true
}

output "cloudwatch_server_log_group" {
  value = try(module.cloudwatch[0].server_log_group_name, null)
}

output "elastic_beanstalk_cname" {
  description = "Elastic Beanstalk CNAME. Use http://<value> in photoapp-client-config.ini."
  value       = try(module.elastic_beanstalk[0].cname, null)
}

output "elastic_beanstalk_url" {
  description = "HTTP base URL for the Project02 EB environment."
  value       = try(module.elastic_beanstalk[0].endpoint_url, null)
}

output "elastic_beanstalk_version_label" {
  description = "Deployed Elastic Beanstalk app version label."
  value       = try(module.elastic_beanstalk[0].version_label, null)
}
