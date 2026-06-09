provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

locals {
  common_tags = {
    Course    = "mbai460"
    Project   = "project03-part01"
    ManagedBy = "terraform"
  }
  # envs/dev -> infra -> project03
  lambda_src = abspath("${path.module}/../../../lambda")
  layers_dir = abspath("${path.module}/../../../layers")
}

module "bcrypt_layer" {
  source     = "../../modules/lambda-layer"
  layer_name = "authsvc-bcrypt-layer"
  zip_path   = "${local.layers_dir}/bcrypt-layer.zip"
}

module "pymysql_layer" {
  source     = "../../modules/lambda-layer"
  layer_name = "authsvc-pymysql-layer"
  zip_path   = "${local.layers_dir}/pymysql-layer.zip"
}

module "authenticate" {
  source = "../../modules/lambda-authenticate"

  lambda_src_dir                       = local.lambda_src
  rds_address                          = var.rds_address
  layer_arns                           = [module.bcrypt_layer.layer_arn, module.pymysql_layer.layer_arn]
  lab_project_permissions_boundary_arn = var.lab_project_permissions_boundary_arn
  tags                                 = local.common_tags
}

module "api" {
  source = "../../modules/api-authsvc"

  authenticate_function_name = module.authenticate.function_name
  authenticate_invoke_arn    = module.authenticate.invoke_arn
  tags                       = local.common_tags
}
