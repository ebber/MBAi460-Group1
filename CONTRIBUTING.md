# Contributing

Welcome. This file is the collaboration contract: enough to install + work + ship a PR without folklore. Everything here applies whether you're a teammate, a returning collaborator, or an agent picking up cold.

For first-time environment setup (AWS credentials, Terraform, Docker, DB schema), start with [`MetaFiles/QUICKSTART.md`](MetaFiles/QUICKSTART.md). This file is for the day-2 question: "I cloned, things install, now what's the discipline?"

---

## Workspace etiquette

The repo is an npm workspaces monorepo. Workspaces are declared in the root `package.json`:

```json
"workspaces": [
  "lib/*",
  "projects/project01/Part03",
  "projects/project02/server"
]
```

This has three concrete consequences for daily work:

### Where to install

Almost always **inside the workspace**, not at the root:

```sh
# Adding a runtime dep to Part 03's server
cd projects/project01/Part03
npm install <pkg>

# Adding a dep to the shared library
cd lib/photoapp-server
npm install <pkg>
```

Root-level installs (`cd MBAi460-Group1 && npm install <pkg>`) are reserved for tooling that genuinely operates across workspaces (e.g., a future repo-wide ESLint config in `devDependencies`). When in doubt: install inside the workspace.

### How the symlinks work

When you run `npm install` from the root, npm creates a symlink at `node_modules/@mbai460/photoapp-server/` pointing into `lib/photoapp-server/`. This means:

- A code change in `lib/photoapp-server/src/` is **immediately visible** to consumers — no `npm install` needed.
- A change to `lib/photoapp-server/package.json` (new dep, version bump) **does** require a fresh root `npm install`.

If `require('@mbai460/photoapp-server')` ever fails with "Cannot find module," run `utils/lib-symlink-check` from the repo root for a 5-line ground-truth check on the symlink state.

### What "the lockfile" means now

