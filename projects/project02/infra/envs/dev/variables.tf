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
  sensitive   = true
}

# ── Elastic Beanstalk (Phase 2) ──────────────────────────────────────────────

variable "eb_vpc_id" {
  description = "VPC ID for the EB environment. Must match the photoapp RDS VPC. Source of truth: Pranav's labs/lab03/create.bash on feat/lab03-eb-scripting."
  type        = string
}

variable "eb_subnet_ids" {
  description = "Subnet IDs (one per AZ in us-east-2) for the EB environment. Same VPC as the photoapp RDS."
  type        = list(string)
}

variable "eb_instance_type" {
  description = "EC2 instance type for the EB environment."
  type        = string
  default     = "t3.micro"
}
