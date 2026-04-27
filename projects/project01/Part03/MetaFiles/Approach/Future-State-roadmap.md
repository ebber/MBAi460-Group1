# Future-State Roadmap

**Status:** Roadmap index. Names each future workstream + its backend dependency + links to the focused approach doc. Phase ordering suggested but not committed.
**Source of changes:** Andrew's `UI-Design-Requirements.md` covers substantially more than Part 03 of Project 01. Per scoping discipline (Erik 2026-04-26): elements not supported by the current backend are split out into their own approach docs so Part 03 can ship to assignment scope without losing the broader vision.

This doc is a **roadmap index**, not a binding plan. Its job is to (a) name each future workstream, (b) state what backend dependency makes each "not yet supported," and (c) link to the focused approach doc.

---

## What is in Part 03 (kept in `01-ui-workstream.md`)

The Part-03-in-scope subset of Andrew's design — driven by what the **assignment requires** AND what the **current Express backend supports** (or can support with workstream 03 alone):

- Login / Register screens — **as visual scaffolds** (mock-auth; real auth deferred to Future-State Auth)
- Library (grid + list — both photos and documents per Q9)
- Asset Detail (photo with Rekognition labels; document with PDF embed + "OCR coming soon" placeholder per Q9)
- Upload (any file accepted per Q9; server derives `kind` per Q8)
- Profile (read-only display of current user)
- Search by label (uses existing `/api/search?label=` from workstream 03; lives in Library page header)
- Delete all images
- Shell components — **MVP shape**: TopBar (wordmark + avatar only), LeftRail, PageHeader, ToastProvider, Modal. **CommandPalette and TweaksPanel are deferred to their own Future-State workstreams.**
- Design tokens migration (`tokens.css` → `tailwind.config.ts` theme)

Optional polish (supported by current backend; not required by assignment; ship in Part 03 only if time permits):

- HelpScreen (keyboard-shortcut reference)
- Mobile responsive parity (mobile-* components)
- Empty-state illustrations

These optional items live in `01-ui-workstream.md` as a Backlog section, not a separate Future-State doc, because they don't require backend changes. **TweaksPanel** is no longer "optional polish in Part 03" — promoted to its own Future-State workstream alongside CommandPalette + shadcn migration (see table below).

---

## What is split into Future-State approach docs

Four focused approach docs, each scoped around a coherent backend dependency:

| Doc | Backend dependency | Andrew's spec coverage |
|---|---|---|
| [`Future-State-auth-and-account-management-workstream.md`](Future-State-auth-and-account-management-workstream.md) | Project 03's `authsvc` Lambdas (`authenticate.zip`, `register.zip`) + `authsvc.users` + `authsvc.tokens` + RBAC `users.role` column | §9.1–§9.3 (login/register/forgot), §9.10–§9.11 (settings, admin), §13.4 (auth handling) |
| [`Future-State-documents-and-textract-workstream.md`](Future-State-documents-and-textract-workstream.md) | New AWS service: Textract (`DetectDocumentText` + `AnalyzeDocument`) + new IAM perms + new `POST /api/images/:id/ocr` endpoint + S3 layout for OCR JSON | §9.6 (asset detail — document), §9.7 (upload OCR mode), §13.6 (Textract integration) |
| [`Future-State-chat-workstream.md`](Future-State-chat-workstream.md) | Project 03's `chatapp.registered` + chat Lambda handlers + SSE infrastructure for message delivery | §6 (chat endpoints), §9 (chat screen), `screens.jsx` ChatScreen demo |
| [`Future-State-command-palette-workstream.md`](Future-State-command-palette-workstream.md) | No backend dependency beyond existing `/api/*` search/list endpoints. Depends on stable Library and Asset Detail routes. | Adds `⌘K` keyboard launcher for navigation, asset search, and common actions. |
| [`Future-State-shadcn-primitive-migration-workstream.md`](Future-State-shadcn-primitive-migration-workstream.md) | No backend dependency. Depends on the Part 03 UI MVP being stable. | Converts selective shadcn usage into full primitive migration: dialogs, dropdowns, command palette, tabs, forms, toasts, menus. |
| [`Future-State-tweaks-panel-workstream.md`](Future-State-tweaks-panel-workstream.md) | No backend dependency. Depends on stable frontend shell/tokens/Zustand. | Restores Andrew's TweaksPanel: theme, accent, density, and mock/demo controls after MVP flows are green. |
| 🔥 **HIGH PRIORITY** [`Future-State-playwright-e2e-workstream.md`](Future-State-playwright-e2e-workstream.md) | No backend dependency beyond a running Express + AWS+RDS stack (already in place post-Phase-8). Depends on Part 03 UI MVP being stable. | Adds Playwright-driven happy-path E2E coverage from a real browser; closes the gap between Vitest+RTL component tests and the manual CLI smoke. |
| [`Future-State-production-hardening-workstream.md`](Future-State-production-hardening-workstream.md) | Multi-environment deployment (S3+CloudFront+CDN), observability backend (Sentry/CloudWatch RUM), CI/CD (GHA), CSP at distribution layer, dependency-scan automation | §13.7 (a11y), §13.8 (performance), §13.9 (browser/device), §13.10 (security), §13.11 (deployment), §13.12 (observability), §13.13 (i18n), §13.14 (feature flags), §14.1 (success metrics) |

