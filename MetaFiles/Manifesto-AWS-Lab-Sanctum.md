# Manifesto: AWS lab sanctum (shared account, human + agents)

This document states **why** we work the way we do. Operational checklists live in  
`Steps-for-initial-AWS-Lab-setup-while-completing-the-assignment.md`. Assignment-faithful extracts live in `Steps.md` and `Requirements.md`.

## What we are building

We are building a **lab sanctum**: a **single shared AWS account** used for **MBAi 460** and kept afterward as a deliberate practice environment. The sanctum is **not** production; it is a **controlled place to learn**, ship course milestones, and grow toward an **ideal** architecture over time.

We **hew to the assignment** for two reasons at once:

1. **Concrete success** — Gradescope and the course rubric give unambiguous feedback (e.g. **10/10** on Part 01).
2. **Depth calibration** — the handout marks **how deep is enough for now**; everything else is staged as **future state** (see `Future-State-Ideal-Lab.md`).

The assignment currently asks for configurations that are **intentionally insecure** (public S3, wide RDS exposure). We accept that **only inside this lab contract**, with **no sensitive data**, and we treat that posture as **temporary**, not as a moral baseline.

## Who “we” are

A **core quartet plus room to grow**, one orchestrator:

- **Erik (human, orchestrator)** — owns direction, AWS console judgment, secrets handling, and when to stop or promote a change. Final say on risk.
- **Cursor / coding agents** — strong at file edits, CLI recipes, helping Human Pilots (i.e. Erik interpret Code), understanding full context of a project or codebase, sythenzing accross files, vizualizing and prototyping.
- **Claude Code (where you deploy it)** — taking CLI actions
- **ChatGPT** — advising, providing overwatch support, acting as a research agent and "Sage" 
- **Other** -- we shall use tools and models to bring forward success in a mutually supportinve way. Everyone should be aware of their strengths and which agents they can pass things too. All of this will be developed over time and be ever evolving :)

**Coordination rule:** everyone reads and updates **`MetaFiles/`** and the orchestrator’s **session notes / decisions** (whatever channel you use: Cursor chat, Claude project, ChatGPT thread). Treat **`MetaFiles/`** as the **durable spine** across tools and sessions.

## IAM: humans vs agents (intent)

We want **at least two CLI identities**:

1. **Erik human** — primary operator; credentials live outside git under `secrets/` once encryption is in place.
2. **Agents** — at least one IAM user (or role pattern) scoped **narrower than “full account admin”** where the course allows; split further (e.g. read-only recon vs mutating CLI) when the orchestrator decides the complexity is worth it.

**Assignment constraint:** Part 01’s walkthrough centers a user like **`mycli`**. Keep **`mycli`** compatible with the handout until you confirm you can deviate without confusing graders or your own scripts. A practical pattern:

- **`mycli`** = human default profile **or** renamed in docs only while the underlying IAM user still satisfies “CLI user from the assignment.”
- **`agent-cli`** (example name) = separate user + access key, stored only under `secrets/`, used exclusively in agent sessions.

Exact policy JSON can wait; **separation of principals** is the sanctum goal.

## Secrets and repository layout (recommended)

**Committed (safe to share with the repo and agents):**

- `MetaFiles/` — manifests, steps, requirements, future-state lists, billing how-tos.

**Not committed:**

- `secrets/` — material that can **authenticate** or **decrypt** (keys, plaintext passwords, long-lived access keys, export of `photoapp-config.ini` if it ever holds real secrets).

**End-of–Part-01 requirement:** before calling this step “done” for the sanctum, **introduce encryption at rest for local lab config** (algorithm/tool is your choice: `age`, `gpg`, `sops`, etc.), store **ciphertext + key file** under `secrets/`, and ensure **both** are **gitignored** (see `secrets/README.md` and the Part-level `.gitignore`). Until encryption is ready, **minimize** what touches disk in plaintext and **never** paste secrets into `MetaFiles/`.

**Why not one giant folder?** Separating **narrative** (`MetaFiles/`) from **credentials** (`secrets/`) reduces the chance an agent “helpfully” commits a key while editing documentation.

## Billing and trust

Everyone who touches the account should see **intentional cost guardrails**. A **$300 budget** with alerts is a shared psychological safety rail (see `Billing-guardrails-300-USD.md`). It is not a guarantee against every bill shape (e.g. some charges lag); it is still **worth doing on day one**.

## How we improve over time

Anything that would make this lab **more secure, observable, or operable** but is **out of scope for the current assignment** goes to **`Future-State-Ideal-Lab.md`**. We pull from that list when the course allows and when Erik says go.

---

*This manifesto is a living agreement. When reality diverges (new course constraint, new tool), update this file in the same PR/session as the behavior change.*
