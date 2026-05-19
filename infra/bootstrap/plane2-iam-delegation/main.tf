provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

data "aws_caller_identity" "current" {}
data "aws_partition" "current" {}

data "aws_iam_user" "conjurer" {
  user_name = var.conjurer_user_name
}

locals {
  account_id = data.aws_caller_identity.current.account_id
  partition  = data.aws_partition.current.partition

  # All project-scoped IAM names created/managed by the delegation policy must use this prefix.
  lab_role_arn_prefix             = "arn:${local.partition}:iam::${local.account_id}:role/lab-project-*"
  lab_policy_arn_prefix           = "arn:${local.partition}:iam::${local.account_id}:policy/lab-project-*"
  lab_instance_profile_arn_prefix = "arn:${local.partition}:iam::${local.account_id}:instance-profile/lab-project-*"
  # AWS-managed policies always live in partition-local ARN form (aws / aws-cn / aws-us-gov / …).
  aws_managed_policy_arn_prefix = "arn:${local.partition}:iam::aws:policy/*"
}

###############################################################################
# Permissions boundary — caps effective permissions for lab-project-* roles
# Mirrors a PowerUser-style envelope (broad data-plane) while blocking IAM and
# high-risk governance planes. Explicit Deny guardrails ensure attached policies
# cannot accidentally grant governance or security-plane tampering. Attach ONLY
# to roles, not to the operator user.
###############################################################################

