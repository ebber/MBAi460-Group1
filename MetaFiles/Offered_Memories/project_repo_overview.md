---
name: MBAi460-Group1 repo overview
description: Top-level layout and key conventions for the Class Project repo
type: project
originSessionId: 1e15db51-7353-4e14-aeea-749705958a24
---
**Layout (top-level dirs):** `docker/` (image used by all labs/projects), `infra/` (Terraform IaC + backbone runtime configs), `labs/` (lab01–lab04), `projects/` (project01–project03), `utils/` (operational scripts), `setup/` (host setup), `visualizations/` (architecture diagrams), `learnings/` (retrospectives — purpose still being elaborated per TODO), `MetaFiles/` (Class-Project coordination layer).

**Key conventions:**
- AWS region `us-east-2` (course requirement).
- Canonical photoapp DDL: `projects/project01/create-photoapp.sql` (+ `create-photoapp-labels.sql` for Part 02 Rekognition labels). All projects build on it.
- Backbone runtime configs live at `infra/config/` (gitignored real configs; `.example` templates committed). Configs may live inside a project folder during active dev, then graduate to `infra/config/` at assignment closeout.
- Terraform runs from `infra/terraform/`; utils from repo root.
- Docker image name read from `docker/_image-name.txt` (currently `mbai460-client`).
- Scoped TODO surfaces — `MetaFiles/TODO.md` (class-project), `infra/MetaFiles/TODO.md`, `visualizations/MetaFiles/TODO.md`, lab/project sub-MetaFiles. Routing heuristic: most-scoped surface that fits; promote only when concern legitimately crosses scopes.

**Project state by sub-area (as of 2026-04-27):**
- Lab 01 ✅ 10/10, Lab 02 ✅ 100/100, Lab 03 ⏳ course-mandated stub, Lab 04 ⏳ course-mandated stub
- Project 01 Part 02 ✅ 70/70 first-submission (Python client)
- Project 01 Part 03: dev-complete UI MVP. Stack pivoted 2026-04-26 from Python/Streamlit → React+Vite frontend / Express+Node backend (built-only dev mode: Vite build → Express serves `frontend/dist`). Collaborator UAT walk in flight.
- Project 02, Project 03 ⏳ not started; SQL scaffolds present for project03 (authsvc + chatapp).

**Photoapp users (RDS):** `photoapp-read-only` (used by validate-db / backbone tools) and `photoapp-read-write` (used by client code). Original passwords were `abc123!!` / `def456!!` and were rotated 2026-04-20 after a brief initial-commit exposure.

**Two AWS profiles, intentional:** `Claude-Conjurer` (PowerUserAccess, used by shell utils + most Terraform); `ErikTheWizard` (Erik's SSO, used for IAM-touching ops). Override with `TF_VAR_aws_profile` or `AWS_PROFILE` env var.
