# ArtifactsForFormLibrary

Curated copy of Andrew Tapple's `screens.jsx` from his Frontend MVP (commit `1f3c067`, `ClaudeDesignDrop/raw/MBAi-460/src/`). Original stays preserved in `raw/`.

## Files

| File | Size | Source role | Acceleration value |
|---|---|---|---|
| `screens.jsx` | 33 KB | Andrew's multi-screen file (UploadScreen + likely forgot-password / account-settings / multi-screen patterns) | We migrated only the UploadScreen subset to `frontend/src/components/UploadScreen.tsx`. The remaining screens contain form patterns Andrew's spec calls out (password rules live checklist, autocomplete attrs, PasswordField show/hide, etc.) |

## Target workstream

`MetaFiles/Approach/Future-State-form-library-workstream.md` (**HIGH** priority — pairs with Library Polish for user-visible polish).

⚠️ **The next agent should split `screens.jsx` per-screen during workstream execution** — it's a multi-screen file (33KB) and dropping it as one unit into the working tree is unwieldy. Suggested approach:
1. Read `screens.jsx` to inventory which screens it contains (likely: UploadScreen, ForgotPasswordScreen, AccountSettingsScreen, possibly more).
2. Identify which screens tie to the Form Library workstream (those exhibiting Andrew's form patterns).
3. Migrate each to its own TypeScript file under `frontend/src/components/` (or `frontend/src/pages/` for routes).
4. Use the migration as the on-ramp for adopting RHF + Zod (per Form Library Phase A).

## Target overlap

Some screens in `screens.jsx` may also accelerate other workstreams:

- **Forgot password screen** → could intersect Future-State Auth workstream (already documented at `Future-State-auth-and-account-management-workstream.md`).
- **Account settings** → also Future-State Auth workstream.

The Form Library workstream is the *primary* destination because Andrew's spec emphasizes form patterns + primitives; these screens are the canonical examples. Auth + account-settings activations would re-use the migrated screen files from the Form Library effort.

## Provenance

- **Original location:** `Part03/ClaudeDesignDrop/raw/MBAi-460/src/screens.jsx`
- **Copied to:** `Part03/Accelerators/ArtifactsForFormLibrary/screens.jsx` (this dir)
- **Copy date:** 2026-04-27 (Outstanding Integrations sub-A Phase 4.3)
- **Audit cross-refs:** rows 50 (password show/hide + autocomplete), 53-R2 (password rules live checklist), 117 (component inventory partial), 124 (form patterns), 126 (RHF+Zod stack) in `MetaFiles/archive/Andrew-MVP-Integration.md`
- **Originals:** preserved in `raw/` (do not modify); this copy is modifiable.
