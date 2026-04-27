# Part 03 — Design Decisions

This is the canonical record of significant design decisions for **Project 01 Part 03 (PhotoApp Web UI)**. Each decision answers a specific question that shaped the architecture or workflow.

**Audience:** any collaborator (human or agent) who needs to understand *why* Part 03 looks the way it does. Andrew, this is the file to skim if you've been building from a pre-pivot baseline.

**Maintenance rule:** when a non-trivial design question gets answered, add it here. Don't bury decisions in commit messages or the refactor-log; the refactor-log is *what was changed*, this doc is *what we decided*. Cross-reference between them.

**Conventions:**

- Each decision has: **Question · Decision · Rationale · Status · Cross-refs**
- "Status" is dated when resolved.
- Cross-refs point to the artifacts that reify the decision (commits, approach-doc sections, code).

---

## Q1 — URL scheme: keep `/api/*` prefix?

**Decision:** **Yes — `/api/*` prefix.**

**Rationale:**

- Cleaner separation between API and static frontend serving (frontend mounts under `/`; API under `/api/*` only).
- Matches the `00-coordination-and-contracts.md` rule: *"Browser calls only HTTP endpoints under `/api/*` plus static website routes."*
- Makes static-frontend mounting unambiguous (no fear of static catchall absorbing API requests, when API is mounted before static).

**Implication:** the existing Project 2 Express baseline (`/ping`, `/users`, `/image/:id`, etc.) was decommissioned during Phase 2 of Server Foundation execution. The legacy `server/api_*.js` files remain on disk as a *behavioral reference* per the `Part03/MetaFiles/TODO.md` Cleanup item.

**Status:** ✅ Resolved 2026-04-26.
**Cross-refs:** `MetaFiles/Approach/00-coordination-and-contracts.md` (API contract section); `MetaFiles/refactor-log.md` 2026-04-26 entry; commits `2df494c`, `fadc449` (legacy URL decommission), `2b61a0f` (`/api` placeholder mount).

---

## Q2 — Reuse `projects/project01/client/photoapp.py` from Part 02?

**Decision:** **No — Node-native re-implementation.** Server uses `@aws-sdk/client-s3`, `@aws-sdk/client-rekognition`, and `mysql2/promise` directly. Part 02 `photoapp.py` is preserved as a behavioral reference only.

**Rationale:**

- Express + Node is the chosen backend (see Q1 / overall stack). Cross-language reuse (Node → Python module) requires either subprocess/IPC plumbing or a separate Python service — both add complexity disproportionate to the value.
- The Project 2 Express baseline already implements the same behaviors in Node; Workstream 03 smooths that baseline into a clean `services/photoapp.js` rather than building a new Python adapter layer.
- Part 02's `photoapp.py` remains valuable as a **canonical behavioral reference**: when implementing each `/api/*` endpoint, read `photoapp.py` to understand expected results, then port the behavior to the Node service module.

**Implication:** the `Project Queue` has an item *"correctly deprecating Part 02 Python from Part 03 backend"* tracking the formal deprecation path (banner in `client/photoapp.py`, README updates, etc.).

**Status:** ✅ Resolved 2026-04-26.
**Cross-refs:** `MetaFiles/Approach/03-api-routes.md` (service-module architecture); `MetaFiles/refactor-log.md` 2026-04-26 entry; `MBAi460-Group1/MetaFiles/TODO.md` "[Project01/Part03] Correctly deprecate Part 02 Python..." item.

---

## Q3 — Response envelope shape?

**Decision:** **Wrap every response in `{message, data}` (success) or `{message, error}` (failure).**

**Rationale:**

- Uniform shape across endpoints lets the UI write a single response-handling helper.
- Distinguishing `success` from `error` at the message-field level (rather than via HTTP status alone) keeps the UI robust to partial-success or domain-error patterns.
- Already aligned with parts of the legacy baseline (`api_get_users.js` returns `{message, data}`); other legacy routes (`/ping` returning `{message, M, N}`) need normalization, which Workstream 03 handles.

