# UI Workstream Approach

> **For agentic workers:** This workstream now has a concrete visual contract — Andrew Tapple's Claude Design export at `ClaudeDesignDrop/raw/MBAi-460/`. Read it before implementing. The 1609-line `UI-Design-Requirements.md` is the product spec; the JSX components in `src/` are the working visual reference. This workstream's job is to migrate those components into a properly built React/Vite app under `Part03/frontend/` that is wired to the live `/api/*` endpoints.

> **Dev mode (Q5):** Built-only. UI iteration on isolated components may use Vite dev server with mocked API responses, but full-stack testing always uses `npm run build` → `frontend/dist/` → Express static middleware on port 8080. No Vite-dev-server proxy.

> **Stack (Q7, resolved 2026-04-26; Playwright descoped 2026-04-27):** **React 18.3.x** (NOT React 19 — Andrew's MVP runs on React 18.3.1 from a CDN; concurrent-render semantics differ in 19) + Vite + **TypeScript strict** + **Tailwind CSS** + **selective shadcn/ui** + **Zustand** + **Vitest + React Testing Library**. Andrew's `tokens.css` translates into a Tailwind theme config; Andrew's `.jsx` components migrate to `.tsx` with explicit types. Full replacement of every custom primitive with shadcn/Radix primitives is Future-State; Part 03 uses shadcn only where it accelerates required flows. **Playwright E2E moved to its own Future-State workstream** (`Future-State-playwright-e2e-workstream.md`) — high priority post-MVP; the assignment demo verifies via Vitest+RTL component tests + manual smoke per `MetaFiles/HumanTestInstructions/`.

> **Auth in v1 (Q10, resolved 2026-04-26):** **non-blocking visual scaffolds.** Login/Register exist for visual demo only; no auth guards on any route; default route is `/library`. Users demo the entire app without visiting `/login`. Real auth ships in `Future-State-auth-and-account-management-workstream.md`.

## Goal

Convert Andrew's Claude Design export into a maintainable React/Vite frontend that renders the PhotoApp UI and communicates with the Express backend through `/api/*` calls. Preserve the visual fidelity and component boundaries Andrew specified; add the wiring + tests + production polish needed for Canvas submission.

## Scope (Part 03 — assignment window)

**In scope:**

- Bootstrap a React/Vite/TypeScript-strict app under `Part03/frontend/` with the active Q7 stack.
- Translate Andrew's `tokens.css` (cream/coral/serif design system) into a `tailwind.config.ts` theme so utility classes resolve to the same tokens.
- Initialize shadcn/ui selectively for required primitives only (initial target: Button, Input, Dialog, DropdownMenu, Toast/Toaster as needed for upload/delete/error flows).
- Migrate Andrew's components from `ClaudeDesignDrop/raw/MBAi-460/src/*.jsx` → `Part03/frontend/src/components/*.tsx` (TS-strict types and Tailwind classes; use shadcn primitives only where they reduce immediate complexity).
- Wire components to a typed `photoappApi.ts` client that calls `/api/*` (per Q1).
- Implement Library (renders **both photos and documents**), Asset Detail (photo with Rekognition labels; document with basic file preview + "OCR coming soon" placeholder), Upload (accepts **any file**; server stores photos with Rekognition labels and documents with `kind='document'` and no labels per Q9), and Profile screens.
- Add Login/Register screens **as non-blocking visual scaffolds** (Q10): default route `/library`; no auth guards.
- Zustand store for global UI state needed by the MVP (sidebar collapsed, command-palette open if implemented, mock-auth flag). Theme/accent/density tweak controls are Future-State.
- Test stack: **Vitest + React Testing Library for components only**. Playwright E2E is descoped to `Future-State-playwright-e2e-workstream.md` (🔥 high priority post-MVP). Assignment-window E2E verification relies on the manual CLI smoke in `MetaFiles/HumanTestInstructions/README.md`.
- Accessibility: meet the spec's WCAG 2.1 AA baseline for the in-scope screens via manual review (automated axe-core CI gate is deferred — see Q7).
- Vite build → `frontend/dist/` is what Express serves.

**Deferred to Future-State** (each preserved in its own focused approach doc — see `Future-State-roadmap.md`):

- **Real auth + Settings + Admin** → `Future-State-auth-and-account-management-workstream.md` (depends on Project 03 `authsvc` Lambdas).
- **Documents + Textract OCR** → `Future-State-documents-and-textract-workstream.md` (depends on new AWS Textract service + IAM + schema).
- **Webhook chat** → `Future-State-chat-workstream.md` (depends on Project 03 chat infrastructure + SSE shim).
- **CommandPalette keyboard launcher** → `Future-State-command-palette-workstream.md` (adds ⌘K search/navigation/actions after library/search/delete flows are stable).
- **Full shadcn/ui primitive migration** → `Future-State-shadcn-primitive-migration-workstream.md` (replaces remaining custom primitives with standardized shadcn/Radix components after assignment-critical flows are green).
- **TweaksPanel theme/accent/density controls** → `Future-State-tweaks-panel-workstream.md` (restores Andrew's design-time controls after the assignment MVP is stable).
- **Playwright E2E test suite** → `Future-State-playwright-e2e-workstream.md` (🔥 **high priority** — first among the no-backend-dependency Future-State workstreams; closes the gap between component tests and manual smoke).
- **Performance budgets, observability, security headers, multi-env deployment, feature flags, i18n** → `Future-State-production-hardening-workstream.md` (cross-cutting; lands incrementally).

This workstream does **not** own:

- Express server setup (workstream 02 — done).
- `/api/*` route implementation (workstream 03).
- AWS SDK / `mysql2` service-module behavior (workstream 03).
- Textract integration (Future-State).

## Workstream Rules

(Carried forward from the pre-Andrew-MVP version of this doc; still in force.)

- Do not put AWS credentials, database config, or `photoapp-config.ini` in frontend code.
- Do not call Part 2 `photoapp.py` from frontend code.
- Frontend talks only to `/api/*` (per Q1).
- Preserve visual intent from Andrew's MVP — but prefer React component boundaries (and shadcn primitive substitutions per Q7) over copying static HTML/JSX verbatim.
- If a migration becomes difficult mid-Phase, create a `Part03/MetaFiles/TODO.md` item and preserve the raw design files rather than blocking the whole workstream.
- Keep the public UI simple enough for the assignment demo: all in-scope API functions must be demonstrable via the migrated UI.
- Login/Register screens stay non-blocking (Q10) — never gate access to other routes.
- **Install-log discipline:** all `npm install` invocations during this workstream are recorded in `Part03/MetaFiles/install-log.md` (consistent with workstreams 02 and 03). Each entry: date, cwd, command, exit code, packages added, vulnerability count, notable warnings.
- **MVP TopBar shape:** wordmark + avatar only. ⌘K trigger button, tweaks toggle button, and notifications bell are **omitted** (NOT left as no-op visual stubs) — their respective Future-State workstreams will restore them. Avoiding no-op buttons in the demo prevents the "wait, why doesn't this work?" UX trap. See `00-coordination-and-contracts.md` UI Primitive Set for the full deferred list.

## Dependencies

Read first:

- `00-coordination-and-contracts.md` (API contract, UI primitive set)
- `02-server-foundation.md` (Express skeleton; `/api` mount point)
- `03-api-routes.md` (the routes the UI will consume)
- `DesignDecisions.md` (Q1–Q6 + any new Q7+)
- `ClaudeDesignDrop/raw/MBAi-460/uploads/UI-Design-Requirements.md` (Andrew's spec — read at minimum §1, §3 (product principles), §6 (system context), §9 (per-screen specs for in-scope screens), §11 (visual design system))
- `ClaudeDesignDrop/raw/MBAi-460/src/tokens.css` (design tokens)
- `ClaudeDesignDrop/raw/MBAi-460/src/*.jsx` (working components — read shell.jsx + library.jsx + auth.jsx for the in-scope screens)

## Target Files

```text
projects/project01/Part03/
  frontend/
    package.json
    vite.config.ts              # Vite + React plugin (TS)
    tailwind.config.ts          # theme = translated Andrew's tokens.css
    postcss.config.js           # tailwind + autoprefixer
    tsconfig.json               # "strict": true
    components.json             # shadcn/ui config
    index.html
    src/
      main.tsx                  # React root; <Toaster/> wrap; <BrowserRouter>
      App.tsx                   # Top-level: TopBar + LeftRail + <Routes>; default → /library
      styles/
        globals.css             # @tailwind base / components / utilities + token-aware resets
      api/
        photoappApi.ts          # typed fetch wrapper; envelope-aware
        types.ts                # Asset, User, Label, ApiEnvelope<T>
      components/
        ui/                     # shadcn/ui primitives (toast, dialog, dropdown-menu, command, popover, tabs, button, input)
        TopBar.tsx              # from shell.jsx → TS + Tailwind + shadcn DropdownMenu
        LeftRail.tsx
        PageHeader.tsx
        Library.tsx
        AssetCard.tsx, ListView.tsx
        UploadScreen.tsx        # accepts any file; documents stored without OCR (Q9)
        ProfileScreen.tsx
        LoginScreen.tsx, RegisterScreen.tsx  # visual scaffolds, non-blocking (Q10)
        EmptyLibrary.tsx
        Icon.tsx                # lucide-react wrapper
      pages/
        AssetDetail.tsx         # split from library context
      stores/
        ui.ts                   # Zustand: sidebar, mockAuth flag
      utils/
        format.ts               # fmtBytes, fmtDate, fmtDateRel
      __tests__/
        photoappApi.test.ts
        Library.test.tsx
        AssetCard.test.tsx
        UploadScreen.test.tsx
        fixtures/               # ports of Andrew's data.jsx for component tests
    dist/                       # Vite build output; served by Express
```

(Playwright `e2e/` directory is descoped to `Future-State-playwright-e2e-workstream.md`.)

## Design Decisions (workstream-local)

- **Frontend stack (per Q7, 2026-04-26; Playwright descoped 2026-04-27):** React 18.3.x + Vite + TypeScript strict + Tailwind CSS + selective shadcn/ui + Zustand + Vitest+RTL. Andrew's `tokens.css` becomes `tailwind.config.ts` theme; Andrew's `.jsx` components migrate to `.tsx` with explicit types. Full shadcn/Radix primitive replacement is deferred to `Future-State-shadcn-primitive-migration-workstream.md`. **Playwright E2E** is its own Future-State workstream (`Future-State-playwright-e2e-workstream.md`).
- **Auth in v1 (per Q10, 2026-04-26):** **non-blocking.** Login/Register exist as visual scaffolds; no auth guards; default route is `/library`. The Login form's "Sign in" button optionally toggles a `mockAuth` flag in the Zustand store for visual differentiation only (e.g., topbar avatar). Real `POST /api/auth` deferred to `Future-State-auth-and-account-management-workstream.md`.
- **Mock data:** Andrew's `data.jsx` (`window.MOCK`) ports into `__tests__/fixtures/` as ES-module imports. Component tests import fixtures directly. Runtime always fetches from `/api/*` (no `window.MOCK` reference in production code).
- **Routing:** React Router 6 (per Q7's stack alignment with spec §13.1). Routes in scope: `/`, `/login`, `/register`, `/library`, `/asset/:id`, `/upload`, `/profile`, `/help`, `/404`. Auth-gated routes (`/admin/*`, `/profile/settings`, `/chat`) are Future-State; not in Part 03.
- **State management:** Zustand for global UI state needed by the MVP (sidebar collapsed, command-palette open if implemented, mock-auth). Local component state stays in `useState`. Theme/accent/density controls from Andrew's TweaksPanel are Future-State. Server state is hand-rolled via `useEffect + apiFetch` (TanStack Query is deferred per Q7).
- **Selective shadcn primitives:** use shadcn where it directly supports assignment flows (initial target: form controls, delete confirmation dialog, dropdowns/toasts if needed). Do not block the MVP on replacing every Andrew custom primitive. CommandPalette and complete primitive replacement are future-state.
- **No PWA / no offline route in v1.** Spec mentions `/offline` — defer to Production Hardening.

---

## Phase 1: App Bootstrap (TypeScript + Tailwind + selective shadcn + Zustand + React Router)

**Implementation status:** ✅ Implemented 2026-04-27 per Plan §1.1, §1.2, §1.4, §1.5. Task 1.3 (selective shadcn) DESCOPED 2026-04-27 per reviewer remediation R1 — replaced with custom Tailwind-styled primitives. Individual line checkboxes below describe approach intent and are not flipped (some describe descoped paths).

### Task 1.1: Create Vite + TypeScript app under `Part03/frontend/`

**Files:**

- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json` (strict mode)
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx` (placeholder shell)

**Steps:**

- [ ] From `Part03/frontend/`: `npm create vite@latest . -- --template react-ts` (uses TS template).
- [ ] Open `tsconfig.json`, confirm `"strict": true`. Tighten further: `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`.
- [ ] `npm install` (logged in `install-log.md`).
- [ ] Add `react-router-dom` for routing: `npm install react-router-dom`.
- [ ] Wire `BrowserRouter` in `main.tsx`; default route in `App.tsx` redirects to `/library`.
- [ ] **Failing test first:** `frontend/src/__tests__/App.test.tsx` — renders, finds "MBAi 460" wordmark.
- [ ] Implement minimal `App.tsx` with the wordmark; pass test.
- [ ] `npm run build` → confirm `frontend/dist/index.html` exists.

**Check your work:**

- Unit: App-shell test passes under Vitest.
- Integration: `npm run build` produces `dist/index.html`.
- Smoke: `cd .. && npm start` (Express) and `curl http://localhost:8080/` returns the built `dist/index.html`.

### Task 1.2: Add Tailwind CSS + translate Andrew's tokens.css to theme

**Files:**

- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.js`
- Create: `frontend/src/styles/globals.css`
- Modify: `frontend/src/main.tsx` (`import './styles/globals.css'`)

**Steps:**

- [ ] Install: `npm install -D tailwindcss postcss autoprefixer` and run `npx tailwindcss init -p`.
- [ ] In `tailwind.config.ts`, set `content: ['./index.html', './src/**/*.{ts,tsx}']`.
- [ ] **Translate Andrew's `tokens.css` into the Tailwind theme.** Read `ClaudeDesignDrop/raw/MBAi-460/src/tokens.css`; mirror the token names into the theme's `extend` block:
  - `colors.paper`, `colors.paper-2`, … → cream scale.
  - `colors.ink`, `colors.ink-2`, … → text scale.
  - `colors.accent`, `colors.accent-2`, `colors.accent-fg`, `colors.accent-soft`, `colors.accent-ring`.
  - `colors.success`, `colors.warn`, `colors.error`, `colors.info`.
  - `fontFamily.sans = ['Inter', …]`, `fontFamily.serif = ['Source Serif 4', …]`, `fontFamily.mono`.
  - `fontSize.xs`/`sm`/`base`/`md`/`lg`/`xl`/`2xl`/`3xl` per Andrew's scale.
  - `spacing` (4px grid: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16).
  - `borderRadius.xs/sm/md/lg/xl/full`.
  - `boxShadow.1/2/3`.
  - `transitionDuration.fast/base/slow` and `transitionTimingFunction.ease`.
  - `keyframes` + `animation` for `fade` and `shim` (skeleton shimmer).
- [ ] In `globals.css`, add `@tailwind base; @tailwind components; @tailwind utilities;`. Add the dark-mode selector strategy: `:root[data-theme="dark"] { … }` overrides remain valid (Tailwind's `dark:` variant uses the same token names from theme).
- [ ] **Failing test:** assert a sample component renders with the expected computed background color (cream paper) when no theme override is active.
- [ ] Implement; run tests → green.

**Check your work:**

- Unit: token-application test passes (e.g., `<div className="bg-paper">` resolves to `#F0EEE6`).
- Integration: a sample button using `bg-accent text-accent-fg` renders coral with white text.

### Task 1.3: ~~Initialize selective shadcn/ui primitives~~ — DESCOPED 2026-04-27 per R1 reviewer remediation

**Files:**

- Create: `frontend/components.json` (shadcn config)
- Create: initial primitives under `frontend/src/components/ui/`

**Steps:**

- [ ] Run `npx shadcn-ui@latest init` from `frontend/`. Choose: TypeScript, Tailwind, components dir `src/components/ui`, utils path `src/lib/utils.ts`, CSS variables yes (token-friendly).
- [ ] Install only the primitives needed for the assignment-window MVP. Start with `button`, `input`, and `dialog`; add `dropdown-menu` or `toast` only when a current screen actually needs them.
- [ ] Do not install/migrate `command`, `popover`, `tabs`, or other polish primitives unless assignment-critical flows are already green.
- [ ] Verify installed primitives render with expected styling (Tailwind classes resolve to token values).

**Check your work:**

- Unit: `<Button>` from shadcn renders with the configured theme classes.
- Integration: delete confirmation or upload form can use the installed primitives without breaking the build.

### Task 1.4: Add Zustand store

**Files:**

- Create: `frontend/src/stores/ui.ts`

**Implementation sketch (TypeScript):**

```ts
import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface UIState {
  sidebarCollapsed: boolean;
  mockAuth: { isMockAuthed: boolean; givenname?: string; familyname?: string };
  toggleSidebar: () => void;
  setMockAuth: (a: UIState['mockAuth']) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mockAuth: { isMockAuthed: false },
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMockAuth: (a) => set({ mockAuth: a }),
}));
```

**Steps:**

- [ ] Install: `npm install zustand`.
- [ ] Implement `ui.ts` per sketch.
- [ ] **Failing test:** call `useUIStore.getState().toggleSidebar()`; assert `sidebarCollapsed` flipped.
- [ ] Run test → green.

### Task 1.5: ~~Add Playwright~~ — DESCOPED 2026-04-27

Playwright E2E moved to `Future-State-playwright-e2e-workstream.md` (🔥 high priority post-MVP). MVP's E2E verification path is the manual CLI smoke per `MetaFiles/HumanTestInstructions/README.md`. The component test pyramid (Vitest + RTL) covers per-component contracts; the route-level `/api/*` contract is covered by the Phase 6+7+integration tests in the API workstream.

---

## Phase 2: Migrate Design Tokens (already in Phase 1.2) + Add Icon shim

**Implementation status:** ✅ Implemented 2026-04-27 per Plan §2.1.

### Task 2.1: Add Icon shim

(Phase 1.2 already translated the design tokens to the Tailwind theme; this phase is just the icon shim.)

Andrew's components use `<Icon name="..." size={N}/>` everywhere. Spec recommends Lucide.

**Files:**

- Create: `frontend/src/components/Icon.tsx`
- Install: `npm install lucide-react` (logged in install-log)

**Implementation (named imports only — `import * as LucideIcons` defeats Vite's tree-shaking; importing only the icons in the map keeps the bundle ~50–200 KB lighter):**

```tsx
import { Search, Upload, FileText /* add named icons here as Andrew's components need them */ } from 'lucide-react';

const map: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  search: Search,
  upload: Upload,
  document: FileText,
  // ...one named import per icon Andrew's components reference
};

export function Icon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  const C = map[name] ?? Search; // sensible fallback
  return <C size={size} className={className} />;
}
```

**Check your work:**

- Unit: `<Icon name="search"/>` renders without console errors.
- Integration: rendering `TopBar` (after Phase 3 migration) shows real icons in the wordmark slot, search bar, etc.

---

## Phase 3: Migrate Shell Components

**Implementation status:** ✅ Implemented 2026-04-27 per Plan §P3 (Calibration Test #3 — 3 parallel subagents on Toast+Modal, TopBar, LeftRail+PageHeader, ~46% wall-time savings vs sequential).

### Task 3.1: ToastProvider + Modal

**Files:**

- Create: `frontend/src/components/ToastProvider.tsx` (port from `shell.jsx` lines 4–33)
- Create: `frontend/src/components/Modal.tsx` (port from `shell.jsx` lines 35–68)

**Steps:**

- [ ] Failing test: render with one toast, assert it appears.
- [ ] Failing test: open Modal, press Escape, assert it closes.
- [ ] Migrate code from Andrew's `shell.jsx`. Replace global `React.createContext` access with module imports. Use custom/Tailwind components unless shadcn reduces immediate MVP complexity.
- [ ] Run tests → pass.

### Task 3.2: TopBar + LeftRail + PageHeader

**Files:**

- Create: `frontend/src/components/TopBar.tsx` (port from `shell.jsx` lines 70–165, **MVP-trimmed**: omit the ⌘K trigger button, tweaks toggle button, and notifications bell — those primitives are deferred to their respective Future-State workstreams. MVP shape: wordmark + avatar only.)
- Create: `frontend/src/components/LeftRail.tsx` (port from `shell.jsx` lines 167–245)
- Create: `frontend/src/components/PageHeader.tsx` (port from `shell.jsx` lines 247–270)

**Steps:**

- [ ] Failing tests for each: render, assert key text, click handler called.
- [ ] Port code; replace `Object.assign(window, ...)` global exposure with proper exports. Keep custom primitives if they are faster to migrate safely.
- [ ] Migrate `fmtBytes` / `fmtDate` / `fmtDateRel` from `shell.jsx` lines 273–281 into `frontend/src/utils/format.ts`.
- [ ] Run tests → pass.

---

## Phase 4: Migrate `photoappApi.ts`

**Implementation status:** ✅ Implemented 2026-04-27 per Plan §4.1.

### Task 4.1: Typed fetch wrapper

**Files:**

- Create: `frontend/src/api/photoappApi.ts`
- Create: `frontend/src/api/__tests__/photoappApi.test.ts`

**Required functions** (per `00-coordination-and-contracts.md`):

```js
export async function getPing();              // GET /api/ping
export async function getUsers();             // GET /api/users
export async function getImages(userid);      // GET /api/images?userid=...
export async function uploadImage(userid, file);  // POST /api/images (multipart)
export function getImageFileUrl(assetid);     // returns string for <img src>
export async function getImageLabels(assetid); // GET /api/images/:id/labels
export async function searchImages(label);    // GET /api/search?label=...
export async function deleteAllImages();      // DELETE /api/images
```

**Envelope handling:** every function unwraps `{message, data}` on success; on `{message: "error", error}` (or non-2xx) throws `Error(error)`.

**Test-first examples:**

```js
test('getUsers calls /api/users and returns parsed data array', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ message: 'success', data: [{ userid: 80001 }] }),
  });
  const result = await getUsers();
  expect(fetch).toHaveBeenCalledWith('/api/users');
  expect(result).toEqual([{ userid: 80001 }]);
});

test('uploadImage sends userid + file as FormData', async () => {
  const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ message: 'success', data: { assetid: 1001 } }),
  });
  await uploadImage(80001, file);
  expect(fetch).toHaveBeenCalledWith('/api/images', expect.objectContaining({
    method: 'POST',
    body: expect.any(FormData),
  }));
});

test('error envelope throws', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false, status: 400,
    json: async () => ({ message: 'error', error: 'no such userid' }),
  });
  await expect(uploadImage(99999, new File([], 'x.jpg'))).rejects.toThrow('no such userid');
});
```

**Check your work:**

- Unit: all test cases above pass.
- Integration: deferred to live wire-up (Phase 7).

---

## Phase 5: Migrate Library, AssetCard, ListView

**Implementation status:** ✅ Implemented 2026-04-27 per Plan §P4 (Calibration Test #4 — combined with Phase 6 in 4 parallel subagents on Library set, Login+Register, Upload, AssetDetail; ~74% wall-time savings vs sequential).

### Task 5.1: Migrate Andrew's `library.jsx` → `Library.tsx`

**Files:**

- Create: `frontend/src/components/Library.tsx` (port from `library.jsx` lines 1–113, plus `SegmentedControl`, `Dropdown`, `Grid`, `EmptyLibrary` sub-components)
- Create: `frontend/src/components/AssetCard.tsx` (port from `library.jsx` lines 182–258)
- Create: `frontend/src/components/ListView.tsx` (port from `library.jsx` lines 260–299)

**Test-first:**

```jsx
test('Library renders empty state when emptyState prop is true', () => {
  render(<Library assets={[]} emptyState={true} onOpenUpload={vi.fn()}/>);
  expect(screen.getByText(/No assets yet/i)).toBeInTheDocument();
});

test('Library filters assets by type', async () => {
  const assets = [
    { id: 1, name: 'a.jpg', kind: 'photo', /* ... */ },
    { id: 2, name: 'b.pdf', kind: 'document', /* ... */ },
  ];
  render(<Library assets={assets} onOpenAsset={vi.fn()} onOpenUpload={vi.fn()} density="comfy"/>);
  await userEvent.click(screen.getByRole('button', { name: /Photos/i }));
  expect(screen.getByText('a.jpg')).toBeInTheDocument();
  expect(screen.queryByText('b.pdf')).not.toBeInTheDocument();
});
```

**Steps:**

- [ ] Port code. Replace `window.LeftRail` / `Library` global exports with proper module exports.
- [ ] Replace `localStorage.getItem("lib_view")` access with a small hook so it can be mocked in tests.
- [ ] Replace `MOCK` references with props.

---

## Phase 6: Migrate Login + Register (non-blocking scaffolds, Q10) + Upload

**Implementation status:** ✅ Implemented 2026-04-27 per Plan §P4 (combined with Phase 5 — see Phase 5 banner). Login/Register are non-blocking visual scaffolds per Q10; Upload accepts any file with per-kind processing per Q9.

### Task 6.1: LoginScreen + RegisterScreen — non-blocking visual scaffolds

**Files:**

- Create: `frontend/src/components/LoginScreen.tsx` (port from `auth.jsx` lines 4–115)
- Create: `frontend/src/components/RegisterScreen.tsx` (port from `auth.jsx` lines 117–181)

**Per Q10 (resolved 2026-04-26):** Login + Register are **non-blocking visual scaffolds**. They do NOT gate access to other routes. Specifically:

- App's default route is `/library` (NOT `/login`). Anyone hitting `/` is redirected to `/library` directly.
- No `<RequireAuth>` wrapper, no auth-guard middleware, no protected-route HOC. Every route in the app is publicly accessible.
- Login form's "Sign in" button does NOT call `POST /api/auth`. It optionally toggles `mockAuth.isMockAuthed = true` in the Zustand store for visual differentiation only (e.g., topbar avatar shows the entered name vs. anonymous initials).
- Register form's "Create account" button does NOT call `POST /api/users`. Same treatment as Login — sets `mockAuth` for visual demo purposes only.
- "Forgot?" modal stays as a placeholder pointing at staff contact (per spec §9.3).
- Login/Register screens migrate visual fidelity from Andrew's `auth.jsx` (TS-strict, Tailwind classes via translated theme, shadcn `Input` for fields).

**Test-first expectation:**

```tsx
// Login is reachable directly
test('LoginScreen renders without an auth gate', () => {
  render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>);
  expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
});

// Other routes are reachable WITHOUT logging in
test('Library is accessible without mock auth', () => {
  render(<MemoryRouter initialEntries={['/library']}><App /></MemoryRouter>);
  expect(screen.getByText(/Library/i)).toBeInTheDocument();  // no redirect
});

// Default route redirects to /library
test('default route renders Library, not Login', () => {
  render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
  expect(screen.getByText(/Library/i)).toBeInTheDocument();
});
```

**Steps:**

- [ ] Migrate `LoginScreen.tsx` from `auth.jsx`. Replace inline styles → Tailwind classes; replace HTML inputs → shadcn `<Input>`.
- [ ] Wire submit handler: `useUIStore().setMockAuth({ isMockAuthed: true, givenname: u, familyname: '' })` and navigate to `/library`. **No fetch.**
- [ ] Migrate `RegisterScreen.tsx` similarly.
- [ ] Verify the failing tests above all pass.
- [ ] Verify Express-served static (`npm run build && cd .. && npm start`) shows `/library` directly when visiting `http://localhost:8080/`.

**What lands in the Auth Future-State workstream (NOT here):** real `POST /api/auth` + `POST /api/users` calls; `<RequireAuth>` wrapper; default-route flip to `/login` for unauthenticated visitors; token storage + Bearer header injection; 401 → redirect-to-login flow. See `Future-State-auth-and-account-management-workstream.md`.

### Task 6.2: UploadScreen (accepts any file; per-kind processing per Q9)

**Files:**

- Create: `frontend/src/components/UploadScreen.tsx` (port from `screens.jsx` lines 6–119)

**Per Q9 (documents accepted; OCR deferred):**

- Drop area + file picker accept **any file type** (photo, PDF, doc, etc.). Multer on the server applies only a 50 MB size limit.
- Real upload calls `photoappApi.uploadImage(userid, file)`; UI optimistically appends to the queue + updates progress on response.
- Server derives `kind` from filename extension (Q8). The UI doesn't send classification — the radio in Andrew's MVP is purely a **UX hint**.
- The `classify` radio is preserved for visual fidelity. Selecting "auto" lets the server derive (the default behavior). Selecting "photo" or "document" is informational (no server contract change in Part 03 — server still derives from extension).
- Drop the `ocrMode` radio (Textract is Future-State; the radio's "text" / "forms" options have no server-side wiring in Part 03).
- Queue display shows status per item: photos get "analyzing… → done with N labels"; documents get "uploaded · stored as document · OCR coming soon".
- Files larger than 50 MB → server returns 400; UI shows a per-item error toast; user can remove + retry with a smaller file.

### Task 6.3: AssetDetail page component scaffold with per-kind branch (component-only; live wire-up is Task 7.4)

**Scope of this task:** create the AssetDetail page component with the per-kind branching logic, using mock asset data for component tests. Live backend wire-up (real `getImages` for the asset payload, `getImageFileUrl` for the preview src, `getImageLabels` for the labels list) happens in Task 7.4 — not here.

**Files:**

- Create: `frontend/src/pages/AssetDetail.tsx`

**Per-kind rendering branches (driven by `asset.kind`):**

- **`asset.kind === 'photo'`:** image preview slot (src injected by 7.4); labels list slot (data injected by 7.4) sorted by confidence DESC.
- **`asset.kind === 'document'`:** basic preview slot — for PDFs, embed via `<embed src={...} type="application/pdf">` (browsers fall back to a download link if PDF embedding is blocked); for other document types, a download link with the filename. **No OCR text panel** in Part 03 — replaced by an "OCR coming soon" empty state with a one-line note pointing at `Future-State-documents-and-textract-workstream.md`.

For Phase 6 component tests, both branches render against fixtures from `__tests__/fixtures/`. Phase 7.4 swaps fixtures for live API calls.

The full split-pane image+OCR view from spec §9.6 is Future-State.

---

## Phase 7: Wire to Live Backend

### Task 7.1: App startup + `/api/ping` health probe

App loads → calls `getPing()` → renders connected/disconnected indicator (see `LeftRail` "Status" item).

### Task 7.2: Library loads from `/api/images`

Replace `MOCK.ASSETS` with a `useEffect` + `getImages()` call. Render skeleton while loading; render error state on failure.

### Task 7.3: Upload calls `/api/images` (multipart)

End-to-end: select user, select file, click Upload → multipart POST → success → refresh library.

### Task 7.4: Asset detail — wire the page component (Task 6.3) to the live backend

Wire the `AssetDetail.tsx` component (created in Task 6.3) to live data. New route `/asset/:id`. Resolve the asset payload (look up by id from the Library list, or refetch via `getImages` if landing directly), then drive the per-kind branches:

- **Photo:** `<img src={getImageFileUrl(id)}>` for the preview; `getImageLabels(id)` populates the labels list (sorted confidence DESC).
- **Document:** basic preview only (per Q9). For PDF: `<embed src={getImageFileUrl(id)} type="application/pdf">` with a download-link fallback. For other document types: filename + size + download link. The text panel position shows an "OCR coming soon" empty state — Future-State Textract workstream populates it.

The branch logic itself is identical to Task 6.3 — this task only changes the data source from fixtures to live API calls.

### Task 7.5: Search by label

**MVP placement:** a search input + Search button in the **Library page header** (above the asset grid). On submit, call `searchImages(label)` through `photoappApi.ts` and render matching assets in the same grid (replacing the unfiltered list until the input is cleared).

The Library-header input is the MVP search surface. The `⌘K` CommandPalette experience (fuzzy navigation + actions + asset search) is Future-State — see `Future-State-command-palette-workstream.md`. Do not block the MVP on the keyboard launcher.

### Task 7.6: Delete all images

Confirmation modal with type-the-name; on confirm, calls `deleteAllImages()`.

---

## Phase 8: Acceptance + Demo Quickstart

### Task 8.1: Frontend acceptance checklist

Borrowed from Andrew's spec §9 acceptance criteria, scoped to in-scope screens. **Auth-related criteria adjusted for Q10 (non-blocking scaffolds): Login does not gate access; default route is `/library`.**

- [ ] **L1.** Visiting `/` redirects to `/library` directly (no Login interception).
- [ ] **L2.** `/login` and `/register` are reachable for visual demo; their submit buttons toggle the Zustand `mockAuth` flag (no fetch).
- [ ] **L3.** All in-scope routes render without an auth gate (`/library`, `/asset/:id`, `/upload`, `/profile`, `/help`).
- [ ] **LIB1.** Library first-paints with ≤50 assets in <2s on a wired connection.
- [ ] **LIB2.** Grid view: 2 cols <480px, 3 cols 480–768, 4 cols 768–1024, 5 cols ≥1024.
- [ ] **LIB3.** Photo cards show ≤3 labels with "+N" pill for overflow.
- [ ] **LIB4.** Document cards render with metadata (filename, size, date, kind badge) + "OCR coming soon" placeholder where labels would be (per Q9).
- [ ] **U1.** Upload accepts a JPG, returns an assetid, refreshes the library; Library shows the new photo card with labels.
- [ ] **U2.** Upload error is surfaced via toast (not silent).
- [ ] **U3.** Upload accepts a PDF (or other non-image), returns an assetid, refreshes the library; Library shows the new document card with the "OCR coming soon" placeholder (per Q9).
- [ ] **U4.** Files >50 MB are rejected at the server with a friendly error toast.
- [ ] **A1.** Asset detail (photo) shows labels in confidence-DESC order.
- [ ] **A2.** Asset detail (document) shows file preview (PDF embed or download link) + "OCR coming soon" empty state where the text panel would be.
- [ ] **A3.** File preview loads via `/api/images/:id/file` (no base64) for both photos and documents.
- [ ] **A11Y1.** Manual a11y review passes for the in-scope screens (focus-visible, keyboard-only nav, screen-reader landmarks). **Automated axe-core CI gate is deferred** per Q7 — lands with `Future-State-production-hardening-workstream.md`.
- [ ] `npm test` (Vitest) green; `npm run build` clean; TypeScript strict compiles with zero errors.
- [ ] Manual CLI smoke per `MetaFiles/HumanTestInstructions/README.md` Tier 3+ passes against the built frontend served by Express. (Automated Playwright happy-path is descoped to `Future-State-playwright-e2e-workstream.md`.)
- [ ] `npm run build` output served by Express renders identically to `npm run dev`.

### Task 8.2: Demo Quickstart guide for video teammate

**Files:**

- Create: `Part03/DEMO-QUICKSTART.md`

Contents (sketch — fill during execution):

1. Prereqs: Docker up; `npm install` from `Part03/`; `npm install` from `Part03/frontend/`.
2. Build frontend: `cd frontend && npm run build`.
3. Start backend: `cd .. && npm start` (Express on 8080).
4. Open browser at `http://localhost:8080/` — see Library.
5. Demo path: upload `01degu.jpg` → see in gallery → click → see Rekognition labels → search "Animal" → delete-all → confirm empty state.
6. Talking points (per spec): asset-first vocabulary, single coral accent, cream paper background, keyboard-first navigation for the assignment-critical controls.

---

## Suggested Commit Points

- After Phase 1 (Vite app bootstrap + first test green)
- After Phase 2 (tokens migrated + icon shim)
- After Phase 3 (shell components migrated)
- After Phase 4 (photoappApi.ts with all envelope handling tests green)
- After Phase 5 (library renders mock data)
- After Phase 6 (auth scaffold + upload screen)
- After each Phase 7 sub-task (live backend wiring is fragile; small commits help)
- After Phase 8 (acceptance + demo quickstart)

## Risks and Mitigations

- **Risk:** Andrew's components use global `window.MOCK` and global `React.createContext` — these break in a properly modular React/Vite app.
  - **Mitigation:** every migrated component gets a small refactor — replace `window.MOCK` with props, replace global React access with module imports.
- **Risk:** `uuid` was removed from deps (production polish 2026-04-26). The Asset upload flow needs uuid for filename generation per `00`'s `bucketkey` shape, but that's *server-side* — the frontend just sends file bytes; the server generates the bucketkey.
  - **Mitigation:** confirm in Phase 7 wire-up that the server (not frontend) generates the uuid portion of `bucketkey`.
- **Risk:** Spec's "Phase 2 base64 JSON" and "Phase 3 presigned URL" upload models — for Part 03 we use multipart (Q3-related decision) which is neither.
  - **Mitigation:** multipart works fine in the spec's spirit (browser-friendly); note in `DesignDecisions.md` Q3 follow-up if needed.
- **Risk:** Andrew's components are visually production-quality but use inline styles + global React + plain JSX. Migrating to TS+Tailwind+shadcn per Q7 is real upfront work.
  - **Mitigation:** the migration cost is paid in Phase 1 (toolchain + theme translation) + per-component re-styling during Phases 3–6. Each component migration is independent (testable in isolation), so the cost is amortized across the workstream rather than landing as a single big-bang refactor. Andrew's components serve as the *visual contract* — fidelity is preserved; full shadcn replacement is deferred until after assignment-critical flows are green.

## Footnote: Frontend baseline provenance

Andrew's Frontend MVP (commit `1f3c067`, merged via `e76d4d9`, 2026-04-26) is the **visual contract** for this workstream. The 1609-line `UI-Design-Requirements.md` is the **product spec**. This `01-ui-workstream.md` distills the Part-03-relevant subset into a TDD-disciplined checklist; the broader vision (Textract, auth, chat, hardening) is preserved across four focused Future-State workstream docs — index at `Future-State-roadmap.md`.
