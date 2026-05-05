variable "log_group_prefix" {
  description = "CloudWatch log group name prefix (e.g. /photoapp/project02)"
  type        = string
  default     = "/photoapp/project02"
}

variable "retention_days" {
  description = "Log retention in days (0 = never expire)"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
