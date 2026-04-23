# Collaborator Readiness Quest — Phase 2 Triage Table

**Status:** 2E Complete — triage signed off 2026-04-23
**Source artifacts:** phase2-findings-2a through 2d
**LoE tiers:** Trivial < 5 min | Quick 5–15 min | Involved 15+ min

---

## ACT — Quick (1)

| ID | Tag | Finding | File(s) |
|----|-----|---------|---------|
| S2B-1 | 🟠 | ~~Fix `rotate-passwords` bug — write `NEW_RO_PWD` to `infra/config/photoapp-config.ini` after rotation~~ | ✅ DONE 2026-04-23 |

---

## ACT — Trivial (16)

### QUICKSTART / Docs cluster

| ID | Tag | Finding | File(s) |
|----|-----|---------|---------|
| S2C-1 | 🔴 | ~~Delete root `QUICKSTART.md`; update `README.md` "Getting Started" link to `MetaFiles/QUICKSTART.md`; add `## MetaFiles` section~~ | ✅ DONE 2026-04-23 |
| S2C-4 | 🟡 | ~~Add `bash setup/mac.bash` step to `MetaFiles/QUICKSTART.md` Step 2~~ | ✅ DONE 2026-04-23 |
| S2C-5 | ✨ | ~~Add `QUICKSTART.md` + `plans/` rows to `MetaFiles/README.md` contents table~~ | ✅ DONE 2026-04-23 |
| S2C-6 | ✨ | ~~Comment-guard `create-shorten.sql` step in QUICKSTART Step 6~~ | ✅ DONE 2026-04-23 |

### Utils / Infra cluster

| ID | Tag | Finding | File(s) |
|----|-----|---------|---------|
| S2B-2 | 🟠 | ~~Add `# Mac/Colima only` header to `docker-up`, `docker-down`, `docker-status`~~ | ✅ DONE 2026-04-23 |
| S2B-3 | 🟡 | ~~Add `infra/terraform/terraform.tfvars.example`~~ | ✅ DONE 2026-04-23 |
| S2B-4 | 🟡 | ~~Add CWD note to `docker/build` + `docker/run.bash` headers~~ | ✅ DONE 2026-04-23 |
| S2B-5 | 🟡 | ~~Add `require_cmd aws` guard to `smoke-test-aws` + `aws-inventory`~~ | ✅ DONE 2026-04-23 |
| S2C-7 | 🟡 | ~~Add `MetaFiles/plans/` to `.gitignore`~~ | ✅ DONE 2026-04-23 |
| S2A-6 | ✨ | ~~Replace partial live RDS suffix `c5q4s860smqq` with fully generic placeholder in both `.example` files~~ | ✅ DONE 2026-04-23 |

### Codebase / Artifacts cluster

| ID | Tag | Finding | File(s) |
|----|-----|---------|---------|
| S2D-1 | ⬜ | ~~Add "agent coordination artifacts" note to `labs/lab02/MetaFiles/README.md`~~ | ✅ DONE 2026-04-23 |
| S2D-2 | ✨ | ~~Convert Future State `[ ]` items to prose in `lab01-iam-design-v1.md`~~ | ✅ DONE 2026-04-23 |
| S2D-3 | ✨ | ~~Add cross-reference header to `projects/project02/client/photoapp.py`~~ | ✅ DONE 2026-04-23 |
| S2D-6 | 🟡 | ~~Add `test-mysql.py` row to `projects/project01/README.md`~~ | ✅ ALREADY PRESENT — no action needed |
| S2D-8 | 🟡 | ~~Close `[IaC]` + `[Secrets]` items in `Part02/MetaFiles/TODO.md` (both done; stale open items mislead collaborators)~~ | ✅ DONE 2026-04-23 |
| S2A-4 | 🟡 | ~~Remove `-- pwd = abc123!!` comment from seed INSERT in `create-photoapp.sql`~~ | ✅ DONE 2026-04-23 (removed all 3 seed INSERT pwd comments) |

---

## ACK — Accept As-Is (4)

| ID | Tag | Finding | Reason |
|----|-----|---------|--------|
| S2A-2 | ⬜ | `labs/lab01/Part 00/s3-config.ini` tracks class/staff S3 bucket | Part 00 exercise uses the shared class bucket — that IS the correct value |
| S2A-3 | ⬜ | `authsvc-client-config-staff.ini` contains live staff API endpoint | Class-provided intentionally; students test against staff service by design |
| S2A-5 | 🟠 | `project03` SQL `CREATE USER` with plaintext passwords | Class-provided; already in MetaFiles/TODO.md B5; can't change assignment files |
| S2D-4 | ⬜ | `project03/` committed Lambda deployment zips | Class-provided; necessary for the assignment |

---

## QUEUE — Defer Beyond This Session (3)

| ID | Tag | Finding | Deferred to |
|----|-----|---------|-------------|
| S2A-1 | 🟠 | All Phase 1 + Phase 2 work uncommitted — remote is pre-Phase-1 | Phase 3 final commit (last quest step by definition) |
| S2A-7 / S2D-5 | 🟡 | ~~`Part03/` PDF untracked; inconsistent with tracked Part02 PDF~~ | ✅ ROUTED 2026-04-23 → `MetaFiles/TODO.md` Active — resolve before Phase 3 commit |
| S2D-7 | ⬜ | ~~`labs/lab01/Part 00/` extensionless `A` + duplicate `B` artifacts — download exercise outputs without context~~ | ✅ DROP 2026-04-23 — A and B are functional test artifacts; keep as-is |

---

## DROP — Resolved by Other Items (2)

| ID | Tag | Finding | Resolved by |
|----|-----|---------|-------------|
| S2C-2 | 🟠 | Root QUICKSTART says `AdministratorAccess` (should be PowerUserAccess) | S2C-1 — file gets deleted |
| S2C-3 | 🟠 | Root QUICKSTART password ordering creates garbage literal password | S2C-1 — file gets deleted |

---

## Totals

| Recommendation | Count |
|---------------|-------|
| Act — Quick | 1 |
| Act — Trivial | 16 |
| Ack | 4 |
| Queue | 3 |
| Drop | 2 |
| **Total findings** | **26** |
