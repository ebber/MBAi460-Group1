variable "aws_region" {
  description = "AWS region for the provider (IAM is global; region selects STS endpoints for the AWS provider)."
  type        = string
  default     = "us-east-2"
}

variable "aws_profile" {
  description = "Named profile with privileges to create IAM policies and attach them to the lab operator user (Erik/admin for apply; not Claude-Conjurer)."
  type        = string
  default     = null
}

variable "conjurer_user_name" {
  description = "Existing IAM user that receives the delegation policy (Plane 2 operator)."
  type        = string
  default     = "Claude-Conjurer"
}

variable "create_lab_project_eb_roles" {
  description = "When true, create shared Elastic Beanstalk runtime IAM (lab-project-eb-service-role, lab-project-eb-ec2-role, instance profile) with LabProjectPermissionsBoundary. Owned by this bootstrap state; Project02 should then reuse the names with eb_create_iam_roles=false."
  type        = bool
  default     = false
}

variable "lab_project_eb_service_role_name" {
  description = "Name for the shared EB service role created when create_lab_project_eb_roles=true. Must match lab-project-* and the EB module reuse default."
  type        = string
  default     = "lab-project-eb-service-role"

  validation {
    condition     = startswith(var.lab_project_eb_service_role_name, "lab-project-")
    error_message = "lab_project_eb_service_role_name must start with \"lab-project-\" per LAB_PROJECT_IAM_CONTRACT.md."
  }
}

variable "lab_project_eb_ec2_role_name" {
  description = "Name for the shared EB EC2 role created when create_lab_project_eb_roles=true. Must match lab-project-* and be the instance profile basename."
  type        = string
  default     = "lab-project-eb-ec2-role"

  validation {
    condition     = startswith(var.lab_project_eb_ec2_role_name, "lab-project-")
    error_message = "lab_project_eb_ec2_role_name must start with \"lab-project-\" per LAB_PROJECT_IAM_CONTRACT.md."
  }
}
