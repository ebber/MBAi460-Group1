variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "aws_profile" {
  description = "AWS CLI profile for Terraform operations"
  type        = string
  default     = "Claude-Conjurer"
}

variable "bucket_name" {
  description = "S3 bucket name (must start with 'photoapp', globally unique)"
  type        = string
}

variable "enable_core_infra" {
  description = "When true, create Project02 RDS/S3/IAM/CloudWatch core infra. Set false to reuse existing lab infra for EB-only deployment."
  type        = bool
  default     = true
}

variable "db_identifier" {
  description = "RDS instance identifier"
  type        = string
}

variable "db_master_username" {
  description = "RDS master username"
  type        = string
  default     = "admin"
}

variable "db_master_password" {
  description = "RDS master password — store in terraform.tfvars (gitignored)"
  type        = string
  default     = ""
  sensitive   = true

  validation {
    condition     = !var.enable_core_infra || length(var.db_master_password) > 0
    error_message = "db_master_password is required when enable_core_infra is true."
  }
}

variable "enable_elastic_beanstalk" {
  description = "When true, create the Terraform-native Elastic Beanstalk deployment lane."
  type        = bool
  default     = false
}

variable "eb_application_name" {
  description = "Elastic Beanstalk application name."
  type        = string
  default     = "project02-photoapp"
}

variable "eb_environment_name" {
  description = "Elastic Beanstalk environment name."
  type        = string
  default     = "project02-photoapp-dev"
}

variable "eb_solution_stack_name" {
  description = "Elastic Beanstalk Node.js solution stack."
  type        = string
  default     = "64bit Amazon Linux 2023 v6.5.1 running Node.js 20"
}

variable "eb_instance_type" {
  description = "Elastic Beanstalk EC2 instance type."
  type        = string
  default     = "t3.micro"
}

variable "eb_vpc_id" {
  description = "VPC ID for Elastic Beanstalk. Required when enable_elastic_beanstalk is true."
  type        = string
  default     = ""
}

variable "eb_subnet_ids" {
  description = "Subnet IDs for Elastic Beanstalk. Required when enable_elastic_beanstalk is true."
  type        = list(string)
  default     = []
}

variable "eb_artifact_bucket_name" {
  description = "S3 bucket name for Elastic Beanstalk app versions. Required when enable_elastic_beanstalk is true."
  type        = string
  default     = ""
}

variable "eb_bundle_path" {
  description = "Local path to the EB bundle zip produced by tools/stage-eb-bundle.sh. Required when enable_elastic_beanstalk is true."
  type        = string
  default     = ""
}

variable "eb_version_label" {
  description = "Elastic Beanstalk app version label. Should match the staged bundle version."
  type        = string
  default     = "project02-photoapp-dev"
}

variable "eb_app_policy_arns" {
  description = "Additional policy ARNs for the EB EC2 role. Optional while app uses explicit INI credentials."
  type        = list(string)
  default     = []
}

variable "eb_create_iam_roles" {
  description = "When true, create EB IAM roles. When false, use existing names (Plane-2 contract: lab-project-*; legacy: aws-elasticbeanstalk-*)."
  type        = bool
  default     = false
}

variable "eb_existing_service_role_name" {
  description = "Existing EB service role name when eb_create_iam_roles is false. Default matches LAB_PROJECT_IAM_CONTRACT.md (Plane-2)."
  type        = string
  default     = "lab-project-eb-service-role"
}

variable "eb_existing_ec2_instance_profile_name" {
  description = "Existing EB EC2 instance profile name when eb_create_iam_roles is false. Default matches LAB_PROJECT_IAM_CONTRACT.md (Plane-2)."
  type        = string
  default     = "lab-project-eb-ec2-role"
}
