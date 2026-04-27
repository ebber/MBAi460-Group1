# Future-State Workstream — Observability + SLOs

**Status:** Aspirational. **Not committed to Part 03.** Shipped MVP has only `console.error('UNHANDLED ERROR:', err)` from the error middleware + a startup banner; no structured logging, no RUM, no error reporting, no synthetic checks.
**Priority:** STANDARD
**Source:** distilled from Andrew's `UI-Design-Requirements.md` §13.12 (Observability), §14.1 (Success metrics), §14.3 (Error taxonomy), §14.4 (Edge cases catalog), §14.5 (SLOs); FR-SYS-2 (correlation IDs).
**Provenance:** Surfaced 2026-04-27 during Outstanding Integrations sub-A audit (`Andrew-MVP-Integration.md` rows 12, 103, 137, 140, 143, 144). Split out from `Future-State-production-hardening-workstream.md` per Erik's Q-Phase4-4 ruling — observability is a distinct concern from hardening (visibility vs. safety).

---

## Goal

Make the PhotoApp UI's runtime behavior observable: structured logs, correlation IDs flowing end-to-end, real user monitoring of Web Vitals, error reporting with PII scrubbing, synthetic uptime checks. Define SLOs + success metrics + an edge case catalog so the team has explicit targets to measure against.

## Scope

### 1. Correlation IDs

- Generate ULID client-side at request initiation; pass via `X-Correlation-Id` header on every API call (per spec FR-SYS-2).
- Echo back in server response headers; include in any error envelope body.
- Display the correlation ID on every error UI surface (per spec FR-SYS-2 + §11.7 error-boundary surface).
- Server-side: log every request's correlation ID; thread it through downstream AWS calls when supported.

### 2. Structured client-side logger

- `logger` wrapper (e.g., `pino` or a 30-line bespoke wrapper) — DEBUG in dev, INFO+ in prod.
- Log shape: `{ level, ts, correlationId, route, msg, ...context }`.
- No raw `console.*` calls in app code (lint rule).

### 3. Real User Monitoring (RUM)

- CloudWatch RUM (or alternative) instruments the app for Web Vitals: LCP, INP, CLS, TTFB.
- Sampling: 100% in staging, 10% in prod (cost-managed).
- Dashboards per route + per release.

### 4. Error reporting

- Sentry (or self-hosted GlitchTip) with source maps uploaded at build.
- PII-scrubbing on payloads: strip `password`, `token`, `Authentication` header values, OCR text (unless user opts in).
- Error boundary surface (per spec §11.7) catches React render errors, captures correlation ID + retry button.

### 5. Synthetic checks

- Scheduled Playwright test runs the canonical flow (login → upload → view) every 5 minutes against prod.
- Fails feed into observability dashboards + alert.

### 6. SLOs (per spec §14.5)

- Availability: 99.5% (per spec).
- Error budget: derived from SLO; surfaces in dashboards.
- Latency targets: per-page LCP/INP/CLS budgets enforced as SLO breaches when sustained.

### 7. Success metrics (per spec §14.1)

| Metric | Target | Rationale |
|---|---|---|
| Time to first successful upload after register | p75 < 90s | Onboarding stickiness |
| Upload success rate | ≥ 99% | Reliability signal |
| Rekognition label success rate | ≥ 97% | Service health |
| Textract OCR success rate | ≥ 95% on supported types | New capability tolerance |
| Search-to-click | p75 < 6s | Search quality |

These metrics feed into RUM dashboards.

### 8. Error taxonomy (per spec §14.3)

Catalog of error categories with consistent UX treatment:

- 4xx auth (missing/invalid token, expired session, insufficient role)
- 4xx validation (request body shape, file size, file type)
- 4xx cost-guard (Textract per-user OCR rate limit, etc.)
- 4xx conflict (username already taken, asset name collision)
- 5xx server / timeout / AWS service degraded

Each category gets a UI treatment + correlation ID + retry path (where applicable).

### 9. Edge cases catalog (per spec §14.4)

- Large files (≤50MB upload limit)
- Multi-file batches (concurrent uploads — see Future-State Library Polish)
- Network drops mid-upload (resume? abort + retry?)
- Token expiry mid-action (auto-redirect + return to flow)
- Concurrent Textract jobs per user (rate-limit + queueing)
- Stale RDS state (eventual consistency for label/OCR backfill)
- Browser-specific (HEIC on iOS, etc. — see Future-State Mobile)

## Cross-refs

- **Andrew's spec:** §13.12, §14.1, §14.3, §14.4, §14.5; FR-SYS-2
- **Audit rows:** 12 (recoverable errors with correlation ID), 103 (FR-SYS-2 correlation IDs), 137 (observability stack), 140 (success metrics), 143 (edge cases catalog), 144 (SLOs)
- **Adjacent workstream:** `Future-State-production-hardening-workstream.md` — security headers, a11y CI, deployment infrastructure; observability DOES intersect (axe-core CI is in hardening; RUM is here; both might share a Sentry/CloudWatch backend)
- **Pre-existing observability content** in `Future-State-production-hardening-workstream.md` §4 should be MOVED to this doc (or replaced with a pointer here) per the Q-Phase4-4 split decision.

## Implementation sketch

**Phase A — Correlation IDs (cheap; high value).** ULID generation + header injection on the API client wrapper; server-side log echo; UI display on error states. Lands quickly and unblocks every downstream observability item.

**Phase B — Structured logger.** Wrap `console.*` with a logger; lint rule banning direct console; DEBUG/INFO/WARN/ERROR levels.

**Phase C — Sentry / GlitchTip.** Source maps in CI; PII scrubbing; error boundary surface integration.

**Phase D — CloudWatch RUM.** Web Vitals instrumentation; dashboards per route; sampling tier.

**Phase E — Synthetic checks.** Playwright canonical flow scheduled in CI/cron.

**Phase F — SLOs + success metrics dashboards.** Tie everything together.

**Phase G — Edge case catalog drills.** For each category in §9 above, write a runbook + (where possible) an automated probe.

## Open questions

- **Q-OBS-1:** Sentry SaaS vs self-hosted GlitchTip — class-project budget vs. ops complexity. Recommend Sentry free tier for v1.
- **Q-OBS-2:** Correlation IDs at the AWS-call level — boto3/SDK doesn't natively propagate `X-Correlation-Id` to S3/RDS. Either log them at our wrapper layer (server adds correlation ID to every log line) or accept that we lose them at the AWS boundary. Recommend the former.
- **Q-OBS-3:** RUM cost at 10% sampling in prod — order-of-magnitude estimation needed before committing.

## Status

⏳ Queued (STANDARD priority). Activate when production-hardening or external deployment is on the near horizon; correlation IDs (Phase A) are the cheapest first step — could land standalone before the full workstream activates.
