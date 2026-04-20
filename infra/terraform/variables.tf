variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-2"
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