**Implication:** schema/conversion helpers live in `server/schemas.js`; envelope helpers (`successResponse`, `errorResponse`) are the first artifact API Routes builds (Phase 1 of `03-api-routes.md`).

**Status:** ✅ Resolved 2026-04-26.
**Cross-refs:** `MetaFiles/Approach/00-coordination-and-contracts.md` (Error Contract section + per-endpoint examples); `MetaFiles/Approach/03-api-routes.md` Phase 1.

---

## Q4 — Test stack for the Express server?

**Decision:** **Jest + supertest.**

**Rationale:**

- Mature, conventional Express pairing (per the "mature, best-practice heuristic" — see `claude-workspace/scratch/system-plane-notes.md`).
- Jest runs the Node testEnv natively; supertest exercises Express handlers without binding a port.
- Vitest was considered but Jest's deeper Express ecosystem outweighed Vitest's faster startup for this assignment-window project.
- `--passWithNoTests` flag added to `npm test` (Phase 1 of Server Foundation) so the toolchain reports clean before any test files exist.

**Implication:** test files live at `server/tests/**/*.test.js`. UI workstream uses **Vitest** (Vite-native) for frontend tests — separate test surface, no Jest/Vitest interleave.

**Status:** ✅ Resolved 2026-04-26.
**Cross-refs:** `Part03/jest.config.js`; `MetaFiles/Approach/02-server-foundation.md` Phase 1; `Part03/package.json` `devDependencies`.

---

## Q5 — Local dev mode for the UI?

**Decision:** **Built-only.** UI workstream runs `npm run build` (Vite) to produce `frontend/dist/`; Express serves that built output via static middleware. No Vite-dev-server-with-proxy mode for full-stack development.

**Rationale:**

- Single port (8080), single process — simplest deployment story; matches the "one local backend server process" rule in `00-coordination-and-contracts.md`.
- UI iteration on isolated components can still use `vite dev` independently with mocked API responses; full-stack integration testing always uses the built artifact.
- Removes the dev/prod parity question for Part 03 (production demo path == local development path).

**Implication:** UI workstream's iteration cycle includes a build step before each integration test. Acceptable for an assignment-window project. Future projects with longer UI iteration loops may revisit.

**Status:** ✅ Resolved 2026-04-26.
**Cross-refs:** `MetaFiles/Approach/01-ui-workstream.md` (Goal section dev-mode callout); `MetaFiles/Approach/00-coordination-and-contracts.md` Open Questions resolution note.

---

## Q6 — Visualization language/implementation agnosticism?

**Decision:** **The Target-State architecture diagram (`visualizations/Target-State-project01-part03-photoapp-architecture-v1.md`) is written language-agnostic** — no "FastAPI", "Python", "JS", "Node", or "Express" in box labels or prose. Boxes describe roles ("Local Web Server", "PhotoApp Service Module", "AWS service clients"); the implementation is documented in the approach docs.

**Rationale:**

- The diagram captures *architecture* (what talks to what, in which order). The *implementation* of each box (Express, mysql2, AWS SDK v3) belongs in the approach docs and code.
- Agnostic visualizations survive future re-platform decisions without rework.
- Design agent has reviewed the agnostic version (`visualizations/MetaFiles/TODO.md` item closed).

**Implication:** when describing the live architecture verbally, prefer architecture-level vocabulary first ("the server orchestrates AWS clients and a database driver"), then drop into implementation details when the audience is implementing.

**Status:** ✅ Resolved 2026-04-26 (design-agent reviewed).
**Cross-refs:** `visualizations/Target-State-project01-part03-photoapp-architecture-v1.md`; `visualizations/MetaFiles/TODO.md` closed item.

---

## How to add a future decision

1. Pick the next available Q number.
2. Use the **Question · Decision · Rationale · Status · Cross-refs** template above.
3. Cross-link from the relevant approach doc(s) and the next refactor-log entry.
4. If the decision changes a previous one, link the previous Q and add a "Superseded by Q-N" line under its Status.
