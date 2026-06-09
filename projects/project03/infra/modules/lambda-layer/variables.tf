variable "layer_name" {
  type        = string
  description = "Lambda layer name (e.g. authsvc-bcrypt-layer)"
}

variable "zip_path" {
  type        = string
  description = "Absolute path to the prebuilt layer .zip"
}

variable "compatible_runtimes" {
  type    = list(string)
  default = ["python3.12", "python3.11", "python3.10"]
}

variable "compatible_architectures" {
  type    = list(string)
  default = ["x86_64"]
}
