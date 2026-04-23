variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-2"
}

variable "aws_profile" {
  description = "AWS CLI profile for Terraform operations — set in terraform.tfvars or via TF_VAR_aws_profile env var"
  type        = string
  default     = "Claude-Conjurer"
}

variable "bucket_name" {
  description = "S3 bucket name — must start with 'photoapp', globally unique, lowercase only"
  type        = string
}

variable "db_identifier" {
  description = "RDS instance identifier (the server name visible in AWS console)"
  type        = string
}

variable "db_master_username" {
  description = "RDS master username"
  type        = string
  default     = "admin"
}

variable "db_master_password" {
  description = "RDS master password — stored in tfvars (gitignored), never committed"
  type        = string
  sensitive   = true
}
