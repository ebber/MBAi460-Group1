terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = "Claude-The-Conjurer"

  # Credentials via env vars — set before running terraform (see infra/README.md):
  #   export AWS_SHARED_CREDENTIALS_FILE=<repo-root>/claude-workspace/secrets/aws-credentials
  #   export AWS_CONFIG_FILE=<repo-root>/claude-workspace/secrets/aws-config
}

###############################################################################
# S3 — Public PhotoApp bucket
# Provider v5 requires this exact depends_on ordering:
#   bucket → public_access_block → ownership_controls → bucket_acl → objects
###############################################################################

resource "aws_s3_bucket" "photoapp" {
  bucket        = var.bucket_name
  force_destroy = true # allows clean destroy during lab iterations

  tags = {
    Name        = var.bucket_name
    Course      = "mbai460"
    Environment = "lab"
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "photoapp" {
  bucket = aws_s3_bucket.photoapp.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false

  depends_on = [aws_s3_bucket.photoapp]
}

resource "aws_s3_bucket_ownership_controls" "photoapp" {
  bucket = aws_s3_bucket.photoapp.id

  rule {
    object_ownership = "BucketOwnerPreferred" # enables ACLs
  }

  depends_on = [aws_s3_bucket_public_access_block.photoapp]
}

resource "aws_s3_bucket_acl" "photoapp" {
  bucket = aws_s3_bucket.photoapp.id
  acl    = "public-read"

  depends_on = [aws_s3_bucket_ownership_controls.photoapp]
}

# Upload test images with per-object public-read ACL (required by assignment)
resource "aws_s3_object" "test_images" {
  for_each = fileset("${path.module}/test-images", "*.jpg")

  bucket       = aws_s3_bucket.photoapp.id
  key          = "test/${each.value}"
  source       = "${path.module}/test-images/${each.value}"
  content_type = "image/jpeg"
  acl          = "public-read"

  depends_on = [aws_s3_bucket_acl.photoapp]
}

###############################################################################
# VPC Security Group — RDS MySQL inbound
# Intentionally open to 0.0.0.0/0 per assignment requirements
# ⚠️ Tech debt: scope to known CIDRs when moving beyond lab — see Future-State-Ideal-Lab.md
#
# Note: no vpc_id specified → lands in the account's default VPC (us-east-2).
# RDS publicly_accessible = true still requires default VPC to have an IGW and
# the default subnets to have auto-assign public IPs enabled (both true by default
# in new AWS accounts). If those have been modified, add explicit vpc_id here.
###############################################################################

resource "aws_security_group" "rds_public" {
  name        = "photoapp-rds-sg"
  description = "Allow MySQL inbound from anywhere - lab only, see Future-State-Ideal-Lab.md"

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

  tags = {
    Name        = "photoapp-rds-sg"
    Course      = "mbai460"
    Environment = "lab"
    ManagedBy   = "terraform"
  }
}

###############################################################################
# RDS — MySQL Free Tier
# All settings match assignment requirements exactly (Requirements.md)
###############################################################################

resource "aws_db_instance" "photoapp" {
  identifier = var.db_identifier

  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro" # free tier eligible

  allocated_storage = 20    # minimum allowed for MySQL
  # max_allocated_storage intentionally omitted → storage autoscaling disabled

  db_name  = null           # database created via SQL post-apply, not here
  username = var.db_master_username
  password = var.db_master_password

  publicly_accessible                 = true
  iam_database_authentication_enabled = true  # password + IAM auth (assignment requirement)
  backup_retention_period             = 0     # automated backups off (assignment requirement)
  skip_final_snapshot                 = true  # allows clean destroy in lab

  vpc_security_group_ids = [aws_security_group.rds_public.id]

  tags = {
    Name        = var.db_identifier
    Course      = "mbai460"
    Environment = "lab"
    ManagedBy   = "terraform"
  }
}
