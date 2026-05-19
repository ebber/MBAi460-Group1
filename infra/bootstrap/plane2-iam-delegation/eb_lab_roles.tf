###############################################################################
# Optional shared EB runtime IAM (Path A in 5_18_IAM_Requirements.md)
#
# When create_lab_project_eb_roles = true, this bootstrap state owns the
# Elastic Beanstalk service role, EC2 role, and instance profile that
# Project02 (and future EB workloads) reuse via:
#
#   eb_create_iam_roles                   = false
#   eb_existing_service_role_name         = "lab-project-eb-service-role"
#   eb_existing_ec2_instance_profile_name = "lab-project-eb-ec2-role"
#
# Mutex: do NOT also set Project02 eb_create_iam_roles = true once these exist
# — that would put two Terraform states in charge of the same role names.
###############################################################################

data "aws_iam_policy_document" "eb_service_assume_role" {
  count = var.create_lab_project_eb_roles ? 1 : 0

  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["elasticbeanstalk.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "eb_ec2_assume_role" {
  count = var.create_lab_project_eb_roles ? 1 : 0

  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lab_project_eb_service" {
  count = var.create_lab_project_eb_roles ? 1 : 0

  name                 = var.lab_project_eb_service_role_name
  description          = "Elastic Beanstalk service role for lab-project workloads; bounded by LabProjectPermissionsBoundary."
  assume_role_policy   = data.aws_iam_policy_document.eb_service_assume_role[0].json
  permissions_boundary = aws_iam_policy.lab_project_permissions_boundary.arn

  tags = {
    Name        = var.lab_project_eb_service_role_name
    Course      = "mbai460"
    Environment = "lab"
    ManagedBy   = "terraform"
    Plane       = "bootstrap-plane2"
    Purpose     = "eb-service-role"
  }
}

resource "aws_iam_role_policy_attachment" "lab_project_eb_service_enhanced_health" {
  count = var.create_lab_project_eb_roles ? 1 : 0

  role       = aws_iam_role.lab_project_eb_service[0].name
  policy_arn = "arn:${local.partition}:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role_policy_attachment" "lab_project_eb_service_managed_updates" {
  count = var.create_lab_project_eb_roles ? 1 : 0

  role       = aws_iam_role.lab_project_eb_service[0].name
  policy_arn = "arn:${local.partition}:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy"
}

resource "aws_iam_role" "lab_project_eb_ec2" {
  count = var.create_lab_project_eb_roles ? 1 : 0

  name                 = var.lab_project_eb_ec2_role_name
  description          = "Elastic Beanstalk EC2 role for lab-project workloads; bounded by LabProjectPermissionsBoundary."
  assume_role_policy   = data.aws_iam_policy_document.eb_ec2_assume_role[0].json
  permissions_boundary = aws_iam_policy.lab_project_permissions_boundary.arn

  tags = {
    Name        = var.lab_project_eb_ec2_role_name
    Course      = "mbai460"
    Environment = "lab"
    ManagedBy   = "terraform"
    Plane       = "bootstrap-plane2"
    Purpose     = "eb-ec2-role"
  }
}

resource "aws_iam_role_policy_attachment" "lab_project_eb_ec2_web_tier" {
  count = var.create_lab_project_eb_roles ? 1 : 0

  role       = aws_iam_role.lab_project_eb_ec2[0].name
  policy_arn = "arn:${local.partition}:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

# Instance profile basename matches the role name so Project02 tfvars and the
# LAB_PROJECT_IAM_CONTRACT examples stay aligned.
resource "aws_iam_instance_profile" "lab_project_eb_ec2" {
  count = var.create_lab_project_eb_roles ? 1 : 0

  name = var.lab_project_eb_ec2_role_name
  role = aws_iam_role.lab_project_eb_ec2[0].name

  tags = {
    Name        = var.lab_project_eb_ec2_role_name
    Course      = "mbai460"
    Environment = "lab"
    ManagedBy   = "terraform"
    Plane       = "bootstrap-plane2"
    Purpose     = "eb-ec2-instance-profile"
  }
}
