# Phase 1 outputs (IAM only). Phase 2 will add: endpoint_url (CNAME),
# application_name, environment_name, application_version_label.

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
