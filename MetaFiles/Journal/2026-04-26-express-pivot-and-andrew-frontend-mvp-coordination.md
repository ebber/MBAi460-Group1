# 2026-04-26 — Express pivot + Andrew's Frontend MVP coordination

**Audience:** Andrew (and any future collaborator coming up to speed). This is a coordination note, not a session log.

**TL;DR:** Two streams of Part 03 work landed today and merged cleanly. Andrew shipped a Claude Design Frontend MVP (commit `1f3c067`); a separate stream pivoted Part 03's backend approach from FastAPI/Python to Express/Node and executed Server Foundation (workstream 02) end-to-end. Independent convergence: both streams chose Express + React + AWS SDK v3 + MySQL2 without seeing each other's work. Zero file conflicts at the merge.

---

## Hi Andrew —

Quick coordinated catch-up so you don't have to reverse-engineer today's history.

### What happened on the other stream

While you were finishing the Frontend MVP, the Part 03 backend approach got pivoted. Six design questions were surfaced, decided, and recorded. They live in:

**👉 [`projects/project01/Part03/MetaFiles/DesignDecisions.md`](../../projects/project01/Part03/MetaFiles/DesignDecisions.md)**

Skim that doc first. Headline:

| | Decision |
|---|---|
| **Q1** Backend URL scheme | Keep `/api/*` prefix |
| **Q2** Reuse Part 02 `photoapp.py`? | No — Node-native (`@aws-sdk/client-*` + `mysql2`). `photoapp.py` is now a behavioral reference only. |
| **Q3** Response envelope | `{message, data}` / `{message, error}` everywhere |
| **Q4** Test stack | Jest + supertest |
| **Q5** Local dev mode | Built-only (no Vite-dev-server proxy; Vite build → Express serves `frontend/dist`) |
| **Q6** Architecture viz | Language/implementation-agnostic |

Your `UI-Design-Requirements.md` (which is excellent, by the way — see below) independently lands on Express + React + AWS SDK v3 + MySQL2. Same destination, different routes. We're aligned.

### What got built on the other stream

Server Foundation workstream (02) was executed today, TDD-disciplined, in 9 phases plus a Phase 0 baseline-verification step:

- Express baseline split: `server/app.js` exports the app; `server/server.js` is the listen entrypoint. Lets Jest + supertest import the app cleanly.
- `/health` (server liveness, outside `/api/*`).
- `/api` placeholder router mounted **before** static (load-bearing order).
- Static frontend host serving `frontend/dist/` (with a placeholder `index.html` + `assets/app.css` until your build replaces them).
- 8 supertest-driven tests, all green. `npm audit` clean (`sqlite3` and `uuid` removed; `uuid` re-added by workstream 03).
- Live smoke confirmed: `/`, `/health`, `/api`, `/assets/*` all return expected; legacy `/ping`, `/users` return 404 (decommissioned).

Plan + per-phase evidence are in:

- **[`projects/project01/Part03/MetaFiles/plans/02-server-foundation-plan.md`](../../projects/project01/Part03/MetaFiles/plans/02-server-foundation-plan.md)** — execution-augmented plan tracker.
- **[`projects/project01/Part03/MetaFiles/refactor-log.md`](../../projects/project01/Part03/MetaFiles/refactor-log.md)** — what changed and why, by date.
- **[`projects/project01/Part03/MetaFiles/install-log.md`](../../projects/project01/Part03/MetaFiles/install-log.md)** — every `npm install` recorded with dep + vulnerability deltas.

### What you shipped

Your Frontend MVP commit `1f3c067` is genuinely impressive — both the visual artifacts and especially `MBAi-460/uploads/UI-Design-Requirements.md`. 1609 lines of structured product thinking (glossary, principles, screen specs, design tokens, phased roadmap, accessibility-as-pre-launch-gate). That doc is going to anchor a lot of future decisions; thank you for that.

A couple of low-friction reconciliation items the merge surfaced — none are urgent, none undo your work; just things to align over the next round of coordination:

- **Location of `MBAi-460/`:** the contract in `01-ui-workstream.md` puts raw Claude Design exports under `projects/project01/Part03/ClaudeDesignDrop/raw/`. Plan is to atomically `git mv MBAi-460/ projects/project01/Part03/ClaudeDesignDrop/raw/MBAi-460/` so Part 03 stays self-contained for Canvas submission. No content changes; just relocation.
- **Spec metadata note.** Your `UI-Design-Requirements.md` header says *"Target file location: Workspace root (not committed to repo)."* But the doc IS committed now. Two possible readings — you changed your mind (the doc became important enough to track), or it was an oversight. Either way easy to clarify. It's a great doc; we'd rather track it than not. Just need to update the metadata line if you want to keep it tracked.
- **Scope distillation.** Your spec covers P01 + P02 + P03 + Textract + auth + chat — broader than the Part 03 assignment window. Plan is to (a) distill the Part-03-relevant subset and link from `01-ui-workstream.md`, and (b) preserve the broader vision as a Future-State design doc so it doesn't get lost. Not throwing anything away — just sequencing.

### Where to coordinate going forward

- **Decision record:** `Part03/MetaFiles/DesignDecisions.md` — for *why* we made architectural choices.
- **Action queue:** `Part03/MetaFiles/TODO.md` — for *what's next*, including the Andrew-MVP integration items above. **Erik will point you at this queue directly.**
- **Refactor log:** `Part03/MetaFiles/refactor-log.md` — for *what changed* in code, dated.
- **This Journal:** `MBAi460-Group1/MetaFiles/Journal/` — for *cross-collaborator coordination notes* like this one.

If you find anything in `DesignDecisions.md` you'd push back on (you might! convergence isn't the same as agreement), the right move is to add a follow-up Q (Q7, Q8, …) with your counter-position. The doc is structured to grow that way.

### Open thread

The merge integrated cleanly with no file conflicts. Server Foundation is acceptance-clean. Workstream 03 (real `/api/*` endpoints) and the React/Vite integration of your design output are the next two units of work. Loose plan: Erik routes; Andrew probably owns UI integration; the agent stream picks up workstream 03.

Welcome back to the merged tip 🤝.

— *(agent stream, signing the journal entry)*
