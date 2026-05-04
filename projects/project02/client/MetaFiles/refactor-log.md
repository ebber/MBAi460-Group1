# Project 02 Part 01 Refactor Log

This log tracks intentional changes made during Project 02 Part 01's multi-tier rebuild. Companion to `Approach/Plan.md` (orchestration) + `OrientationMap.md` (execution state). Use this for *workstream pickup announcements* and *findings/learnings* that don't fit elsewhere.

---

## Workstream pickup log

2026-05-04 agent-pranav-clone picked up Phase 1 (Foundation) on branch `feat/p02-foundation`

---

## Findings + decisions

### 2026-05-04 — Sub-phase 1.0 close (`feat/p02-foundation`)

**Outcome:** `projects/project02/server/` is now a functioning workspace consumer of `@mbai460/photoapp-server@1.0.0`. Smoke shell boots; library symlink resolves through the hoisted root `node_modules`; permanent `tests/unit/library_resolution.test.js` carries the CI guard for the import shape. All workspace tests green: lib 99/99, Part 03 32+2 skipped, project02-server 2/2.

**Decisions:**

1. **Assignment-template starter preserved at `projects/project02/server/_assignment-template/`** rather than deleted. The flat `api_*.js` files document the exact wire contract (request shapes, response envelopes, status codes) the Gradescope autograder expects — useful reference for Approach Phase 2's spec-compliant route implementations even though the source itself won't be reused (CL9 — service core lives in the library, not in consumer trees). `_assignment-template/README.md` documents lifecycle: directory deletes after Phase 2 acceptance (Gradescope server 60/60).
2. **Stale `projects/project02/package-lock.json`** (untracked, pre-workspace remnant) deleted. CONTRIBUTING.md mandates root-only lockfiles under workspaces.
3. **Legacy `projects/project02/package.json`** (tracked, `"name": "nodejs"`, `"main": "app.js"`) **left in place** for now. It is not part of the workspace topology (workspaces only reference `projects/project02/server`), and removing a tracked file felt out of scope for sub-phase 1.0. Flagging here so a future cleanup pass can decide whether to delete + remove from history or leave as a harmless artifact.
4. **Library envelope shape note for forward sub-phases:** the library currently uses Part 03's `successResponse(data) → {message, data}` shape. Project 02's spec calls for variadic envelopes (`{message, M, N}` for /ping; `{message, assetid}` for upload). The library's `envelopes.js` self-documents this gap as "Phase 1+ landing" — track as a 1.1.0 promotion candidate; surfaces in Approach Phase 8 (Plan sub-phase 1.8 — OpenAPI 3.1 stub + library exports verified).
5. **Phase 0.6 fresh-clone smoke deferred.** `utils/freshclone-smoke` already exercises the workspace install flow against a `git clone --shared` tmp dir; running it from `feat/p02-foundation` would gate on the SPA-fallback `frontend/dist/index.html` placeholder issue noted in Phase 0's risks section. The root cause (gitignored Vite output) is queued for a permanent fix in a later sub-phase per the Plan's Phase 0.6 risks carry-forward; the workspace smoke is sufficient evidence for sub-phase 1.0 acceptance.

**Visualizations built:** `visualizations/Target-State-project02-foundation-consumer-bootstrap-v1.md` (Phase 0 optional VIZ, per Erik's "mermaid visualizations confirm architecture for the pilot" directive).

**Optional Steps routing (cadence: per-phase batch):**

- ✅ **Built** — VIZ `Target-State-project02-foundation-consumer-bootstrap-v1.md`
- ✅ **Built** — TEST `tests/unit/library_resolution.test.js` (recommended; replaces deleted /__bootcheck CI value)
- 📋 **Queued** — UTIL `make doctor` extension. Phase 0.4 + 0.5 verification commands (`validate-db`, `smoke-test-aws`, `cred-sweep`, library symlink probe) compose well, but `make doctor` itself doesn't exist yet (Phase −1 didn't ship it). Queue under Plan sub-phase 1.10 (Makefile + compose orchestration) — natural home for the consolidated doctor command.

**Push posture:** per Erik's directive ("git push at end of each phase to surface merge conflicts early"), pushing `feat/p02-foundation` to `origin` immediately after this commit lands.
