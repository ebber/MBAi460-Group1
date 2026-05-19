variable "api_name" {
  type    = string
  default = "ServicesAPI"
}

variable "stage_name" {
  type    = string
  default = "prod"
}

variable "analyze_function_name" {
  type = string
}

variable "analyze_invoke_arn" {
  type = string
}

variable "weather_function_name" {
  type = string
}

variable "weather_invoke_arn" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
