# infra/envs/prod/main.tf
# Production environment — mirrors dev with production-grade retention settings.
# Approach 01-foundation.md § Phase 1.2 skeleton.
# NOTE (D10): no `terraform apply` in Part 01.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state — S3 backend wired in Part 02.
  # backend "s3" {
  #   bucket         = "mbai460-tfstate"
  #   key            = "project02/prod/terraform.tfstate"
  #   region         = "us-east-2"
  #   dynamodb_table = "mbai460-tfstate-lock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

locals {
  common_tags = {
    Course      = "mbai460"
    Environment = "prod"
    ManagedBy   = "terraform"
  }
}

module "rds" {
  source = "../../modules/rds"

  db_identifier      = var.db_identifier
  db_master_username = var.db_master_username
  db_master_password = var.db_master_password
  tags               = local.common_tags
}

module "s3" {
  source = "../../modules/s3"

  bucket_name             = var.bucket_name
  upload_test_images_path = null
  tags                    = local.common_tags
}

module "iam" {
  source = "../../modules/iam"

  bucket_name               = var.bucket_name
  s3_read_write_policy_path = "${path.root}/../../../../projects/project01/s3-read-write-policy.json.txt"
  tags                      = local.common_tags
}

module "cloudwatch" {
  source = "../../modules/cloudwatch"

  log_group_prefix = "/photoapp/project02/prod"
  retention_days   = 90
  tags             = local.common_tags
}
