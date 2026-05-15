# Terminal Walkthrough: Lab03 Production-Grade EB Node Scaffold

This file is for a human terminal user who wants to run the scaffold without
reading the implementation first. Commands assume you are at the monorepo root:

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
```

## What This Scaffold Does

The scaffold provides two local utilities:

- `bin/stage-eb-node-app.sh`: creates an Elastic Beanstalk-ready Node app zip
  plus a manifest.
- `bin/smoke-eb-url.sh`: runs repeatable cURL checks against a local server or
  deployed EB URL.

It does **not** deploy to AWS by itself. Terraform or EB deployment code should
consume the generated bundle in the next phase.

## 1. Run The Local Self-Tests

These tests do not touch AWS.

```bash
bash labs/lab03-production-grade/tests/stage-eb-node-app.test.sh
bash labs/lab03-production-grade/tests/smoke-eb-url.test.sh
```

Expected output:

```text
PASS stage-eb-node-app
PASS smoke-eb-url
```

## 2. Stage A Project02 Bundle

For a safe local dry run, use the committed LocalStack-shaped example config:

```bash
rm -rf labs/lab03-production-grade/.tmp/project02-dry-run
mkdir -p labs/lab03-production-grade/.tmp/project02-dry-run

labs/lab03-production-grade/bin/stage-eb-node-app.sh \
  --source-dir projects/project02/server \
  --config-file projects/project02/client/photoapp-config.ini.example \
  --output-dir labs/lab03-production-grade/.tmp/project02-dry-run \
  --bundle-name project02-photoapp-dry-run \
  --entrypoint server.js
```

Expected output includes:

```text
bundle=.../project02-photoapp-dry-run.zip
manifest=.../project02-photoapp-dry-run.manifest.txt
files=<number>
```

For a real EB deployment bundle, replace the config path with the real,
gitignored server config:

```bash
--config-file projects/project02/client/photoapp-config.ini
```

Do not commit that real config file.

## 3. Inspect The Bundle Manifest

```bash
MANIFEST="labs/lab03-production-grade/.tmp/project02-dry-run/project02-photoapp-dry-run.manifest.txt"

grep -E '^(package.json|server.js|app.js|photoapp-config.ini)$' "$MANIFEST"
grep -E '^routes/v1/ping.js$' "$MANIFEST"
grep -E '^src/photoapp-core/index.js$' "$MANIFEST"
```

Expected: each `grep` prints the matching runtime file.

Check that excluded files are not present:

```bash
if grep -E '(^tests/|^_assignment-template/|^Dockerfile$)' "$MANIFEST"; then
  echo "Unexpected dev/starter file in bundle"
  exit 1
else
  echo "Bundle exclusions look good"
fi
```

## 4. Inspect The Zip Contents

```bash
ZIP="labs/lab03-production-grade/.tmp/project02-dry-run/project02-photoapp-dry-run.zip"
unzip -Z1 "$ZIP" | sort | sed -n '1,80p'
```

You should see nested runtime paths like:

```text
app.js
package.json
photoapp-config.ini
routes/v1/ping.js
server.js
src/photoapp-core/index.js
```

## 5. Smoke-Test A URL

After a local server or EB environment is running, run:

```bash
labs/lab03-production-grade/bin/smoke-eb-url.sh \
  --base-url http://localhost:8080 \
  --path /healthz \
  --path /ping \
  --path /users \
  --expect /healthz=200 \
  --expect /ping=200 \
  --expect /users=200 \
  --retry-count 3 \
  --timeout 10
```

For EB, replace the base URL:

```bash
--base-url http://YOUR-EB-CNAME.elasticbeanstalk.com
```

Expected output shape:

```text
PASS /healthz 200
PASS /ping 200
PASS /users 200
```

If a path fails, the script exits non-zero and prints a diagnostic like:

```text
FAIL /users expected=200 actual=500
```

## 6. Clean Local Generated Files

```bash
rm -rf labs/lab03-production-grade/.tmp
```

Generated `.tmp/`, `dist/`, `.zip`, and manifest files are ignored by
`labs/lab03-production-grade/.gitignore`.

## Next Phase

Use this scaffold from Project02 Terraform/EB deployment work. The intended
Project02 inputs are:

- `--source-dir projects/project02/server`
- `--config-file projects/project02/client/photoapp-config.ini`
- `--entrypoint server.js`
- smoke paths: `/healthz`, `/readyz`, `/ping`, `/users`, `/images`
