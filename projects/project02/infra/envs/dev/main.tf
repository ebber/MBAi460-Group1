# infra/envs/dev/main.tf
# Development environment — calls Project 02 Terraform modules.
# Approach 01-foundation.md § Phase 1.2 skeleton.
# NOTE (D10): no `terraform apply` in Part 01. This config is validated via
# `terraform validate` + `terraform plan` against a mock/empty backend. Real
# apply and state mv land in Part 02 (Elastic Beanstalk deployment workstream).

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state placeholder — S3 backend wired in Part 02.
  # backend "s3" {
  #   bucket         = "mbai460-tfstate"
  #   key            = "project02/dev/terraform.tfstate"
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
    Environment = "dev"
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
  upload_test_images_path = null  # seed test images manually or via tools/seed-images.sh
  tags                    = local.common_tags
}

module "iam" {
  source = "../../modules/iam"

  bucket_name               = var.bucket_name
  s3_read_write_policy_path = "${path.root}/../../policies/s3-read-write-policy.json"
  tags                      = local.common_tags
}

module "cloudwatch" {
  source = "../../modules/cloudwatch"

  log_group_prefix = "/photoapp/project02/dev"
  retention_days   = 7
  tags             = local.common_tags
}

# Elastic Beanstalk infrastructure for Project 02 Part 02 (EB deployment).
# Phase 1 (current): IAM roles + instance profile.
# Phase 2 (pending): aws_elastic_beanstalk_application + environment, with
# vpc_id / subnet_ids / instance_type / solution_stack_name / etc. wired in
# via additional variables in this env stack.
# See modules/eb/README.md for the import workflow if these IAM roles
# already exist in the lab account (per PDF §1 NOTE).
module "eb" {
  source = "../../modules/eb"

  tags = local.common_tags
  # Defaults match the PDF role names (aws-elasticbeanstalk-service-role,
  # aws-elasticbeanstalk-ec2-role); override here only if a parallel team
  # workflow requires distinct names.
}
