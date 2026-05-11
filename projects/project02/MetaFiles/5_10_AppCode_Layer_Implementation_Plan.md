# App Code Layer — implementation plan (2026-05-10)

This plan turns the current Project02 server toward a **single, production-shaped HTTP surface**: explicit API versioning, thin route controllers, boundary validation, unified errors, and domain logic retained in `server/src/photoapp-core`. It assumes **autograder constraints are no longer binding** (for example, duplicate `api_*.js` “compat” files and static patterns in those files).

---

## Goals

- **One routing stack** — no parallel Express handlers for the same behavior.
- **Explicit versioning** — e.g. mount public routes under `/v1` (or `/api/v1`) instead of scattering spec paths at the workspace root forever.
- **Thin controllers** — parse/validate → call `photoapp-core` services → map to response DTOs; failures flow through **`next(err)`** and centralized error middleware.
- **Contract clarity** — OpenAPI (`api/openapi.yaml`) stays aligned with the live surface (generate-from-code, code-from-schema, or manual discipline—pick one workflow and document it in this repo).
- **Operational readiness** — predictable logging fields, liveness vs readiness, timeouts/retries/circuit behavior documented and consistent (not “per-file proof” artifacts).

## Non-goals (for this pass)

- Replacing Express or rewriting `photoapp-core` in another language.
- Full authentication/authorization product design (call out placeholders only).
- Greenfield UI; focus is the API layer and deployment contract.

---

## Phase 0 — Baseline and compatibility decision

1. **Inventory current routes** — List every method/path today (`server/app.js`, `server/routes/v1/*`, any internal routes). Cross-check against `api/openapi.yaml`.
2. **Choose URL strategy** — Either:
   - **Hard cut**: only `/v1/...` (update clients and docs), or  
   - **Transitional dual-mount**: keep legacy root paths for one release **or** put an API gateway / reverse proxy in front to rewrite paths (document the sunset date).
3. **Define success metrics** — Example: all integration tests green, OpenAPI diff clean, no duplicate handler modules, Docker image excludes unused starter trees.

---

## Phase 1 — Introduce a versioned router without behavior drift

1. **Add `server/routes/v1/router.js`** (or equivalent) that exports an `express.Router()` with **all** spec routes moved from `app.js` onto the router.
2. **Mount the router** — `app.use('/v1', v1Router)` (adjust prefix to match Phase 0).
3. **Keep existing middleware order** on `app`: `request_id` → `logging` → `express.json` → **routers** → 404 → `createErrorMiddleware`.
4. **If using transitional dual-mount**, register the same router **twice** (root + `/v1`) only until clients migrate, with a documented removal ticket.

---

## Phase 2 — Validation and error unification

1. **Standardize on Zod at the boundary** — For each route, define input schemas (params, query, body) in a colocated module or `server/schemas/`; reject invalid input **before** calling services.
2. **Normalize errors** — Routes should **not** mix ad hoc `res.status(...).json(...)` for unexpected failures. Prefer:
   - services throw **typed errors** (`middleware/errors.js` family) or return results that map to HTTP errors;
   - **`next(err)`** for anything that should pass through `createErrorMiddleware` and `error_config.js`.
3. **Audit `routes/v1/*`** — Remove duplicated validation logic once Zod covers it; keep handlers small and readable.

---

## Phase 3 — Retire the duplicate layer and cruft

1. **Remove `server/api_*.js`** (root of server) after routes fully subsume behavior and tests no longer import them.
2. **Remove or quarantine `server/_assignment-template/`** — Exclude from Docker build via root `.dockerignore` if files must remain in-repo for history.
3. **Clean stray manifests** — Revisit `projects/project02/package.json` (non-workspace “nodejs” stub); delete or relocate so the monorepo workspace story matches reality (`projects/project02/server` only).
4. **Prune `dist/p02-server-submission-*`** from runtime consideration** — Keep only if needed for archival; never treat as source of truth.

---

## Phase 4 — Contract, tests, and CI guardrails

1. **OpenAPI sync** — Update `api/openapi.yaml` to the versioned paths; add CI check (lint bundle, diff gate, or codegen smoke).
2. **Update integration tests** — Point `supertest` at `/v1/...` (and add a **small** legacy-root suite only if Phase 0 requires transitional mounts).
3. **Add contract tests** — Expand beyond happy path: 400 envelopes, unknown errors → 500 shape, readiness behavior under degraded dependencies where applicable.
4. **Document client migration** — Short note in `server/README.md` (or client README): base URL, versioning, deprecation of root paths.

---

## Phase 5 — Production operations (minimal hardening checklist)

1. **Configuration** — Env vars documented; no secrets in images; config file path (`PHOTOAPP_CONFIG_PATH`) behavior unchanged or clarified.
2. **Process** — Confirm graceful shutdown (`server/server.js`) still drains DB pool when signals fire behind orchestration.
3. **Dependencies** — Review retries and circuit breaking (`opossum`, AWS SDK) for external calls; set **timeouts**; avoid unbounded queueing.
4. **Observability** — Ensure logs include `req.id`, route template, and stable error codes; enable tracing only where it pays off.

---

## Rollback and risk notes

- **Client breakage** is the main risk when introducing `/v1` or removing root mounts; mitigate with dual-mount or proxy rewrites during transition.
- **Error body drift** can break mobile/web clients; gate changes behind tests that assert **documented** error schemas, not accidental string matches.

---

## Suggested execution order (summary)

| Step | Action |
|------|--------|
| 1 | Inventory routes + OpenAPI; choose `/v1` vs dual-mount. |
| 2 | Extract `v1` router; mount under prefix; keep middleware order. |
| 3 | Add Zod validation; route handlers call `next(err)` for failures. |
| 4 | Update tests + OpenAPI + README. |
| 5 | Delete `api_*.js`, template noise, stray package noise; tighten `.dockerignore`. |
| 6 | Ops checklist: shutdown, timeouts, logging, CI contract gate. |

---

## Owners and checkpoints

- After **Phase 1**: “Same behavior, new mount path” verified by tests (or dual-mount parity).
- After **Phase 2**: No new raw `res.status` error exits in `routes/v1` except for intentional, documented early returns that match the OpenAPI contract.
- After **Phase 3**: Image and working tree contain **one** implementation path for each HTTP operation.