---

## Phase ordering (suggested, not committed)

These phases are aspirational. Sequencing is Erik's call when the assignment window closes and we look at what comes next.

> **Updated guidance:** see the **"Activation priority recommendation 2026-04-27 (sub-E)"** section below for a refreshed tiered list incorporating the 6 NEW Future-State workstream docs added during Outstanding Integrations sub-A (mobile, admin, library-polish, form-library, sharing, observability). The original Phase-ordering ASCII below predates those additions and is preserved as historical context; the sub-E recommendation supersedes it.

```
Part 03 ships  →  ─┬─→  🔥 Future-State: Playwright   (HIGH PRIORITY — closes E2E gap)
                   ├─→  Future-State: TweaksPanel    (no backend dependency)
                   ├─→  Future-State: Command        (no backend dependency)
                   ├─→  Future-State: shadcn         (no backend dependency)
                   ├─→  Future-State: Auth           (depends on Project 03 lambdas)
                   ├─→  Future-State: Documents      (independent — new AWS service)
                   ├─→  Future-State: Chat           (depends on Project 03 chat lambda)
                   └─→  Future-State: Hardening      (cross-cutting; lands incrementally)
```

**Playwright E2E is the highest-priority post-MVP workstream** — without it, the gap between component tests (Vitest+RTL) and the live AWS+RDS stack is covered only by the manual CLI smoke (`HumanTestInstructions/README.md`). For any continued evolution post-Canvas, the Playwright suite is the cheapest insurance against demo-path regressions.

The TweaksPanel, CommandPalette, and shadcn primitive migration have no backend dependency; they should wait until assignment-critical UI flows are stable. Auth and Chat both depend on Project 03 deliverables landing first. Documents+Textract is independent (just needs new AWS service). Hardening is cross-cutting and lands incrementally — pieces of it (CI bundle-size check, axe-core gate) are cheap to add early.

---

## Activation priority recommendation 2026-04-27 (sub-E decision-only output)

This section captures the output of Outstanding Integrations sub-workstream E (Future-State workstream prioritization). It supersedes the older "Phase ordering" sequence above and incorporates the 6 NEW workstream docs created during sub-A.

### Universe of Future-State workstream docs (14 total)

| # | Doc | Priority | Source |
|---|---|---|---|
| 1 | `Future-State-playwright-e2e-workstream.md` | 🔥 **HIGH** | Self-flagged in doc; closes E2E gap; cheapest infrastructure improvement post-MVP |
| 2 | `Future-State-library-polish-workstream.md` | **HIGH** | Sub-A Q-Phase4-1 ruling; user-visible value; ~15-row audit cluster |
| 3 | `Future-State-form-library-workstream.md` | **HIGH** | Sub-A Q-Phase4-1 ruling; foundation for auth + admin screens |
| 4 | `Future-State-auth-and-account-management-workstream.md` | STANDARD | Implicit; foundation for chat + admin + sharing + real /me |
| 5 | `Future-State-mobile-workstream.md` | STANDARD | Sub-A Q-Phase4-1 ruling |
| 6 | `Future-State-admin-workstream.md` | STANDARD | Sub-A Q-Phase4-1 ruling; hard-blocked on auth |
| 7 | `Future-State-observability-workstream.md` | STANDARD | Split from production-hardening per Q-Phase4-4; pairs with hardening |
| 8 | `Future-State-production-hardening-workstream.md` | STANDARD | Cross-cutting; lands incrementally; some items cheap (axe CI, security headers) |
| 9 | `Future-State-documents-and-textract-workstream.md` | STANDARD | Q9 deferred OCR; standalone (new AWS service) |
| 10 | `Future-State-chat-workstream.md` | STANDARD | Hard-blocked on auth; webhook-adapter complexity |
| 11 | `Future-State-command-palette-workstream.md` | STANDARD-LOW | Polish; no backend dep; nice-to-have |
| 12 | `Future-State-tweaks-panel-workstream.md` | LOW | Internal-dev affordance; not user-facing |
| 13 | `Future-State-sharing-workstream.md` | LOW / long-term | Sub-A Q-Phase4-1 ruling; needs auth + library polish |
| 14 | `Future-State-shadcn-primitive-migration-workstream.md` | ❌ DESCOPED | R1 reviewer remediation 2026-04-27; preserved as historical record |

### Dependency graph

