variable "bucket_name" {
  description = "S3 bucket name used to scope the read-write policy"
  type        = string
}

variable "s3_read_write_policy_path" {
  description = "Path to the s3-read-write-policy.json.txt template (relative to root module)"
  type        = string
  default     = null
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
