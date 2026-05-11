# Phase 1 variables (IAM only). Phase 2 will add: vpc_id, subnet_ids,
# instance_type, solution_stack_name, app_name, env_name,
# photoapp_config_path, version_bucket_name, etc.

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

variable "tags" {
  description = "Resource tags applied to all module resources."
  type        = map(string)
  default     = {}
}