```
                      ┌──── Library Polish ─── (some server-side deps: PATCH/DELETE/cursor)
                      │
   Form Library ──────┼──── Auth ─────┬─── Admin (needs roles)
                      │               ├─── Chat (needs auth + webhook adapter)
                      │               └─── Sharing (needs auth + library polish)
                      │
   Playwright E2E ────┴──── (no blockers; depends only on stable MVP — already there)

   Production Hardening ──── interleaves with Observability (correlation IDs cheapest)
   Documents + Textract ──── standalone (new AWS service)
   Mobile ────────────────── mostly standalone (benefits from responsive Library Polish)
   Command Palette ───────── standalone polish
   Tweaks Panel ──────────── standalone polish (dev-only)
   shadcn migration ──────── DESCOPED (historical)
```

### Tiered activation recommendation

**Tier 1 — Cheap wins first (start here):**

1. **Playwright E2E** — already 🔥 HIGH per the doc; depends only on stable MVP (we have); cheapest test infrastructure investment; protects all subsequent Future-State work from regressions. Estimated wall: 1-3 days for happy-path coverage.
2. **Form Library** — HIGH; bounded scope; foundation for the auth + admin screens that follow. Adopt RHF + Zod; build PasswordField/NumberField/Textarea/Select primitives; migrate existing forms. Estimated wall: 2-4 days.
3. **Library Polish** — HIGH; user-visible value; some items need new server endpoints (PATCH /api/images/:id, DELETE /api/images/:id, cursor pagination, signed thumbnails) so coordinate with backend.

**Tier 2 — Foundational (moderate priority, key dependencies):**

4. **Auth + Account Management** — unlocks Tier 3. Q10 explicitly descoped this from MVP; activation needs Project 03 lambda integration.
5. **Production Hardening (cheap subset)** — axe-core CI gate (Phase A of the doc), security headers + CSP, dependency scanning. Cheap; cross-cutting. Land incrementally rather than as a big-bang phase.
6. **Observability (correlation IDs subset)** — Phase A of observability doc (correlation IDs); cheapest first step; unblocks downstream observability work.

**Tier 3 — Auth-dependent or external-trigger (wait for Tier 2 + context signal):**

7. **Admin** — strict block on auth roles; activate after auth.
8. **Chat** — auth-blocked; webhook-adapter complexity (R-3 in spec); activate when collaborative use case actually arrives.
9. **Documents + Textract** — standalone but adds AWS cost surface; activate when document users surface or when Q9 deferral expires.
10. **Mobile** — activate when a mobile user / responsive UX gap actually surfaces; otherwise responsive desktop components handle the 95% case.

**Tier 4 — Polish / long-term:**

11. **Command Palette** — nice-to-have; ⌘K is a power-user affordance; activate when there's a real navigation pain point.
12. **Sharing** — LOW per Q-Phase4-1; needs auth + library polish; activate only if the use case (guest reviewers like Prof. Hummel) actually arrives.
13. **Tweaks Panel** — internal-dev affordance; activate when there's a developer audience.
14. **shadcn migration** — DESCOPED; preserved as historical record; reactivate only if a dedicated decision reverses R1.

### What activates next — recommendation depends on context

If the next move is **continued individual evolution of the Class Project** (no external users/audiences):
→ Activate **Playwright E2E first**. Cheapest insurance; protects all downstream work; bounded scope.

If the next move is **demoing the MVP to non-class audiences** (instructor, peers, prospective collaborators):
→ Activate **Production Hardening (cheap subset) + Observability (correlation IDs)** in parallel. Gets the demo-credible signal up. Defer per-feature workstreams until a real user signal arrives.

If the next move is **Project 03 (course-mandated next assignment)**:
→ Treat the Future-State queue as backlog. Project 03 has its own scope (auth Lambda + chat webhook); some of Tier 2/3 may activate naturally during Project 03 (Auth workstream is the obvious overlap).

If the next move is **closing the contract surface** (Sweep CP for drift workstream queued in Pending):
→ Do that BEFORE activating any major Future-State workstream. The Sweep is bounded (doc + code + tracker drift detection); leaves the substrate clean for whatever lands next.

**Decision-only output: my single-best-bet recommendation** — given the post-sub-A + post-sub-B state and absent additional context, **Sweep Class Project for drift first** (it's already queued in Pending and serves as a clean-substrate gate), **then Playwright E2E** (cheapest infrastructure win; activates all subsequent Future-State work with regression protection). Tier 2+ activations can wait until a user signal informs which direction matters.

### Out of scope for sub-E

- Activating any workstream (sub-E is recommendation-only; activation is its own decision + workstream).
- Updating the older "What is split into Future-State approach docs" table (line 34) — that has the original 8 docs only; bringing it to 14 would expand sub-E's scope. Flagged as a separate doc-hygiene TODO if Erik wants it.

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
