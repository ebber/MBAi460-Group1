# Meta Note: Designing a Good Collaborator Onboarding Experience

**Written:** 2026-04-23
**Context:** Collaborator Readiness Quest — designing QUICKSTART.md for independent collaborators with their own AWS accounts

---

## The Collaborator's Mental Model Problem

When you write a QUICKSTART, you know what you're trying to accomplish. You know which files are sensitive. You know what the placeholders mean. You know that `${PHOTOAPP_RO_PWD}` gets substituted at runtime.

Your collaborator knows none of this. They read instructions literally. If a template shows `<choose a password>`, some will type that literally and wonder why the DB connection fails. If you say "run terraform apply," they won't know what to do with the `aws_profile` variable unless you tell them.

**The key insight:** Onboarding documentation fails at the boundaries between systems, not within them. Each individual step is usually clear; it's the handoffs that break.

Common handoff failures:
- **Terraform → Config**: Values created by `terraform apply` must be manually copied to config files, but the docs don't say which outputs go where
- **Config → SQL**: Passwords in config files are substituted into SQL at runtime — this mechanism is invisible unless explained
- **Secrets → Docker**: Docker containers need credentials mounted — if the mount path in the script doesn't match where the collaborator put the secrets, silent failure
- **IAM → Access Keys**: Terraform creates IAM users and access keys; keys end up in terraform state; collaborator needs to extract them — but how?

---

## The "Where Does This Value Come From?" Test

For every `<placeholder>` in every config template, ask: can a collaborator answer "where does this value come from?" by reading only the QUICKSTART?

If the answer requires:
- Going to the AWS console and clicking around → document the click path or replace with a CLI command
- Running a command not mentioned in the QUICKSTART → add that command
- Knowing something implicit about how the system works → make it explicit

Apply this test to every placeholder before declaring the QUICKSTART complete.

---

## The Two-Config Architecture Problem

This project has two config files for the same database — `infra/config/photoapp-config.ini` (read-only user, used by validate-db and utils) and `projects/project01/client/photoapp-config.ini` (read-write user, used by application code).

This is architecturally sound (principle of least privilege) but confusing to document. Collaborators will ask: "Why do I have two files? Which one do I fill in first? Can I use the same password for both users?"

**How to handle this in docs:**
1. Name them explicitly: "Backbone config" vs. "Client config" — not just the file paths
2. Explain the purpose of each in one sentence
3. Note which tools read which config
4. Be explicit that these are two different DB users with different passwords

Never assume a collaborator will infer the two-config architecture from reading the file names.

---

## Secrets Architecture: Explain the Full Flow

The hardest thing to document is the secrets flow — where passwords are created, where they live, and how they get from storage into the running system.

For this repo, the complete flow is:
1. You choose passwords for app DB users (photoapp-read-only, photoapp-read-write, shorten-app)
2. You write those passwords into the gitignored config files
3. `run-sql` reads the config files and substitutes `${PLACEHOLDER}` variables in SQL files before executing
4. The DB users are created in RDS with those passwords
5. The same passwords in the config files are used by application code to authenticate

A collaborator who doesn't understand this flow will:
- Try to change passwords in the SQL files (they're `${PLACEHOLDER}` — editing them does nothing)
- Wonder why validate-db can't connect (they didn't fill in the config file first)
- Not understand why `run-sql` needs the config file path

One paragraph explaining the substitution mechanism prevents all of these.

---

## Per-Account vs. Shared Infrastructure

For class projects, there are two collaboration models:

**Shared infrastructure model:** One AWS account, one deployed stack, collaborators share credentials.
- Simpler setup (one account to provision)
- Harder coordination (credential sharing, who rotates what)
- `.example` files have one set of values

**Per-account model (this project):** Each collaborator provisions their own stack via `terraform apply`.
- More complex setup (each person runs terraform)
- No credential sharing — each person has their own keys
- `.example` files must be completely self-contained

The QUICKSTART must be written for exactly one model. Mixing guidance for both creates confusion.

**Signs your QUICKSTART was written for shared infrastructure but you're now in per-account mode:**
- "Obtain credentials from project owner" instead of "create your own IAM user"
- Config templates showing one person's specific resource names
- Password guidance that says "use the value from the shared config" instead of "choose your own"
- No terraform instructions (shared model provisions once; per-account model, everyone provisions)

---

## The Teardown Section Is Not Optional

Every QUICKSTART for an AWS lab needs a teardown section. Collaborators who don't know how to tear down their stack will either:
- Leave resources running (cost risk)
- Manually delete things in the console (fragile, leaves orphaned resources)
- Be afraid to spin up at all (because they don't know how to undo it)

A teardown section does three things:
1. Makes the setup feel reversible (lowers the fear of starting)
2. Prevents billing surprises
3. Establishes the operational pattern (terraform destroy ≈ terraform apply in reverse)

The teardown verification (smoke-test-aws --mode dead) is especially valuable — it closes the loop and gives the collaborator confidence that everything is actually gone.

---

## What Good Looks Like

A QUICKSTART is good when:
- A collaborator can follow it start to finish without asking a single question
- Every placeholder has a documented source
- Every expected output is stated and current
- The secrets flow is explained, not just implied
- The relationship between files (backbone vs. client config, `.example` vs. live) is explicit
- There is a clear "you're done" signal (validate-db: 26/26 passed)
- Teardown is as clear as setup
