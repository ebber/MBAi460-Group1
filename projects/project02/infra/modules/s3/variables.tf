variable "bucket_name" {
  description = "S3 bucket name (must be globally unique, lowercase, start with 'photoapp')"
  type        = string
}

variable "upload_test_images_path" {
  description = "Path to directory of .jpg test images to seed. Set to null to skip seeding."
  type        = string
  default     = null
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
