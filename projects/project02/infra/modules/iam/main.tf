# Terraform module: iam
# Extracted from MBAi460-Group1/infra/terraform/main.tf (flat layout).
# Approach 01-foundation.md § Phase 1.2 — module skeleton.

# ── s3readonly ───────────────────────────────────────────────────────────────
resource "aws_iam_user" "s3readonly" {
  name = "s3readonly"
  tags = merge(var.tags, { Name = "s3readonly" })
}

resource "aws_iam_user_policy_attachment" "s3readonly_managed" {
  user       = aws_iam_user.s3readonly.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}

resource "aws_iam_access_key" "s3readonly" {
  user = aws_iam_user.s3readonly.name
}

# ── s3readwrite ──────────────────────────────────────────────────────────────
resource "aws_iam_policy" "s3_read_write" {
  name   = "photoapp-s3-read-write"
  policy = templatefile(
    var.s3_read_write_policy_path,
    { bucket_name = var.bucket_name }
  )
}

resource "aws_iam_user" "s3readwrite" {
  name = "s3readwrite"
  tags = merge(var.tags, { Name = "s3readwrite" })
}

resource "aws_iam_user_policy_attachment" "s3readwrite_custom" {
  user       = aws_iam_user.s3readwrite.name
  policy_arn = aws_iam_policy.s3_read_write.arn
}

resource "aws_iam_user_policy_attachment" "s3readwrite_rekognition" {
  user       = aws_iam_user.s3readwrite.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRekognitionFullAccess"
}

resource "aws_iam_access_key" "s3readwrite" {
  user = aws_iam_user.s3readwrite.name
}