There is **one** lockfile: `MBAi460-Group1/package-lock.json`. Workspace-level `package-lock.json` files do not exist (and shouldn't). If you find one, delete it.

Lockfile changes happen at the root after any workspace dep change. Stage them in the same commit as the dependency change.

---

## Lockfile conflict survival

Two PRs that both touch dependencies will fight over the lockfile. Three tools handle it:

### One-time setup

```sh
npx npm-merge-driver install --global
```

This installs an npm-aware merge driver that resolves most lockfile conflicts automatically by re-running `npm install` against the merged tree.

### Rebase strategy

```sh
# main has new lockfile changes; you've also touched it
git fetch origin
git rebase origin/main
# if a conflict surfaces:
npm install                # re-run to materialize the merged lockfile state
git add package-lock.json
git rebase --continue
```

### The "rebuild the lockfile" fixup

If the lockfile gets into a state that npm refuses to install from:

```sh
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "chore(monorepo): rebuild lockfile after merge"
```

This is heavy-handed but reliable. Save it for genuine "everything's broken" moments — habitual lockfile rebuilds defeat the determinism the lockfile exists to provide.

---

## Library change protocol (CL12)

If your PR touches `lib/photoapp-server/` (or any future `lib/<Y>/`), it is a **library-touching PR**. Library-touching PRs cross multiple consumers; reviewers need to think across them.

Three concrete obligations:

1. **Apply the `lib:photoapp-server` GitHub label** (or the label corresponding to the library you touched).
2. **Confirm both consumers' tests pass.** Today: `cd projects/project01/Part03 && npm test` AND `cd lib/photoapp-server && npm test`. Once Project 02 server is scaffolded (Phase 1+), add `cd projects/project02/server && npm test`.
3. **Mention all consumers in the PR description**, even if the change is "purely additive" — additive changes to a library still ripple into consumer test runs and reviewer attention.

The PR template (`.github/pull_request_template.md`) carries the library-touching checkbox; the label is enforced manually until branch-protection automation lands.

### When to bump the library version

| Change | Action |
|---|---|
| Internal refactor; no public API change | No version bump (pre-1.1.0 policy: workspace `*` floats anyway) |
| New public export | Bump minor when the next strict-pin window opens; don't bump mid-window |
| Breaking change to existing public export | **Don't.** Add the new export alongside; deprecate the old one in a follow-up PR. Breaking changes during pre-1.1.0 still require both consumers updated in the same PR. |

---

## Doc-freshness protocol (CL11)

Onboarding-facing docs are production code. See [`MetaFiles/DOC-FRESHNESS.md`](MetaFiles/DOC-FRESHNESS.md) for the canonical convention.

Short version:

- If your PR changes the install command, the test command, the directory layout, env vars, or a tool a contributor uses day-to-day, it's **onboarding-affecting**.
- Onboarding-affecting PRs update the matching docs *in the same PR*.
- Major onboarding-affecting PRs (workspace introduction, new image, new lib export) include a fresh-clone smoke run in the PR description.

The PR template asks the question explicitly. Reviewers verify by reading the docs against the diff.

---

## "It works locally but not in CI" troubleshooting

The single most common symptom: **phantom dependency**. A consumer requires a transitively-installed package that npm hoisted to root `node_modules/` but isn't declared in the consumer's `package.json`. Locally it resolves; CI's clean install doesn't have the hoist artifact.

Fix:

```sh
rm -rf node_modules
npm ci                 # not `npm install` — `ci` is what CI runs and respects the lockfile
```

If `npm ci` fails locally with the same error CI saw, you've reproduced it. The dep is missing from a `package.json` somewhere — declare it in the workspace whose source `require`s it.

If `npm ci` succeeds locally but CI still fails: confirm CI is on the same Node major (24.x per `engines`) and the same `npm` major (11.x). Engine drift is the next most common cause.

---

## Conventional Commits

We use Conventional Commits with the following scopes added for monorepo work:

| Scope | Use for |
|---|---|
| `chore(monorepo)` | workspace topology, root tooling, lockfile rebuilds |
| `chore(meta)` | Plan/Map/refactor-log/learnings updates |
| `docs(monorepo)` | repo-wide doc changes (README, QUICKSTART, CONTRIBUTING, DOC-FRESHNESS) |
| `feat(lib)`, `fix(lib)`, `refactor(lib)`, `test(lib)` | shared library — `@mbai460/photoapp-server` |
| `feat(part03)`, `fix(part03)`, etc. | Part 03 consumer |
| `feat(p02-server)`, `feat(p02-client)`, etc. | Project 02 surfaces (post Phase 1) |
| `feat(infra)`, `fix(infra)` | Terraform / AWS backbone |
| `feat(utils)`, `fix(utils)` | `utils/` scripts |

Body conventions:

- Subject ≤72 chars; explain *what* changed in the subject.
- Body explains *why* and any non-obvious *how*.
- Reference the Approach phase, plan section, or learnings file when applicable. The reviewer should be able to find the design rationale without scrolling git history.
- End with `Co-Authored-By:` lines for any agent or collaborator who substantially shaped the change.

---

## Branching + PRs

| Phase | Branch naming pattern |
|---|---|
| Library extraction (Phase 0) | `feat/lib-extraction` |
| Project 02 phases | `feat/p02-foundation`, `feat/p02-web-service`, `feat/p02-client-api`, `feat/p02-engineering-surface` |
| Bug fixes | `fix/<surface>-<short-description>` |
| Doc-only changes | `docs/<scope>-<topic>` |
| Hygiene / tooling | `chore/<scope>-<topic>` |

Open PRs against `main`. Required status checks (once branch protection lands per Phase 0.6.3):

- `test (lib/photoapp-server)`
- `test (projects/project01/Part03)`
- `test (projects/project02/server)` — once that workspace exists

The PR template carries the onboarding-facing + library-touching checklists.

---

## Approach + Plan + Map: how the docs interact

Project 02 Part 01 (the active quest) is orchestrated by three artifacts:

- **Approach docs** (`projects/project02/client/MetaFiles/Approach/*.md`) — the spec; each workstream is one file, ~700 lines, stable across the quest.
- **Plan** (`projects/project02/client/MetaFiles/Approach/Plan.md`) — orchestration layer over the Approach docs; one master tracker, cross-cutting threads (testing / utilities / visualizations / library / doc-freshness), Optional Steps Registry.
- **OrientationMap** (`projects/project02/client/MetaFiles/OrientationMap.md`) — execution state; mutable; the Active Frame is the current sub-phase.

Pickup protocol when entering a new workstream is in `Plan.md` § *How Collaborating Agents Pick Up*. TL;DR: read OrientationMap § Active first to find the current state, then read the relevant Approach phase, then start work.

---

## Optional Steps queue

Approach docs surface "Optional Test / Utility / Visualization Steps" — work that's valuable but not strictly required for the next acceptance gate. When you assess one and decide to defer, route it to [`MetaFiles/TODO.md`](MetaFiles/TODO.md) § *Deferred Optional Steps* using the schema there. Don't free-form skip — rows in that section have a Trigger field that says when to revisit, which prevents indefinite drift.

---

## Quick reference

| Need | Path |
|---|---|
| First-run env setup | [`MetaFiles/QUICKSTART.md`](MetaFiles/QUICKSTART.md) |
| Repo overview | [`README.md`](README.md) |
| Library API | [`lib/photoapp-server/README.md`](lib/photoapp-server/README.md) |
| Doc-freshness rule | [`MetaFiles/DOC-FRESHNESS.md`](MetaFiles/DOC-FRESHNESS.md) |
| Active Project 02 quest | [`projects/project02/client/MetaFiles/OrientationMap.md`](projects/project02/client/MetaFiles/OrientationMap.md) |
| TODO queue | [`MetaFiles/TODO.md`](MetaFiles/TODO.md) |
| Reconciliation logs | `learnings/` |

If you can't find what you need from this list: open an issue, surface in PR review, or queue a doc TODO. Folklore is the failure mode this whole stack exists to prevent.
