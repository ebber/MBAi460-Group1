# Terraform module: s3
# Extracted from MBAi460-Group1/infra/terraform/main.tf (flat layout).
# Approach 01-foundation.md § Phase 1.2 — module skeleton.
# Provider v5 depends_on ordering: bucket → public_access_block → ownership_controls → acl → objects

resource "aws_s3_bucket" "photoapp" {
  bucket        = var.bucket_name
  force_destroy = true

  tags = merge(var.tags, { Name = var.bucket_name })
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
    object_ownership = "BucketOwnerPreferred"
  }

  depends_on = [aws_s3_bucket_public_access_block.photoapp]
}

resource "aws_s3_bucket_acl" "photoapp" {
  bucket = aws_s3_bucket.photoapp.id
  acl    = "public-read"

  depends_on = [aws_s3_bucket_ownership_controls.photoapp]
}

resource "aws_s3_object" "test_images" {
  for_each = var.upload_test_images_path != null ? fileset(var.upload_test_images_path, "*.jpg") : toset([])

  bucket       = aws_s3_bucket.photoapp.id
  key          = "test/${each.value}"
  source       = "${var.upload_test_images_path}/${each.value}"
  content_type = "image/jpeg"
  acl          = "public-read"

  depends_on = [aws_s3_bucket_acl.photoapp]
}
