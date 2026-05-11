# Project02 Deprecation Inventory (Phase 1)

Single source of truth, scoped to `projects/project02/`, for artifacts that have been deprecated by the `docker-native-deployment` plan but are kept alive in Phase 1 for safety. Phase 1.5 will decide what to remove or archive.

## Status Definitions

- **DEPRECATED** — kept executable but marked. New work must not extend it. Not the canonical deploy path.
- **REFERENCE-ONLY** — kept on disk for inspection. No Project02 runtime depends on it.
- **GENERATED** — output of a deprecated tool. Reproducible, safe to delete.

## Inventory (Project02 scope only)

| Path | Status | Why deprecated | Phase 1.5 action candidate |
|---|---|---|---|
| `tools/package-submission.sh` | DEPRECATED | Builds Gradescope tarball with flatten + lib vendoring + config rewrites. The runtime no longer needs `lib/photoapp-server`. | Remove after Phase 1.5 confirms Docker-native build covers the same surface. |
| `tools/package-client-submission.sh` | DEPRECATED | Mirror of server packaging plus `photoapp.py`. | Remove with the server packaging script. |
| `dist/p02-server-submission-20260505T074204Z(.tar.gz)` | GENERATED | Older of the two server submissions. Differs from 074215Z only in `repositories/assets.js`. | Delete in Phase 1.5. Keep latest (`074215Z`) as historical reference until Phase 1.5 sign-off. |
| `dist/p02-server-submission-20260505T074215Z(.tar.gz)` | GENERATED | Canonical submitted artifact (60/60). | Archive separately or delete after Phase 1.5 confirms the submission-functionality checklist is covered by tests in the Docker-native runtime. |
| `dist/p02-client-submission-20260505T073104Z(.tar.gz)` | GENERATED | Submitted client artifact (30/30). Equals server submission + `photoapp.py`. | Same as server dist. |
| `images/mbai460-server/` | REFERENCE-ONLY | Vendored copy of the instructor course repo; carries its own `.git/`. Used today only by an ad-hoc `docker run -it ... bash` workflow that mounts `dist/` into the container for `/gradescope/gs submit`. | Phase 1.5 should: (a) verify nothing else in Project02 depends on it, (b) remove from disk and from the gitignored area, OR (c) move outside the project02 tree if the instructor shell is still useful for personal labs. |
| `Makefile` targets `submit-server`, `submit-client`, `submit-server-autograder`, `submit-client-autograder`, `clean-dist` | DEPRECATED (wrappers) | Drive the deprecated scripts above. | Either remove or repoint to a Phase 1.5 archive script. |
| `server/api_*.js` (eight files) | NOT YET DEPRECATED in Phase 1 | These are Gradescope filename compatibility wrappers that re-export the canonical `routes/v1/*` handlers. They duplicate behavior but the canonical handlers are tested. | Leave alone in Phase 1.5. Phase 2 (codebase + test alignment) decides whether to delete them after canonical route tests prove parity. |

## What is canonical (kept and prominent)

- `server/Dockerfile` — canonical Project02 app image.
- `docker-compose.yml` — local dev topology (mysql + localstack + server).
- `Makefile` targets `up`, `up-logs`, `down`, `test*`, `lint`, `clean*`.
- `tools/bootstrap-localstack.sh` — used by `make up`.
- `tools/phase1-smoke.sh` — Phase 1 test gate runner.

## Deletion is NOT performed in Phase 1

Phase 1's promise: label and document only. Deletion happens in Phase 1.5 after the Phase 1 alignment review confirms the Docker-native path works. See:

- `scratch/phase1-strays-inventory.md` — full cross-scope reference list.
- `scratch/phase1-test-suite.md` — the test gate that must pass before Phase 1.5 deletes anything.
- `scratch/project02-core-structure-vizualizer.md` — current vs target Docker state visualization.
