# Visualizations

Architecture and design diagrams for the MBAi 460 Class Project.
All diagrams are Mermaid markdown files rendered in-editor or via mermaid.live.

## Contents

| File | Covers | Status |
|------|--------|--------|
| `docker-environment-v1.md` | Docker image structure | Current |
| `lab-architecture-v2.md` | Full Lab AWS architecture | Current — needs Rekognition added for Part02 |
| `lab-database-schema-v2.md` | photoapp + URL_Shortener DB schemas | Current |
| `lab01-iam-design-v1.md` | IAM users, roles, policies | Stale (see MetaFiles/TODO.md) |
| `lab01-part01-architecture.md` | Lab01/Project01-Part01 architecture | Current |
| `lab02-architecture.md` | Lab02 URL Shortener architecture | Current |
| `lab-database-schema-v3.md` | photoapp schema + labels table | Current — labels table live, 70/70 |
| `project01-part02-iam-v1.md` | IAM target state post Phase 1 Terraform | Current — s3readonly + s3readwrite live |
| `project01-part02-api-flow-v1.md` | API function structure + decorator pattern | Current — all 7 functions implemented |

## Naming Convention

`<scope>-<subject>-v<N>.md` — for current/approved state
`Target-State-<scope>-<subject>-v<N>.md` — for proposed state, not yet applied

- **scope:** `lab` (broad), `lab01`/`lab02` (assignment-specific), `project01` etc.
- **subject:** kebab-case description
- **v\<N\>:** version number; increment on significant updates

**Lifecycle of a Target-State file:**
1. Created as `Target-State-X.md` (status: PROPOSED)
2. Reviewed and approved
3. Applied / implemented
4. Renamed to `X.md`, status updated to Current, README updated

**Update vs. new file:**
- **Update** an existing file when the change is evolutionary (living document, version bump applies) — e.g. adding Rekognition to `lab-architecture-v2.md`
- **New Target-State file** when the change is a discrete, reviewable design decision — e.g. a new IAM identity model or new DB schema

See `MetaFiles/TODO.md` for pending naming cleanup.
