variable "aws_region" {
  type    = string
  default = "us-east-2"
}

variable "aws_profile" {
  type    = string
  default = "Claude-Conjurer"
}

variable "rds_address" {
  type        = string
  description = "Backbone RDS hostname (no port) hosting the authsvc DB (Path A)"
  default     = "photoapp-db.c5q4s860smqq.us-east-2.rds.amazonaws.com"
}

variable "lab_project_permissions_boundary_arn" {
  type    = string
  default = "arn:aws:iam::772360735396:policy/LabProjectPermissionsBoundary"
}
