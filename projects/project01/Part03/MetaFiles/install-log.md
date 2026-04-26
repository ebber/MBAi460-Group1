# Part 03 Install Log

A chronological record of every package install (npm or otherwise) performed in this Part 03 directory. Per Erik 2026-04-26: be VERY EXPLICIT about what was installed.

Each entry should capture:
- **Date** (UTC)
- **Working directory** (where the command was run from)
- **Command** (verbatim)
- **Exit code**
- **Packages installed / changed** (counts + notable adds)
- **Vulnerabilities reported** (counts + severity)
- **Warnings / notable output**
- **Source** (which plan phase + task triggered it)

Used by future agents (and any human reviewer) to understand the dependency chain of the Part 03 build.

---

## 2026-04-26 — Phase 0 baseline `npm install`

- **Source:** `02-server-foundation-plan.md` Phase 0 Task 0.2 (baseline verification before refactor begins).
- **Working directory:** `MBAi460-Group1/projects/project01/Part03/`
- **Command:** `npm install`
- **Exit code:** `0`
- **Packages installed:** 305 (audited 306).
- **`node_modules/`:** created (~204 entries at top level).
- **`package-lock.json`:** generated (157 KB).
- **Funding:** 44 packages requesting (`run \`npm fund\` for details`).
- **Deprecation warnings (9):** transitive deps from `sqlite3@5.1.7`'s prebuild toolchain — `tar@6.2.1`, `gauge@4.0.4`, `are-we-there-yet@3.0.1`, `@npmcli/move-file@1.1.2`, `npmlog@6.0.2`, `glob@7.2.3`, `rimraf@3.0.2`, `prebuild-install@7.1.3`, `inflight@1.0.6`. None affect direct deps.
- **Vulnerabilities (8):** 2 low + 1 moderate + 5 high. **All 8 are transitive through `sqlite3@5.1.7`.** Affected packages: `@tootallnate/once`, `cacache`, `http-proxy-agent`, `make-fetch-happen`, `node-gyp`, `tar` (and a couple more in the tree). `npm audit --json` confirms `fixAvailable: { name: 'sqlite3', version: '6.0.1', isSemVerMajor: true }` for every vulnerability — single upgrade resolves them all.
- **Notable:** `sqlite3` is in the package.json dependencies but is **not actually used** by the Express baseline (`server/*.js` files do not `require('sqlite3')` — verified). It appears to be a leftover from the Project 2 copy. **Surface to Erik:** consider removing `sqlite3` from `dependencies` (eliminates all 8 vulnerabilities + 9 deprecation warnings + reduces install size) OR upgrading to `sqlite3@6.0.1` if it's needed downstream. Either path is destructive (changes runtime deps); deferred to Erik.
- **Result:** baseline install OK; no blockers for Phase 0 server smoke.

---

## 2026-04-26 — Phase 1 jest + supertest devDeps install

- **Source:** `02-server-foundation-plan.md` Phase 1 Task 1.1 (test toolchain).
- **Working directory:** `MBAi460-Group1/projects/project01/Part03/`
- **Command:** `npm install --save-dev jest supertest`
- **Exit code:** `0`
- **Packages added:** 306 (audited 612 total).
- **Direct deps recorded in `package.json#devDependencies`:**
  - `jest@^30.3.0`
  - `supertest@^7.2.2`
- **Funding:** 91 packages requesting funds.
- **Deprecation warnings:** 3 × `glob@10.5.0` (transitive). No new direct-dep warnings.
- **Vulnerabilities:** unchanged at 8 (still all transitive through `sqlite3@5.1.7`). Adding jest+supertest did not introduce or fix any vulnerabilities.
- **Notable:** `jest@30.x` is the current major; `supertest@7.x` is current. Both work cleanly with Express 5.
- **Verification after install:** `npm test` (script: `jest --passWithNoTests`) → exit 0, "No tests found, exiting with code 0". Toolchain ready for first failing test in Phase 2.
