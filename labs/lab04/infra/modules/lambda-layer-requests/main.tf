resource "null_resource" "build" {
  triggers = {
    script = filemd5("${path.module}/../../scripts/build-requests-layer.sh")
  }

  provisioner "local-exec" {
    command     = "bash ${path.module}/../../scripts/build-requests-layer.sh"
    working_dir = path.module
  }
}

locals {
  layer_zip = abspath("${path.module}/../../build/requests-layer.zip")
}

resource "aws_lambda_layer_version" "this" {
  depends_on = [null_resource.build]

  layer_name          = "lab-project04-requests-layer"
  compatible_runtimes = ["python3.12", "python3.11", "python3.10"]
  filename            = local.layer_zip
  source_code_hash    = filebase64sha256(local.layer_zip)
}
