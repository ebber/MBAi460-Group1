data "aws_iam_policy_document" "eb_service_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["elasticbeanstalk.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "eb_ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

locals {
  service_role_name = var.create_iam_roles ? aws_iam_role.service_role[0].name : var.existing_service_role_name
  ec2_profile_name  = var.create_iam_roles ? aws_iam_instance_profile.ec2_profile[0].name : var.existing_ec2_instance_profile_name
}

resource "aws_s3_bucket" "artifacts" {
  bucket        = var.artifact_bucket_name
  force_destroy = true

  tags = merge(var.tags, { Name = var.artifact_bucket_name })
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_object" "app_bundle" {
  bucket = aws_s3_bucket.artifacts.id
  key    = "elastic-beanstalk/${var.application_name}/${var.version_label}.zip"
  source = var.bundle_path
  etag   = filemd5(var.bundle_path)
}

resource "aws_iam_role" "service_role" {
  count = var.create_iam_roles ? 1 : 0

  name               = "${var.application_name}-eb-service-role"
  assume_role_policy = data.aws_iam_policy_document.eb_service_assume_role.json

  tags = merge(var.tags, { Name = "${var.application_name}-eb-service-role" })
}

resource "aws_iam_role_policy_attachment" "service_role_enhanced_health" {
  count = var.create_iam_roles ? 1 : 0

  role       = aws_iam_role.service_role[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role_policy_attachment" "service_role_managed_updates" {
  count = var.create_iam_roles ? 1 : 0

  role       = aws_iam_role.service_role[0].name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy"
}

resource "aws_iam_role" "ec2_role" {
  count = var.create_iam_roles ? 1 : 0

  name               = "${var.application_name}-eb-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.eb_ec2_assume_role.json

  tags = merge(var.tags, { Name = "${var.application_name}-eb-ec2-role" })
}

resource "aws_iam_role_policy_attachment" "ec2_web_tier" {
  count = var.create_iam_roles ? 1 : 0

  role       = aws_iam_role.ec2_role[0].name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy_attachment" "ec2_app_policies" {
  for_each = var.create_iam_roles ? toset(var.app_policy_arns) : toset([])

  role       = aws_iam_role.ec2_role[0].name
  policy_arn = each.value
}

resource "aws_iam_instance_profile" "ec2_profile" {
  count = var.create_iam_roles ? 1 : 0

  name = "${var.application_name}-eb-ec2-profile"
  role = aws_iam_role.ec2_role[0].name

  tags = merge(var.tags, { Name = "${var.application_name}-eb-ec2-profile" })
}

resource "aws_elastic_beanstalk_application" "app" {
  name        = var.application_name
  description = "Terraform-managed Elastic Beanstalk application for ${var.application_name}"

  tags = var.tags
}

resource "aws_elastic_beanstalk_application_version" "version" {
  name        = var.version_label
  application = aws_elastic_beanstalk_application.app.name
  bucket      = aws_s3_bucket.artifacts.id
  key         = aws_s3_object.app_bundle.key

  depends_on = [aws_s3_object.app_bundle]
}

resource "aws_elastic_beanstalk_environment" "env" {
  name                = var.environment_name
  application         = aws_elastic_beanstalk_application.app.name
  solution_stack_name = var.solution_stack_name
  version_label       = aws_elastic_beanstalk_application_version.version.name

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = local.ec2_profile_name
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = var.vpc_id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", var.subnet_ids)
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = local.service_role_name
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }

  setting {
    namespace = "aws:elasticbeanstalk:healthreporting:system"
    name      = "SystemType"
    value     = var.health_system_type
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = var.node_env
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PHOTOAPP_CONFIG_PATH"
    value     = var.photoapp_config_path
  }

  tags = var.tags
}
