# Steps: initial AWS lab setup (assignment + sanctum)

Use this file **while executing** Part 01. It layers **sanctum practices** on top of the course handout. For a **PDF-faithful** outline only, see `Steps.md`; for **grading success criteria**, see `Requirements.md`. Principles live in `Manifesto-AWS-Lab-Sanctum.md`.

---

## Phase A — Shared safety rails (before or parallel to Step 1)

- [ ] **Billing guardrails** — Create an AWS **Budget** with a **$300** monthly cost limit (or threshold alerts at 50% / 80% / 100%) and **email** (or SNS) notifications. Follow `Billing-guardrails-300-USD.md`.
- [ ] **Region discipline** — Treat **`us-east-2`** as law for this course unless the staff say otherwise.
- [ ] **Orchestrator note** — In your session log (outside or inside repo per your habit), record: account alias, who ran what, and any **access keys** created (never the secret itself).

---

## Phase B — Assignment Step 1 (CLI) + sanctum IAM shape

Complete the handout’s **Step 1** (`Steps.md` §1) with these additions:

- [ ] Create / use **`mycli`** (or equivalent) per assignment so instructions and peers stay recognizable.
- [ ] **Plan** a second IAM user for **agents** (e.g. `agent-cli`). Create it when Erik is ready to **store its keys only under `secrets/`** (after Phase F encryption exists, or provision now but **do not** commit keys).
- [ ] Configure **AWS CLI profiles** (optional but recommended):
  - `default` or `erik` → human `mycli` keys.
  - `agent` → agent user keys.
  - Use `AWS_PROFILE=erik` vs `AWS_PROFILE=agent` in docs when sharing commands.
- [ ] Smoke test: `aws sts get-caller-identity` per profile; `aws s3 ls` in **`us-east-2`**.

---

## Phase C — Assignment Steps 2–3 (S3) + evidence

Follow **`Steps.md` §2–3** exactly for **bucket name**, **public access**, **ACLs**, **`test/`** prefix, **JPEGs**, and **per-object** public read.

- [ ] Capture **non-secret** evidence in MetaFiles if useful (e.g. bucket **name**, ARN) — never access keys.
- [ ] Optional sanctum note: link to the **public URL** pattern you used for smoke tests (bucket name is not secret).

---

## Phase D — Assignment Step 4 (RDS) + cost hygiene

Follow **`Steps.md` §4** for **Free tier**, **storage**, **public access**, **password + IAM auth**, **backups off**, **security group MySQL/Aurora from Anywhere-IPv4**, **`test-mysql.py`**.

- [ ] Record the RDS **endpoint hostname** somewhere Erik controls (password **not** in `MetaFiles/`).
- [ ] After long breaks, **stop** RDS (console or `aws rds stop-db-instance`) per handout; **start** before Part 02 or further DB work.

---

## Phase E — Assignment Steps 5–6 (schema + MySQL users)

Follow **`Steps.md` §5–6** and **`Requirements.md`** for **`create-photoapp.sql`**, seed users, and **exact** `photoapp-read-only` / `photoapp-read-write` credentials and grants.

- [ ] Prefer running SQL from a **single file** on disk that is **reviewed** before execution (your human notes pattern: extract → review → run).
- [ ] Verify with `SELECT * FROM users;` and login tests for both app users.

---

## Phase F — Sanctum closure (end of this step; required before “done”)

- [ ] **`secrets/` layout in use** — Plaintext credentials for RDS admin, optional second CLI user, and any **export** of configs live **only** under `secrets/` (see `secrets/README.md`).
- [ ] **Encryption** — Encrypt the sensitive bundle you choose (e.g. `age -e -r …`, `gpg -e`, or `sops`). Store **ciphertext + key material** under `secrets/`; confirm **git** does not track them (see Part-level `.gitignore`).
- [ ] **Going forward** — Decrypt when needed for local tools; **never** commit decrypted files; keep **Gradescope submission** using whatever the course expects (often a minimal `photoapp-config.ini`); if that file contains secrets later, treat it as **secret-class**, not “innocent config.”

---

## Phase G — Assignment submission (Gradescope)

Follow **`Steps.md` §7**.

- [ ] `[rds] endpoint=` set correctly; other TODOs may remain for Part 01 per handout.
- [ ] Submit; iterate until **10/10**.
- [ ] Optional: stop RDS after submission if you are done for a while.

---

## When agents help

Give agents: **profile name**, **region**, **file paths**, and **“do not touch secrets / do not commit”** explicitly. Paste **structured excerpts** from `Requirements.md` when asking for verification (“did we miss a success criterion?”).

---

## Quick map

| Phase | Primary doc |
|-------|-------------|
| A | `Billing-guardrails-300-USD.md` |
| B–G | `Steps.md` + `Requirements.md` |
| Principles | `Manifesto-AWS-Lab-Sanctum.md` |
| Backlog | `Future-State-Ideal-Lab.md` |
