# DOC-FRESHNESS Protocol (CL11)

> Documentation that walks a contributor through *running, building, testing, or contributing* is **onboarding-facing**. Onboarding-facing documentation has the same status as production code: a PR cannot be merged if it makes onboarding-facing docs incorrect.

This file is the canonical convention. `CONTRIBUTING.md` summarises the rule and links here for the full text. The PR template (`.github/pull_request_template.md`) carries the question explicitly so the discipline survives re-orgs and review fatigue.

---

## 1. Inventory

The following files are onboarding-facing today. When a new onboarding-facing doc is added, append it here in the same PR.

### Repo entry surfaces

- `MBAi460-Group1/README.md` — repo entry point + quickstart paragraph
- `MBAi460-Group1/MetaFiles/QUICKSTART.md` — full collaborator setup walkthrough
- `MBAi460-Group1/CONTRIBUTING.md` — workspace etiquette + lockfile + library-touching protocol

### Per-project READMEs

- `projects/project01/Part03/README.md` — Part 03 server (Node / Express)
- `projects/project01/Part03/DEMO-QUICKSTART.md` — Part 03 demo walkthrough
- `projects/project02/server/README.md` — Project 02 web service (created in Phase 1)
- `projects/project02/client/README.md` — Project 02 Python client (created in Phase 3)

### Per-library READMEs

- `lib/photoapp-server/README.md` — `@mbai460/photoapp-server` (post-Phase-0.5 expansion)
- (each future `lib/<Y>/README.md` joins this list as it lands)

### Infrastructure / utility surfaces

- `infra/README.md` — Terraform, AWS backbone runtime configs
- `utils/README.md` — operational scripts inventory
- `docker/README.md` — dev image build + run

---

## 2. Classification per PR

A PR is *onboarding-affecting* if it changes any of:

- the install command (`npm install`, `pip install`, `terraform init`, etc.)
- the directory layout a contributor navigates (project structure, workspace topology)
- the development loop (test command, build command, dev-server command)
- the env vars a contributor must set
- the local-dev infra (docker-compose, mysql port, env-file conventions)
- any tool added or removed from a contributor's day-to-day path
- any IAM, AWS, or secrets-handling step a contributor performs
- the public API of a shared library (`lib/<Y>/`) — consumers' integration changes are onboarding-facing for the library's consumers

If unsure: ask the question "would a teammate following the docs at HEAD~1 still reach green tests?" — if no, the PR is onboarding-affecting.

---

## 3. Update obligation

Onboarding-affecting PRs **must** update the matching docs in the same PR. The PR template asks the question explicitly. Reviewers are expected to verify by reading the docs against the diff.

The onus is on the PR author. "I'll fix the docs in a follow-up PR" is exactly the path that produces the stale-doc state CL11 exists to prevent. Resist the temptation; spend the 10 minutes inside the same PR.

---

## 4. Verification

Major onboarding-affecting PRs (workspace introduction, new image, new tool, new library export, new env var) carry a fresh-clone smoke-test in their acceptance section: a clean clone + the exact documented commands lands at green tests. The smoke test belongs in the PR description so a reviewer can re-run it.

The Phase 0.5 plan introduces an Optional Utility — `utils/freshclone-smoke` — that automates this. When that lands, the discipline becomes: paste `utils/freshclone-smoke` output in the PR description; reviewer skims for a green tail.

---

## 5. Per-phase touchpoints

Workstream Approach docs (`*/MetaFiles/Approach/*.md`) end each phase with a *Documentation touchpoint* item that names the specific docs to refresh based on what that phase changed. The touchpoint item makes the doc-update step a checklist line, not folklore.

Pattern:

```markdown
**Documentation touchpoint:**
- [ ] If this phase changed install / boot / test commands: update root README + QUICKSTART.
- [ ] If this phase added a public library export: update `lib/<Y>/README.md`.
- [ ] If this phase changed the contributor's day-to-day workflow: update CONTRIBUTING.md.
- [ ] If this phase added an onboarding-facing doc: append it to DOC-FRESHNESS.md § Inventory.
```

---

## Internal-process docs (NOT onboarding-facing; tracked here for visibility)

These are for executors / coordinators, not new contributors. They don't gate on the fresh-clone smoke test.

- `MBAi460-Group1/MetaFiles/TODO.md` — Class Project queue (includes Deferred Optional Steps schema after Phase 0.5.7)
- `MBAi460-Group1/MetaFiles/Journal/` — session journal entries
- `projects/<X>/MetaFiles/Approach/*.md` — workstream-specific Approach docs (planning surface, not onboarding)
- `projects/<X>/MetaFiles/OrientationMap.md` — execution-state snapshot
- `learnings/*.md` — process retrospectives + reconciliation logs
- `claude-workspace/` (parent lab repo) — agent-internal coordination

---

## How this protocol came to exist

Phase 0 of the Project 02 library extraction was the catalyst: introducing npm workspaces changed the install command (`npm install` from monorepo root, not `cd projects/project01/Part03 && npm install`). Without a doc-freshness gate, that change would have shipped while the QUICKSTART still said "cd into Part 03 first" — a teammate would have hit phantom `Cannot find module '@mbai460/photoapp-server'` errors with no obvious culprit.

CL11 was articulated in the extraction Approach (`projects/project02/client/MetaFiles/Approach/00-shared-library-extraction.md` § Phase 5) and ratified by Phase 0.5.1's commit landing this file.

See the broader Approach for the rationale: workspace topology + library extraction + multi-consumer collaboration is exactly the situation where folklore beats documentation faster than anyone notices.
