# Project 02 Assignment Template (preserved reference)

These files are the **assignment-shipped starter code** from Prof. Joe Hummel for Project 02 Part 01 (the original flat `api_*.js` layout that calls `mysql2` / `aws-sdk` directly from each route handler).

**Why they live here, not at `projects/project02/server/`:** Sub-phase 1.0 of the Foundation workstream (`MetaFiles/Approach/01-foundation.md` § Phase 0) rebuilds the server tree as a *consumer of `@mbai460/photoapp-server`* with a layered architecture (route → controller → library service → repository). The assignment template's flat file layout is incompatible with that — the spec-compliant routes will be re-implemented in Phase 2 (`02-web-service.md`) as thin adapters over the library's service layer, not as direct DB/S3 callers.

**Reference value:** these files document the **exact wire contract** (request shapes + response envelopes + status codes) the Gradescope autograder expects. Phase 2 implementations should match the wire contract observable here, not re-derive it from the PDF alone.

**Do not import from this directory.** Anything live should land outside `_assignment-template/`. This directory is read-only reference. The Approach acceptance gate for Phase 0 (§ 0.5) explicitly forbids copying *source* into Project 02's server tree from anywhere — including from Part 03 — because the canonical service-core source lives in the library now. The assignment template predates that rule and is preserved for *contract* reference, not source reuse.

**Lifecycle:** these files stay until Phase 2 is fully accepted (Gradescope server 60/60). At that point, the `_assignment-template/` directory can be deleted; a final `git log --follow` will preserve the history if needed.
