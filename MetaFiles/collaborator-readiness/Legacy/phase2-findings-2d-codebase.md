# Phase 2 — 2D Codebase & Artifacts Sweep Findings

**Swept:** 2026-04-23 (re-swept same session for ground-truth safety)
**Scope:** `labs/`, `projects/`, `visualizations/` — structure clarity, completion signals, backbone vs. submission, orphaned/confusing artifacts

---

## ✅ Clean — No Action Required

| Area | Status |
|------|--------|
| `labs/lab03/` | Class-provided Elastic Beanstalk starter; no MetaFiles; `.ebignore` tracked correctly ✅ |
| `labs/lab04/` | Class-provided Rekognition starter; no MetaFiles; all class-provided images tracked ✅ |
| `projects/project01/` | Backbone SQL + IAM policy in place; README updated (T9 ✅); Part02 complete + MetaFiles clean ✅ |
| `projects/project02/client/photoapp-client-config.ini` | Tracked with `# placeholder — update to deployed URL when starting project02` comment (B13 ✅); localhost:8080 only ✅ |
| `projects/project02/server/` | Class-provided Node.js stubs; no sensitive values ✅ |
| `projects/project03/client/authsvc-client-config.ini` | Tracked; contains `https://YOUR-AUTH-SERVICE.execute-api...` placeholder — clearly not live ✅ |
| `projects/project03/client/chatapp-client-config.ini` | Tracked; contains `https://YOUR-CHATAPP.amazonaws.com/stage` placeholder — clearly not live ✅ |
| `visualizations/README.md` | All 9 visualization files listed in Contents table ✅; naming convention documented ✅ |
| `visualizations/` schema accuracy | `lab-database-schema-v2.md` rotation annotation present (T3/B4 ✅); v3 has labels table ✅ |
| `projects/project01/create-photoapp.sql` | `CREATE USER` uses `${PLACEHOLDER}` variables — no plaintext passwords in SQL ✅ |
| `.gitignore` coverage | `photoapp-config.ini`, `shorten-config.ini`, `log.txt`, `.DS_Store`, `__pycache__` all gitignored ✅ |

---

## Findings

### S2D-1 — ⬜ Ownership Ambiguity — `labs/lab02/MetaFiles/` contains 6 agent coordination docs

`labs/lab02/MetaFiles/` is committed with: `APPROACH.md`, `COLLABORATION-APPROACH.md`, `EXPECTED-OUTCOMES.md`, `NAMING-CONVENTIONS.md`, `README.md`, `RETROSPECTIVE.md`.

These are agent coordination artifacts from when lab02 was developed — not student-facing docs. The MetaFiles README only lists `COLLABORATION-APPROACH.md` in its contents table and describes the directory as "how the team works together" — partially accurate but undersells the agent-coordination nature. A new collaborator encountering these would find them:
- **Valuable** — RETROSPECTIVE.md shows what worked/what didn't; APPROACH.md provides development context
- **Confusing** — `COLLABORATION-APPROACH.md`, `NAMING-CONVENTIONS.md` sound like active team-collaboration docs

**Route:** Ack — keep as project history. Add a one-line header note to the MetaFiles README clarifying these are agent coordination artifacts from lab02 development, not active team docs.

---

### S2D-2 — ✨ Polish — `lab01-iam-design-v1.md` Future State `[ ]` items (B9)

Six `[ ]` items sit at the bottom of the IAM diagram file in a clearly-labeled `## Future State` section:
```
- [ ] Scope `Claude-Conjurer` further — PowerUserAccess is still broad...
- [ ] IAM Groups for policy management...
- [ ] MFA on SSO / root
- [ ] Separate `agent-read-only` vs `agent-mutate` identities
- [ ] Replace static keys with IAM Role + OIDC for agent auth
- [ ] Periodic Access Advisor review
```

These are architectural aspirations, not active work items. The "Future State" label makes intent clear but any tool counting `[ ]` items repo-wide picks these up, and a new collaborator scanning for open tasks lands here unexpectedly.

**Route:** ✨ Polish — convert to prose (`> Aspirations: ...`) or note source as `Future-State-Ideal-Lab.md`. Queued as B9 in Phase 1.

---

### S2D-3 — ✨ Polish — Two `photoapp.py` versions coexist without cross-reference

`projects/project01/client/photoapp.py` — the Part02 implementation (7 API functions, Rekognition)
`projects/project02/client/photoapp.py` — the project02 version (class-provided stub)

Both exist at parallel paths. Intentional — different assignment stages. A new collaborator might not know which is "current" or "canonical."

**Route:** ✨ Polish — add a one-line note to `projects/project02/client/photoapp.py` header: `# project02 client stub — see project01/client/photoapp.py for the Part02 reference implementation`.

