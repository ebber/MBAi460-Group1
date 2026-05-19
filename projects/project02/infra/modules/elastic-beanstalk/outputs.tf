output "application_name" {
  description = "Elastic Beanstalk application name."
  value       = aws_elastic_beanstalk_application.app.name
}

output "environment_name" {
  description = "Elastic Beanstalk environment name."
  value       = aws_elastic_beanstalk_environment.env.name
}

output "cname" {
  description = "Elastic Beanstalk environment CNAME."
  value       = aws_elastic_beanstalk_environment.env.cname
}

output "endpoint_url" {
  description = "HTTP base URL for the deployed EB environment."
  value       = "http://${aws_elastic_beanstalk_environment.env.cname}"
}

output "version_label" {
  description = "Elastic Beanstalk application version label."
  value       = aws_elastic_beanstalk_application_version.version.name
}

output "artifact_bucket_name" {
  description = "S3 bucket holding EB application bundles."
  value       = aws_s3_bucket.artifacts.bucket
}

output "service_role_name" {
  description = "Elastic Beanstalk service role name. Origin: Path A bootstrap (`existing_service_role_name` when `create_iam_roles=false`) or Path B (`service_role_name` when `create_iam_roles=true`). See infra/bootstrap/LAB_PROJECT_IAM_CONTRACT.md."
  value       = local.service_role_name
}

output "ec2_instance_profile_name" {
  description = "Elastic Beanstalk EC2 instance profile name. Origin: Path A bootstrap (`existing_ec2_instance_profile_name`) or Path B (`ec2_role_name`, same basename). See infra/bootstrap/LAB_PROJECT_IAM_CONTRACT.md."
  value       = local.ec2_profile_name
}
