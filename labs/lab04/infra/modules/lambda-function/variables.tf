variable "function_name" {
  type = string
}

variable "role_name" {
  type = string
}

variable "source_file" {
  type = string
}

variable "handler" {
  type = string
}

variable "lab_project_permissions_boundary_arn" {
  type = string
}

variable "managed_policy_arns" {
  type    = list(string)
  default = []
}

variable "layer_arns" {
  type    = list(string)
  default = []
}

variable "runtime" {
  type    = string
  default = "python3.12"
}

variable "timeout" {
  type    = number
  default = 300
}

variable "tags" {
  type    = map(string)
  default = {}
}