---

### S2D-4 — ⬜ Ownership Ambiguity — `project03/` committed binary Lambda zips

`authenticate.zip`, `register.zip`, `layers/bcrypt-layer.zip`, `layers/pymysql-layer.zip`, `layers/requests-layer.zip` — Lambda deployment packages committed to git. Class-provided assignment scaffolding.

Not harmful and necessary for the project03 assignment. Binary blobs are opaque in diffs and grow repo size.

**Route:** Ack — class-provided, expected. Note for future: if repo size becomes a concern, consider Git LFS.

---

### S2D-5 — 🟡 Good Practice — `projects/project01/Part03/` untracked with only a PDF

`projects/project01/Part03/project01-part03.pdf` (595KB) is on disk and untracked. Inconsistency: `labs/lab02/lab02.pdf` and `projects/project01/Part02/project01-part02.pdf` are tracked; Part03 PDF is not.

**Route:** 🟡 Good Practice — track the PDF at Phase 3 commit time for consistency, or establish and document a PDF policy (all tracked or all gitignored).

---

### S2D-6 — 🟡 Good Practice — `projects/project01/test-mysql.py` not in README

`projects/project01/test-mysql.py` reads endpoint from `photoapp-config.ini` and runs a direct MySQL connection test. Useful pre-schema sanity check. No README entry, no usage context — a new collaborator might not know it exists or when to use it.

**Route:** 🟡 Good Practice — add `test-mysql.py` to the `projects/project01/README.md` table with a one-line description ("Pre-schema MySQL connectivity check").

---

### S2D-7 — ⬜ Ownership Ambiguity — `labs/lab01/Part 00/` has tracked download artifacts `A`, `B`, `B.txt`

Four files are tracked in `labs/lab01/Part 00 - Client Setup/`:
- `A` — a JPEG binary (640×480, Panasonic camera) with **no file extension**. This is `A.jpg` downloaded back from S3 during the lab exercise — the key was `A`, so no extension was preserved on download.
- `A.jpg` — the original source image (also tracked)
- `B` — ASCII text file identical in content to `B.txt` (both contain Docker setup instructions: "python3 test.py")
- `B.txt` — same content as `B`

A collaborator encounters: a binary blob named `A` (no extension, not obviously an image), a duplicate text file pair `B`/`B.txt`, and the original `A.jpg`. Without context they look like download exercise artifacts left in the repo. `A` won't render in any file viewer without a hint it's a JPEG.

**Route:** ⬜ Ownership Ambiguity — assess with Erik. Options: (a) remove `A` and `B` (the extensionless download artifacts — `A.jpg` and `B.txt` already provide the content); (b) rename `A` → `A-downloaded.jpg` to make the artifact purpose clear; (c) keep as-is (they are the literal assignment output). At minimum, a comment in `lab01-assignment-io.txt` or a README note explaining what `A` and `B` are would help a collaborator.

---

### S2D-8 — 🟡 Good Practice — Two stale `[ ]` items in Part02 TODO are actually completed work

`projects/project01/Part02/MetaFiles/TODO.md` "Active — sanctum overlays" section has two unchecked items:

```
- [ ] [IaC] Move PDF steps 1, 2, 10 (IAM console clicks for s3readonly, s3readwrite,
      custom bucket policy, Rekognition attachment) into infra/terraform/main.tf...
- [ ] [Secrets] Terraform must not write access keys into anything git-tracked.
      Script under utils/ pipes terraform output -json into the gitignored photoapp-config.ini...
```

Both are **done**:
- `[IaC]`: Completed in Part02 Phase 1 (Task 1.1, all `[x]`). IAM users, custom policy, outputs `sensitive = true` — all in `infra/terraform/main.tf`.
- `[Secrets]`: `utils/rotate-access-keys` pipes `terraform output -json` to gitignored `photoapp-config.ini`. Keys never touch tracked files.

A collaborator reading this TODO sees two open action items that are already complete.

**Route:** 🟡 Good Practice — close both items with a completion note.

---

## Summary Counts

| Tag | Count |
|-----|-------|
| 🔴 Blocker | 0 |
| 🟠 Risk | 0 |
| 🟡 Good Practice | 3 (S2D-5 PDF policy, S2D-6 test-mysql.py note, S2D-8 stale open items) |
| ✨ Polish | 2 (S2D-2 Future State checkboxes, S2D-3 photoapp.py cross-reference) |
| ⬜ Ownership Ambiguity | 3 (S2D-1 lab02 MetaFiles, S2D-4 project03 zips, S2D-7 lab01 A/B artifacts) |
