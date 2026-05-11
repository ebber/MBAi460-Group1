# Project02 Deprecation Inventory

History of what was deprecated and removed/archived during Phases 1 and 1.5 of the `docker-native-deployment` plan. Scoped to `projects/project02/`. Update on each Phase 1.5 group landing.

## Status Definitions

- **REMOVED** — gone from the live tree. Reachable via git history.
- **ARCHIVED** — moved out of the live tree into `projects/project02/submission artifacts/`. Read-only, preserved for inspection.
- **DEPRECATED** — still on disk in its original location, marked, kept executable for safety. Removal queued for a later phase.

## Inventory

| Path (final) | Status | Phase | Notes |
|---|---|---|---|
| `submission artifacts/tools/archieve_package-submission.sh` | ARCHIVED | 1.5 Group A/B | Original `tools/package-submission.sh`. Built Gradescope tarballs (flatten + lib vendoring + Gradescope shim). Replaced by `server/Dockerfile` as the canonical artifact builder. |
| `submission artifacts/tools/archieve_package-client-submission.sh` | ARCHIVED | 1.5 Group A/B | Mirror of the server packaging script plus `photoapp.py`. |
| `submission artifacts/dist/archieve_p02-server-submission-20260505T074204Z(.tar.gz)` | ARCHIVED | 1.5 Group A | Generated submission output; older of the two server submissions. Differs from 074215Z only in `repositories/assets.js`. |
| `submission artifacts/dist/archieve_p02-server-submission-20260505T074215Z(.tar.gz)` | ARCHIVED | 1.5 Group A | Canonical submitted artifact (60/60). Kept as the historical reference baseline. |
| `submission artifacts/dist/archieve_p02-client-submission-20260505T073104Z(.tar.gz)` | ARCHIVED | 1.5 Group A | Submitted client artifact (30/30). Equals server submission + `photoapp.py`. |
| `submission artifacts/images/archieve_mbai460-server/` | ARCHIVED | 1.5 Group C | Vendored copy of the instructor course repo with its own `.git/`. Used by the deprecated `gs submit` workflow. |
| `Makefile` targets `submit-server`, `submit-client`, `submit-server-autograder`, `submit-client-autograder`, `clean-dist` | REMOVED | 1.5 Group B | Removed in commit `9fa8bd8`. Reachable via `git log -p Makefile`. |
| `Makefile` aliases `up`, `down` | DEPRECATED | (Group E) | Aliases for `docker-up-aws` / `docker-down`. Kept for muscle memory; removal queued for Group E. |
| `server/api_*.js` (8 files) | NOT YET DEPRECATED | (Phase 2 P2.A) | Gradescope filename-compatibility wrappers. Phase 2 retires them after canonical route tests prove parity. |

## What is canonical (kept and prominent)

- `server/Dockerfile` — canonical Project02 app image.
- `docker-compose.yml` — local dev topology, two profiled lanes.
- `Makefile` — canonical operator commands (`docker-up-aws`, `docker-up-localstack`, `docker-down`, `bootstrap-localstack`, plus test/lint/install/clean).
- `tools/bootstrap-localstack.sh` — operator-driven LocalStack provisioning.
- `tools/phase1-smoke.sh` — Phase 1 test gate runner.
- `README.md` — operator entry point.

## How to inspect archived content

```bash
ls "projects/project02/submission artifacts/"
ls "projects/project02/submission artifacts/tools/"
ls "projects/project02/submission artifacts/dist/"           # gitignored on disk
ls "projects/project02/submission artifacts/images/"         # gitignored on disk
```

The two `archieve_package-*-submission.sh` files are tracked in git; the dist tarballs and the instructor repo stay gitignored to avoid bloating the parent repo.

## Removal vs archival decisions

Group B removed Makefile targets because they are tiny, reachable via `git log -p`, and there is no value in keeping a broken bash shim that points at a script no longer in `tools/`.

Groups A + C archived rather than removed because the content has historical/reference value (the canonical submission tarball is the byte-for-byte record of what passed Gradescope; the instructor repo carries its own `.git/`). Archive moves are reversible; deletes are not.
