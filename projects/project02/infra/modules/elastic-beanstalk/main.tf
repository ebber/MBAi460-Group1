data "aws_partition" "current" {}

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

# Lookup the lab permissions boundary by name when no ARN is supplied. Requires
# the Plane-2 bootstrap to have been applied in this account.
data "aws_iam_policy" "lab_permissions_boundary" {
  count = var.create_iam_roles && var.lab_permissions_boundary_arn == "" ? 1 : 0
  name  = var.lab_permissions_boundary_policy_name
}

locals {
  # Single-source naming prefix; mirrors LAB_PROJECT_IAM_CONTRACT.md. Used by
  # plan-time preconditions on the EB roles below.
  #
  # MUST match the twin definition in
  #   infra/bootstrap/plane2-iam-delegation/eb_lab_roles.tf (locals.lab_project_prefix)
  # because Terraform cannot share locals across roots/modules. The drift guard
  # is infra/bootstrap/plane2-iam-delegation/__tests__/prefix-twin.test.sh.
  lab_project_prefix = "lab-project-"

  service_role_name = var.create_iam_roles ? aws_iam_role.service_role[0].name : var.existing_service_role_name
  ec2_profile_name  = var.create_iam_roles ? aws_iam_instance_profile.ec2_profile[0].name : var.existing_ec2_instance_profile_name

  lab_permissions_boundary_arn = var.create_iam_roles ? (
    var.lab_permissions_boundary_arn != "" ? var.lab_permissions_boundary_arn : data.aws_iam_policy.lab_permissions_boundary[0].arn
  ) : null
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

  name                 = var.service_role_name
  assume_role_policy   = data.aws_iam_policy_document.eb_service_assume_role.json
  permissions_boundary = local.lab_permissions_boundary_arn

  tags = merge(var.tags, { Name = var.service_role_name })

  lifecycle {
    precondition {
      condition     = startswith(var.service_role_name, local.lab_project_prefix)
      error_message = "service_role_name must start with \"${local.lab_project_prefix}\" per LAB_PROJECT_IAM_CONTRACT.md."
    }
    precondition {
      condition     = local.lab_permissions_boundary_arn != null && local.lab_permissions_boundary_arn != ""
      error_message = "lab_permissions_boundary_arn is empty and the data source lookup for \"${var.lab_permissions_boundary_policy_name}\" returned nothing. Apply infra/bootstrap/plane2-iam-delegation first or pass lab_permissions_boundary_arn explicitly."
    }
  }
}

resource "aws_iam_role_policy_attachment" "service_role_enhanced_health" {
  count = var.create_iam_roles ? 1 : 0

  role       = aws_iam_role.service_role[0].name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role_policy_attachment" "service_role_managed_updates" {
  count = var.create_iam_roles ? 1 : 0

  role       = aws_iam_role.service_role[0].name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy"
}

resource "aws_iam_role" "ec2_role" {
  count = var.create_iam_roles ? 1 : 0

  name                 = var.ec2_role_name
  assume_role_policy   = data.aws_iam_policy_document.eb_ec2_assume_role.json
  permissions_boundary = local.lab_permissions_boundary_arn

  tags = merge(var.tags, { Name = var.ec2_role_name })

  lifecycle {
    precondition {
      condition     = startswith(var.ec2_role_name, local.lab_project_prefix)
      error_message = "ec2_role_name must start with \"${local.lab_project_prefix}\" per LAB_PROJECT_IAM_CONTRACT.md."
    }
    # Boundary precondition is duplicated from service_role for visual symmetry;
    # both roles consume the same local.lab_permissions_boundary_arn, so either
    # one would surface the gap, but a reader scanning the EC2 role expects the
    # same shape as the service role.
    precondition {
      condition     = local.lab_permissions_boundary_arn != null && local.lab_permissions_boundary_arn != ""
      error_message = "lab_permissions_boundary_arn is empty and the data source lookup for \"${var.lab_permissions_boundary_policy_name}\" returned nothing. Apply infra/bootstrap/plane2-iam-delegation first or pass lab_permissions_boundary_arn explicitly."
    }
  }
}

resource "aws_iam_role_policy_attachment" "ec2_web_tier" {
  count = var.create_iam_roles ? 1 : 0

  role       = aws_iam_role.ec2_role[0].name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy_attachment" "ec2_app_policies" {
  for_each = var.create_iam_roles ? toset(var.app_policy_arns) : toset([])

  role       = aws_iam_role.ec2_role[0].name
  policy_arn = each.value
}

# Instance profile basename matches the EC2 role name so the value lines up with
# Path A outputs and Project02 reuse defaults.
resource "aws_iam_instance_profile" "ec2_profile" {
  count = var.create_iam_roles ? 1 : 0

  name = var.ec2_role_name
  role = aws_iam_role.ec2_role[0].name

  tags = merge(var.tags, { Name = var.ec2_role_name })
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
