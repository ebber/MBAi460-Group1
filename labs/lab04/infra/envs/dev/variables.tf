variable "aws_region" {
  type    = string
  default = "us-east-2"
}

variable "aws_profile" {
  type    = string
  default = "Claude-Conjurer"
}

variable "api_stage_name" {
  type    = string
  default = "prod"
}

variable "lab_project_permissions_boundary_arn" {
  description = "From infra/bootstrap/plane2-iam-delegation output lab_project_permissions_boundary_arn"
  type        = string
  default     = "arn:aws:iam::772360735396:policy/LabProjectPermissionsBoundary"
}
