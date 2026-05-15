# Lab03 Production-Grade EB Node Scaffold

Reusable Elastic Beanstalk helpers extracted from the completed Lab03 scripts.
The original `labs/lab03/` files remain the course-compatible reference; this
directory provides generic, testable utilities that other projects can consume.

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

## Tests

Run both local tests:

```bash
bash labs/lab03-production-grade/tests/stage-eb-node-app.test.sh
bash labs/lab03-production-grade/tests/smoke-eb-url.test.sh
```

These tests do not touch AWS or Elastic Beanstalk. They validate local bundle
staging and cURL smoke behavior only.

## Project02 Phase 2 Consumption

Project02 should consume this scaffold by passing:

- source directory: `projects/project02/server`
- config file: `projects/project02/client/photoapp-config.ini`
- entrypoint: `server.js`
- smoke paths: `/healthz`, `/readyz`, `/ping`, `/users`, `/images`

The Terraform-native EB work should build on these helpers instead of copying
Lab03’s ad-hoc shallow `zip *` behavior.
