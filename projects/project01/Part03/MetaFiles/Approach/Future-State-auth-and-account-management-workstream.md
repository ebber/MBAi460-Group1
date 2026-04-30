# Future-State Workstream — Auth + Account Management

**Status:** Aspirational. **Not committed to Part 03.** Ships when Project 03's `authsvc` Lambdas + schema land. Promoted into the canonical approach docs at that time.
**Source:** distilled from Andrew's `UI-Design-Requirements.md` §9.1–§9.3, §9.10–§9.11, §13.4 + the `auth.jsx` / `screens.jsx` MVP components.

---

## Goal

Replace Part 03's mock-auth scaffold with real token-based authentication. Add user account management (Settings: change password, delete account, display name). Add admin RBAC (cross-user views: `/admin/users`, `/admin/assets`).

## Scope

**In scope (when this workstream lands):**

- Real `POST /api/auth` calling Project 03's `authenticate.zip` Lambda → returns bearer token + duration.
- Real `POST /api/users` (register) calling Project 03's `register.zip` Lambda → bcrypt-hashed password into `authsvc.users` + mirror row in `photoapp.users` (transactional).
- `GET /api/me` → returns current user from token; called on app mount; failure clears token.
- `POST /api/logout` → invalidates token server-side.
- Token storage: in-memory only (no `localStorage`, no cookies in v1 — XSS hardening per spec §13.4).
- `Authentication: Bearer <token>` header injected on every `/api/*` fetch via the `apiFetch` wrapper.
- `401 → cache clear → redirect to /login?next=<route>` flow.
- **Settings screen** (Andrew's `SettingsScreen`): change password (current + new + confirm), display-name update, delete account (type-name confirmation gate).
- **Admin RBAC**: `users.role ENUM('user','staff') NOT NULL DEFAULT 'user'` column. Staff-allowlist middleware on `/api/admin/*`. Non-staff hitting `/admin/*` get a 404 UI (not 403; per spec §9.5 acceptance — avoid revealing existence).
- **Admin/Users** (Andrew's `AdminUsers`): cross-user table with usernames, asset counts, last-upload timestamps; CSV export.
- **Admin/Assets** (Andrew's `AdminAssets` — implied by spec §9.10): cross-user asset browser with filtering.
- Login/Register screen visual polish — keep Andrew's password rules checklist, show/hide toggle, error states, autocomplete attributes.

**Out of scope (still — even at this workstream):**

- SSO / OAuth (Google / Northwestern SSO).
- Multi-factor authentication.
- Session-management UI (revoke device sessions across browsers).
- Forgot-password reset flow — `authsvc` schema doesn't include reset tokens; placeholder modal stays in `LoginScreen` until the schema gains a reset-flow.
- Audit logging UI.

## Dependencies

**Workstream-blocking:**

- Project 03's `authsvc` Lambdas (`authenticate.zip`, `register.zip`) deployed.
- `authsvc.users` + `authsvc.tokens` schemas live in RDS (per `projects/project03/create-authsvc.sql`).
- Decision: where `users.role` lives (`authsvc.users.role` vs `photoapp.users.role`). Recommend `authsvc.users.role` since auth owns identity; the `photoapp` schema mirror reads it.

**Non-blocking but recommended:**

- Login attempt rate-limiting (Express middleware) — spec §9.1 acceptance L5 mentions 5+ failures in 60s triggers a wait.
- Audit log table (`auditsvc.events` or similar) — useful for the spec's "correlation ID" surface.

## Implementation phases (sketch — not TDD-final)

### Phase A — `apiFetch` wrapper + 401 handling

- New: `frontend/src/api/apiFetch.js` — wraps `fetch` with base URL, correlation ID (ULID), `Authentication` header injection, timeout, retry on 5xx + network only.
- New: `frontend/src/state/auth.js` — small Zustand (or plain useState in v1) auth store: `{ token, user, setToken, clearToken }`.
- 401 handler: clear store, clear TanStack Query cache (or local state), `navigate('/login?next=' + currentPath)`.

### Phase B — Real login + register

- Replace mock-auth in `LoginScreen.jsx` with `apiFetch('/api/auth', {method: 'POST', body: {username, password, duration?}})`.
- Replace mock-auth in `RegisterScreen.jsx` with `apiFetch('/api/users', {method: 'POST', body: {...}})` → auto-sign-in on success (per spec acceptance R3).
- Wire Express server (workstream 03) to forward to `authenticate.zip` / `register.zip`.

### Phase C — `/me` + logout

- Add `apiFetch('/api/me')` — call on app mount if token present; clear token on failure.
- Add `apiFetch('/api/logout', {method: 'POST'})` — wired to TopBar avatar menu's "Sign out".

### Phase D — Settings

- Migrate `SettingsScreen` from `screens.jsx` lines 290–327.
- Wire change-password to `POST /api/users/me/password` with body `{current, new}` (server validates current; updates bcrypt hash in `authsvc.users`).
- Wire display-name update to `POST /api/users/me` with body `{givenname, familyname}`.
- Wire delete-account to `DELETE /api/users/me` (type-name confirmation modal — irreversible).

### Phase E — Admin RBAC

- Add `authsvc.users.role` column (migration: forward-only, default `'user'`, manual SQL to promote first staff).
- Add staff-allowlist middleware on `/api/admin/*` Express routes — checks decoded token's user `role`; 404 if not 'staff'.
- Migrate `AdminUsers` from `screens.jsx` lines 329–359 — wire to `GET /api/admin/users`.
- Add `AdminAssets` (implied by spec) — `GET /api/admin/assets` with cross-user filtering.
- Route guards: `/admin/*` routes 404 for non-staff (per spec §9.5 acceptance).

## Risks and Mitigations

- **Risk:** Token-in-memory means full reload kills the session — UX cost for refresh-friendly workflows.
  - **Mitigation:** accept the trade-off in v1 (XSS protection > refresh convenience). Future refresh-cookie adapter would add CSRF tokens; deferred.
- **Risk:** Real auth changes the local-dev story (mock-auth was seamless; real requires running `authsvc` Lambdas locally or pointing at a staging URL).
  - **Mitigation:** maintain a `MOCK_AUTH=1` env var that flips back to local mock-auth for UI iteration; production path always uses real auth.
- **Risk:** Admin RBAC requires careful DB migration; existing users default to 'user'; first staff must be manually promoted via SQL.
  - **Mitigation:** capture the SQL one-liner in this workstream's runbook + put it on the deploy checklist.
- **Risk:** Forgot-password is a placeholder; users will hit the dead-end.
  - **Mitigation:** the `LoginScreen` "Forgot?" button opens a modal explaining the limitation and pointing at staff contact (per spec §9.3). Capture the unblock as a dependency on `authsvc` schema gaining a `password_resets` table.

## Source / cross-refs

- Andrew's `UI-Design-Requirements.md`: §6 (auth endpoints), §9.1 (login), §9.2 (register), §9.3 (forgot — placeholder), §9.10 (settings), §9.11 (admin), §13.4 (auth handling), §14.3 (error taxonomy: `E_AUTH_INVALID`, `E_AUTH_EXPIRED`, `E_AUTH_LOCKED`, `E_PERMISSION`)
- `ClaudeDesignDrop/raw/MBAi-460/src/auth.jsx` (LoginScreen + RegisterScreen MVP)
- `ClaudeDesignDrop/raw/MBAi-460/src/screens.jsx` lines 290–359 (SettingsScreen + AdminUsers MVP)
- `MetaFiles/Approach/01-ui-workstream.md` (current — references mock-auth scaffold)
- `MetaFiles/DesignDecisions.md` Q10 (auth scaffold for v1, resolved)
- Project 03 source: `projects/project03/create-authsvc.sql`, `register.zip`, `authenticate.zip`, `client/client.py`

---

## Andrew's accelerator artifacts (added 2026-04-27 per sub-A Phase 5)

Andrew shipped multi-screen form patterns in `ClaudeDesignDrop/raw/MBAi-460/src/screens.jsx` covering auth-adjacent flows (SettingsScreen, AdminUsers, ForgotPasswordScreen). The curated copy is at `Part03/Accelerators/ArtifactsForFormLibrary/screens.jsx` (intentional cross-workstream sharing — `screens.jsx` is the canonical source for both Form Library + Auth migrations; the next agent splits per-screen during workstream activation).

`auth.jsx` is NOT in Accelerators — it was already migrated to `LoginScreen.tsx` + `RegisterScreen.tsx` in shipped MVP (Q10 non-blocking). The `Accelerators/ArtifactsForFormLibrary/README.md` notes this overlap explicitly.

**Audit cross-refs:** rows 80 (FR-AUTH-1..9), 101 (FR-PROFILE), 32 (Authentication header) in `MetaFiles/archive/Andrew-MVP-Integration.md`.
