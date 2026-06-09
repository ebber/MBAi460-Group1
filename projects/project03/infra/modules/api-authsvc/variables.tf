variable "api_name" {
  type    = string
  default = "authsvc-api"
}

variable "stage_name" {
  type    = string
  default = "prod"
}

variable "authenticate_function_name" {
  type = string
}

variable "authenticate_invoke_arn" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
