# Future-State Workstream — Production Hardening

**Status:** Aspirational. **Not committed to Part 03.** Cross-cutting workstream that lands incrementally — pieces of it (axe-core CI gate, bundle-size check) are cheap to add early; full production deployment (CloudFront, RUM, Sentry) is a later phase.
**Source:** distilled from Andrew's `UI-Design-Requirements.md` §13.7 (a11y), §13.8 (performance), §13.9 (browsers), §13.10 (security), §13.11 (deployment), §13.12 (observability), §13.13 (i18n), §13.14 (feature flags), §14.1 (success metrics), §14.2 (testing strategy).

---

## Goal

Move the PhotoApp UI from "works locally for the assignment" to "production-credible for non-class deployments." This workstream is a checklist of cross-cutting practices, not a single feature. Many items are cheap to add early; some (CloudFront deployment, paid observability) wait until there's actually a non-class user.

## Scope

**In scope (when items land — order is flexible):**

### 1. Performance budgets + CI bundle-size gate

- Web Vitals targets (per spec §13.8 + §14.1):
  - LCP on `/login` < 1.5s on 4G; on `/library` with 50 assets < 2.5s on 4G
  - INP < 200ms p75
  - CLS < 0.1
  - Initial JS bundle < 200 KB gzipped
  - Per-route lazy chunks < 80 KB gzipped each
  - Image thumbnail target < 50 KB at 400px width
- CI bundle-size check (e.g., `size-limit` package) — fails the build on regression.
- Lazy-loaded routes via `React.lazy` + `Suspense`.

### 2. Accessibility CI gate

