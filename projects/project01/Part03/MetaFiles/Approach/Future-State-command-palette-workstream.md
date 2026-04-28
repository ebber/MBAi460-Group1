# Future-State Workstream — CommandPalette Keyboard Launcher

**Status:** Aspirational. **Not committed to Part 03 assignment completion.** Land after the core library, upload, asset detail, search, and delete/reset flows are green.
**Source:** split out from Andrew's `CommandPalette` concept in `ClaudeDesignDrop/raw/MBAi-460/src/screens.jsx` so the assignment MVP can ship with simpler visible search/navigation controls.

---

## Goal

Add a keyboard-first `⌘K` command palette for navigation, asset search, and common PhotoApp actions while preserving the visual and keyboard behavior Andrew designed.

This workstream upgrades the app from visible controls only to a power-user command surface.

## Scope

In scope:

- `⌘K` / `Ctrl+K` global shortcut.
- Command palette modal/dialog.
- Search across assets by filename and labels.
- Navigation actions:
  - Library
  - Upload
  - Profile
  - Help
- Common actions:
  - upload asset
  - search label
  - open selected asset
  - delete/reset flow entry point, behind confirmation
- Keyboard navigation and focus management.
- Tests for shortcut open/close, keyboard navigation, and action execution.

Out of scope:

- Chat command actions.
- Auth/admin command actions.
- Full shadcn primitive replacement beyond what the palette needs.
- Server changes beyond consuming existing `/api/*` endpoints.

## Preconditions

- `frontend/` app exists and builds.
- Library/search behavior works with visible controls.
- `photoappApi.ts` exposes `searchImages(label)` and `getImages(userid?)`.
- Asset detail route exists.
- Zustand store exists or another simple global state mechanism is available.

## Implementation Phases

### Phase 1 — Command Data Model

- [ ] Define command item shape:
  - id
  - label
  - description
  - keywords
  - action
  - optional disabled reason
- [ ] Add navigation command list.
- [ ] Add asset-derived command list.
- [ ] Unit test filtering and ordering.

### Phase 2 — Palette Shell

- [ ] Port Andrew's CommandPalette visual structure.
- [ ] Use shadcn `Command` + `Dialog` if already available; otherwise keep a focused custom implementation.
- [ ] Add `⌘K` / `Ctrl+K` listener.
- [ ] Add ESC close and focus return.
- [ ] Test open/close and focus behavior.

### Phase 3 — Asset Search Integration

- [ ] Wire visible query to local asset list first.
- [ ] Optionally call `searchImages(label)` for server-side label search after debounce.
- [ ] Show loading/error/empty states.
- [ ] Test debounced search behavior.

### Phase 4 — Action Execution

- [ ] Navigation actions route correctly.
- [ ] Asset actions open asset detail.
- [ ] Upload action opens upload screen.
- [ ] Delete action opens the existing confirmation flow; it must not delete directly from the palette.
- [ ] Test each action category.

## Verification

- [ ] `npm test` passes in `frontend/`.
- [ ] `npm run build` passes in `frontend/`.
- [ ] `⌘K` opens the palette in the browser.
- [ ] Keyboard-only navigation works.
- [ ] Searching and opening an asset works.
- [ ] Assignment-critical visible controls still work without using the palette.

## Risks And Mitigations

- **Risk:** palette work delays assignment-critical UI.
  - **Mitigation:** keep this future-state until visible upload/library/search/delete flows are green.
- **Risk:** destructive commands become too easy to trigger.
  - **Mitigation:** never execute destructive actions directly; only open existing confirmation UI.
- **Risk:** server search and local filtering disagree.
  - **Mitigation:** start with local filtering; add server label search only after API behavior is stable.

## Source / Cross-Refs

- `01-ui-workstream.md`
- `ClaudeDesignDrop/raw/MBAi-460/src/screens.jsx`
- `ClaudeDesignDrop/raw/MBAi-460/src/library.jsx`
- `Future-State-shadcn-primitive-migration-workstream.md`


---

## Andrew's accelerator artifacts (added 2026-04-27 per sub-A Phase 5)

**No specific Accelerator subfolder for this workstream.** Andrew's spec specifies the command-palette pattern (⌘K, fuzzy search across name/labels/OCR, keyboard-only operable) but doesn't ship a corresponding source component — the palette is a pattern Andrew specifies but doesn't pre-build. References in `library.jsx` + `screens.jsx` (preserved in `raw/`) only show the trigger surface, not the palette itself.

When this workstream activates, the executing agent builds the palette from scratch following Andrew's spec; Radix `Command` + custom Tailwind styling is the likely shape (no shadcn per R1).

**Audit cross-refs:** rows 13 (keyboard-first principle), 55 (TopBar ⌘K), 60 (Library interactions: ⌘K + / + u key), 72 (search ⌘K command-palette style), 73 (search acceptance S1–S3), 78 (? help overlay) in `MetaFiles/archive/Andrew-MVP-Integration.md`.
