# Future-State Workstream — Full shadcn/ui Primitive Migration

**Status:** Aspirational. **Not committed to Part 03 assignment completion.** Land after the Part 03 MVP flows are green and the UI has stabilized around real API data.
**Source:** split out from `01-ui-workstream.md` so assignment-critical UI work can use selective shadcn primitives without being blocked by a full design-system migration.

---

## Goal

Replace remaining custom UI primitives from Andrew's Claude Design export with standardized shadcn/Radix primitives while preserving the visual language from `tokens.css` and the interaction behavior users see in the Part 03 MVP.

This workstream turns "selective shadcn where useful" into a consistent component foundation.

## Scope

In scope:

- Replace remaining custom modal/dialog behavior with shadcn `Dialog`.
- Replace custom dropdowns, menus, popovers, tabs, and command interactions with shadcn equivalents.
- Standardize buttons, inputs, form controls, badges, cards, tables/lists, toasts, and empty states.
- Normalize keyboard/focus behavior across shell, library, upload, asset detail, and future auth/chat/admin screens.
- Preserve Andrew's visual tokens through Tailwind theme configuration.
- Add focused component tests for interactive primitives.

Out of scope:

- Changing `/api/*` endpoint behavior.
- Adding future-state backend features such as auth, Textract, or chat.
- Large visual redesigns not grounded in Andrew's design.
- Full automated axe-core CI gate; that belongs to `Future-State-production-hardening-workstream.md`.

## Preconditions

- Part 03 assignment MVP is complete or near-complete.
- `frontend/` exists and builds cleanly.
- Core flows work against real `/api/*` endpoints:
  - library
  - upload
  - asset detail
  - search
  - delete/reset
- Tailwind theme already reflects Andrew's token system.
- shadcn base config exists in `frontend/components.json`.

## Candidate Primitive Map

| Current / Andrew primitive | Future shadcn target | Notes |
|---|---|---|
| `Modal` | `Dialog` | Preserve ESC close, focus trap, focus return. |
| `ToastProvider` / custom toast stack | `Toaster` / toast hook | Preserve tone variants and auto-dismiss timing. |
| custom dropdowns | `DropdownMenu` | TopBar avatar, actions menus, view/sort menus. |
| custom command palette | `Command` + `Dialog` | Keyboard nav, fuzzy search, action execution. |
| upload options radio cards | `RadioGroup` or custom cards backed by Radix | Keep large clickable cards. |
| view toggles / tabs | `Tabs` or `ToggleGroup` | Library grid/list, asset sections. |
| custom form inputs | `Input`, `Textarea`, `Label`, `Form` | Keep validation messaging accessible. |
| cards / badges | shadcn `Card`, `Badge` where helpful | Do not force if custom layout is clearer. |

## Implementation Phases

### Phase 1 — Inventory Current Primitives

- [ ] List every custom primitive in `frontend/src/components`.
- [ ] Identify where each appears.
- [ ] Mark each as one of:
  - keep custom
  - replace with shadcn
  - defer
- [ ] Record decisions in this file or a `MetaFiles/DesignDecisions.md` follow-up.

### Phase 2 — Replace Low-Risk Primitives

- [ ] Replace simple buttons/inputs/badges where behavior is trivial.
- [ ] Run component tests after each replacement.
- [ ] Confirm visual parity with the current MVP screens.

### Phase 3 — Replace Interactive Primitives

- [ ] Replace modal/dialog flows.
- [ ] Replace dropdown/action menus.
- [ ] Replace command palette only after library/search workflows are stable.
- [ ] Add keyboard interaction tests for each replacement.

### Phase 4 — Polish And Accessibility Pass

- [ ] Manual keyboard-only walkthrough.
- [ ] Manual screen-reader label check for dialogs, menus, and forms.
- [ ] Confirm focus-visible styling is intact.
- [ ] Confirm reduced-motion settings are respected where applicable.

## Verification

- [ ] `npm test` passes in `frontend/`.
- [ ] `npm run build` passes in `frontend/`.
- [ ] Core UI smoke still works through Express static serving.
- [ ] No regression in upload, library, asset detail, search, and delete flows.
- [ ] Visual parity with Andrew's MVP remains acceptable.

## Risks And Mitigations

- **Risk:** replacing primitives changes visual spacing or layout.
  - **Mitigation:** migrate one primitive at a time and compare against the existing MVP.
- **Risk:** shadcn defaults fight Andrew's token system.
  - **Mitigation:** theme through Tailwind tokens first; avoid one-off overrides unless necessary.
- **Risk:** command palette consumes time without improving assignment demo.
  - **Mitigation:** leave it deferred until all required flows are green.
- **Risk:** focus behavior changes subtly.
  - **Mitigation:** add keyboard interaction tests for dialog/menu/command replacements.

## Source / Cross-Refs

- `01-ui-workstream.md`
- `ClaudeDesignDrop/raw/MBAi-460/src/shell.jsx`
- `ClaudeDesignDrop/raw/MBAi-460/src/screens.jsx`
- `ClaudeDesignDrop/raw/MBAi-460/src/library.jsx`
- `ClaudeDesignDrop/raw/MBAi-460/src/tokens.css`
- `Future-State-production-hardening-workstream.md`


---

## Andrew's accelerator artifacts (added 2026-04-27 per sub-A Phase 5)

**No Accelerator subfolder for this workstream.** Andrew's spec recommended shadcn/ui primitives; this was DESCOPED 2026-04-27 per R1 reviewer remediation in favor of custom Tailwind-styled primitives. The shipped MVP has Button/Modal/Toast/etc. as custom components, not shadcn.

This workstream is preserved as a historical record of the original recommendation and as the activation point if/when a future agent decides to migrate from custom Tailwind to shadcn primitives. Andrew's `tokens.css` is already translated to `tailwind.config.ts` — that translation persists regardless of shadcn adoption. There are no shadcn-specific source artifacts to accelerate from Andrew's drop.

**Audit cross-ref:** row 118 (§11.7 shadcn recommendation — explicitly DESCOPED) in `MetaFiles/archive/Andrew-MVP-Integration.md`.
