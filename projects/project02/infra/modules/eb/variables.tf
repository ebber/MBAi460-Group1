# Phase 1 (IAM) + Phase 2 (Application + Environment) variables.

# ── Phase 1: IAM ─────────────────────────────────────────────────────────────

variable "eb_service_role_name" {
  description = "Name for the EB service role. PDF default: 'aws-elasticbeanstalk-service-role'."
  type        = string
  default     = "aws-elasticbeanstalk-service-role"
}

variable "eb_ec2_role_name" {
  description = "Name for the EB EC2 role (and matching instance profile). PDF default: 'aws-elasticbeanstalk-ec2-role'."
  type        = string
  default     = "aws-elasticbeanstalk-ec2-role"
}

# ── Phase 2: EB Application + Environment ───────────────────────────────────

variable "app_name" {
  description = "EB application name. Per Hosting_Plan.md and the PDF naming pattern."
  type        = string
  default     = "photoapp-web-service"
}

variable "env_name" {
  description = "EB environment name. Convention: <app_name>-env."
  type        = string
  default     = "photoapp-web-service-env"
}

variable "app_description" {
  description = "Human-readable description for the EB application."
  type        = string
  default     = "PhotoApp Node.js/Express web service — Project 02 Part 02 deployment"
}

variable "vpc_id" {
  description = "VPC ID for the EB environment. Must be the same VPC as the photoapp RDS so the EB EC2 instance can reach it."
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs (one per AZ) for the EB environment. Use the same subnets as the photoapp RDS."
  type        = list(string)
}

variable "instance_type" {
  description = "EC2 instance type for the EB environment. PDF default: t3.micro."
  type        = string
  default     = "t3.micro"
}

variable "environment_type" {
  description = "EB environment type. 'SingleInstance' matches the PDF's --single flag (no load balancer, lowest cost)."
  type        = string
  default     = "SingleInstance"
}

variable "health_system_type" {
  description = "EB health reporting system. PDF §11 specifies 'basic' so overload tests during the autograder run don't terminate the env."
  type        = string
  default     = "basic"
}

variable "node_env" {
  description = "Value for the NODE_ENV environment variable on EC2."
  type        = string
  default     = "production"
}

variable "photoapp_config_path" {
  description = "Absolute path of photoapp-config.ini on the EC2 instance. EB sets this as a PHOTOAPP_CONFIG_PATH env property so server/src/photoapp-core/config.js can find it (per Hosting_Plan.md §2.3)."
  type        = string
  default     = "/var/app/current/photoapp-config.ini"
}

variable "solution_stack_name_regex" {
  description = "Regex matching the EB solution stack name. Default matches the latest Node.js 24 on AL2023 stack. Pin a specific version here if reproducibility matters more than tracking patches."
  type        = string
  default     = "^64bit Amazon Linux 2023 .* running Node\\.js 24$"
}

# ── Cross-phase ─────────────────────────────────────────────────────────────

variable "tags" {
  description = "Resource tags applied to all module resources."
  type        = map(string)
  default     = {}
}
