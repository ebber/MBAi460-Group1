provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

locals {
  common_tags = {
    Course      = "mbai460"
    Environment = "lab04"
    ManagedBy   = "terraform"
  }

  lab_root            = abspath("${path.module}/../../..")
  lambda_common_file  = "${local.lab_root}/lambda_common.py"
}

module "requests_layer" {
  source = "../../modules/lambda-layer-requests"
}

module "analyze" {
  source = "../../modules/lambda-function"

  function_name                        = "analyze"
  role_name                            = "lab-project04-analyze-role"
  source_file                          = "${local.lab_root}/analyze.py"
  shared_module_file                   = local.lambda_common_file
  handler                              = "analyze.lambda_handler"
  lab_project_permissions_boundary_arn = var.lab_project_permissions_boundary_arn
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/AmazonRekognitionFullAccess",
  ]
  tags = local.common_tags
}

module "weather" {
  source = "../../modules/lambda-function"

  function_name                        = "weather"
  role_name                            = "lab-project04-weather-role"
  source_file                          = "${local.lab_root}/weather.py"
  shared_module_file                   = local.lambda_common_file
  handler                              = "weather.lambda_handler"
  lab_project_permissions_boundary_arn = var.lab_project_permissions_boundary_arn
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
  ]
  layer_arns   = [module.requests_layer.layer_arn]
  timeout      = 30
  memory_size  = 128
  tags         = local.common_tags
}

module "api" {
  source = "../../modules/api-services"

  stage_name            = var.api_stage_name
  analyze_function_name = module.analyze.function_name
  analyze_invoke_arn      = module.analyze.invoke_arn
  weather_function_name = module.weather.function_name
  weather_invoke_arn      = module.weather.invoke_arn
  tags                  = local.common_tags
}
