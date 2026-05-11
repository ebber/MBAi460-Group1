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

# ── Elastic Beanstalk (Phase 2) ──────────────────────────────────────────────

output "eb_application_name" {
  description = "EB application name."
  value       = module.eb.application_name
}

output "eb_environment_name" {
  description = "EB environment name."
  value       = module.eb.environment_name
}

output "eb_endpoint_url" {
  description = "EB endpoint URL (http://CNAME). Paste this into photoapp-client-config.ini's webservice= setting per PDF §15."
  value       = module.eb.endpoint_url
}

output "eb_cname" {
  description = "Bare EB CNAME (no protocol)."
  value       = module.eb.cname
}

output "eb_solution_stack" {
  description = "Resolved EB solution stack name. Verify after first apply that this is the Node.js 24 platform you expect."
  value       = module.eb.solution_stack_name
}
