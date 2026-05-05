---
name: Environment Separation — keep cross-checkout coupling out of forward-looking artifacts
description: When this checkout's work depends on artifacts from another checkout (config, fixtures, snapshots), bring them in via cp (not symlink), and keep documentation environment-agnostic. Never reference the other checkout's path in live forward-looking docs.
type: feedback
---

**Rule:** When this checkout's work depends on artifacts from another checkout (config files, secrets, fixtures, snapshot data), bring them in via `cp` (not symlink), and keep all forward-looking documentation environment-agnostic. Never name the source checkout's path in live docs (plan, OrientationMap, design docs, READMEs). Commit-message provenance is acceptable as historical record but should not be relied on for future operation.

**Why:** Erik named the principle 2026-05-04 during a Playwright E2E workstream Phase A close-out. The motivating example: an agent had copied `photoapp-config.ini` from a sibling checkout (`mbai460-client/MBAi460-Group1/`) during pre-flight, and then wrote that source path into both the OrientationMap and the plan. That created forward-coupling — a future agent reading the tempDir checkout cold would be told to look at the sibling, perpetuating environment entanglement that the user wants to dissolve.

The deeper reason: each checkout is meant to be self-sufficient as a code surface. AWS infra and other shared resources can be acceptably co-used (Erik explicitly OK'd shared-infra during that session), but documentation in environment X should not encode an expectation that environment Y exists. Otherwise the two evolve in lockstep and the whole point of having multiple checkouts is undermined.

**How to apply:**

- **Operational:** when bringing artifacts across checkouts, use `cp` not symlink. The destination should be a self-contained copy. Once landed, the source is irrelevant.
- **Documentation:** in plan/Map/design-doc descriptions of those operations, write "copied in from an external reference" — not "copied from sibling `<path>`". The provenance lives in git commit messages and install-log entries (acceptable historical record), not in forward-looking artifacts.
- **Audit trigger:** at every workstream phase boundary, grep your authored artifacts for the literal name of the other checkout. Fix any forward-looking reference inline. Leave commit messages alone (they are historical and rewriting is destructive).
- **Edge case — shared infra:** AWS resources, Rekognition models, RDS hostnames, S3 bucket names — these are not "the other checkout"; they are shared infrastructure named via config. Different concern; not subject to this rule.
- **Edge case — workspace symlinks:** intra-repo workspace symlinks (e.g., `node_modules/@mbai460/photoapp-server -> ../../lib/photoapp-server`) are within the same checkout and are an npm-workspaces convention. Not subject to this rule.
