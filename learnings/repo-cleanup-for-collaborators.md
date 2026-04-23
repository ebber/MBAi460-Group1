# Retrospective: Cleaning a Repository for Collaborators

**Written:** 2026-04-23
**Context:** Collaborator Readiness Quest — making MBAi460-Group1 immaculate before the first external collaborator clones it

---

## The Core Problem

A repo that works for its original author is not the same as a repo that works for a stranger. The original author has:
- Implicit knowledge of what's gitignored and why
- Memorized the quirks of every script
- A mental model of which files are "live" vs. "template"
- AWS credentials that happen to match what the code expects

A collaborator has none of that. Every undocumented assumption is a potential 30-minute debugging session before they've written a single line of code.

The goal of a collaborator readiness pass is to close the gap between "works for me" and "works for anyone."

---

## The Three-Phase Structure That Works

### Phase 1 — TODO Surface
Before any cleanup, do a full sweep of every TODO list, backlog file, inline comment, and open checkbox in the repo. The goal isn't to act — it's to see everything at once.

Why this matters: cleanup often reveals sub-tasks. If you act before you've surfaced everything, you'll make decisions in isolation that you'd have made differently with full context. A security finding early in the sweep might change how you handle a docs finding later.

**Sweep targets for a class project:**
- `MetaFiles/TODO.md` (or equivalent master queue)
- Infra, visualization, lab-level TODO files
- Inline `# TODO`, `# FIXME` comments
- Open `[ ]` checkboxes in plan/execution files
- Any workstream trackers

### Phase 2 — Structural Audit
A fresh-eyes pass through the repo from the perspective of someone arriving cold. This is different from a TODO sweep — you're looking for things that aren't on any list yet.

**Audit areas (in priority order):**
1. **Security** — credentials committed, `.example` templates missing or incomplete, gitignore gaps. These are blockers, not polish.
2. **Infrastructure / Tooling** — path hardcoding (absolute paths, user-specific relative paths), missing CWD notes, unguarded dependencies (`require_cmd aws`), Mac-only scripts that don't say so
3. **Docs** — QUICKSTART accuracy, README links (especially dead links on fresh clone), step ordering, missing prerequisite setup
4. **Codebase / Artifacts** — stale open checkboxes that were actually completed, historical artifacts with no context, mystery files

### Phase 3 — Final Polish
After you've executed all the fixes: walkthrough the QUICKSTART mentally end-to-end, run a credential sweep against tracked files, and review the full `git status` before committing.

---

## The QUICKSTART Walkthrough Is Non-Negotiable

The QUICKSTART is the most high-leverage document in the repo. It's the first thing a collaborator reads, and if any step fails, they stop and ask for help (or give up).

**What to verify in a walkthrough:**
- Does every file referenced in Step N actually exist at that path?
- Are all prerequisite tools listed? Are all prerequisite files created before they're needed?
- For each config template shown inline: does it match the actual `.example` file? Are all sections present?
- For each expected test output: is that output actually what the tool produces?
- Is there a clear explanation of how credentials/passwords flow through the system? (This is the #1 source of collaborator confusion in AWS labs)

**Common gaps found in this quest:**
- Config templates showing only some sections — the collaborator would copy the `.example` (complete) but not realize the inline docs were showing them a truncated version
- No guidance on how to get IAM access key values after `terraform apply` — collaborators would see placeholders and not know where the actual values come from
- Missing `setup/mac.bash` step before `docker/build` — subtle failure on fresh Mac clone

---

## Triage Before Executing

Never start executing cleanup items as you find them. Always surface the full list first, then triage.

**The four buckets:**
- **Act** — must be done; assign LoE (Trivial/Quick/Involved) and execute in that order
- **Ack** — real finding, but deliberate choice to accept as-is; document the reason
- **Queue** — valid but not now; route to the right permanent backlog with enough context to act on later
- **Drop** — resolved by another item or no longer applicable

**Why this matters:** A blocker found on Day 2 might change what you do with a polish item from Day 1. Triage gives you the full picture before you commit to any direction.

---

## The Credential Sweep Pattern

Before any collaborator-facing commit, grep tracked files for patterns that should never be committed:

```bash
# AWS access key ID prefix
git ls-files | xargs grep -l "AKIA"

# Live resource identifiers (replace with your account-specific values)
git ls-files | xargs grep -l "<your-rds-suffix>"
git ls-files | xargs grep -l "<your-bucket-name>"

# Known lab passwords
git ls-files | xargs grep -l "abc123!!\|def456!!"

# Populated credential lines (not placeholder values)
git ls-files | xargs grep -n "user_pwd\s*=\s*[^<$]"
git ls-files | xargs grep -n "aws_secret_access_key\s*=\s*[^<$\{]"
```

**What to expect:** Most hits will be false positives — pattern descriptions in docs, historical notes, or diagram content. The value is in the ones that aren't.

**Key distinction:** Sensitivity vs. Confusion. An architecture diagram showing a real RDS endpoint isn't sensitive (it's not a credential) but might confuse a collaborator. Handle these differently — ACK the diagram, add a note to the expected-outcomes doc.

---

## What Makes a Good `.example` File

An `.example` file is a contract with future collaborators. It should:
1. **Be complete** — every section and key that the live file will have, with no omissions
2. **Show where values come from** — not just `<your-value>` but `<from: terraform output rds_address>`
3. **Include a note** at the top: "Copy to X.ini — X.ini is gitignored, never commit it"
4. **Connect related values** — if the same password must appear in two files, say so explicitly

Bad: `user_pwd = <password>`
Good: `user_pwd = <choose a password for photoapp-read-only — same value as [rds] user_pwd in photoapp-config.ini>`

---

## The Files That Always Need Attention

In a class AWS lab repo, these are the perennial cleanup targets:

| File pattern | Common issue |
|---|---|
| `utils/` scripts | Hardcoded absolute paths, missing CWD notes, no dependency guards |
| `infra/terraform/variables.tf` | Hardcoded profile names, missing `aws_profile` variable |
| `*.example` files | Missing sections, live values leaked in from earlier work |
| `QUICKSTART.md` | Missing steps, wrong expected outputs, stale tool names |
| `MetaFiles/TODO.md` | Completed items still showing as open, stale context |
| `visualizations/` | `[ ]` checkboxes inside diagram files (wrong venue for action items) |
