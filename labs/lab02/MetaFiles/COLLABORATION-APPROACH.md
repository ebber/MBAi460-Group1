# Collaborative approach — meta notes

This document captures agreed **team practices** for course work where **Git + shared remote** (e.g. GitLab) and **optional parallel roles** matter most. It was written with **Project 01 Part 02** (PhotoApp API: RDS, S3, Rekognition) in mind; the same patterns apply to other grouped parts.

---

## Goal / intent

- **Ship working code** that passes Gradescope while spreading work across people with different strengths.
- **Keep everyone in sync** with minimal friction: one obvious way to clone, update, and contribute.
- **Protect secrets** (IAM keys, RDS passwords, bucket-specific config) so nothing credential-bearing lands in the remote history.
- **Lower the bar** for teammates who are new to Git/GitLab or “off box” workflows so they can contribute without becoming Git experts first.

---

## Description of the approach

### 1. Shared remote + local copies

- One **team repository** (private). Everyone **clones** once; day-to-day work is **branch → merge request (MR) → merge to `main` → `git pull`** on `main` for a clean sync story.
- **Small, frequent merges** reduce painful conflicts in shared files like `photoapp.py` and `tests.py`.

### 2. Parallel work (dependency-aware)

Split work by **what can run independently**, not arbitrary line counts:

| Phase | Examples |
|--------|-----------|
| Early | One person on **IAM / S3 config** and validating `get_ping`; others on **`get_users` / `get_images`** + tests (pure DB). |
| Middle | **`post_image`** (S3 + DB + transactions) — ideally **one owner** per MR to avoid merge fights; **`get_image`** once upload contract is clear. |
| Later | **Labels DDL** + **Rekognition** extensions + **`get_image_labels` / `get_images_with_label`** — agree table/column names once (“team contract”), then parallelize tests with **reserved test name ranges** (`test_02`…`test_04` for Alice, etc.). |

Optional non-code roles still parallelize: **Gradescope captain**, **README/onboarding**, **MR reviewer**, **security check** (no keys in repo).

### 3. Secrets and config — “template + local”

- **Commit** a **template only**: e.g. `photoapp-config.ini.example` with placeholders and short comments for each section.
- **Do not commit** real credentials: add **`photoapp-config.ini`** (and any `*.local.ini` / `.env` you introduce) to **`.gitignore`**.
- Each developer copies the example → local file, fills in **their** AWS/RDS values if everyone uses **separate accounts/stacks**.
- **RDS passwords** are set in **infra** (Part 01) but consumed like **any other app secret** — same hygiene as IAM keys for the repo.

**Gradescope nuance:** Autograding may expect a **submitted** `.ini` that points at **one** environment graders can reach. That does not mean committing secrets to a **public** repo: use a **private** team repo; produce the submission file from a **secure** copy when one teammate submits. If everyone develops against **their own** RDS, designate **one** “submission stack” or align the submitted ini with whoever owns that stack.

### 4. GitLab (or GitHub) — keep the workflow boring

- **Default path:** feature branch → **MR** → review → merge to **`main`**.
- **Less technical contributors** can use **GitLab’s web UI** (edit file, commit, open MR) for small changes; stronger devs use local clone + IDE.
- Add a **one-page “First day”** doc: account → invite → clone → copy example config → run tests / client. **Screenshots** help more than dense Git jargon.
- **MR description checklist:** e.g. “No real `photoapp-config.ini`,” “No keys in screenshots.”

### 5. Onboarding and “easy synchronization”

- Document **sync in one line of behavior:** merge MRs on the default branch, then locally: `git checkout main` and `git pull`.
- **Buddy system:** pair each newer teammate with someone comfortable with Git for the **first one or two MRs**.
- Pick **one** default environment story for the README: **Docker vs local Python** so “works on my machine” is rare.

---

## Questions worth deciding once (short team meeting)

1. **One submission AWS stack vs many dev stacks?** Who owns the stack Gradescope hits; how do others test safely?
2. **Who approves / merges MRs?** One maintainer vs rotating reviewers.
3. **Where do secrets live off-repo?** (Password manager, agreed channel — **not** habitually pasting keys in Slack.)

---

## Execution checklist (when you start)

- [ ] Create **private** team remote; invite everyone; confirm clone + MR works end-to-end.
- [ ] Add **`photoapp-config.ini.example`** (or equivalent) and **`.gitignore`** entries for real config.
- [ ] Add **`docs/FIRST-DAY.md`** (or root **README** section) with clone, config copy, and test commands.
- [ ] Optional: **MR template** with secret-safety checkboxes (GitLab project settings).
- [ ] Assign **rough API / test ownership** from the dependency table above; reserve **`test_XX` name ranges**.
- [ ] After features land: **Gradescope** dry run; one person owns reading autograder output and filing fixes.

---

## References (course context)

- **Part 02** builds the **PhotoApp Python API** (`photoapp.py`): RDS + S3 + Rekognition, retries (**Tenacity** on MySQL paths), logging, transactions, parameterized SQL.
- **Lab 02** (URL shortener) is useful precedent for **DB API discipline** (transactions, placeholders, tests).
- Course materials stress: **never publish real access keys**; prefer **private** repos for anything that ever touched real credentials.

---

*This file lives under `lab02/MetaFiles/` as a durable place for cross-lab “how we work together” notes; extend or move if the team standardizes elsewhere (e.g. org-wide `CONTRIBUTING.md`).*
