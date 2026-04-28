# Future-State Workstream — Playwright E2E Test Suite

**Status:** Aspirational. **Not committed to Part 03 assignment completion.** **🔥 HIGH PRIORITY** — should land first among the no-backend-dependency Future-State workstreams; pre-deployment confidence is meaningfully degraded without an end-to-end happy-path gate.

**Source:** split out from `01-ui-workstream.md` so the Part 03 UI MVP can ship with Vitest + React Testing Library coverage alone, while the cross-system happy-path verification ships in its own focused workstream right after.

---

## Goal

Add a Playwright-driven end-to-end test suite that exercises the PhotoApp UI against the live Express + AWS+RDS stack, covering the assignment-critical happy paths from a real browser. This complements (does not replace) the Vitest + RTL component tests already in the MVP.

The MVP test pyramid post-Part-03:

```
       ▲
      ▲ ▲     Playwright (E2E) ← THIS WORKSTREAM
     ▲   ▲
    ▲     ▲   Vitest + RTL (component / unit)         ← in MVP
   ▲       ▲
  ▲         ▲ Jest + supertest (server unit + integration) ← in MVP (workstream 03)
 ▲▲▲▲▲▲▲▲▲▲▲
```

## Why high priority

Part 03 backend ships with 12 server suites / 73 tests + opt-in live integration. The UI MVP ships with Vitest+RTL component tests. **Neither layer verifies that the browser → Express → AWS+RDS round-trip works under realistic conditions** — that's the gap Playwright fills. Without it, the assignment demo relies on manual smoke (per `HumanTestInstructions/README.md`); regressions in the wiring path can ship undetected.

For an assignment-window project, manual smoke is acceptable. For any continued evolution post-submission, an automated E2E gate is the cheapest way to keep the demo path green.

## Scope

**In scope (when this workstream lands):**

- Playwright installed under `Part03/frontend/` with chromium binary (`@playwright/test` + `npx playwright install chromium`).
- `playwright.config.ts` configured for `baseURL: http://localhost:8080` and serial execution (the live-RDS `deleteAll()` test is destructive).
- `frontend/e2e/` directory with happy-path specs:
  - `mock-login-to-delete.spec.ts` — main happy-path arc: visit `/library` → upload a known JPG → see new asset card → click → see Rekognition labels → search "Animal" → confirm filtered result → trigger delete-all → confirm empty state.
  - `document-upload.spec.ts` — Q9 branch: upload a small PDF → see document card with "OCR coming soon" → asset detail shows PDF embed + no labels.
  - `error-paths.spec.ts` — surface validation: oversized file → toast; missing file in upload form → 400 envelope rendered as toast; unknown asset detail route → 404 page.
- `npm run e2e` script.
- Test fixtures under `frontend/e2e/fixtures/`: a small JPG (~50 KB), a small PDF (~10 KB).
- CI integration (optional initial scope): a GitHub Actions step that runs `npm run e2e` against a local-Express instance on PR.

**Out of scope (still — even at this workstream):**

- Visual regression testing (screenshot diffing).
- Cross-browser matrix beyond chromium (firefox + webkit deferred to Production Hardening).
- Mobile viewport testing.
- Performance budgets / Lighthouse CI.
- Auth-protected E2E flows (depends on Future-State Auth workstream).
- Document OCR E2E flows (depends on Future-State Documents+Textract workstream).
- Chat E2E flows (depends on Future-State Chat workstream).

## Dependencies

- Part 03 UI MVP must be green and stable (Vitest + RTL component tests passing; manual smoke per `HumanTestInstructions/` succeeding).
- `npm start` from `Part03/` must reliably bring up Express + serve the built frontend on port 8080.
- AWS credentials configured for live RDS + S3 (the architecture fix from Phase 8 commit `2d987cc` made this work).
- A small set of test fixtures (JPG, PDF) checked in under `frontend/e2e/fixtures/`.

## Implementation phases (sketch)

### Phase A — Bootstrap

- `npm install -D @playwright/test` (logged in install-log).
- `npx playwright install chromium`.
- `playwright.config.ts` with `baseURL`, serial mode, retries=1, reporter=list.
- Stub `e2e/sanity.spec.ts` that asserts `http://localhost:8080/` renders with the wordmark.
- Add `npm run e2e` script wrapping `playwright test`.

### Phase B — Happy path

- `mock-login-to-delete.spec.ts`: the main arc through the assignment-critical flows.
- Use a known fixture image (`fixtures/01degu.jpg`) for upload predictability.
- Assert UI state at each step (asset count, label presence, search-filtered subset, empty-state after delete).

### Phase C — Document branch

- `document-upload.spec.ts`: per Q9 — verify documents land with `kind='document'`, render the "OCR coming soon" placeholder, and the asset-detail PDF preview.

### Phase D — Error surfaces

- `error-paths.spec.ts`: oversized file (>50 MB) → friendly toast; unknown route → 404 page; missing file in upload → inline-validation error.

### Phase E — CI integration (optional initial scope)

- GitHub Actions workflow that builds the frontend, starts Express, runs Playwright against it. Decide retention of artifacts (videos, traces) on failure.

## Risks and Mitigations

- **Risk:** Playwright tests against live RDS + S3 mutate state (uploads, deletes). Concurrent runs would conflict.
  - **Mitigation:** serial mode in `playwright.config.ts` (`workers: 1`); run only against a dedicated dev RDS+S3 stack. Document the destructive nature in the test file headers.
- **Risk:** Test fixtures (JPG, PDF) bloat the repo.
  - **Mitigation:** keep fixtures small (<100 KB total). One real JPG (Andrew's `01degu.jpg`-style), one real-PDF (~10 KB).
- **Risk:** Rekognition is async-ish — labels may not be available immediately after upload.
  - **Mitigation:** the upload service awaits `DetectLabels` before returning, so the label rows are inserted before the route response. The E2E test can fetch labels right after upload responds. If timing flakes, add a single retry with `expect.poll`.
- **Risk:** Playwright chromium binary is large (~150 MB).
  - **Mitigation:** install on demand; document that `npx playwright install chromium` is needed before first run.
- **Risk:** CI integration adds maintenance burden (flaky E2E + maintenance overhead) before there's enough surface to justify it.
  - **Mitigation:** Phase E (CI) is explicitly optional initial scope. The local `npm run e2e` is the minimum viable; CI lands when the value clearly outweighs the maintenance cost.

## Cross-refs

- `01-ui-workstream.md` — Part 03 UI MVP (Vitest + RTL only; Playwright moved here).
- `00-coordination-and-contracts.md` — API contract the E2E tests assert against.
- `MetaFiles/HumanTestInstructions/README.md` — manual smoke that this workstream eventually automates.
- `Future-State-roadmap.md` — sequencing.
- `DesignDecisions.md` Q7 — frontend stack, including the test stack decision and this workstream's descope note.

---

## Andrew's accelerator artifacts (added 2026-04-27 per sub-A Phase 5)

**No specific Accelerator subfolder for this workstream.** E2E testing infrastructure is not something Andrew shipped — his MVP is a visual + design spec, not a test suite. When this workstream activates, the executing agent builds the Playwright suite from scratch against the canonical user flows specified in `UI-Design-Requirements.md` §14.2 (testing strategy) and the journeys in §5 (J1–J6).

**Audit cross-refs:** row 141 (FR-test — testing strategy: unit/component/E2E/a11y/visual-regression layered) in `MetaFiles/archive/Andrew-MVP-Integration.md`. Plus visibility of E2E coverage from Andrew's acceptance criteria across §9 screens.
