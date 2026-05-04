# Terraform module: rds
# Extracted from MBAi460-Group1/infra/terraform/main.tf (flat layout).
# Approach 01-foundation.md § Phase 1.2 — module skeleton (no apply in Part 01).
# D10: forward-only; no destroy cycles in shared envs.

resource "aws_security_group" "rds_public" {
  name        = "photoapp-rds-sg"
  description = "Allow MySQL inbound from anywhere - lab only"

  ingress {
    description = "MySQL from anywhere (assignment requirement)"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "photoapp-rds-sg" })
}

resource "aws_db_instance" "photoapp" {
  identifier     = var.db_identifier
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro"

  allocated_storage = 20

  db_name  = null
  username = var.db_master_username
  password = var.db_master_password

  publicly_accessible                 = true
  iam_database_authentication_enabled = true
  backup_retention_period             = 0
  skip_final_snapshot                 = true

  vpc_security_group_ids = concat(
    var.vpc_security_group_ids,
    [aws_security_group.rds_public.id]
  )

  tags = merge(var.tags, { Name = var.db_identifier })
}
