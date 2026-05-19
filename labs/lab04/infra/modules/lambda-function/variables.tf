variable "function_name" {
  type = string
}

variable "role_name" {
  type = string
}

variable "source_file" {
  type = string
}

variable "shared_module_file" {
  description = "Shared Python module packaged alongside the handler (e.g. lambda_common.py)."
  type        = string
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

variable "memory_size" {
  type    = number
  default = 128
}

variable "tags" {
  type    = map(string)
  default = {}
}
