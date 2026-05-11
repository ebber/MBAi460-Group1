# Terraform module: eb (Application + Environment portion — Phase 2)
#
# Provisions the Elastic Beanstalk application + environment for the
# Project 02 PhotoApp deployment, declaratively replacing the manual
# `eb init` / `eb create` / `aws elasticbeanstalk update-environment`
# sequence from project02-part02-EB.pdf §2 and Pranav's
# feat/lab03-eb-scripting Lab 03 templates.
#
# What this owns:
#   - aws_elastic_beanstalk_application.photoapp (the application shell)
#   - aws_elastic_beanstalk_environment.photoapp_env (the running env,
#     with all setting blocks wired to satisfy the PDF requirements:
#     --service-role, --instance_profile, --single, --vpc.id,
#     --vpc.ec2subnets, basic health, photoapp-config.ini path)
#
# What this does NOT own (intentional boundary):
#   - The application bundle (server/*.js + photoapp-config.ini +
#     package.json). The bundle is pushed via `eb deploy` after
#     `terraform apply`, OR (future) via an aws_elastic_beanstalk_application_version
#     resource. On first apply the env runs the AWS sample app until
#     the bundle is uploaded — matches the PDF's --sample flag behavior.

# ── Solution stack (Node.js 24 on Amazon Linux 2023) ─────────────────────────

# Resolves the latest matching solution stack at apply time. To pin a
# specific patch, set var.solution_stack_name_regex to a tighter regex.
data "aws_elastic_beanstalk_solution_stack" "nodejs24" {
  most_recent = true
  name_regex  = var.solution_stack_name_regex
}

# ── EB Application ───────────────────────────────────────────────────────────

resource "aws_elastic_beanstalk_application" "photoapp" {
  name        = var.app_name
  description = var.app_description
  tags        = merge(var.tags, { Name = var.app_name })
}

# ── EB Environment ───────────────────────────────────────────────────────────

resource "aws_elastic_beanstalk_environment" "photoapp_env" {
  name                = var.env_name
  application         = aws_elastic_beanstalk_application.photoapp.name
  solution_stack_name = data.aws_elastic_beanstalk_solution_stack.nodejs24.name
  tags                = merge(var.tags, { Name = var.env_name })

  # ── EC2 launch configuration ──
  # PDF flag equivalents: --instance_profile, default instance type t3.micro
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_ec2_profile.name
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }

  # ── Environment posture ──
  # PDF flag equivalents: --single (SingleInstance), --service-role
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = var.environment_type
  }
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = aws_iam_role.eb_service_role.arn
  }

  # ── VPC placement ──
  # PDF flag equivalents: --vpc.id, --vpc.ec2subnets
  # Same VPC + subnets as the photoapp RDS so the EB EC2 instance can
  # reach it via security-group rules. AssociatePublicIpAddress=true is
  # needed for SingleInstance environments without a load balancer.
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
    namespace = "aws:ec2:vpc"
    name      = "AssociatePublicIpAddress"
    value     = "true"
  }

  # ── Health monitoring ──
  # PDF §11: 'basic' so the autograder's overload tests don't terminate
  # the environment.
  setting {
    namespace = "aws:elasticbeanstalk:healthreporting:system"
    name      = "SystemType"
    value     = var.health_system_type
  }

  # ── Application environment properties ──
  # PHOTOAPP_CONFIG_PATH is required: server/src/photoapp-core/config.js
  # falls back to a monorepo-relative path that doesn't exist on EC2,
  # so we set the absolute path here (Hosting_Plan.md §2.3).
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PHOTOAPP_CONFIG_PATH"
    value     = var.photoapp_config_path
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = var.node_env
  }
  # PORT is set by EB itself; server.js already honors process.env.PORT.

  # ── Lifecycle ──
  # Wait long enough for first-time provisioning + sample-app boot
  # (EB defaults are 30 min for healthy state; explicit for clarity).
  wait_for_ready_timeout = "30m"
}
