# Lab03 Production-Grade EB Node Scaffold

Reusable Elastic Beanstalk helpers extracted from the completed Lab03 scripts.
The original `labs/lab03/` files remain the course-compatible reference; this
directory provides generic, testable utilities that other projects can consume.

Commands below assume you are at the monorepo root:

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
```

## Goals

- Stage a recursive Node.js EB application bundle from any configured source
  directory.
- Validate the bundle contains the runtime entrypoint, `package.json`, and
  `photoapp-config.ini` before deployment.
- Exclude common dev/test/starter artifacts that should not run on EB.
- Smoke-test an EB CNAME or any base URL with repeatable cURL probes.
- Keep project-specific knowledge outside the scaffold. Consumers provide source
  paths, config paths, names, and smoke endpoints.

## Non-Goals

- This scaffold does not mutate `labs/lab03/`.
- This scaffold does not deploy cloud resources yet; Terraform/EB wiring is the
  next layer that consumes these helpers.
- This scaffold does not know PhotoApp route semantics beyond whatever smoke
  paths a consumer passes in.

## Utility Scripts

### `bin/stage-eb-node-app.sh`

Creates a deterministic EB Node app zip plus a manifest.

```bash
labs/lab03-production-grade/bin/stage-eb-node-app.sh \
  --source-dir projects/project02/server \
  --config-file projects/project02/client/photoapp-config.ini \
  --output-dir projects/project02/build/eb \
  --bundle-name project02-photoapp \
  --entrypoint server.js
```

Outputs:

- `project02-photoapp.zip`
- `project02-photoapp.manifest.txt`

Default exclusions:

- `node_modules/`
- `tests/`
- `__tests__/`
- `_assignment-template/`
- `.git/`
- `.terraform/`
- `coverage/`
- `dist/`
- `Dockerfile`
- common JS test files and dev config files

The script copies the provided config to `photoapp-config.ini` at bundle root.

### `bin/smoke-eb-url.sh`

Runs cURL probes against a deployed EB URL or local service.

```bash
labs/lab03-production-grade/bin/smoke-eb-url.sh \
  --base-url http://example.elasticbeanstalk.com \
  --path /healthz \
  --path /users \
  --expect /healthz=200 \
  --expect /users=200
```

Useful options:

- `--timeout SECONDS`: per-request timeout. Default: `10`.
- `--retry-count N`: attempts per path. Default: `1`.

## Terminal Walkthrough

This section is the copy/paste path for a human terminal user.

### 1. Run The Local Self-Tests

Run both local tests:

```bash
bash labs/lab03-production-grade/tests/stage-eb-node-app.test.sh
bash labs/lab03-production-grade/tests/smoke-eb-url.test.sh
```

Expected output:

```text
PASS stage-eb-node-app
PASS smoke-eb-url
```

These tests do not touch AWS or Elastic Beanstalk. They validate local bundle
staging and cURL smoke behavior only.

### 2. Stage A Project02 Bundle

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

### 3. Inspect The Bundle Manifest

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

### 4. Inspect The Zip Contents

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

### 5. Smoke-Test A URL

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

### 6. Clean Local Generated Files

```bash
rm -rf labs/lab03-production-grade/.tmp
```

Generated `.tmp/`, `dist/`, `.zip`, and manifest files are ignored by
`labs/lab03-production-grade/.gitignore`.

## Project02 Phase 2 Consumption

Project02 should consume this scaffold by passing:

- source directory: `projects/project02/server`
- config file: `projects/project02/client/photoapp-config.ini`
- entrypoint: `server.js`
- smoke paths: `/healthz`, `/readyz`, `/ping`, `/users`, `/images`

The Terraform-native EB work should build on these helpers instead of copying
Lab03’s ad-hoc shallow `zip *` behavior.
