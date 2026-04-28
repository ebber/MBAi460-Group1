# Future-State Workstream — Form Library

**Status:** Aspirational. **Not committed to Part 03.** Shipped MVP uses plain `useState` + bare HTML inputs; this workstream introduces a typed form library + the form primitives Andrew's spec calls for.
**Priority:** **HIGH** (per Erik routing 2026-04-27 — pairs with Library Polish for the most user-visible polish work)
**Source:** distilled from Andrew's `UI-Design-Requirements.md` §9.1 (Login interactions), §9.2 (Register R1–R3), §11.7 (component inventory), §12.4 (form patterns), §13.1 (RHF + Zod stack), §13.4 (auth handling).
**Provenance:** Surfaced 2026-04-27 during Outstanding Integrations sub-A audit (`MetaFiles/archive/Andrew-MVP-Integration.md` rows 50, 53-R2, 117 partial, 124, 126 partial).

---

## Goal

Adopt a typed form library (React Hook Form + Zod for runtime validation) and ship the form primitives Andrew's spec specifies (PasswordField with show/hide, NumberField with ±, Textarea autosizing, Select + Combobox keyboard-operable, Toggle, accessible Checkbox + Radio). Provide `useFormSchema()` patterns + live validation feedback (per spec §9.2 R2 password rules checklist).

## Scope

1. **Adopt React Hook Form (RHF) + Zod.** Schema-first validation; uncontrolled form perf; tight TypeScript inference. Per spec §13.1 stack prescription.
2. **`PasswordField` primitive.** Shows toggle (👁 icon); autocomplete attrs (`current-password` / `new-password`); supports live-validation checklist (e.g., password rules from §9.2 R2: min 8 chars, ≥1 digit, ≥1 non-alphanumeric).
3. **`NumberField` primitive.** With increment/decrement buttons; min/max/step; keyboard arrows; integer or decimal modes.
4. **`Textarea` primitive.** Auto-resizing up to 40vh per spec §11.7.
5. **`Select` / `Combobox` primitive.** Keyboard-operable, typeahead. Per spec §11.7.
6. **`Toggle` (switch) primitive.** For boolean settings. Per spec §11.7.
7. **`Checkbox` / `Radio` primitives.** Custom but accessible — visible focus indicators, proper labels, keyboard activation.
8. **Form pattern enforcement.** Labels above fields (not floating); required marked `*`; error messaging directly below the offending field in `--color-error`; inline-first then form-level banner; submit always at bottom aligned with field column. Per spec §12.4.
9. **Autocomplete attrs by default.** Every text field declares an `autocomplete` value; `username`, `current-password`, `new-password`, etc.
10. **Live-validation feedback patterns.** Password rules as live checklist below the password field; field-level error inline; form-level banner only for server-returned global errors.

## Cross-refs

- **Andrew's spec:** §9.1 Login interactions, §9.2 Register R1–R3, §11.7 component inventory, §12.4 form patterns, §13.1 stack
- **Audit rows:** 50 (password show/hide + autocomplete), 53-R2 (password rules live checklist), 117 (component inventory), 124 (form patterns), 126 partial (RHF+Zod)
- **Accelerators:** `Part03/Accelerators/ArtifactsForFormLibrary/screens.jsx` — Andrew's 33KB screens file. Likely contains multi-screen forms (forgot password, account settings, etc.) that this workstream will split into individual screen components.
- **Dependencies:**
  - Many items intersect Future-State auth (LoginScreen + RegisterScreen become primary RHF consumers).
  - Future-State Sharing may need form primitives for guest-mode invitation flows.
  - Potential dependency on Future-State Library Polish for filter-bar form components.

## Implementation sketch

**Phase A — Adopt RHF + Zod.** `npm install react-hook-form zod @hookform/resolvers`. Migrate LoginScreen + RegisterScreen + UploadScreen to `useForm` + Zod schemas. Keep behavior identical; just swap state management.

**Phase B — Build PasswordField primitive.** With show/hide toggle, autocomplete attrs, live-rules checklist hook (composable; not all forms need rules display).

**Phase C — Build NumberField + Textarea + Toggle primitives.** Standard accessibility patterns.

**Phase D — Build Select / Combobox primitive.** Most complex — keyboard nav + typeahead. May leverage Radix Select under the hood (without using shadcn's wrapped version, since shadcn descope per R1).

**Phase E — Migrate existing forms.** Replace bare HTML inputs across the codebase with the new primitives.

**Phase F — Form-pattern enforcement via lint.** Custom ESLint rule (or codemod) that flags forms not using the primitives or missing autocomplete attrs.

**Phase G — Multi-screen form patterns.** Pull from `Accelerators/ArtifactsForFormLibrary/screens.jsx` for the forgot-password, account-settings, etc. screen patterns; split per-screen during this phase.

## Open questions

- **Q-FORM-1:** Radix primitives (without shadcn) — acceptable, or stay fully custom? Radix Select has best-in-class a11y + keyboard nav; rebuilding from scratch is significant.
- **Q-FORM-2:** Zod schemas centralized in `src/api/schemas.ts` (shared with API client) or per-form? Recommendation: shared where possible (e.g., RegisterRequest schema lives at the API layer + reused at the form layer).
- **Q-FORM-3:** Migration of existing forms — single sweeping commit or per-form-and-merge?

## Status

⏳ Queued (HIGH priority). Activate when Erik wants form polish or when a new screen needs primitives we don't have.
