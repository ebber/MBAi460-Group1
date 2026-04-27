# Future-State Workstream — Mobile + Responsive Support

**Status:** Aspirational. **Not committed to Part 03.** The shipped MVP is desktop-first; mobile rendering works but isn't optimized.
**Priority:** STANDARD
**Source:** distilled from Andrew's `UI-Design-Requirements.md` §7.3 (mobile <768px hides rail behind hamburger), §13.9 (browser + device support: iOS Safari 15+, Chrome Android 100+, min viewport 360px, no IE11), and the substantial mobile source-file set Andrew shipped at `ClaudeDesignDrop/raw/MBAi-460/src/` (≈94 KB across 5 files).
**Provenance:** Surfaced 2026-04-27 during Outstanding Integrations sub-A audit (`Andrew-MVP-Integration.md` rows 109, 134).

---

## Goal

Make the PhotoApp UI a first-class mobile experience: responsive layouts down to 360px viewport, hamburger-driven nav under 768px, and (potentially) a dedicated mobile shell built on top of the components Andrew already drafted.

## Scope

1. **Responsive nav.** Left rail collapses to icon-only at <1024px (already shipped); hides behind a hamburger at <768px (NOT shipped). TopBar adapts. Per spec §7.3.
2. **Browser + device support targets.** iOS Safari 15+, Chrome Android 100+, min viewport 360px. Test matrix in CI (see Production-Hardening §8).
3. **Mobile shell components.** Andrew shipped a `mobile-shell.jsx` + `mobile-core.jsx` + `mobile-screens.jsx` + `ios-frame.jsx` + `mobile.css` set in his Frontend MVP. Whether to migrate these as a parallel mobile shell or to enhance the desktop components for responsiveness is a phased decision (see below).
4. **Touch-first interactions.** Gestures (swipe to dismiss, pull to refresh), 44×44 minimum touch targets, no hover-only affordances.
5. **Mobile-specific UX.** Fullscreen image viewer (use of native viewport), file-picker on iOS Safari (handles HEIC), upload via mobile camera capture.

## Cross-refs

- **Andrew's spec:** §7.3 Navigation pattern, §13.9 Browser + device support
- **Audit rows:** 109 (mobile <768 hamburger), 134 (browser + device support)
- **Accelerators:** `Part03/Accelerators/ArtifactsForMobile/` — 5 source files copied from Andrew's `src/` for direct use when this workstream activates
- **Andrew-MVP-Integration audit:** see `Andrew-MVP-Integration.md` for the row-level routing

## Implementation sketch

**Phase A — responsive desktop components (cheap, lands first).** Add Tailwind breakpoint utilities to existing components: hamburger menu under 768px, hidden rail, condensed TopBar. Validate min-viewport 360px.

**Phase B — mobile-specific shell evaluation.** Read Andrew's `mobile-shell.jsx` + `mobile-core.jsx` + `mobile-screens.jsx` from `Accelerators/ArtifactsForMobile/`. Decide: enhance desktop components (lighter touch) vs. build a parallel mobile shell (more divergence but matches Andrew's design intent). Trade-off discussion expected.

**Phase C — touch-first interactions + mobile UX polish.** Camera capture, gesture support, larger touch targets, native viewport handling.

**Phase D — CI mobile test matrix.** Playwright runs on iOS Safari + Chrome Android device emulators; visual regression coverage per breakpoint.

## Open questions

- **Q-MOB-1:** Parallel mobile shell vs. responsive desktop components? Trade-off: divergence + matches Andrew's intent (parallel) vs. simpler single-codebase (responsive).
- **Q-MOB-2:** iOS Safari HEIC handling — server-side conversion or browser-side? (Spec doesn't say; HEIC is a real production concern for iOS users.)
- **Q-MOB-3:** Pull-to-refresh — over-engineered for v1 or essential mobile UX expectation? Probably over-engineered; defer.

## Status

⏳ Queued (not active). Activate when Erik prioritizes mobile experience or when a class member with iOS-only access surfaces blockers.
