---
name: Spec citations in commits + code comments — quote the source at decision points
description: Quote the spec/PDF/RFC/protocol document directly in commit bodies AND inline code comments at decision points; mechanical link from code change to spec, surviving review years from now
type: feedback
---

When a code change is driven by a specification (PDF, RFC, protocol document, project requirement doc), **quote the spec verbatim in two places**: the commit message body AND an inline code comment at the decision point.

**Why:** Mechanical link from code change to spec. The reviewer doesn't need to context-switch to "is this what the spec asked for?" — the quote is in the commit + the comment. Years later, when the codebase has evolved + the original implementer is gone, the comment still says exactly which spec line drove the choice. Survives refactors that lose surrounding context.

**Pattern source:** `feat/p02-gradescope-mvp` branch (andrew-apple, 2026-05-04). Two complementary surfaces:
- **Commits:** body cites PDF spec by quote — e.g., commit `8045533`: *"PDF: 'with Node.js's mysql library, you need to use the query() function — not the execute() function'"*
- **Code comments:** inline comments at decision points cite PDF — e.g., `// PDF: 'images are not deleted from S3 unless the database is successfully cleared'`. Comment style is *why this matches the spec*, not *what this does*.

**How to apply:**
- For any code change driven by a spec, copy the relevant spec line(s) verbatim into the commit message body. Wrap in quotes; cite the source (PDF page / section / line as available).
- At the code site itself, add an inline comment quoting the spec line. Comment style: explain *why this matches the spec*, not *what the code does*. (The code already says what it does.)
- For multi-line spec quotes, use the comment-block format with attribution: `// PDF §3.2: "<exact quote>"`.
- The pattern composes with atomic spec-correction commits (one concern per commit, each citing its driving spec line).
- Especially load-bearing for: assignment / coursework spec compliance; protocol implementations (HTTP, WebSocket, RPC); regulatory or compliance-driven code; security-critical decisions.

**Adjacent memories:**
- `feedback_read_before_locking.md` — read the spec source before authoring (verification at authoring time)
