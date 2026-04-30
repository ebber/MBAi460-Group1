---
name: Orientation surfaces
description: Where to look first when resuming a session in this repo
type: reference
originSessionId: 1e15db51-7353-4e14-aeea-749705958a24
---
**Read order for fastest spin-up:**

1. `README.md` (repo root) — directory map + key facts (region, schema canonical path, queue surfaces).
2. `MetaFiles/QUICKSTART.md` — full collaborator setup walkthrough (secrets → Docker → Terraform → schema → verify). Use when standing up the env from scratch.
3. `MetaFiles/TODO.md` — Class-Project ActionQueue (Active + Backlog).
4. `projects/project01/Part03/MetaFiles/OrientationMap.md` — **the authoritative current-state file** when Part 03 is the active arc. Lists Active workstream, Pending queue, Closed (recent). Updated atomically per substep close.
5. `MetaFiles/Journal/` — most recent file gives the freshest narrative of what landed and why. Files are ISO-dated.
6. `projects/project01/Part03/MetaFiles/Approach/` — durable design docs for Part 03 (00-coordination-and-contracts.md is the FE↔BE contract; Future-State-roadmap.md is the long-range plan).
7. `MetaFiles/Manifesto-AWS-Lab-Sanctum.md` and `MetaFiles/Future-State-Ideal-Lab.md` — governing principles + long-term design target.

**For "what's the schema?":** `projects/project01/create-photoapp.sql` (+ `create-photoapp-labels.sql`).

**For "what utils exist?":** `utils/` (cred-sweep, rebuild-db, rotate-passwords, smoke-test-aws, validate-db, run-sql, aws-inventory, docker-up/down/status/run, etc.). All callable from repo root.

**For "what infra is up?":** `infra/terraform/` (run terraform here); `utils/smoke-test-aws --mode live` verifies live state; `utils/aws-inventory` enumerates resources.
