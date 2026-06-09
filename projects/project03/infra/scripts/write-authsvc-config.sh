#!/usr/bin/env bash
# Write the Gradescope server INI (authsvc-config.ini) with the live RDS endpoint.
# Matches what Terraform packages into the Lambda zip. Course-mandated DB creds.
set -euo pipefail
PROJ03="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${PROJ03}/authsvc-config.ini"
RDS="${RDS_ADDRESS:-photoapp-db.c5q4s860smqq.us-east-2.rds.amazonaws.com}"

cat > "${OUT}" <<EOF
[rds]
endpoint = ${RDS}
port_number = 3306
region_name = us-east-2
user_name = authsvc-read-write
user_pwd = def456!!
db_name = authsvc
EOF

echo "Wrote ${OUT} (endpoint=${RDS})"