- `axe-core` runs against every route in CI. **Zero violations required** (per spec §13.7 — pre-launch hard gate, not post-launch goal).
- WCAG 2.1 AA color contrast: ≥ 4.5:1 text, ≥ 3:1 UI components and large text.
- Focus-visible on every interactive element (already in `tokens.css` from Andrew's MVP).
- Reduced-motion respected (already in `tokens.css`).
- Keyboard: no traps except intentional focus traps in modals; Tab order matches visual; all actions reachable without mouse (already designed in Andrew's components — verify in tests).
- Screen-reader landmarks (`header`, `nav`, `main`, `aside`, `footer`); dialogs have `role="dialog"` + labelled headings; async updates use `aria-live`.

### 3. Security defaults

- Content Security Policy (per spec §13.10):
  ```
  default-src 'self';
  img-src 'self' data: https://*.amazonaws.com;
  connect-src 'self' https://<api-host> https://*.amazonaws.com;
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  frame-ancestors 'none';
  base-uri 'self';
  ```
- Headers: `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`.
- HTTPS-only at production; HSTS at the CloudFront distribution.
- Tokens never logged, never in URL, never in `localStorage` (already covered in Auth workstream).
- XSS hardening: React's default escaping; `dompurify` for any user-generated HTML (Markdown notes etc.).
- S3 access via **presigned URLs only** (15-min expiry — per spec §13.10) — already partially in scope for workstream 03.
- Dependency scanning: `npm audit` in CI; Dependabot (GitHub) on high/critical advisories.

### 4. Observability

- Client-side structured logger (`logger` wrapper) — DEBUG in dev, INFO+ in prod.
- Real User Monitoring: CloudWatch RUM for Web Vitals; sampling 100% in staging, 10% in prod.
- Error reporting: Sentry (or self-hosted GlitchTip) with source maps; PII-scrubbing on payloads (strip password, token, OCR text unless user opts in).
- Correlation IDs: ULID generated client-side; passed via `X-Correlation-Id` header; echoed on error surfaces (per spec §14.3 error taxonomy — every error gets a copy-to-clipboard correlation ID).
- Synthetic checks: Playwright runs login + upload + view cycle every 5 minutes against prod.

### 5. Multi-environment deployment

- Build artifact: static bundle (`frontend/dist/`).
- Environments: `local`, `dev`, `staging`, `prod`. Env vars injected at build time via `.env.<env>`.
- CI/CD pipeline (GitHub Actions):
  - On PR: `pnpm install` → `pnpm test` → `pnpm build` → axe → bundle-size check.
  - On merge to main: deploy `dev` automatically.
  - On tag push (e.g., `v0.1.0`): deploy `staging`, then promote to `prod` after manual approval.
- Hosting: S3 + CloudFront in us-east-1 (front-door region; edge-replicated). UI bundle at `https://app.mbai460.example/`; API at `https://api.mbai460.example/`.

### 6. Feature flags

- Manifest at `/flags.json` (per spec §13.14) — fetched at app boot, no third-party SDK.
- v1 flags: `textract_enabled`, `chat_enabled`, `admin_enabled`, `presigned_uploads`, `dark_mode`.
- Flags evaluated at React root; components check synchronously.
- Useful for incremental rollout (Textract on staging only, chat behind a flag while debugging webhooks).

### 7. Internationalization scaffolding

- English only for v1.
- Copy wrapped in `t('key')` helper from day one (per spec §13.13) — translation pass becomes a pure data change.
- `Intl.DateTimeFormat` for dates / times.
- Tolerate multiple locales at render time.

### 8. Browser + device support

- Per spec §13.9:
  - Evergreen: last 2 versions of Chrome, Edge, Firefox, Safari.
  - Mobile: iOS Safari 15+, Chrome Android 100+.
  - Minimum viewport: 360px.
  - No IE11. No unsupported Safari < 15.
- Browserslist config in `package.json`.

### 8.5. Server-state library (TanStack Query)

Per Q7 (resolved 2026-04-26), TanStack Query is deferred to this workstream. Part 03 hand-rolls server state via `useEffect + apiFetch`. When the app grows beyond assignment scope:

- Install `@tanstack/react-query` + `@tanstack/react-query-devtools`.
- Wrap app in `<QueryClientProvider>` at the React root.
- Migrate `useEffect` → `useQuery` / `useMutation` for: ping, users, images, image labels, search, upload, delete.
- Configure cache staleness + invalidation (e.g., upload mutation invalidates the images query so the gallery refreshes).
- Add request deduplication, retry-with-backoff (replacing the small retry logic in `apiFetch`).

**Why deferred:** the assignment-window UI has small enough state that hand-rolled `useEffect` is fine. TanStack Query's value compounds with scale (cache hit rates, optimistic updates, background refetching) — those become real wins once the app has real users.

### 9. Testing strategy (per spec §14.2)

- **Unit (Vitest):** 80% line coverage on `src/lib`, `src/api`, `src/features/*/logic/`.
- **Component (React Testing Library):** every component with branching logic; every form's validation; every screen's empty/loading/error/success states.
- **E2E (Playwright):** happy paths J1–J6 from spec §5; login failures; upload + re-analyze; chat send/receive against mock SSE; admin deny-list.
- **Accessibility (axe-core):** every route in CI. Zero violations.
- **Visual regression (optional):** Playwright screenshot diff or Chromatic/Percy on key screens (login, library grid+list, asset detail photo+doc, chat).

### 10. Manual QA checklist (per release)

- Screen reader run (VoiceOver + NVDA) through login + library.
- Mobile device check (one iOS, one Android).
- Keyboard-only run through all primary actions.
- Offline toggle → graceful degradation.

**Out of scope:**

- Full production runbooks (referenced in spec; not authored here — operational, not architectural).
- SLA negotiations, on-call rotations.
- Marketing-site SSR / SEO (the UI is behind auth — no SEO surface).

## Dependencies

This workstream is **mostly self-contained**. No backend changes required. But:

- **Sentry / RUM** require accounts + cost decisions (Erik).
- **CloudFront / S3 deployment** requires Terraform updates for CDN distribution + Route 53 if a custom domain is wanted.
- **Synthetic Playwright checks** require a host to run them on (cron'd EC2, GitHub Actions schedule, AWS Lambda — pick one).
- **Feature flags** are trivial JSON; no backend dependency.

## Implementation phases (sketch — order is suggestive, not binding)

### Phase A — Cheap CI wins (land first)

- `axe-core` automated run in component tests.
- `size-limit` package + CI bundle-size check.
- `npm audit` failure on high/critical in CI.
- Browserslist config locked to spec §13.9.

### Phase B — Observability scaffold

- Client logger + correlation ID generation (ULID).
- Sentry SDK installed; source maps uploaded on build.
- Playwright synthetic checks running in CI nightly.

### Phase C — Feature flags

- `/flags.json` static manifest at the app build.
- Boot-time fetch + synchronous evaluation in the React root.
- First flag wired: `textract_enabled` (gates the document upload classification radio).

### Phase D — i18n scaffolding

- `t('key')` helper installed.
- Initial pass: wrap user-facing strings (~20–50 strings for the in-scope UI).
- No second locale yet — the scaffolding is the deliverable.

### Phase E — Production deployment

- Terraform: S3 bucket for static hosting + CloudFront distribution + Route 53 record.
- GitHub Actions workflow: build → S3 upload → CloudFront invalidation.
- Multi-env: `dev` / `staging` / `prod` separated by env vars + S3 prefixes.
- Synthetic Playwright switched to run against prod.

### Phase F — Performance + accessibility hard gates

- Web Vitals collected via CloudWatch RUM (live data).
- Performance budgets enforced in CI on regression.
- axe-core CI gate elevated from "report" to "fail build" on any violation.

## Risks and Mitigations

- **Risk:** Sentry / CloudWatch RUM cost.
  - **Mitigation:** sampling at 10% in prod (per spec §13.12). Self-hosted GlitchTip is the free alternative if cost-sensitive.
- **Risk:** Performance budgets are aspirational; Andrew's spec sets ambitious targets.
  - **Mitigation:** start with "report only" mode in CI; promote to "fail build" once we have baseline measurements that the budgets are achievable.
- **Risk:** axe-core "zero violations" is a hard gate but third-party components (shadcn/ui) may have violations we can't immediately fix.
  - **Mitigation:** allowlist specific rules per component with a tracked-debt note; review allowlist quarterly.
- **Risk:** CloudFront + Route 53 + custom domain setup is non-trivial Terraform; deployment phase has highest setup cost.
  - **Mitigation:** spike-then-decide. Phase E can be deferred indefinitely; v1 deploys directly to S3 with the public URL until a custom domain is justified.
- **Risk:** Feature flags become a hidden coupling layer if not curated.
  - **Mitigation:** rule: every flag has a target removal date in its description. Quarterly review prunes stale flags.

## Source / cross-refs

- Andrew's `UI-Design-Requirements.md`: §13.7 (accessibility), §13.8 (performance budgets), §13.9 (browser/device), §13.10 (security), §13.11 (deployment), §13.12 (observability), §13.13 (i18n), §13.14 (feature flags), §14.1 (success metrics), §14.2 (testing strategy)
- `MBAi460-Group1/MetaFiles/Future-State-Ideal-Lab.md` (lab-wide aspirational doc — overlaps with this workstream's deployment + observability sections; reconcile when promoting)
- `MBAi460-Group1/MetaFiles/Manifesto-AWS-Lab-Sanctum.md` (governing principles — production credibility is one of them)
- `MetaFiles/DesignDecisions.md` Q7 (frontend stack prescription) — affects CI tooling choices (TS strict, Tailwind, shadcn) here
