output "lab_project_permissions_boundary_arn" {
  description = "ARN of the managed policy used as the permissions boundary for every lab-project-* IAM role."
  value       = aws_iam_policy.lab_project_permissions_boundary.arn
}

output "claude_conjurer_plane2_iam_delegation_policy_arn" {
  description = "ARN of the delegation policy attached to the Plane-2 operator IAM user."
  value       = aws_iam_policy.claude_conjurer_plane2_iam_delegation.arn
}

output "conjurer_user_name" {
  description = "IAM user that receives ClaudeConjurerPlane2IAMDelegation via aws_iam_user_policy_attachment."
  value       = data.aws_iam_user.conjurer.user_name
}

output "aws_account_id" {
  description = "Current account ID (for lab-project-* ARN patterns in PassRole and resource constraints)."
  value       = local.account_id
}

output "lab_project_eb_service_role_name" {
  description = "Name of the shared EB service role when create_lab_project_eb_roles=true. Empty string otherwise. Copy into Project02 eb_existing_service_role_name."
  value       = try(aws_iam_role.lab_project_eb_service[0].name, "")
}

output "lab_project_eb_ec2_role_name" {
  description = "Name of the shared EB EC2 role when create_lab_project_eb_roles=true. Empty string otherwise."
  value       = try(aws_iam_role.lab_project_eb_ec2[0].name, "")
}

output "lab_project_eb_ec2_instance_profile_name" {
  description = "Name of the shared EB EC2 instance profile when create_lab_project_eb_roles=true. Empty string otherwise. Copy into Project02 eb_existing_ec2_instance_profile_name."
  value       = try(aws_iam_instance_profile.lab_project_eb_ec2[0].name, "")
}

output "delegation_capability_summary" {
  description = "Plain-language summary of what the Plane-2 operator can and cannot do via this delegation policy (combined in AWS with other attached policies such as PowerUserAccess)."
  value       = <<-EOT
    CAN (in addition to existing policies like PowerUserAccess):
    - Create/delete/update IAM roles whose ARN matches role/lab-project-* when created with permissions boundary ${aws_iam_policy.lab_project_permissions_boundary.arn}.
    - Attach/detach only (a) IAM AWS managed policies (arn:${data.aws_partition.current.partition}:iam::aws:policy/*) or (b) customer-managed policies named lab-project-* in this account to those roles.
    - Create inline role policies on lab-project-* roles.
    - Create/manage customer-managed IAM policies named lab-project-* and read AWS managed policy documents for planning.
    - Create/manage IAM instance profiles named lab-project-* (add/remove roles, tags).
    - iam:PassRole only for role/lab-project-* and only when iam:PassedToService is elasticbeanstalk.amazonaws.com, ec2.amazonaws.com, or lambda.amazonaws.com.
    - Create Elastic Beanstalk and Lambda service-linked roles (narrow iam:AWSServiceName condition); deleting SLRs is not granted — admin cleanup if needed.
    - iam:ListRoles / ListPolicies / ListInstanceProfiles for Terraform discovery.

    CANNOT (this policy does not grant):
    - Broad iam:*, IAMFullAccess, or AdministratorAccess.
    - IAM users, groups, access keys, login profiles, or human identity lifecycle outside roles/instance-profiles/policies above.
    - PassRole to services other than EB/EC2/Lambda, or for roles outside lab-project-*.
    - Attach arbitrary customer-managed policies (non-lab-project-*) to project roles, or attach policies to non-lab-project-* roles.
    - Remove the LabProjectPermissionsBoundary (DeleteRolePermissionsBoundary is not allowed).
    - Account/billing/organizations/SSO/Identity Store APIs (also outside typical PowerUserAccess).

    BOUNDARY (lab-project-* runtime roles wearing LabProjectPermissionsBoundary):
    - Explicit Deny guardrails block IAM, org/account/billing/SSO/Identity Store/support consoles, and security/audit planes—including CloudTrail, CloudTrail data, Config, GuardDuty, Security Hub, Macie, Detective, Inspector, Access Analyzer, Security Lake, Shield, Firewall Manager, Audit Manager—even if an attached/inline policy mistakenly grants them. Agents can rely on the boundary, not self-policing, for those APIs.

    NOTE: Runtime IAM roles must be named with the lab-project-* prefix (e.g. lab-project-eb-service-role) so they align with PassRole and mutation scopes. Existing aws-elasticbeanstalk-* names would require admin rename/import or separate policy.
  EOT
}
