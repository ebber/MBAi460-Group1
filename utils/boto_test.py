# Docker sanity check — verifies boto3 is installed and returns its version.
# Run from inside the Docker container: python3 MBAi460-Group1/utils/boto_test.py
# Expected output: a version string like 1.42.76 or higher.
import boto3
print(boto3.__version__)
