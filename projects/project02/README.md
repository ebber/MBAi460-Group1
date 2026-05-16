# Project02 — PhotoApp Web Service

Self-contained Project02 deliverable. Node/Express server (`server/`),
Python client (`client/`), Terraform (`infra/`), local dev via Docker
Compose, planned hosting on Elastic Beanstalk.

## Run options

Two lanes share the same `server/Dockerfile` image; only the dependencies
differ.

### AWS lane (default; production-shape)

Runs the server alone. Talks to real AWS RDS + S3 + Rekognition using the
credentials in `client/photoapp-config.ini` (gitignored).

```bash
make docker-up-aws    # build + start; server on http://localhost:8080
make docker-down      # stop everything
```

Prereq: `client/photoapp-config.ini` must exist. It is intentionally not
committed; provision it from your AWS-shaped config or copy from the
sibling project that has it.

### LocalStack lane (offline)

Runs server + MySQL + LocalStack on a private Docker network. Talks to
local mocks using the LocalStack-shaped values in
`client/photoapp-config.ini.example` (committed, safe).

```bash
make docker-up-localstack    # build + start full stack; bootstraps S3 bucket
make docker-down             # stop everything
```

Prereq: none beyond Docker.

## Test gate

`tools/phase1-smoke.sh` runs the Phase 1 test gate against the AWS lane.
Layers: jest unit + integration + contract + smoke, image build, compose
config, AWS-lane HTTP probes, container source layout.

```bash
bash tools/phase1-smoke.sh                # full suite
SKIP_DOCKER=1   bash tools/phase1-smoke.sh   # only jest layers (1–4)
SKIP_RUNTIME=1  bash tools/phase1-smoke.sh   # layers 1–6 (no docker-up)
```

Exit codes: `0` GREEN, `1` RED, `2` AWS-INFRA-MISSING (server alive but
real AWS infra unreachable; investigate AWS state, not Project02 code).

LocalStack-lane smoke is deliberately not in the Phase 1 gate; design
notes in `scratch/phase2-codebase-test-alignment-stub.md` (Workstream P2.F).

## Elastic Beanstalk bundle and smoke

Project02 consumes the reusable scaffold in `../../labs/lab03-production-grade/`
for EB bundle staging and cURL smoke checks.

Dry-run a bundle with safe example config:

```bash
make eb-bundle-example
```

Check real deployment prerequisites without printing secrets:

```bash
make eb-preflight
```

Stage a deployable bundle with the real gitignored config:

```bash
make eb-bundle
```

Smoke a deployed EB CNAME:

```bash
make eb-smoke EB_URL=http://YOUR-EB-CNAME.elasticbeanstalk.com
```

Terraform wiring for the EB environment lives under `infra/envs/dev`; see
`MetaFiles/Hosting_Plan.md` for the full flow.

## Layout (high-level)

```
server/         Node/Express service + local photoapp-core under src/
client/         Python client + dual-purpose config files
infra/          Terraform (envs/dev, envs/prod) + migrations + IAM policy
api/            OpenAPI spec
tools/          Operator scripts (smoke, bootstrap, deprecated packaging)
scratch/        Working artifacts for the docker-native-deployment plan
```

Architectural detail and the docker-native-deployment plan live in
`scratch/project02-core-structure-vizualizer.md` and the Phase 1 / 1.5 /
2 / 3 documents next to it.
