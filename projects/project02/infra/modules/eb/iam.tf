# Terraform module: eb (IAM portion — Phase 1)
#
# Provisions the two IAM roles required by Elastic Beanstalk for the
# Project 02 PhotoApp deployment per project02-part02-EB.pdf §1:
#
#   - aws-elasticbeanstalk-service-role: assumed by the EB platform for
#     environment management + health monitoring (NOT by EC2)
#   - aws-elasticbeanstalk-ec2-role: assumed by EC2 instances inside the
#     EB environment for runtime AWS access (web tier, worker tier,
#     multicontainer Docker)
#
# Plus the EC2 instance profile that wraps the EC2 role — the EB
# environment references the *instance profile name*, not the role name.
#
# Pre-existing role caveat (PDF §1 NOTE): some lab accounts already have
# these roles. If `terraform apply` errors with EntityAlreadyExistsException,
# import the existing roles per the README before retrying.

# ── Trust policies ───────────────────────────────────────────────────────────

data "aws_iam_policy_document" "eb_service_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["elasticbeanstalk.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "eb_ec2_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

# ── EB service role (assumed by EB platform) ─────────────────────────────────

resource "aws_iam_role" "eb_service_role" {
  name               = var.eb_service_role_name
  assume_role_policy = data.aws_iam_policy_document.eb_service_trust.json
  tags               = merge(var.tags, { Name = var.eb_service_role_name })
}

resource "aws_iam_role_policy_attachment" "eb_service_enhanced_health" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role_policy_attachment" "eb_service_managed_updates" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy"
}

# ── EB EC2 instance role (assumed by EC2 instances in the EB env) ────────────

resource "aws_iam_role" "eb_ec2_role" {
  name               = var.eb_ec2_role_name
  assume_role_policy = data.aws_iam_policy_document.eb_ec2_trust.json
  tags               = merge(var.tags, { Name = var.eb_ec2_role_name })
}

resource "aws_iam_role_policy_attachment" "eb_ec2_web_tier" {
  role       = aws_iam_role.eb_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy_attachment" "eb_ec2_worker_tier" {
  role       = aws_iam_role.eb_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"
}

resource "aws_iam_role_policy_attachment" "eb_ec2_multicontainer_docker" {
  role       = aws_iam_role.eb_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker"
}

# ── EC2 instance profile (referenced by EB environment) ──────────────────────

resource "aws_iam_instance_profile" "eb_ec2_profile" {
  # Match the role name so the EB env's IamInstanceProfile setting can use
  # the same identifier the PDF references.
  name = var.eb_ec2_role_name
  role = aws_iam_role.eb_ec2_role.name
  tags = merge(var.tags, { Name = var.eb_ec2_role_name })
}
