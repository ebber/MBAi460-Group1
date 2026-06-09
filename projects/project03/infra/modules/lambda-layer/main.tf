# Generic Lambda layer from a prebuilt zip. Instantiated once per layer
# (bcrypt, pymysql). No Docker/null build — project03 ships committed zips.
resource "aws_lambda_layer_version" "this" {
  layer_name               = var.layer_name
  filename                 = var.zip_path
  source_code_hash         = filebase64sha256(var.zip_path)
  compatible_runtimes      = var.compatible_runtimes
  compatible_architectures = var.compatible_architectures
}
