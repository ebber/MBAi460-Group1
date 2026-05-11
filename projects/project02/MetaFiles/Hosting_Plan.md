# Hosting plan — platform team (Elastic Beanstalk + local verification)

Audience: **platform / EB** owners who ship the **Node PhotoApp web service**. This doc lists **what to deploy**, **runtime requirements on AWS**, and **how to test locally** before or after EB, using repo-native tooling.

The **Python / Streamlit client** and **`make client-*`** flows are **not** part of EB hosting; they consume the same HTTP API once it is live.

---

## 1. What you are hosting

**One artifact:** the **Express API** under `projects/project02/server/` — same process as `node server.js`, listening on **`PORT`** (Elastic Beanstalk sets this).

**Not in the classic course EB bundle:** Docker image from `server/Dockerfile` (that path is for local Compose). Part 02 per the handout is a **directory of `.js` + `photoapp-config.ini` + `package.json`** run by the **Node** platform on EB, unless you deliberately adopt a container-based EB variant (out of scope for the PDF flow).

---

## 2. Files and directories to include in the EB `app/` bundle

Copy everything required for **`npm install`** (or `npm ci`) and **`npm start`** → **`node server.js`**.

### 2.1 Must ship (runtime)

| Path (under `server/`) | Purpose |
|------------------------|---------|
| `server.js` | Process entry; graceful shutdown; uses `PORT`. |
| `app.js` | Express application. |
| `package.json` | Dependencies and `"start": "node server.js"`. Prefer **`package-lock.json`** from the monorepo root workspace if your EB build runs `npm ci`. |
| `routes/` | HTTP handlers (`v1`, `_internal/readyz`). |
| `middleware/` | Request ID, logging, validation, errors. |
| `services/` | DB pool, breakers. |
| `observability/` | Pino (and tracing if used). |
| `schemas/` | Request validation modules used by routes. |
| `src/photoapp-core/` | **Required** — config, services, repositories, middleware, schemas. |

### 2.2 Omit (typical)

| Path | Reason |
|------|--------|
| `tests/` | Jest only; not needed on EC2. |
| `jest.config.js`, `eslint.config.js`, `commitlint.config.cjs` | Dev tooling. |
| `Dockerfile` | Local / Compose image build. |
| `_assignment-template/` | Instructor starter; exclude from production bundle. |
| Root-level `api_*.js` | Legacy; **canonical app** mounts `routes/v1/*` — omit if nothing requires them. |

### 2.3 Server config on the instance

| File | Notes |
|------|--------|
| **`photoapp-config.ini`** | **Production-shaped** RDS, S3, region, credentials (or IAM pattern your loader supports). Source of truth in-repo: `client/photoapp-config.ini` (gitignored); **do not** ship LocalStack example values to EB. |

**Path resolution:** `server/src/photoapp-core/config.js` uses:

1. `process.env.PHOTOAPP_CONFIG_PATH` if set  
2. else a monorepo path under `client/photoapp-config.ini` (**will not exist** on EB unless you mirror that layout)

**Platform action:** set **Elastic Beanstalk environment property** `PHOTOAPP_CONFIG_PATH` to the **absolute path** of the deployed INI (commonly under `var/app/current/…`; confirm with your EB Node layout), e.g. the file copied next to `server.js` as `./photoapp-config.ini` resolved to full path if your platform documents it.

### 2.4 Environment variables (EB)

| Variable | Role |
|----------|------|
| `PORT` | Set by EB; **must** be honored (already used in code). |
| `PHOTOAPP_CONFIG_PATH` | **Required** if the bundle does not include `projects/project02/client/photoapp-config.ini` at the hard-coded fallback path. |
| `NODE_ENV` | Optional; `production` for EB. |
| AWS SDK | Prefer **instance profile** on EC2; align with how `photoapp-config.ini` supplies or omits static keys. |

---

## 3. Course / Lab 03 workflow (reference)

Official steps live in **`project02-part02-EB.pdf`** and **Lab 03** materials:

- IAM roles (`aws-elasticbeanstalk-service-role`, `aws-elasticbeanstalk-ec2-role` or equivalents).
- Copy of Lab **create / update / delete** scripts; **`app/`** filled with the bundle above.
- **`eb create`** with correct service role and instance profile; health reporting **basic** per handout.
- **`eb status`** → CNAME for `http://…elasticbeanstalk.com`.

This repo does **not** replace those scripts; it supplies **which source tree** to package.

---

## 4. How to test locally (same codebase, before or after EB)

Local testing uses **Docker Compose** from **`projects/project02/`**, **not** the EB CLI.

### 4.1 Prerequisites

- Docker Desktop (or equivalent).
- From repo root once: `npm install` at `MBAi460-Group1/` (workspace installs `projects/project02/server`).

### 4.2 AWS lane (closest to EB behavior)

**Requires** real `client/photoapp-config.ini` (RDS + S3 + credentials / IAM shape for real AWS).

```bash
cd projects/project02
make docker-up-aws
```

- API: **http://localhost:8080**
- Quick checks: `curl -s http://localhost:8080/healthz` → `{"status":"live"}`; `curl -s http://localhost:8080/readyz` if RDS/S3 are wired; `curl -s http://localhost:8080/users` (shape depends on data).

Logs: `docker compose logs -f server`

Stop: `make docker-down`

### 4.3 LocalStack lane (offline)

**Uses** `client/photoapp-config.ini.example` + local MySQL + LocalStack (no real AWS).

```bash
cd projects/project02
make docker-up-localstack
```

Same host port **8080**; good for **CI-shaped** validation when AWS is unavailable.

Stop: `make docker-down`

### 4.4 Host-only Node (optional, no Docker)

From monorepo root:

```bash
npm install
cd projects/project02/server
export PHOTOAPP_CONFIG_PATH=/absolute/path/to/photoapp-config.ini
export PORT=8080
npm start
```

Useful for quick debugging; **Compose** better matches “clean room” parity with containerized deps.

### 4.5 Optional automated gate

```bash
bash tools/phase1-smoke.sh
```

Runs Jest layers plus Compose/AWS-lane checks per project docs; use when validating **merge readiness**, not as a substitute for **EB** post-deploy checks.

---

## 5. After EB deploy — smoke checks

1. Browser or curl: `http://<CNAME>/users` and/or `/images` (handout).
2. Confirm **`photoapp-client-config.ini`** uses `webservice=http://<CNAME>` (no trailing slash, `http` per handout).
3. Run Python client or Streamlit **against the EB URL** if the team owns client verification.

**Known PDF caveat:** uploads **> 1MB** may fail with the course EB configuration.

---

## 6. Quick reference

| Question | Answer |
|----------|--------|
| What ships to EB? | `server/` runtime tree + **`photoapp-config.ini`** + **`package.json`** (+ lockfile if `npm ci`). |
| What sets config path on EB? | **`PHOTOAPP_CONFIG_PATH`** environment property (recommended). |
| Does `make docker-up-aws` deploy EB? | **No** — local Compose only. |
| Entry command | `npm start` → `node server.js` |

Related: **`MetaFiles/Submission_Plan.md`** (Gradescope INIs for Part 02), **`README.md`** (Compose lanes), **`server/README.md`** (config + layout).
