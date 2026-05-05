# Terraform module: cloudwatch
# Approach 01-foundation.md § Phase 1.2 — module skeleton.
# Full dashboards + alarms land in Phase 4.8 (engineering surface workstream).

resource "aws_cloudwatch_log_group" "server" {
  name              = "${var.log_group_prefix}/server"
  retention_in_days = var.retention_days
  tags              = var.tags
}

resource "aws_cloudwatch_log_group" "access" {
  name              = "${var.log_group_prefix}/access"
  retention_in_days = var.retention_days
  tags              = var.tags
}
