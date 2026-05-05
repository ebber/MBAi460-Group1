output "bucket_name" {
  description = "S3 bucket name — use in photoapp-config.ini [s3] bucket_name"
  value       = aws_s3_bucket.photoapp.bucket
}

output "bucket_url" {
  description = "S3 bucket base URL"
  value       = "https://${aws_s3_bucket.photoapp.bucket}.s3.${aws_s3_bucket.photoapp.region}.amazonaws.com"
}
