terraform {
  required_providers {
    aws     = { source = "hashicorp/aws" }
    archive = { source = "hashicorp/archive" }
  }
}

data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# Render the server config from a template; rds_address injected at apply.
locals {
  rendered_config = templatefile("${path.module}/templates/authsvc-config.ini.tftpl", {
    rds_address = var.rds_address
    rds_port    = var.rds_port
    region_name = var.region_name
    db_user     = var.db_user
    db_pwd      = var.db_pwd
    db_name     = var.db_name
  })
}

# Multi-file deployment zip: the 4 starter .py files + the rendered INI.
data "archive_file" "lambda_zip" {
  type        = "zip"
  output_path = "${path.module}/build/${var.function_name}.zip"

  source {
    content  = file("${var.lambda_src_dir}/lambda_function.py")
    filename = "lambda_function.py"
  }
  source {
    content  = file("${var.lambda_src_dir}/datatier.py")
    filename = "datatier.py"
  }
  source {
    content  = file("${var.lambda_src_dir}/auth.py")
    filename = "auth.py"
  }
  source {
    content  = file("${var.lambda_src_dir}/api_utils.py")
    filename = "api_utils.py"
  }
  source {
    content  = local.rendered_config
    filename = "authsvc-config.ini"
  }
}

resource "aws_iam_role" "this" {
  name                 = var.role_name
  assume_role_policy   = data.aws_iam_policy_document.assume.json
  permissions_boundary = var.lab_project_permissions_boundary_arn
  tags                 = merge(var.tags, { Name = var.role_name })
}

resource "aws_iam_role_policy_attachment" "managed" {
  count      = length(var.managed_policy_arns)
  role       = aws_iam_role.this.name
  policy_arn = var.managed_policy_arns[count.index]
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = 7
  tags              = var.tags
}

resource "aws_lambda_function" "this" {
  function_name = var.function_name
  role          = aws_iam_role.this.arn
  handler       = var.handler
  runtime       = var.runtime
  architectures = [var.architecture]
  timeout       = var.timeout
  memory_size   = var.memory_size

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  layers = var.layer_arns

  depends_on = [
    aws_iam_role_policy_attachment.managed,
    aws_cloudwatch_log_group.this,
  ]

  tags = merge(var.tags, { Name = var.function_name })
}
