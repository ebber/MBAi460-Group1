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
  count  = var.enable_core_infra ? 1 : 0
  source = "../../modules/rds"

  db_identifier      = var.db_identifier
  db_master_username = var.db_master_username
  db_master_password = var.db_master_password
  tags               = local.common_tags
}

module "s3" {
  count  = var.enable_core_infra ? 1 : 0
  source = "../../modules/s3"

  bucket_name             = var.bucket_name
  upload_test_images_path = null # seed test images manually or via tools/seed-images.sh
  tags                    = local.common_tags
}

module "iam" {
  count  = var.enable_core_infra ? 1 : 0
  source = "../../modules/iam"

  bucket_name               = var.bucket_name
  s3_read_write_policy_path = "${path.root}/../../policies/s3-read-write-policy.json"
  tags                      = local.common_tags
}

module "cloudwatch" {
  count  = var.enable_core_infra ? 1 : 0
  source = "../../modules/cloudwatch"

  log_group_prefix = "/photoapp/project02/dev"
  retention_days   = 7
  tags             = local.common_tags
}

module "elastic_beanstalk" {
  count  = var.enable_elastic_beanstalk ? 1 : 0
  source = "../../modules/elastic-beanstalk"

  application_name     = var.eb_application_name
  environment_name     = var.eb_environment_name
  solution_stack_name  = var.eb_solution_stack_name
  instance_type        = var.eb_instance_type
  vpc_id               = var.eb_vpc_id
  subnet_ids           = var.eb_subnet_ids
  artifact_bucket_name = var.eb_artifact_bucket_name
  bundle_path          = var.eb_bundle_path
  version_label        = var.eb_version_label
  app_policy_arns      = var.eb_app_policy_arns
  create_iam_roles     = var.eb_create_iam_roles

  existing_service_role_name         = var.eb_existing_service_role_name
  existing_ec2_instance_profile_name = var.eb_existing_ec2_instance_profile_name

  # The EB bundle stages photoapp-config.ini at app root.
  photoapp_config_path = "/var/app/current/photoapp-config.ini"
  node_env             = "production"
  health_system_type   = "basic"
  tags                 = local.common_tags
}
