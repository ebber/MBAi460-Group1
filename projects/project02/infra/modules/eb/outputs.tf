# Phase 1 (IAM) + Phase 2 (Application + Environment) outputs.

# ── Phase 1: IAM ─────────────────────────────────────────────────────────────

output "service_role_arn" {
  description = "ARN of the EB service role; consumed by EB environment's ServiceRole setting."
  value       = aws_iam_role.eb_service_role.arn
}

output "service_role_name" {
  description = "Name of the EB service role."
  value       = aws_iam_role.eb_service_role.name
}

output "ec2_role_arn" {
  description = "ARN of the EB EC2 role."
  value       = aws_iam_role.eb_ec2_role.arn
}

output "ec2_role_name" {
  description = "Name of the EB EC2 role."
  value       = aws_iam_role.eb_ec2_role.name
}

output "ec2_instance_profile_name" {
  description = "Name of the EC2 instance profile; consumed by EB environment's IamInstanceProfile setting."
  value       = aws_iam_instance_profile.eb_ec2_profile.name
}

output "ec2_instance_profile_arn" {
  description = "ARN of the EC2 instance profile."
  value       = aws_iam_instance_profile.eb_ec2_profile.arn
}

# ── Phase 2: Application + Environment ───────────────────────────────────────

output "application_name" {
  description = "EB application name."
  value       = aws_elastic_beanstalk_application.photoapp.name
}

output "environment_name" {
  description = "EB environment name."
  value       = aws_elastic_beanstalk_environment.photoapp_env.name
}

output "cname" {
  description = "EB environment CNAME (the bare hostname). Use 'endpoint_url' for the http:// URL."
  value       = aws_elastic_beanstalk_environment.photoapp_env.cname
}

output "endpoint_url" {
  description = "Full http:// URL for the EB environment. Use this to populate photoapp-client-config.ini's webservice= setting per PDF §15."
  value       = "http://${aws_elastic_beanstalk_environment.photoapp_env.cname}"
}

output "solution_stack_name" {
  description = "Resolved EB solution stack name (e.g. '64bit Amazon Linux 2023 v6.x.x running Node.js 24'). Useful for verifying the platform Terraform picked."
  value       = data.aws_elastic_beanstalk_solution_stack.nodejs24.name
}
