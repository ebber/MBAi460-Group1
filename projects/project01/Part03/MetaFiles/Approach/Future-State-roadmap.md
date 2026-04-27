# Future-State Roadmap

**Status:** Roadmap index. Names each future workstream + its backend dependency + links to the focused approach doc. Phase ordering suggested but not committed.
**Source of changes:** Andrew's `UI-Design-Requirements.md` covers substantially more than Part 03 of Project 01. Per scoping discipline (Erik 2026-04-26): elements not supported by the current backend are split out into their own approach docs so Part 03 can ship to assignment scope without losing the broader vision.

This doc is a **roadmap index**, not a binding plan. Its job is to (a) name each future workstream, (b) state what backend dependency makes each "not yet supported," and (c) link to the focused approach doc.

---

## What is in Part 03 (kept in `01-ui-workstream.md`)

The Part-03-in-scope subset of Andrew's design — driven by what the **assignment requires** AND what the **current Express backend supports** (or can support with workstream 03 alone):

- Login / Register screens — **as visual scaffolds** (mock-auth; real auth deferred to Future-State Auth)
- Library (grid + list of photos)
- Asset Detail (photo with Rekognition labels)
- Upload (photo only — Rekognition path)
- Profile (read-only display of current user)
- Search by label (uses existing `/api/search?label=` from workstream 03)
- Delete all images
- Shell components (TopBar, LeftRail, PageHeader, ToastProvider, Modal, CommandPalette)
- Design tokens migration (`tokens.css`)

Optional polish (supported by current backend; not required by assignment; ship in Part 03 only if time permits):

- TweaksPanel (theme/accent/density toggles)
- HelpScreen (keyboard-shortcut reference)
- Mobile responsive parity (mobile-* components)
- Empty-state illustrations

These optional items live in `01-ui-workstream.md` as a Backlog section, not a separate Future-State doc, because they don't require backend changes.

---

## What is split into Future-State approach docs

Four focused approach docs, each scoped around a coherent backend dependency:

| Doc | Backend dependency | Andrew's spec coverage |
|---|---|---|
| [`Future-State-auth-and-account-management-workstream.md`](Future-State-auth-and-account-management-workstream.md) | Project 03's `authsvc` Lambdas (`authenticate.zip`, `register.zip`) + `authsvc.users` + `authsvc.tokens` + RBAC `users.role` column | §9.1–§9.3 (login/register/forgot), §9.10–§9.11 (settings, admin), §13.4 (auth handling) |
| [`Future-State-documents-and-textract-workstream.md`](Future-State-documents-and-textract-workstream.md) | New AWS service: Textract (`DetectDocumentText` + `AnalyzeDocument`) + new IAM perms + new `POST /api/images/:id/ocr` endpoint + S3 layout for OCR JSON | §9.6 (asset detail — document), §9.7 (upload OCR mode), §13.6 (Textract integration) |
| [`Future-State-chat-workstream.md`](Future-State-chat-workstream.md) | Project 03's `chatapp.registered` + chat Lambda handlers + SSE infrastructure for message delivery | §6 (chat endpoints), §9 (chat screen), `screens.jsx` ChatScreen demo |
| [`Future-State-production-hardening-workstream.md`](Future-State-production-hardening-workstream.md) | Multi-environment deployment (S3+CloudFront+CDN), observability backend (Sentry/CloudWatch RUM), CI/CD (GHA), CSP at distribution layer, dependency-scan automation | §13.7 (a11y), §13.8 (performance), §13.9 (browser/device), §13.10 (security), §13.11 (deployment), §13.12 (observability), §13.13 (i18n), §13.14 (feature flags), §14.1 (success metrics) |

---

## Phase ordering (suggested, not committed)

These phases are aspirational. Sequencing is Erik's call when the assignment window closes and we look at what comes next.

```
Part 03 ships  →  ─┬─→  Future-State: Auth        (depends on Project 03 lambdas)
                   ├─→  Future-State: Documents   (independent — new AWS service)
                   ├─→  Future-State: Chat        (depends on Project 03 chat lambda)
                   └─→  Future-State: Hardening   (cross-cutting; lands incrementally)
```

Auth and Chat both depend on Project 03 deliverables landing first. Documents+Textract is independent (just needs new AWS service). Hardening is cross-cutting and lands incrementally — pieces of it (CI bundle-size check, axe-core gate) are cheap to add early.

---

## What is explicitly NOT in any future doc (per Andrew's spec §1)

Out of scope at every phase:

- Native mobile apps (iOS/Android) — responsive web covers mobile.
- Server-side rendering / Next.js — pure SPA behind auth.
- Billing / payments / subscriptions.
- Full Figma design-system token library generation.
- Production incident-response runbooks.

If any of these become in scope later, they get their own Future-State approach doc at that time.

---

## Where to add a new future workstream doc

If a new Andrew-spec section (or new external pressure) surfaces a workstream not covered above:

1. Pick a path: `Future-State-<feature>-workstream.md` (uses the same template as the existing four).
2. Add a row to the table above with the backend dependency.
3. If the workstream needs a new Decision-Record entry, add it to `DesignDecisions.md` as Q11+.
4. Cross-link from `01-ui-workstream.md` "Deferred to Future-State" section if relevant.

---

## Source materials (cite-back)

- `ClaudeDesignDrop/raw/MBAi-460/uploads/UI-Design-Requirements.md` (1609 lines, 2026-04-20, Andrew Tapple)
- `MetaFiles/Approach/00-coordination-and-contracts.md` (current Part 03 contract)
- `MetaFiles/Approach/01-ui-workstream.md` (current Part 03 UI plan)
- `MetaFiles/DesignDecisions.md` (Q1–Q6, plus Q7–Q10 (resolved 2026-04-26))
- `visualizations/Target-State-project01-part03-photoapp-architecture-v1.md` (current Part 03 architecture, agnostic)
- Project 03 source: `projects/project03/create-authsvc.sql`, `create-chatapp.sql`, `authenticate.zip`, `register.zip`, `client/client.py`