data "aws_iam_policy_document" "lab_project_permissions_boundary" {
  statement {
    sid    = "ProjectRuntimeDataPlane"
    effect = "Allow"
    not_actions = [
      "account:*",
      "aws-portal:*",
      "billing:*",
      "ce:*",
      "consolidatedbilling:*",
      "cur:*",
      "identitystore:*",
      "iam:*",
      "invoicing:*",
      "organizations:*",
      "payments:*",
      "purchase-orders:*",
      "sso:*",
      "sso-directory:*",
      "support:*",
      "support-console:*",
      "tax:*",
    ]
    resources = ["*"]
  }

  # Explicit Deny wins over allows from customer-managed / inline policies on the
  # same role. Agents do not need to self-police: these planes stay off-limits.
  statement {
    sid    = "DenyGovernanceAndSecurityTampering"
    effect = "Deny"
    actions = [
      "access-analyzer:*",
      "account:*",
      "auditmanager:*",
      "aws-portal:*",
      "billing:*",
      "ce:*",
      "cloudtrail:*",
      "cloudtrail-data:*",
      "config:*",
      "consolidatedbilling:*",
      "cur:*",
      "detective:*",
      "fms:*",
      "guardduty:*",
      "iam:*",
      "identitystore:*",
      "inspector2:*",
      "invoicing:*",
      "macie2:*",
      "organizations:*",
      "payments:*",
      "purchase-orders:*",
      "securityhub:*",
      "securitylake:*",
      "shield:*",
      "sso:*",
      "sso-directory:*",
      "support:*",
      "support-console:*",
      "tax:*",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "lab_project_permissions_boundary" {
  name        = "LabProjectPermissionsBoundary"
  description = "Lab-wide permissions boundary for lab-project-* runtime roles. Allow=data-plane (PowerUser-style via NotAction); explicit Deny for IAM/org/billing/SSO and audit/security services (CloudTrail, Config, GuardDuty, etc.)."
  policy      = data.aws_iam_policy_document.lab_project_permissions_boundary.json

  tags = {
    Name        = "LabProjectPermissionsBoundary"
    Course      = "mbai460"
    Environment = "lab"
    ManagedBy   = "terraform"
    Plane       = "bootstrap-plane2"
  }
}

###############################################################################
# Delegation policy — grants Claude-Conjurer scoped IAM administration
###############################################################################

data "aws_iam_policy_document" "claude_conjurer_plane2_iam_delegation" {
  # Customer-managed policies: create/manage only lab-project-* in this account.
  statement {
    sid    = "CustomerManagedPoliciesUnderPrefix"
    effect = "Allow"
    actions = [
      "iam:CreatePolicy",
      "iam:DeletePolicy",
      "iam:GetPolicy",
      "iam:TagPolicy",
      "iam:UntagPolicy",
      "iam:ListPolicyVersions",
      "iam:GetPolicyVersion",
      "iam:CreatePolicyVersion",
      "iam:DeletePolicyVersion",
      "iam:SetDefaultPolicyVersion",
    ]
    resources = [local.lab_policy_arn_prefix]
  }

  # Read AWS-managed policy metadata (plans that reference managed policy ARNs).
  statement {
    sid    = "ReadAwsManagedPolicyDocuments"
    effect = "Allow"
    actions = [
      "iam:GetPolicy",
      "iam:GetPolicyVersion",
      "iam:ListPolicyVersions",
    ]
    resources = [local.aws_managed_policy_arn_prefix]
  }

  # Role creation must attach the lab permissions boundary (cannot be relaxed later without admin).
  statement {
    sid    = "CreateRoleRequiresLabPermissionsBoundary"
    effect = "Allow"
    actions = [
      "iam:CreateRole",
    ]
    resources = [local.lab_role_arn_prefix]
    condition {
      test     = "ArnEquals"
      variable = "iam:PermissionsBoundary"
      values   = [aws_iam_policy.lab_project_permissions_boundary.arn]
    }
  }

  statement {
    sid    = "RolesUnderPrefixMutations"
    effect = "Allow"
    actions = [
      "iam:DeleteRole",
      "iam:GetRole",
      "iam:UpdateRole",
      "iam:UpdateRoleDescription",
      "iam:UpdateAssumeRolePolicy",
      "iam:PutRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:ListAttachedRolePolicies",
      "iam:ListRolePolicies",
      "iam:GetRolePolicy",
      "iam:TagRole",
      "iam:UntagRole",
      "iam:ListRoleTags",
      "iam:ListInstanceProfilesForRole",
    ]
    resources = [local.lab_role_arn_prefix]
  }

  # Replacing the boundary is still permitted, but only with the same lab boundary ARN.
  statement {
    sid    = "PutRolePermissionsBoundaryRestrictBoundaryArn"
    effect = "Allow"
    actions = [
      "iam:PutRolePermissionsBoundary",
    ]
    resources = [local.lab_role_arn_prefix]
    condition {
      test     = "ArnEquals"
      variable = "iam:PermissionsBoundary"
      values   = [aws_iam_policy.lab_project_permissions_boundary.arn]
    }
  }

  # Attach/detach managed policies: AWS-managed bundle OR customer-managed lab-project-* only.
  statement {
    sid    = "AttachAwsManagedPoliciesToProjectRoles"
    effect = "Allow"
    actions = [
      "iam:AttachRolePolicy",
      "iam:DetachRolePolicy",
    ]
    resources = [local.lab_role_arn_prefix]
    condition {
      test     = "ArnLike"
      variable = "iam:PolicyArn"
      values   = [local.aws_managed_policy_arn_prefix]
    }
  }

  statement {
    sid    = "AttachCustomerManagedProjectPoliciesToProjectRoles"
    effect = "Allow"
    actions = [
      "iam:AttachRolePolicy",
      "iam:DetachRolePolicy",
    ]
    resources = [local.lab_role_arn_prefix]
    condition {
      test     = "ArnLike"
      variable = "iam:PolicyArn"
      values   = [local.lab_policy_arn_prefix]
    }
  }

  # Instance profiles strictly under lab-project-*.
  statement {
    sid    = "InstanceProfilesUnderPrefix"
    effect = "Allow"
    actions = [
      "iam:CreateInstanceProfile",
      "iam:DeleteInstanceProfile",
      "iam:GetInstanceProfile",
      "iam:AddRoleToInstanceProfile",
      "iam:RemoveRoleFromInstanceProfile",
      "iam:TagInstanceProfile",
      "iam:UntagInstanceProfile",
      "iam:ListInstanceProfileTags",
    ]
    resources = [local.lab_instance_profile_arn_prefix]
  }

  # PassRole for approved services only, and only for lab-project-* roles.
  statement {
    sid    = "PassRoleElasticBeanstalk"
    effect = "Allow"
    actions = [
      "iam:PassRole",
    ]
    resources = [local.lab_role_arn_prefix]
    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["elasticbeanstalk.amazonaws.com"]
    }
  }

  statement {
    sid    = "PassRoleEc2"
    effect = "Allow"
    actions = [
      "iam:PassRole",
    ]
    resources = [local.lab_role_arn_prefix]
    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["ec2.amazonaws.com"]
    }
  }

  statement {
    sid    = "PassRoleLambda"
    effect = "Allow"
    actions = [
      "iam:PassRole",
    ]
    resources = [local.lab_role_arn_prefix]
    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["lambda.amazonaws.com"]
    }
  }

  # Terraform/provider discovery — list actions are not resource-tag constrained by IAM.
  statement {
    sid    = "IamListDiscoveryForTerraform"
    effect = "Allow"
    actions = [
      "iam:ListRoles",
      "iam:ListPolicies",
      "iam:ListInstanceProfiles",
    ]
    resources = ["*"]
  }

  # Service-linked roles sometimes required before first EB/Lambda use in a fresh account.
  # Deleting SLRs is intentionally omitted for v1 — cleanup is account-sensitive and left to admin.
  statement {
    sid    = "CreateApprovedServiceLinkedRoles"
    effect = "Allow"
    actions = [
      "iam:CreateServiceLinkedRole",
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "iam:AWSServiceName"
      values = [
        "elasticbeanstalk.amazonaws.com",
        "lambda.amazonaws.com",
      ]
    }
  }
}

resource "aws_iam_policy" "claude_conjurer_plane2_iam_delegation" {
  name        = "ClaudeConjurerPlane2IAMDelegation"
  description = "Plane-2 delegation: scoped IAM admin for lab-project-* roles/policies/instance-profiles with PassRole guardrails and mandatory LabProjectPermissionsBoundary."
  policy      = data.aws_iam_policy_document.claude_conjurer_plane2_iam_delegation.json

  tags = {
    Name        = "ClaudeConjurerPlane2IAMDelegation"
    Course      = "mbai460"
    Environment = "lab"
    ManagedBy   = "terraform"
    Plane       = "bootstrap-plane2"
  }
}

resource "aws_iam_user_policy_attachment" "conjurer_plane2_iam_delegation" {
  user       = data.aws_iam_user.conjurer.user_name
  policy_arn = aws_iam_policy.claude_conjurer_plane2_iam_delegation.arn
}
