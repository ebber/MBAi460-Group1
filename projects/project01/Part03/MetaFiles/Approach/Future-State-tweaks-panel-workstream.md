# Future-State Workstream — TweaksPanel Theme And Density Controls

**Status:** Aspirational. **Not committed to Part 03 assignment completion.** Land after the required upload/library/asset/search/delete flows are green.
**Source:** split out from Andrew's `TweaksPanel` concept in `ClaudeDesignDrop/raw/MBAi-460/src/screens.jsx` so the MVP can keep a stable visual theme without being blocked by design-time controls.

---

## Goal

Restore Andrew's design-time TweaksPanel as a controlled, user-facing or developer-facing preferences surface for theme, accent, density, and mock/demo data options.

For Part 03, the UI should use a stable default theme. This future workstream adds runtime controls once the core assignment flows are complete.

## Scope

In scope:

- Theme toggle (`light` / `dark`) backed by Zustand.
- Accent color selection, constrained to approved design tokens.
- Density control (`comfortable` / `compact`) for library/list layouts.
- Optional mock-data seed controls for design/demo work only.
- Persistence strategy for preferences (localStorage or future user profile setting).
- Tests for store updates and UI class/data-attribute changes.

Out of scope:

- Changing the base design tokens.
- Adding auth-backed user preferences; that belongs to the auth/account future-state workstream.
- Reworking the whole component library.
- Production analytics/feature flags; those belong to production hardening.

## Preconditions

- Part 03 UI MVP is complete or near-complete.
- Tailwind theme reflects Andrew's `tokens.css`.
- Zustand store exists.
- Library and shell components are stable enough that density/theme changes can be tested.

## Implementation Phases

### Phase 1 — Preferences Store

- [ ] Extend `frontend/src/stores/ui.ts` with theme, accent, and density state.
- [ ] Add setter actions.
- [ ] Add persistence behavior if desired.
- [ ] Unit test state transitions.

### Phase 2 — Theme And Accent Application

- [ ] Apply theme through a root `data-theme` attribute or Tailwind-compatible class.
- [ ] Apply accent through controlled CSS variables or approved Tailwind theme classes.
- [ ] Verify contrast remains acceptable for supported combinations.

### Phase 3 — Density Application

- [ ] Wire density state into library/list/card spacing.
- [ ] Confirm compact mode does not break touch targets below acceptable sizes.
- [ ] Add component tests for density class changes.

### Phase 4 — Panel UI

- [ ] Port Andrew's TweaksPanel visual shell.
- [ ] Use existing primitives where possible; full shadcn replacement is separate.
- [ ] Add tests for toggles and persistence.
- [ ] Smoke through Express-served build.

## Verification

- [ ] `npm test` passes in `frontend/`.
- [ ] `npm run build` passes in `frontend/`.
- [ ] Theme toggle changes the visible theme without reload.
- [ ] Accent changes remain within the approved palette.
- [ ] Density changes affect library layout without breaking core flows.
- [ ] Upload, library, asset detail, search, and delete still work.

## Risks And Mitigations

- **Risk:** theme/accent customization causes inconsistent screenshots or demo confusion.
  - **Mitigation:** default to the approved cream/coral theme; keep alternate settings opt-in.
- **Risk:** density control creates layout regressions.
  - **Mitigation:** add focused component tests and keep only two density modes initially.
- **Risk:** mock-data seed controls leak into production behavior.
  - **Mitigation:** guard demo controls behind a development flag or keep them documented as design-time only.

## Source / Cross-Refs

- `01-ui-workstream.md`
- `ClaudeDesignDrop/raw/MBAi-460/src/screens.jsx`
- `ClaudeDesignDrop/raw/MBAi-460/src/tokens.css`
- `Future-State-shadcn-primitive-migration-workstream.md`
- `Future-State-production-hardening-workstream.md`


---

## Andrew's accelerator artifacts (added 2026-04-27 per sub-A Phase 5)

Andrew's `screens.jsx` may include a TweaksPanel or settings-overlay-style component in its multi-screen content. The curated copy is at `Part03/Accelerators/ArtifactsForFormLibrary/screens.jsx` (cross-workstream sharing — see `Accelerators/ArtifactsForFormLibrary/README.md` for the per-screen split note).

`tokens.css` (already translated to `tailwind.config.ts`) is the canonical token source; no separate accelerator needed.

**Audit cross-refs:** no specific row directly maps to a TweaksPanel; this workstream is more of an internal-developer-affordance concept than a user-facing requirement in Andrew's spec. When activated, identify TweaksPanel-relevant content in `screens.jsx` and decide migration scope.
