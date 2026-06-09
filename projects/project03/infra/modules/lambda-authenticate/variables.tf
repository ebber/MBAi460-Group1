variable "function_name" {
  type    = string
  default = "authenticate"
}

variable "role_name" {
  type    = string
  default = "lab-project-authenticate-role"
}

variable "handler" {
  type    = string
  default = "lambda_function.lambda_handler"
}

variable "runtime" {
  type    = string
  default = "python3.12"
}

variable "architecture" {
  type    = string
  default = "x86_64"
}

variable "timeout" {
  type    = number
  default = 300
}

variable "memory_size" {
  type    = number
  default = 128
}

variable "lambda_src_dir" {
  type        = string
  description = "Absolute path to projects/project03/lambda (the starter .py files)"
}

variable "layer_arns" {
  type    = list(string)
  default = []
}

variable "lab_project_permissions_boundary_arn" {
  type = string
}

variable "managed_policy_arns" {
  type    = list(string)
  default = ["arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"]
}

variable "rds_address" {
  type = string
}

variable "rds_port" {
  type    = string
  default = "3306"
}

variable "region_name" {
  type    = string
  default = "us-east-2"
}

variable "db_name" {
  type    = string
  default = "authsvc"
}

variable "db_user" {
  type    = string
  default = "authsvc-read-write"
}

variable "db_pwd" {
  type    = string
  default = "def456!!"
}

variable "tags" {
  type    = map(string)
  default = {}
}
