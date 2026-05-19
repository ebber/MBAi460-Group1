variable "application_name" {
  description = "Elastic Beanstalk application name."
  type        = string
}

variable "environment_name" {
  description = "Elastic Beanstalk environment name."
  type        = string
}

variable "solution_stack_name" {
  description = "Elastic Beanstalk solution stack. Use a Node.js platform string from aws elasticbeanstalk list-available-solution-stacks."
  type        = string
  default     = "64bit Amazon Linux 2023 v6.5.1 running Node.js 20"
}

variable "instance_type" {
  description = "EC2 instance type for the EB environment."
  type        = string
  default     = "t3.micro"
}

variable "vpc_id" {
  description = "VPC ID for the EB environment."
  type        = string
}

variable "subnet_ids" {
  description = "EC2 subnet IDs for single-instance EB environment."
  type        = list(string)
}

variable "artifact_bucket_name" {
  description = "S3 bucket for EB application versions."
  type        = string
}

variable "bundle_path" {
  description = "Local path to EB app bundle zip created by stage-eb-bundle.sh."
  type        = string
}

variable "version_label" {
  description = "Elastic Beanstalk application version label."
  type        = string
}

variable "photoapp_config_path" {
  description = "Absolute path used by the EB instance to read photoapp-config.ini."
  type        = string
  default     = "/var/app/current/photoapp-config.ini"
}

variable "node_env" {
  description = "NODE_ENV for the EB environment."
  type        = string
  default     = "production"
}

variable "app_policy_arns" {
  description = "Additional policy ARNs to attach to the EB EC2 role for app access."
  type        = list(string)
  default     = []
}

variable "create_iam_roles" {
  description = "When true, create EB service role and EC2 instance profile (Path B). When false, reuse names produced by Path A (bootstrap) or a documented exception."
  type        = bool
  default     = true
}

variable "existing_service_role_name" {
  description = "Existing EB service role name used when create_iam_roles is false. Intentionally unvalidated: the contract permits documented legacy/exception names (e.g. aws-elasticbeanstalk-service-role) so adding a startswith(\"lab-project-\") check here would close the contract's escape hatch."
  type        = string
  default     = ""
}

variable "existing_ec2_instance_profile_name" {
  description = "Existing EB EC2 instance profile name used when create_iam_roles is false. Intentionally unvalidated for the same exception-path reason as existing_service_role_name."
  type        = string
  default     = ""
}

variable "service_role_name" {
  description = "Name for the EB service role created when create_iam_roles is true. Must match the lab-project-* contract."
  type        = string
  default     = "lab-project-eb-service-role"

  validation {
    condition     = startswith(var.service_role_name, "lab-project-")
    error_message = "service_role_name must start with \"lab-project-\" per infra/bootstrap/LAB_PROJECT_IAM_CONTRACT.md."
  }
}

variable "ec2_role_name" {
  description = "Name for the EB EC2 role created when create_iam_roles is true. Also used as the instance profile basename so Project02 tfvars and the bootstrap Path A outputs line up."
  type        = string
  default     = "lab-project-eb-ec2-role"

  validation {
    condition     = startswith(var.ec2_role_name, "lab-project-")
    error_message = "ec2_role_name must start with \"lab-project-\" per infra/bootstrap/LAB_PROJECT_IAM_CONTRACT.md."
  }
}

variable "lab_permissions_boundary_arn" {
  description = "ARN of the LabProjectPermissionsBoundary policy. Required when create_iam_roles=true. If empty, the module looks up the policy by name (LabProjectPermissionsBoundary) via data source — the Plane-2 bootstrap must already be applied in that account."
  type        = string
  default     = ""
}

variable "lab_permissions_boundary_policy_name" {
  description = "Name used for the data-source fallback when lab_permissions_boundary_arn is empty."
  type        = string
  default     = "LabProjectPermissionsBoundary"
}

variable "health_system_type" {
  description = "Elastic Beanstalk health reporting system type."
  type        = string
  default     = "basic"
}

variable "tags" {
  description = "Common tags."
  type        = map(string)
  default     = {}
}
