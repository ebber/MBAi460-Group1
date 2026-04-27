# UI Workstream (01) Execution Plan

> **For agentic workers:** Inline execution by the active agent (lightweight pattern, mirroring 02 + 03; NOT full `superpowers:subagent-driven-development` ceremony — overhead is wrong for this scope per `feedback_subagent_overhead.md`). Steps use checkbox (`- [ ]`) syntax for tracking. **Updating this plan, the 01 approach doc, install-log, and source code are ATOMIC with each task's commit — not deferred.**

**Goal:** Implement the Part 03 UI MVP per `MetaFiles/Approach/01-ui-workstream.md` — Vite + TS strict + Tailwind + Zustand frontend (shadcn/ui descoped 2026-04-27 per reviewer remediation); migrate Andrew's components to TypeScript with custom Tailwind-styled primitives; wire to the live `/api/*` backend; ship a clickable demo at http://localhost:8080. All TDD-disciplined; all Q7/Q9/Q10 design decisions honored.

**Architecture:** React 18.3.x app under `Part03/frontend/` built by Vite into `frontend/dist/` and served by Express static middleware on port 8080 (Q5 built-only). Andrew's `tokens.css` translates into Tailwind theme; `.jsx` components migrate to `.tsx` with explicit types. Zustand global UI state for sidebar + mockAuth. Vitest + React Testing Library for component tests. Manual CLI smoke per `HumanTestInstructions/README.md` for E2E (Playwright is its own Future-State workstream — see `Future-State-playwright-e2e-workstream.md`).

**Tech Stack:** React 18.3.x, Vite (latest), TypeScript strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`, Tailwind CSS 3.x, Zustand, lucide-react, react-router-dom 6, Vitest, @testing-library/react, jsdom. Optional: `clsx` + `tailwind-merge` for a `cn()` helper if any component needs class composition. **shadcn/ui is NOT used** — descoped 2026-04-27 per reviewer remediation; UI primitives implemented as custom Tailwind-styled React components.

**Approach doc (source of truth):** `MetaFiles/Approach/01-ui-workstream.md`. This plan adds **state tracking, evidence, atomic-update gates, parallelism dispatch, and recovery** — code snippets and full task content live in 01. Where this plan says "per 01 Task X.Y", read 01 for the failing-test code, expected commands, and implementation snippets.

**Execution mode:** inline by the active agent. Selective subagent dispatch in two phases (Calibration Test #3 — Phase 3 shell components; Calibration Test #4 — Phase 5+6 screens); rest is main thread.

---

## 🎯 First Clickable UI — End of Phase 7

After Phase 7 lands (`Wire to Live Backend`), Erik can run:

```bash
cd ~/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
npm run build
cd ..
npm start
# → open http://localhost:8080/
```

…and click through the entire MVP flow against live RDS+S3: Library → AssetCard click → AssetDetail (per-kind branch for photos vs. PDFs) → upload a new photo → see Rekognition labels appear → search by label → delete-all reset. Login/Register screens reachable directly at `/login` and `/register` (Q10 non-blocking — they don't gate access).

**This is the first viable demo milestone.** Earlier phases produce visible artifacts (npm run build outputs `dist/index.html`) but only Phase 7 wires the live `/api/*` for clickable functionality.

---

## Standing Instructions

### Atomic doc-update gate (Erik 2026-04-26 — STRICT)

After each task's tests confirm GREEN:

1. Update **this plan's tracker** — flip the task's `[ ]` → `[x]` and the phase row in Master Tracker (✅ + commit hash + date).
2. Update **`MetaFiles/Approach/01-ui-workstream.md`** corresponding task checkboxes — `[ ]` → `[x]` with date.
3. Update **`Part03/MetaFiles/install-log.md`** if the task ran any `npm install` / `npm uninstall` / `npm prune`.
4. **Stage source + doc changes together** and commit in ONE git commit. The commit captures the full atomic state.
5. **Only then** start the next task.

**Anti-pattern:** "I'll batch the doc updates at end of phase." NO. Per task. Always.

### Push policy

No `git push` during execution. Erik signals when ready (likely at MVP closeout per his routing 2026-04-27).

### Install log

`Part03/MetaFiles/install-log.md` records every `npm install` / `npm uninstall` per Erik 2026-04-26. The frontend has its own `package.json` + `node_modules` at `Part03/frontend/`; entries should explicitly note `Part03/frontend/` as the working directory (vs. backend `npm install` which used `Part03/`).

### Test infrastructure split (per Erik 2026-04-27)

- **Backend tests:** existing Jest at `Part03/`. Run via `cd Part03 && npm test`.
- **Frontend tests:** new Vitest at `Part03/frontend/`. Run via `cd Part03/frontend && npm test`.
- **No unified runner.** Each workstream has its own test surface.

### Working directory

Most frontend commands run from `Part03/frontend/`. Express commands (`npm start`) run from `Part03/`. Build output lands at `Part03/frontend/dist/` and is served by Express's static middleware. Each `Bash` call should re-establish cwd explicitly (CWD doesn't persist reliably across calls).

### Subagent calibration

Two parallel-dispatch points:

- **Calibration Test #3 — Phase 3 shell components:** 3 subagents on independent files (Toast+Modal, TopBar, LeftRail+PageHeader).
- **Calibration Test #4 — Phase 5+6 screens:** 4 subagents on independent component sets (Library set, Login+Register, Upload, AssetDetail).

Decisions logged to `claude-workspace/scratch/system-plane-notes.md`. Hypothesis under test: parallel wins for independent component files in a TypeScript+React codebase (already confirmed for Express+Node in Tests #1 and #2; reproducing on the frontend toolchain).

### Visualization update — queued (per Erik 2026-04-27)

Add a TODO entry in `Part03/MetaFiles/TODO.md` at MVP closeout: update `visualizations/Target-State-project01-part03-photoapp-architecture-v1.md` with Vite/Tailwind/custom-primitives stack details. **Not in plan execution scope** — Erik handles outside this session.

### Resumption protocol (post-crash recovery)

1. Read this plan → state column shows current position.
2. Read latest commit on `MBAi460-Group1` main → confirms last completed task.
3. If plan ≠ commit reality, **trust git**; update plan state to match before resuming.
4. Resume at next ⏳ task.

---

## Master Tracker

| Phase | Goal | State | Commit | Evidence |
|---|---|---|---|---|
| 0 | Pre-execution prep | ✅ 2026-04-27 | (read-only — no commit) | backend 73/75 + tree clean + tokens.css internalized |
| 1 | Vite + TS strict + Tailwind + Zustand + Router (shadcn descoped) | ✅ 2026-04-27 | 6daf112 → 30675cd → 05eadf0 → (close-out hash unrecoverable post-compaction) | `npm run build` clean; vitest 7/7 green (2 Zustand + 5 routing); Tailwind theme wired with Andrew's tokens; Q10 non-blocking routes scaffolded |
| 2 | Icon shim (Lucide named-imports) | ✅ 2026-04-27 | 6f878dc | 18 named-import icons; 3/3 Icon tests green; vitest total 10/10 |
| 3 | Shell components (Toast, Modal, TopBar, LeftRail, PageHeader) | ✅ 2026-04-27 | (close-out hash unrecoverable post-compaction) | 9 vitest files / 41 tests green; build clean (10.73 kB CSS); Calibration Test #3 — 3 parallel subagents saved ~46% wall vs sequential |
| (3 PARALLEL — Calibration Test #3, 3 subagents) | | | | |
| 4 | photoappApi.ts (typed fetch wrapper) | ✅ 2026-04-27 | fc8d24e | 11 tests green; types.ts shared with Phase 5+6 fixtures |
| 5+6 | Library set + Login/Register + Upload + AssetDetail | ✅ 2026-04-27 | (close-out hash unrecoverable post-compaction) | 17 vitest files / 74 tests green; build clean (15.43 kB CSS, 162.73 kB JS); Calibration Test #4 — 4 parallel subagents saved ~74% wall vs sequential |
| (5+6 PARALLEL — Calibration Test #4, 4 subagents) | | | | |
| 7 | Wire to live backend | ✅ 2026-04-27 | (close-out hash unrecoverable post-compaction) | Live demo verified at http://localhost:8080 (Erik confirmed in browser; uploaded 3 photos with Rekognition labels — s3_object_count rose 10→13). All 35 substeps reverified by file-evidence post-compaction; SPA-fallback hotfix landed mid-Phase-7. **🎯 MILESTONE: clickable UI shipped** |
| 8 | Acceptance + DEMO-QUICKSTART | ⏳ | — | All Phase 8 acceptance items; DEMO-QUICKSTART.md written |

State legend: ⏳ Planned · 🔄 In progress · ✅ Complete · 🚩 Blocked · ⚠️ Executed pre-approval (reverification required at resumption)

---

## Phase 0: Pre-Execution Prep

**Goal:** confirm clean baseline + read the visual contract before any code work begins.

### Task 0.1: Verify backend baseline still green

**Files:** none modified. Read-only verification.

- [x] **Step 0.1.1:** From `Part03/`, run `npm test`. **Expected: ≥73 passed, ≤2 skipped.** (Live integration tests are opt-in.) **Strictly higher count than the baseline below is acceptable** (backend may have grown since plan was written); lower count or new failures is a blocker.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03
npm test
```

Expected last 5 lines (current baseline 2026-04-27 post-reviewer-fixes):
```
Test Suites: 1 skipped, 11 passed, 11 of 12 total
Tests:       2 skipped, 73 passed, 75 total
Snapshots:   0 total
Time:        ~0.6 s
Ran all test suites.
```

If count differs, run `git log --oneline -3` to confirm backend test additions landed since this plan was written. Strictly higher count = OK; equal-or-lower-with-failures = blocker.

- [x] **Step 0.1.2:** Run `git status`. Expected: `nothing to commit, working tree clean`.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git status
```

- [x] **Step 0.1.3:** Verify `Part03/frontend/dist/index.html` and `Part03/frontend/dist/assets/app.css` placeholder files still exist (from Server Foundation 02 Phase 4). They will be **overwritten** by `npm run build` later in this plan.

```bash
ls -la projects/project01/Part03/frontend/dist/
```

Expected: `index.html` and `assets/app.css` both present.

**Commit:** none (read-only verification).

### Task 0.2: Read Andrew's visual contract

**Files:** none modified. Read-only.

- [x] **Step 0.2.1:** Read `ClaudeDesignDrop/raw/MBAi-460/src/tokens.css` to memorize the design tokens (cream/coral/serif palette, 4px spacing grid, fontFamily scale). These translate into `tailwind.config.ts` in Phase 1.2.

- [x] **Step 0.2.2:** Skim `ClaudeDesignDrop/raw/MBAi-460/src/shell.jsx` (lines 4–281). Note the components: ToastProvider/useToast (4–33), Modal (35–68), TopBar (70–165), LeftRail (167–245), PageHeader (247–270), format helpers (273–281).

- [x] **Step 0.2.3:** Skim `ClaudeDesignDrop/raw/MBAi-460/src/library.jsx` (Library, AssetCard, ListView, plus SegmentedControl/Dropdown/Grid/EmptyLibrary sub-components).

- [x] **Step 0.2.4:** Skim `ClaudeDesignDrop/raw/MBAi-460/src/auth.jsx` (LoginScreen 4–115, RegisterScreen 117–181) and `ClaudeDesignDrop/raw/MBAi-460/src/screens.jsx` (UploadScreen 6–119).

**Commit:** none (read-only).

### Task 0.3: Confirm working directory layout

**Files:** none modified.

- [x] **Step 0.3.1:** Confirm `Part03/frontend/` exists and currently contains only `dist/` (placeholder content from 02). It does NOT yet contain `package.json`, `src/`, etc. — those are created in Phase 1.

```bash
ls projects/project01/Part03/frontend/
```

Expected output: `dist`

**Atomic doc update:** mark Task 0.1, 0.2, 0.3 ✅ in this plan tracker. (No 01 boxes apply for Phase 0.)

**Commit:** none (read-only verifications).

---

## Phase 1: App Bootstrap (Vite + TS strict + Tailwind + Zustand + Router)

**Reference:** 01 §Phase 1 (Tasks 1.1, 1.2, 1.3, 1.4). Task 1.5 was descoped (Playwright moved to Future-State).

**Why main thread:** Phase 1 wires up an interlocking toolchain (Vite + Tailwind + Zustand + Router all share `package.json`, `tsconfig.json`, and config files). Subagents would race on shared files.

### Task 1.1: Vite + TypeScript strict app bootstrap

**Files:**

- Create: `Part03/frontend/package.json` (via `npm create vite`)
- Create: `Part03/frontend/vite.config.ts`
- Create: `Part03/frontend/tsconfig.json` (strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes)
- Create: `Part03/frontend/index.html`
- Create: `Part03/frontend/src/main.tsx`
- Create: `Part03/frontend/src/App.tsx` (placeholder shell)
- Create: `Part03/frontend/.gitignore` (ignore `dist/`, `node_modules/`)

- [x] **Step 1.1.1:** Bootstrap Vite TS template. From `Part03/frontend/`:

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
npm create vite@latest . -- --template react-ts
```

When prompted ("Current directory is not empty"), select **Ignore files and continue** (the only existing content is `dist/` from 02, which Vite's template will leave alone).

- [x] **Step 1.1.2:** Pin React to 18.3.x (NOT React 19 per Q7). Open `package.json` and confirm `"react": "^18.3.x"` and `"react-dom": "^18.3.x"`. If Vite's template defaulted to React 19, downgrade:

```bash
npm install react@^18.3.0 react-dom@^18.3.0
npm install -D @types/react@^18.3.0 @types/react-dom@^18.3.0
```

- [x] **Step 1.1.3:** Tighten `tsconfig.json` strictness. Open `Part03/frontend/tsconfig.json`. Find the `compilerOptions` block. Add (or confirm) the following:

```json
"strict": true,
"noUncheckedIndexedAccess": true,
"exactOptionalPropertyTypes": true,
"noImplicitOverride": true
```

If `tsconfig.json` extends a base config (e.g., `tsconfig.app.json`), apply these in the extends-source.

- [x] **Step 1.1.4:** Replace the Vite template's `App.tsx` with a minimal placeholder shell. File: `Part03/frontend/src/App.tsx`.

```tsx
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-serif">MBAi 460 — PhotoApp</h1>
    </div>
  );
}

export default App;
```

(Tailwind classes won't resolve until Task 1.2; for now they're just CSS class strings.)

- [x] **Step 1.1.5:** Install (logged in `Part03/MetaFiles/install-log.md`).

```bash
npm install
```

- [x] **Step 1.1.6:** Append entry to `Part03/MetaFiles/install-log.md`:

```markdown
## 2026-04-27 — Phase 1.1 install: Vite + React 18.3.x + TypeScript strict (Part03/frontend)

- **Source:** `01-ui-workstream-plan.md` Phase 1 Task 1.1.
- **Working directory:** `MBAi460-Group1/projects/project01/Part03/frontend/`
- **Command:** `npm create vite@latest . -- --template react-ts` + `npm install`
- **Exit code:** `0`
- **Packages added:** vite, react@^18.3, react-dom@^18.3, @types/react, @types/react-dom, @vitejs/plugin-react, typescript.
- **Vulnerabilities:** record `npm audit` count.
- **Notes:** TS strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes + noImplicitOverride. React pinned to 18.3.x per Q7 (NOT React 19).
```

- [x] **Step 1.1.7:** Smoke build.

```bash
npm run build
```

Expected: `dist/index.html` and `dist/assets/index-<hash>.js` written. The placeholder text `MBAi 460 — PhotoApp` should appear in the built HTML (or in the JS bundle).

- [x] **Step 1.1.8:** Atomic doc update + commit.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/frontend/ projects/project01/Part03/MetaFiles/install-log.md projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md
# Note: dist/ is gitignored; only source files commit.
git commit -m "Part03 01 Phase 1.1: Vite + React 18.3.x + TypeScript strict bootstrap (Part03/frontend)"
```

### Task 1.2: Tailwind CSS + translate Andrew's tokens.css to theme

**Files:**

- Create: `Part03/frontend/tailwind.config.ts`
- Create: `Part03/frontend/postcss.config.js`
- Create: `Part03/frontend/src/styles/globals.css`
- Modify: `Part03/frontend/src/main.tsx` (add `import './styles/globals.css'`)
- Modify: `Part03/frontend/tsconfig.json` (if Tailwind config TS path needs declaration)

- [x] **Step 1.2.1:** Install Tailwind toolchain.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
npm install -D tailwindcss@^3 postcss autoprefixer
npx tailwindcss init -p
```

(Pin Tailwind 3.x; Tailwind 4 has breaking config syntax changes that affect `tailwind.config.ts` structure and the PostCSS plugin interface — safer to stay on 3.x for the assignment window.)

- [x] **Step 1.2.2:** Replace `tailwind.config.ts` (or rename `tailwind.config.js` to `.ts`) with the token translation. File contents:

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cream paper scale (per Andrew's tokens.css)
        paper: '#F0EEE6',
        'paper-2': '#E8E5DA',
        ink: '#1F1B16',
        'ink-2': '#5A544A',
        'ink-3': '#8C8576',
        // Single coral accent
        accent: '#CC785C',
        'accent-2': '#B66A4E',
        'accent-fg': '#FFFFFF',
        'accent-soft': '#F5DCD0',
        'accent-ring': '#E5A98D',
        // Status (mapped to coral-aware palette)
        success: '#5C9B7C',
        warn: '#D4A24A',
        error: '#C5524A',
        info: '#5C8CB8',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        md: ['1.125rem', { lineHeight: '1.625rem' }],
        lg: ['1.25rem', { lineHeight: '1.75rem' }],
        xl: ['1.5rem', { lineHeight: '2rem' }],
        '2xl': ['2rem', { lineHeight: '2.5rem' }],
        '3xl': ['2.5rem', { lineHeight: '3rem' }],
      },
      spacing: {
        // 4px grid
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },
      boxShadow: {
        1: '0 1px 2px rgba(0, 0, 0, 0.04)',
        2: '0 2px 8px rgba(0, 0, 0, 0.06)',
        3: '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
      transitionTimingFunction: {
        ease: 'cubic-bezier(0.2, 0, 0.2, 1)',
      },
      keyframes: {
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shim: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fade: 'fade 200ms ease',
        shim: 'shim 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
```

If exact hex values differ from `tokens.css`, prefer the values in `tokens.css` (it's the authoritative visual contract).

- [x] **Step 1.2.3:** Create `Part03/frontend/src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

body {
  background-color: theme('colors.paper');
  color: theme('colors.ink');
  font-family: theme('fontFamily.sans');
}
```

- [x] **Step 1.2.4:** Wire `globals.css` into `main.tsx`. Edit `Part03/frontend/src/main.tsx`. Add `import './styles/globals.css';` near the top imports.

- [x] **Step 1.2.5:** Update `App.tsx` to use Tailwind classes that consume the theme:

```tsx
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper text-ink">
      <h1 className="text-2xl font-serif">MBAi 460 — PhotoApp</h1>
    </div>
  );
}

export default App;
```

- [x] **Step 1.2.6:** Verify build still works.

```bash
npm run build
```

Expected: `dist/assets/index-<hash>.css` exists and contains Tailwind utility classes (e.g., `.bg-paper { background-color: ... }`). Spot-check via:

```bash
grep -c "bg-paper\|text-ink\|font-serif" dist/assets/index-*.css
```

Expected: at least 1 match (Tailwind generated the utility for our usage).

- [x] **Step 1.2.7:** Append `tailwind + postcss + autoprefixer` install to `install-log.md` (same format as Task 1.1.6).

- [x] **Step 1.2.8:** Atomic doc update + commit.

```bash
git add projects/project01/Part03/frontend/ projects/project01/Part03/MetaFiles/install-log.md projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md
git commit -m "Part03 01 Phase 1.2: Tailwind + Andrew's tokens.css → tailwind.config.ts theme"
```

### Task 1.3: ~~Selective shadcn/ui primitives~~ — DESCOPED 2026-04-27 (reviewer remediation)

shadcn/ui is **NOT used in the MVP**. UI primitives are implemented as custom Tailwind-styled React components:

- **Modal** → custom component in Phase 3 Subagent A (`Modal.tsx` with Escape-key + click-outside close + focus return + portal rendering). Reused by Phase 7.6 delete confirmation.
- **Button / Input** → native `<button>` / `<input>` with Tailwind utility classes (Phase 6 Subagent B uses these directly).
- **DropdownMenu** (TopBar avatar) → custom Tailwind-styled `<div>` with toggle state + ARIA disclosure pattern (Phase 3 Subagent B).
- **Toaster** → custom in Phase 3 Subagent A (`ToastProvider.tsx` with context-based pub/sub).

**Optional:** `npm install clsx tailwind-merge` if any component needs a `cn()` helper for class composition. Not required for MVP — only install if a concrete need surfaces during execution.

**Why descoped:** Phase 3 already creates a custom Modal (the only place shadcn's accessibility plumbing would have saved real work). Other primitives (Button, Input) are trivial Tailwind one-liners. The avatar dropdown (1–2 items) needs ARIA disclosure, not a full focus trap — manageable as a small custom component. Removing shadcn cuts a meaningful dep surface (@radix-ui/* transitive packages) and keeps stylistic coherence with Andrew's custom MVP.

(Original Task 1.3 reviewed and removed 2026-04-27 per reviewer remediation R1.)

### Task 1.4: Zustand store + Vitest + RTL test infra

**Files:**

- Create: `Part03/frontend/src/stores/ui.ts`
- Create: `Part03/frontend/vitest.config.ts`
- Create: `Part03/frontend/src/test/setup.ts`
- Create: `Part03/frontend/src/stores/__tests__/ui.test.ts`
- Modify: `Part03/frontend/package.json` (add `test` script: `vitest run`)

- [x] **Step 1.4.1:** Install Zustand + Vitest + RTL + jsdom.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
npm install zustand
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui
```

- [x] **Step 1.4.2:** Create `Part03/frontend/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

- [x] **Step 1.4.3:** Create `Part03/frontend/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [x] **Step 1.4.4:** Update `package.json` `scripts`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [x] **Step 1.4.5:** Implement `Part03/frontend/src/stores/ui.ts`:

```ts
import { create } from 'zustand';

export interface MockAuth {
  isMockAuthed: boolean;
  givenname?: string;
  familyname?: string;
}

export interface UIState {
  sidebarCollapsed: boolean;
  mockAuth: MockAuth;
  toggleSidebar: () => void;
  setMockAuth: (a: MockAuth) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mockAuth: { isMockAuthed: false },
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMockAuth: (a) => set({ mockAuth: a }),
}));
```

- [x] **Step 1.4.6:** Failing test `Part03/frontend/src/stores/__tests__/ui.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../ui';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarCollapsed: false,
      mockAuth: { isMockAuthed: false },
    });
  });

  it('toggleSidebar flips sidebarCollapsed', () => {
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it('setMockAuth replaces the mockAuth shape', () => {
    useUIStore.getState().setMockAuth({ isMockAuthed: true, givenname: 'Pooja', familyname: 'Sarkar' });
    const auth = useUIStore.getState().mockAuth;
    expect(auth.isMockAuthed).toBe(true);
    expect(auth.givenname).toBe('Pooja');
    expect(auth.familyname).toBe('Sarkar');
  });
});
```

- [x] **Step 1.4.7:** Run tests.

```bash
npm test
```

Expected: **2 tests pass (the 2 Zustand tests).** If Vitest can't resolve `@/...` aliases, confirm `vitest.config.ts` alias matches `tsconfig.json` paths. (No shadcn Button test — Task 1.3 descoped per reviewer remediation R1.)

- [x] **Step 1.4.8:** Append zustand + vitest install to `install-log.md`.

- [x] **Step 1.4.9:** Atomic doc update + commit.

```bash
git add projects/project01/Part03/frontend/ projects/project01/Part03/MetaFiles/install-log.md projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md
git commit -m "Part03 01 Phase 1.4: Zustand store + Vitest + RTL + jsdom test infrastructure"
```

### Task 1.5: react-router-dom routing scaffold

**Files:**

- Modify: `Part03/frontend/src/main.tsx` (wrap with `<BrowserRouter>`)
- Modify: `Part03/frontend/src/App.tsx` (add `<Routes>` with stub routes)
- Create: `Part03/frontend/src/__tests__/App.test.tsx`

- [x] **Step 1.5.1:** Install react-router-dom.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
npm install react-router-dom@^6
```

- [x] **Step 1.5.2:** Update `Part03/frontend/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

- [x] **Step 1.5.3:** Update `Part03/frontend/src/App.tsx` with stub routes:

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';

function PlaceholderPage({ name }: { name: string }) {
  return <div className="p-8"><h1 className="text-xl font-serif">{name}</h1></div>;
}

function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="px-6 py-4 border-b border-paper-2">
        <h1 className="text-lg font-serif">MBAi 460 — PhotoApp</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/library" replace />} />
          <Route path="/library" element={<PlaceholderPage name="Library" />} />
          <Route path="/upload" element={<PlaceholderPage name="Upload" />} />
          <Route path="/asset/:id" element={<PlaceholderPage name="Asset Detail" />} />
          <Route path="/login" element={<PlaceholderPage name="Login" />} />
          <Route path="/register" element={<PlaceholderPage name="Register" />} />
          <Route path="/profile" element={<PlaceholderPage name="Profile" />} />
          <Route path="/help" element={<PlaceholderPage name="Help" />} />
          <Route path="*" element={<PlaceholderPage name="404 — Not Found" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
```

- [x] **Step 1.5.4:** Failing test `Part03/frontend/src/__tests__/App.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routing', () => {
  it('renders the wordmark on every route', () => {
    renderAt('/library');
    expect(screen.getByText('MBAi 460 — PhotoApp')).toBeInTheDocument();
  });

  it('redirects / to /library', () => {
    renderAt('/');
    expect(screen.getByText('Library')).toBeInTheDocument();
  });

  it('renders /login as a public route (Q10 non-blocking)', () => {
    renderAt('/login');
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders /upload as a public route (no auth gate per Q10)', () => {
    renderAt('/upload');
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('renders 404 for unknown routes', () => {
    renderAt('/random-path');
    expect(screen.getByText('404 — Not Found')).toBeInTheDocument();
  });
});
```

- [x] **Step 1.5.5:** Run tests.

```bash
npm test
```

Expected: all tests pass (2 Zustand + 5 App routing = 7 tests). No Button test — shadcn descoped per reviewer remediation R1.

- [x] **Step 1.5.6:** Smoke build. From `Part03/frontend/`:

```bash
npm run build
```

Expected: `dist/index.html` and `dist/assets/index-<hash>.{js,css}` written.

- [x] **Step 1.5.7:** Append react-router-dom install to `install-log.md`.

- [x] **Step 1.5.8:** Atomic doc update + commit.

```bash
git add projects/project01/Part03/frontend/ projects/project01/Part03/MetaFiles/install-log.md projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md
git commit -m "Part03 01 Phase 1.5: react-router-dom + Q10 non-blocking routing scaffold"
```

**Phase 1 wrap:** Master Tracker Phase 1 → ✅ with this commit hash.

---

## Phase 2: Icon Shim

**Reference:** 01 §Phase 2 Task 2.1.

### Task 2.1: Lucide-react Icon component (named imports only — N-4 fix from burr-patch)

**Files:**

- Create: `Part03/frontend/src/components/Icon.tsx`
- Create: `Part03/frontend/src/components/__tests__/Icon.test.tsx`

- [x] **Step 2.1.1:** Install lucide-react.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
npm install lucide-react
```

- [x] **Step 2.1.2:** Failing test `Part03/frontend/src/components/__tests__/Icon.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Icon } from '../Icon';

describe('Icon', () => {
  it('renders an icon by name without crashing', () => {
    const { container } = render(<Icon name="search" size={20} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('renders the fallback (Search) for unknown names', () => {
    const { container } = render(<Icon name="this-icon-does-not-exist" size={16} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull(); // fallback still renders
  });

  it('passes className through', () => {
    const { container } = render(<Icon name="upload" className="text-accent" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('text-accent')).toBe(true);
  });
});
```

- [x] **Step 2.1.3:** Implement `Part03/frontend/src/components/Icon.tsx`:

```tsx
import {
  Search,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  User,
  LogIn,
  HelpCircle,
  Home,
  Plus,
  Filter,
  Grid as GridIcon,
  List as ListIcon,
  AlertCircle,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const map: Record<string, IconComponent> = {
  search: Search,
  upload: Upload,
  document: FileText,
  photo: ImageIcon,
  trash: Trash2,
  close: X,
  check: Check,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  user: User,
  login: LogIn,
  help: HelpCircle,
  home: Home,
  plus: Plus,
  filter: Filter,
  grid: GridIcon,
  list: ListIcon,
  alert: AlertCircle,
};

export function Icon({
  name,
  size = 16,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const C = map[name] ?? Search; // sensible fallback
  return <C size={size} className={className} />;
}
```

(Add named imports for additional icons as Andrew's components reference them in later phases. Per N-4 from the UI burr patch: NEVER `import * as LucideIcons` — defeats tree-shaking.)

- [x] **Step 2.1.4:** Run tests.

```bash
npm test
```

Expected: all prior 7 tests + 3 new Icon tests = 10 tests passing.

- [x] **Step 2.1.5:** Append lucide-react install to `install-log.md`.

- [x] **Step 2.1.6:** Atomic doc update + commit.

```bash
git add projects/project01/Part03/frontend/ projects/project01/Part03/MetaFiles/install-log.md projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md
git commit -m "Part03 01 Phase 2.1: Icon shim (lucide-react, named imports only per N-4)"
```

**Phase 2 wrap:** Master Tracker Phase 2 → ✅.

---

## Phase 3: Shell Components — Calibration Test #3 (PARALLEL SUBAGENT DISPATCH)

**Why parallel:** 5 shell components are 5 independent files, with disjoint test surfaces. Each subagent reads Andrew's `shell.jsx` (read-only reference) and writes a different output file. Identical shape to Calibration Test #1 from 03 (3 independent files).

**Hypothesis under test:** parallel wins for independent component files in a TS+React codebase. Reproduces H1 from the 03 backend on the frontend toolchain.

**Subagent split (3 subagents):**

- **Subagent A (overlays):** ToastProvider + Modal (shell.jsx lines 4–68; smaller; both are overlay primitives)
- **Subagent B (chrome):** TopBar **MVP-trimmed** (shell.jsx lines 70–165; largest; strip ⌘K trigger + tweaks toggle + notifications per the M-2 burr-patch decision)
- **Subagent C (chrome):** LeftRail + PageHeader (shell.jsx lines 167–270; medium)

Plus the format helpers (lines 273–281: `fmtBytes`, `fmtDate`, `fmtDateRel`) port to `Part03/frontend/src/utils/format.ts` — assigned to Subagent C since LeftRail and PageHeader use date/size formatting.

### Task P3.1: Dispatch 3 subagents in parallel

**Files (subagent territories — each subagent ONLY modifies its own files):**

- Subagent A creates:
  - `Part03/frontend/src/components/ToastProvider.tsx`
  - `Part03/frontend/src/components/Modal.tsx`
  - `Part03/frontend/src/components/__tests__/ToastProvider.test.tsx`
  - `Part03/frontend/src/components/__tests__/Modal.test.tsx`
- Subagent B creates:
  - `Part03/frontend/src/components/TopBar.tsx`
  - `Part03/frontend/src/components/__tests__/TopBar.test.tsx`
- Subagent C creates:
  - `Part03/frontend/src/components/LeftRail.tsx`
  - `Part03/frontend/src/components/PageHeader.tsx`
  - `Part03/frontend/src/utils/format.ts`
  - `Part03/frontend/src/components/__tests__/LeftRail.test.tsx`
  - `Part03/frontend/src/components/__tests__/PageHeader.test.tsx`
  - `Part03/frontend/src/utils/__tests__/format.test.ts`

- [x] **Step P3.1.1:** Single message with three Agent tool invocations (parallel runtime fan-out). Each subagent receives:
  - Working directory: `Part03/frontend/` (cd explicitly per Bash call).
  - Source-of-truth: 01 §Phase 3 + Andrew's `ClaudeDesignDrop/raw/MBAi-460/src/shell.jsx`.
  - Goal: TS port + Tailwind classes + lucide-react Icon shim + Vitest+RTL test files.
  - Scope discipline: only modify YOUR files (listed above); do NOT touch other shell components, do NOT touch `App.tsx`, do NOT modify any docs (plan, 01 approach, install-log — main thread handles those post-merge), do NOT commit.
  - Run only your test file: `npm test -- <your-test-file>`. Do NOT run full `npm test` (other subagents in flight).
  - Return shape: under 350 words — files written, test count, deviations from 01, opens, final test output last 5 lines.

**Subagent A brief (overlays — Toast + Modal):**

> Implement `ToastProvider.tsx` (port from `shell.jsx` lines 4–33) and `Modal.tsx` (port from `shell.jsx` lines 35–68) as TS strict + Tailwind-classed React components.
>
> ToastProvider: context-based pub/sub (provider exports `useToast()` hook returning `addToast(message, tone?)`). Tone variants: `success | warn | error | info`. Auto-dismiss after 4s. Stacked bottom-right.
>
> Modal: portal-based or inline; closes on Escape, click-outside, and explicit close button. Returns focus to trigger element on close.
>
> Tests cover: ToastProvider — render with one toast asserts it appears + auto-dismisses; Modal — open then press Escape asserts onClose called.
>
> Use Tailwind classes that consume the theme tokens (`bg-paper`, `text-ink`, `bg-accent`, etc.). Use `Icon` from `@/components/Icon` for the close button.
>
> Constraints: TS strict; explicit prop types for everything; no `any`. No `Object.assign(window, ...)` patterns (Andrew's globals don't carry over). Module exports: named exports `ToastProvider`, `useToast`, `Modal`.

**Subagent B brief (TopBar — MVP-trimmed):**

> Implement `TopBar.tsx` (port from `shell.jsx` lines 70–165) as a TS strict + Tailwind-classed React component.
>
> **MVP shape (per M-2 from the UI burr-patch, 2026-04-27):** wordmark on the left + avatar dropdown on the right. **OMIT** the ⌘K trigger button, tweaks toggle button, and notifications bell — those are deferred to their respective Future-State workstreams. NOT no-op visual stubs; physically removed from the JSX so no UX traps in the demo.
>
> Avatar dropdown: implement as a custom Tailwind-styled `<div>` with relative positioning and toggle state — do NOT use shadcn DropdownMenu (not installed per 2026-04-27 descope decision). Focus trap and keyboard close (Escape) must be implemented manually to maintain WCAG 2.1 AA compliance for the avatar control. **Implementation note:** for a simple avatar disclosure (1–2 items: Profile, Sign out), ARIA-correct disclosure (`aria-expanded` + `aria-haspopup="menu"` + Escape-close + click-outside-close + focus-visible ring) is sufficient; a full focus-trap pattern can be implemented if reviewer requires. The trigger shows the user's initials when `mockAuth.isMockAuthed` is true (read from `useUIStore`), or an anonymous icon (`<Icon name="user" />`) when not.
>
> Tests cover: render with `mockAuth.isMockAuthed = false` shows anonymous icon; render with `mockAuth = { isMockAuthed: true, givenname: 'Pooja', familyname: 'Sarkar' }` shows initials "PS" or similar.
>
> Constraints: TS strict; no `any`; named export `TopBar`. Wordmark text: `MBAi 460`.

**Subagent C brief (LeftRail + PageHeader + format helpers):**

> Implement three things: `LeftRail.tsx`, `PageHeader.tsx`, and `utils/format.ts`.
>
> **LeftRail.tsx** (port from `shell.jsx` lines 167–245): collapsible sidebar with three groups — Workspace (Library / Upload / Search), You (Profile), Help. Active route is highlighted via `useLocation()` from react-router-dom. Collapse state from `useUIStore().sidebarCollapsed`. Each item has an icon (use `Icon` shim).
>
> **PageHeader.tsx** (port from `shell.jsx` lines 247–270): title + subtitle + breadcrumbs + actions slot. Props: `{ title: string; subtitle?: string; breadcrumbs?: { label: string; to?: string }[]; actions?: React.ReactNode }`.
>
> **utils/format.ts** (port from `shell.jsx` lines 273–281): three exports — `fmtBytes(n: number): string`, `fmtDate(d: Date | string): string`, `fmtDateRel(d: Date | string): string`. `fmtBytes` formats KB/MB/GB; `fmtDate` formats `YYYY-MM-DD` or similar locale-stable; `fmtDateRel` formats "2h ago", "3 days ago", etc.
>
> Tests cover: LeftRail renders 5 nav items + active highlight on `/library`; PageHeader renders title; format helpers — `fmtBytes(1024) === '1 KB'`, `fmtDate(...)` returns expected, `fmtDateRel(...)` for "now" returns "just now" (or similar).
>
> Constraints: TS strict; no `any`; named exports for all three files. Use `Icon` from `@/components/Icon`. Use `Link` from react-router-dom for nav items.

### Task P3.2: Verify merge

- [x] **Step P3.2.1:** Receive all 3 subagent reports.

- [x] **Step P3.2.2:** From `Part03/frontend/`, run full `npm test`.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
npm test
```

Expected: 11 prior + ~12 new (Toast 1 + Modal 1 + TopBar 2 + LeftRail 2 + PageHeader 1 + format 5) = ~23 tests. All green.

- [x] **Step P3.2.3:** Run `git status` to confirm only the expected files changed.

### Task P3.3: Atomic doc update + single commit

- [x] **Step P3.3.1:** Update Master Tracker: Phase 3 → ✅.

- [x] **Step P3.3.2:** Single commit.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/frontend/ projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md
git commit -m "Part03 01 Phase 3: shell components — Toast + Modal + TopBar (MVP-trimmed) + LeftRail + PageHeader + format helpers (parallel subagent dispatch)"
```

**Subagent calibration log entry:** append to `claude-workspace/scratch/system-plane-notes.md` Subagents section with Test #3 results (wall time, token usage, scope discipline, coherence outcomes).

**Phase 3 wrap:** Master Tracker Phase 3 → ✅.

---

## Phase 4: photoappApi.ts (Main Thread)

**Reference:** 01 §Phase 4 Task 4.1.

**Why main thread:** single file; small; needs to land cleanly before Phase 5+6 components consume types from it.

### Task 4.1: Typed fetch wrapper with envelope handling

**Files:**

- Create: `Part03/frontend/src/api/types.ts`
- Create: `Part03/frontend/src/api/photoappApi.ts`
- Create: `Part03/frontend/src/api/__tests__/photoappApi.test.ts`

- [x] **Step 4.1.1:** Create `Part03/frontend/src/api/types.ts`:

```ts
export interface ApiSuccess<T> {
  message: 'success';
  data: T;
}

export interface ApiError {
  message: 'error';
  error: string;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiError;

export interface User {
  userid: number;
  username: string;
  givenname: string;
  familyname: string;
}

export type AssetKind = 'photo' | 'document';

export interface Asset {
  assetid: number;
  userid: number;
  localname: string;
  bucketkey: string;
  kind: AssetKind;
}

export interface Label {
  label: string;
  confidence: number;
}

export interface SearchHit {
  assetid: number;
  label: string;
  confidence: number;
}

export interface PingData {
  s3_object_count: number;
  user_count: number;
}
```

- [x] **Step 4.1.2:** Failing test `Part03/frontend/src/api/__tests__/photoappApi.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPing,
  getUsers,
  getImages,
  uploadImage,
  getImageFileUrl,
  getImageLabels,
  searchImages,
  deleteAllImages,
} from '../photoappApi';

describe('photoappApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getPing calls /api/ping and returns parsed data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: { s3_object_count: 5, user_count: 3 } }),
    } as Response);
    const data = await getPing();
    expect(fetch).toHaveBeenCalledWith('/api/ping');
    expect(data).toEqual({ s3_object_count: 5, user_count: 3 });
  });

  it('getUsers returns array', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: [{ userid: 80001, username: 'p_sarkar', givenname: 'Pooja', familyname: 'Sarkar' }] }),
    } as Response);
    const result = await getUsers();
    expect(fetch).toHaveBeenCalledWith('/api/users');
    expect(result).toHaveLength(1);
    expect(result[0]?.username).toBe('p_sarkar');
  });

  it('getImages without userid', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: [] }),
    } as Response);
    await getImages();
    expect(fetch).toHaveBeenCalledWith('/api/images');
  });

  it('getImages with userid encodes the query param', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: [] }),
    } as Response);
    await getImages(80001);
    expect(fetch).toHaveBeenCalledWith('/api/images?userid=80001');
  });

  it('uploadImage sends multipart FormData', async () => {
    const file = new File(['fakebytes'], 'test.jpg', { type: 'image/jpeg' });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: { assetid: 1001 } }),
    } as Response);
    const data = await uploadImage(80001, file);
    expect(data).toEqual({ assetid: 1001 });
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toBe('/api/images');
    expect(call[1].method).toBe('POST');
    expect(call[1].body).toBeInstanceOf(FormData);
  });

  it('getImageFileUrl returns the right path', () => {
    expect(getImageFileUrl(1001)).toBe('/api/images/1001/file');
  });

  it('getImageLabels parses labels array', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: [{ label: 'Animal', confidence: 99 }] }),
    } as Response);
    const labels = await getImageLabels(1001);
    expect(labels).toHaveLength(1);
    expect(labels[0]?.confidence).toBe(99);
  });

  it('searchImages encodes label query', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: [] }),
    } as Response);
    await searchImages('animal');
    expect(fetch).toHaveBeenCalledWith('/api/search?label=animal');
  });

  it('searchImages url-encodes special chars', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: [] }),
    } as Response);
    await searchImages('hi there');
    expect(fetch).toHaveBeenCalledWith('/api/search?label=hi%20there');
  });

  it('deleteAllImages calls DELETE /api/images', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: { deleted: true } }),
    } as Response);
    await deleteAllImages();
    expect(fetch).toHaveBeenCalledWith('/api/images', expect.objectContaining({ method: 'DELETE' }));
  });

  it('throws on error envelope', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'error', error: 'no such userid' }),
    } as Response);
    await expect(uploadImage(99999, new File([], 'x.jpg'))).rejects.toThrow('no such userid');
  });
});
```

- [x] **Step 4.1.3:** Run test → expect RED (`photoappApi` module not found).

```bash
npm test -- photoappApi.test.ts
```

- [x] **Step 4.1.4:** Implement `Part03/frontend/src/api/photoappApi.ts`:

```ts
import type {
  ApiEnvelope,
  Asset,
  Label,
  PingData,
  SearchHit,
  User,
} from './types';

async function unwrap<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T>;
  if (body.message === 'success') return body.data;
  throw new Error(body.error);
}

export async function getPing(): Promise<PingData> {
  const res = await fetch('/api/ping');
  return unwrap<PingData>(res);
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  return unwrap<User[]>(res);
}

export async function getImages(userid?: number): Promise<Asset[]> {
  const url = userid !== undefined ? `/api/images?userid=${userid}` : '/api/images';
  const res = await fetch(url);
  return unwrap<Asset[]>(res);
}

export async function uploadImage(userid: number, file: File): Promise<{ assetid: number }> {
  const fd = new FormData();
  fd.append('userid', String(userid));
  fd.append('file', file);
  const res = await fetch('/api/images', { method: 'POST', body: fd });
  return unwrap<{ assetid: number }>(res);
}

export function getImageFileUrl(assetid: number): string {
  return `/api/images/${assetid}/file`;
}

export async function getImageLabels(assetid: number): Promise<Label[]> {
  const res = await fetch(`/api/images/${assetid}/labels`);
  return unwrap<Label[]>(res);
}

export async function searchImages(label: string): Promise<SearchHit[]> {
  const res = await fetch(`/api/search?label=${encodeURIComponent(label)}`);
  return unwrap<SearchHit[]>(res);
}

export async function deleteAllImages(): Promise<{ deleted: boolean }> {
  const res = await fetch('/api/images', { method: 'DELETE' });
  return unwrap<{ deleted: boolean }>(res);
}
```

- [x] **Step 4.1.5:** Run test → expect GREEN.

```bash
npm test -- photoappApi.test.ts
```

Expected: 11/11 photoappApi tests pass.

- [x] **Step 4.1.6:** Atomic doc update + commit.

```bash
git add projects/project01/Part03/frontend/ projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md
git commit -m "Part03 01 Phase 4.1: photoappApi.ts typed fetch wrapper with envelope handling"
```

**Phase 4 wrap:** Master Tracker Phase 4 → ✅.

---

## Phase 5+6: Screens — Calibration Test #4 (PARALLEL SUBAGENT DISPATCH)

**Why parallel:** 4 component sets are independent. Library set (Library + AssetCard + ListView) is one tightly-coupled unit. Login + Register share auth.jsx as source. Upload is its own file. AssetDetail is its own page.

**Hypothesis under test:** parallel works for 4 simultaneous subagents on independent component sets — extends Tests #1 and #2 to a higher subagent count.

**Subagent split (4 subagents):**

- **Subagent A (Library set):** Library + AssetCard + ListView (port from Andrew's `library.jsx`). Library imports AssetCard + ListView so they're coupled and stay in one subagent.
- **Subagent B (Auth scaffolds, Q10 non-blocking):** LoginScreen + RegisterScreen (port from `auth.jsx`).
- **Subagent C (Upload):** UploadScreen (port from `screens.jsx`; Q9 — accepts any file; classify radio is UX hint only; ocrMode radio dropped).
- **Subagent D (Asset detail):** AssetDetail page component scaffold with per-kind branch (per Task 6.3 redesign — component-only, fixtures; live wiring is Phase 7.4).

### Task P4.0: Create shared fixture file (main thread, pre-dispatch)

**Why (per reviewer remediation R2):** Subagent D imports fixtures from `__tests__/fixtures/assets.ts`. In a true parallel run, Subagent A would not have created the file when D starts. Pre-create the shared fixture on main thread; A and D both import.

**Files:**

- Create: `Part03/frontend/src/__tests__/fixtures/assets.ts`

- [x] **Step P4.0.1:** Create `Part03/frontend/src/__tests__/fixtures/assets.ts`:

```ts
import type { Asset, Label } from '@/api/types';

export const mockPhotoAsset: Asset = {
  assetid: 1001,
  userid: 80001,
  localname: '01degu.jpg',
  bucketkey: 'p_sarkar/uuid-01degu.jpg',
  kind: 'photo',
};

export const mockDocumentAsset: Asset = {
  assetid: 1042,
  userid: 80001,
  localname: 'test.pdf',
  bucketkey: 'p_sarkar/uuid-test.pdf',
  kind: 'document',
};

export const mockAssets: Asset[] = [mockPhotoAsset, mockDocumentAsset];

export const mockLabels: Label[] = [
  { label: 'Animal', confidence: 99 },
  { label: 'Dog', confidence: 92 },
];
```

- [x] **Step P4.0.2:** Atomic doc update + commit (precedes the 4-subagent dispatch):

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/frontend/src/__tests__/fixtures/assets.ts projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md
git commit -m "Part03 01 Phase 5+6 pre-dispatch: shared fixture file (mockPhotoAsset, mockDocumentAsset, mockLabels) for Subagents A + D"
```

### Task P4.1: Dispatch 4 subagents in parallel

**Files (subagent territories):**

- Subagent A creates:
  - `Part03/frontend/src/components/Library.tsx`
  - `Part03/frontend/src/components/AssetCard.tsx`
  - `Part03/frontend/src/components/ListView.tsx`
  - `Part03/frontend/src/components/EmptyLibrary.tsx`
  - `Part03/frontend/src/components/__tests__/Library.test.tsx`
  - `Part03/frontend/src/components/__tests__/AssetCard.test.tsx`
  - `Part03/frontend/src/components/__tests__/ListView.test.tsx`
  - _(does NOT create fixtures/assets.ts — created on main thread in Task P4.0)_
- Subagent B creates:
  - `Part03/frontend/src/components/LoginScreen.tsx`
  - `Part03/frontend/src/components/RegisterScreen.tsx`
  - `Part03/frontend/src/components/__tests__/LoginScreen.test.tsx`
  - `Part03/frontend/src/components/__tests__/RegisterScreen.test.tsx`
- Subagent C creates:
  - `Part03/frontend/src/components/UploadScreen.tsx`
  - `Part03/frontend/src/components/__tests__/UploadScreen.test.tsx`
- Subagent D creates:
  - `Part03/frontend/src/pages/AssetDetail.tsx`
  - `Part03/frontend/src/pages/__tests__/AssetDetail.test.tsx`

- [x] **Step P4.1.1:** Single message with four Agent tool invocations (parallel runtime fan-out). Each subagent receives:
  - Working directory: `Part03/frontend/`.
  - Source-of-truth: 01 §Phase 5 (or Phase 6) + Andrew's relevant `.jsx` source.
  - Goal: TS port + Tailwind classes + Vitest+RTL test files using fixtures.
  - Mock data: import from `Part03/frontend/src/__tests__/fixtures/` (created on main thread in Task P4.0 — file exists before dispatch).
  - Scope discipline: only your files; do NOT modify other components, App.tsx, photoappApi.ts, docs; do NOT commit.
  - Run only your tests.
  - Return shape: under 350 words.

**Subagent A brief (Library set):**

> Implement `Library.tsx`, `AssetCard.tsx`, `ListView.tsx`, `EmptyLibrary.tsx`. Port from Andrew's `ClaudeDesignDrop/raw/MBAi-460/src/library.jsx`.
>
> Library is the page-level component: header (title + search input + view toggle Grid/List + filter dropdown All/Photos/Documents), then either AssetCard grid (responsive: 2 cols <480px, 3 cols 480–768, 4 cols 768–1024, 5 cols ≥1024) OR ListView, OR EmptyLibrary if `assets.length === 0`.
>
> AssetCard renders ONE asset. Per-kind branch: `kind === 'photo'` → image preview via `getImageFileUrl(assetid)` + Rekognition labels (top 3 + "+N" pill). `kind === 'document'` → metadata (filename, size, date, kind badge) + "OCR coming soon" placeholder per Q9. Click → `onOpenAsset(asset)` callback.
>
> ListView renders a table-like list with the same per-kind handling.
>
> EmptyLibrary: friendly empty-state UI with a "Upload your first asset" button → `onOpenUpload()` callback.
>
> Props for Library: `{ assets: Asset[]; onOpenAsset: (a: Asset) => void; onOpenUpload: () => void; emptyState?: boolean }`. Pass labels per asset via prop or via a `labelsByAssetId: Record<number, Label[]>` object — pick whichever feels cleaner.
>
> Search input: controlled local state in Library; on submit (or debounced), call an `onSearch(label: string)` prop. The actual `searchImages` API call is wired in Phase 7 — for now, this prop is just a callback.
>
> Filter (All/Photos/Documents): segmented control; filters the rendered grid by `kind`.
>
> View toggle: persist via `useUIStore` if you add `libraryView: 'grid' | 'list'` field, OR keep as local state for now.
>
> Tests:
> - Library renders empty state when `emptyState={true}`.
> - Library renders 2 photos + 1 document; filter "Photos" hides the document.
> - AssetCard photo renders labels (top 3 visible).
> - AssetCard document renders kind badge + "OCR coming soon".
> - ListView renders rows for each asset.
>
> Fixtures file at `Part03/frontend/src/__tests__/fixtures/assets.ts` is created on main thread BEFORE this dispatch (Task P4.0); import `mockPhotoAsset`, `mockDocumentAsset`, `mockAssets`, `mockLabels` from it. Subagent A may EXTEND the file with additional fixtures specific to Library tests (e.g., a 5-asset list for filter testing) but must NOT redefine the shared exports.
>
> Constraints: TS strict; named exports.

**Subagent B brief (Login + Register, non-blocking per Q10):**

> Implement `LoginScreen.tsx` + `RegisterScreen.tsx`. Port from Andrew's `auth.jsx` (lines 4–115 for Login, 117–181 for Register).
>
> **Per Q10 (resolved 2026-04-26):** these are NON-BLOCKING visual scaffolds.
> - The Login submit handler does NOT call `POST /api/auth`. It calls `useUIStore().setMockAuth({ isMockAuthed: true, givenname, familyname: '' })` then navigates to `/library`.
> - The Register submit handler same: sets `mockAuth` for visual demo + navigates.
> - "Forgot?" link opens a Modal placeholder pointing at staff contact (per spec §9.3). No password-reset call.
>
> Use native `<input>` and `<button>` elements with Tailwind utility classes. No shadcn primitives. Example: `<input className="w-full px-3 py-2 border border-paper-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-ring" />`, `<button className="px-4 py-2 bg-accent text-accent-fg rounded-md hover:bg-accent-2 focus:outline-none focus:ring-2 focus:ring-accent-ring">Submit</button>`. Preserve focus-visible behavior + accessible labels (`<label for>` pattern) for WCAG 2.1 AA.
>
> Tests:
> - LoginScreen renders the form (username + password inputs).
> - LoginScreen submit toggles `useUIStore().mockAuth.isMockAuthed = true`.
> - RegisterScreen renders form + password-rules checklist (Andrew's `auth.jsx` includes the checklist UI).
> - RegisterScreen submit toggles mockAuth.
> - Use `MemoryRouter` to verify navigation to `/library` after submit.
>
> Constraints: TS strict; named exports `LoginScreen`, `RegisterScreen`. NO `fetch` calls. NO `<RequireAuth>` or auth-guard wrappers.

**Subagent C brief (UploadScreen, Q9 documents accepted):**

> Implement `UploadScreen.tsx`. Port from Andrew's `screens.jsx` (lines 6–119).
>
> **Per Q9 (documents accepted; OCR deferred):**
> - Drop area + `<input type="file">` accept ANY file type. The 50 MB size limit is enforced server-side.
> - Real upload flow (wired in Phase 7.3): call `photoappApi.uploadImage(userid, file)`. UI optimistically appends to a queue + updates progress on response.
> - Server derives `kind` from extension (Q8). The UI doesn't send a `kind` field. Andrew's `classify` radio (auto/photo/document) is preserved as a **UX hint only** — selection has no server effect in Part 03.
> - DROP the `ocrMode` radio entirely (Textract is Future-State; the radio's "text"/"forms" options have no server-side wiring in Part 03).
> - Queue display: photos show "analyzing… → done with N labels"; documents show "uploaded · stored as document · OCR coming soon".
> - >50 MB files → server returns 400; UI shows a per-item error toast via `useToast()` from ToastProvider.
>
> Take the `userid` to upload as via either a prop or by reading the user from a top-of-screen user-select dropdown (Andrew's mockup likely has one — preserve that pattern).
>
> Tests:
> - Render shows file picker + drop area + classify radio + upload button.
> - Selecting a file appends to the queue.
> - Submit calls a passed-in `onUpload(userid, file)` callback (Phase 7.3 swaps the callback for `photoappApi.uploadImage`).
> - Drop the `ocrMode` radio test entirely; assert `ocrMode` is NOT rendered.
>
> Constraints: TS strict; named export `UploadScreen`. Use `Icon` shim. Use Tailwind classes.

**Subagent D brief (AssetDetail, per-kind branch component scaffold):**

> Implement `pages/AssetDetail.tsx` per Task 6.3 of `01-ui-workstream.md`. **Component-only scaffold** — uses fixture data for tests; live backend wiring is Phase 7.4 (separate task, separate commit).
>
> Per Q9, branches on `asset.kind`:
> - **`kind === 'photo'`:** image preview slot (src injected via prop) + labels list slot (labels injected via prop) sorted by confidence DESC.
> - **`kind === 'document'`:** basic preview slot — for `.pdf`, `<embed src={previewSrc} type="application/pdf" />` with a download-link fallback if embedding fails; for other document types, a download link with the filename. **No OCR text panel.** Replace with an "OCR coming soon" empty state with a one-line note pointing at `Future-State-documents-and-textract-workstream.md`.
>
> Props: `{ asset: Asset; previewSrc?: string; labels?: Label[] }`. Phase 7.4 will pass `previewSrc = getImageFileUrl(asset.assetid)` and `labels = await getImageLabels(asset.assetid)` from live API.
>
> Tests (import fixtures from `@/__tests__/fixtures/assets.ts` — created on main thread before dispatch via Task P4.0):
> - `mockPhotoAsset` + `mockLabels`: renders image + labels list (top label first by confidence DESC).
> - `mockDocumentAsset`: renders `<embed>` + filename + "OCR coming soon" empty state. NO labels list rendered for documents.
> - Unknown `asset.kind`: graceful fallback (no crash).
>
> Constraints: TS strict; named export `AssetDetail`. Use `Icon` shim where useful (download icon, etc.).

### Task P4.2: Verify merge

- [x] **Step P4.2.1:** Receive all 4 subagent reports.

- [x] **Step P4.2.2:** From `Part03/frontend/`, run full `npm test`.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
npm test
```

Expected: ~23 prior + ~16 new (Library 2 + AssetCard 2 + ListView 1 + Login 2 + Register 2 + Upload 3 + AssetDetail 3 + EmptyLibrary 1) = ~39 tests. All green.

- [x] **Step P4.2.3:** `git status` to confirm clean delta.

### Task P4.3: Atomic doc update + single commit

- [x] **Step P4.3.1:** Update Master Tracker: Phases 5+6 → ✅.

- [x] **Step P4.3.2:** Single commit.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/frontend/ projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md
git commit -m "Part03 01 Phase 5+6: screens — Library/AssetCard/ListView + Login/Register (Q10) + Upload (Q9) + AssetDetail per-kind branch (parallel subagent dispatch)"
```

**Subagent calibration log entry:** append to `claude-workspace/scratch/system-plane-notes.md` with Test #4 results.

**Phase 5+6 wrap:** Master Tracker Phases 5 + 6 → ✅.

---

## Phase 7: Wire to Live Backend (Main Thread) — 🎯 MILESTONE

**Reference:** 01 §Phase 7 (Tasks 7.1–7.6).

**Why main thread:** wiring touches `App.tsx` + multiple components iteratively; subagent dispatch would step on each other. Each task is small.

After this phase: **🎯 first clickable UI** at http://localhost:8080.

### Task 7.1: App startup + /api/ping health probe

**Files:**

- Modify: `Part03/frontend/src/App.tsx` (add ping probe + connection indicator)
- Possibly modify: `Part03/frontend/src/components/LeftRail.tsx` (add Status indicator)

- [x] **Step 7.1.1:** Failing test in `Part03/frontend/src/__tests__/App.test.tsx` — add a test that asserts on app load, `getPing` is called and the result drives a "connected" indicator.

```tsx
// Add to App.test.tsx
import * as photoappApi from '../api/photoappApi';

it('App calls getPing on mount and shows connected indicator', async () => {
  vi.spyOn(photoappApi, 'getPing').mockResolvedValue({ s3_object_count: 5, user_count: 3 });
  renderAt('/library');
  // Wait for the async probe
  await screen.findByText(/connected/i);
});
```

- [x] **Step 7.1.2:** Run test → expect RED.

- [x] **Step 7.1.3:** Implement: in `App.tsx`, add a `useEffect` that calls `getPing()` on mount; store `connected: boolean | null` state; pass to `LeftRail` (or display in TopBar) as a status indicator.

- [x] **Step 7.1.4:** Run test → GREEN.

- [x] **Step 7.1.5:** Atomic doc update + commit.

```bash
git add projects/project01/Part03/frontend/ projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md
git commit -m "Part03 01 Phase 7.1: App startup + /api/ping health probe + connected indicator"
```

### Task 7.2: Library loads from /api/images

**Files:**

- Modify: `Part03/frontend/src/components/Library.tsx` OR create `Part03/frontend/src/pages/LibraryPage.tsx` as a wrapper that fetches assets and renders Library
- Modify: `Part03/frontend/src/App.tsx` (route `/library` → LibraryPage)

- [x] **Step 7.2.1:** Failing test for the page wrapper that asserts assets load from `getImages()` on mount and Library renders them.

- [x] **Step 7.2.2:** Run RED.

- [x] **Step 7.2.3:** Implement page wrapper with `useEffect` + `useState`. Render skeleton while loading; render error state on `getImages` rejection.

- [x] **Step 7.2.4:** Run GREEN.

- [x] **Step 7.2.5:** Atomic doc update + commit.

```bash
git commit -m "Part03 01 Phase 7.2: Library loads from /api/images via useEffect"
```

### Task 7.3: Upload calls /api/images (multipart)

**Files:**

- Modify: `Part03/frontend/src/components/UploadScreen.tsx` (swap the `onUpload` callback default with a real `photoappApi.uploadImage` invocation)
- OR create `Part03/frontend/src/pages/UploadPage.tsx` wrapping UploadScreen with the live call.

- [x] **Step 7.3.1:** Failing test asserting that on file submit, `photoappApi.uploadImage` is called with the right userid+file, and on success the UI navigates to `/library` (or shows a success toast).

- [x] **Step 7.3.2:** Run RED.

- [x] **Step 7.3.3:** Implement.

- [x] **Step 7.3.4:** Run GREEN.

- [x] **Step 7.3.5:** Commit.

```bash
git commit -m "Part03 01 Phase 7.3: Upload calls /api/images (multipart) end-to-end"
```

### Task 7.4: Asset detail wire to live backend

**Files:**

- Create: `Part03/frontend/src/pages/AssetDetailPage.tsx` (wraps AssetDetail with live data)
- Modify: `Part03/frontend/src/App.tsx` (route `/asset/:id` → AssetDetailPage)

- [x] **Step 7.4.1:** Failing test: AssetDetailPage at `/asset/1001` calls `getImages` (find by id) + `getImageFileUrl` + `getImageLabels` for photos.

- [x] **Step 7.4.2:** Run RED.

- [x] **Step 7.4.3:** Implement: `useParams()` for `:id`; resolve asset via Library list (cached) or refetch via `getImages`; for `kind === 'photo'`, also call `getImageLabels`. Pass to `AssetDetail` component as props.

- [x] **Step 7.4.4:** Run GREEN.

- [x] **Step 7.4.5:** Commit.

```bash
git commit -m "Part03 01 Phase 7.4: AssetDetailPage wires per-kind branch to live backend"
```

### Task 7.5: Search by label (Library page header per N-1 from burr-patch)

**Files:**

- Modify: `Part03/frontend/src/components/Library.tsx` (or LibraryPage) — wire the search input's `onSearch` to `photoappApi.searchImages(label)`.

- [x] **Step 7.5.1:** Failing test: typing "animal" + clicking Search calls `searchImages('animal')` and renders the filtered subset.

- [x] **Step 7.5.2:** Run RED.

- [x] **Step 7.5.3:** Implement: search input + button (per N-1 burr-patch placement: Library page header). On submit, call `searchImages` and replace the rendered grid with results until cleared.

- [x] **Step 7.5.4:** Run GREEN.

- [x] **Step 7.5.5:** Commit.

```bash
git commit -m "Part03 01 Phase 7.5: Search by label wired to /api/search (Library page header per N-1)"
```

### Task 7.6: Delete all images (with type-the-name confirmation)

**Files:**

- Create: `Part03/frontend/src/components/DeleteAllConfirm.tsx` (confirmation modal)
- Modify: `Part03/frontend/src/components/LeftRail.tsx` OR `Part03/frontend/src/components/TopBar.tsx` to expose the trigger.

- [x] **Step 7.6.1:** Failing test: open the confirm modal, type "delete", click Confirm → `deleteAllImages()` is called → on success, library refreshes (empty state).

- [x] **Step 7.6.2:** Run RED.

- [x] **Step 7.6.3:** Implement using the **custom `Modal` component from Phase 3 Subagent A** (`Part03/frontend/src/components/Modal.tsx` — already provides Escape-key + click-outside close + focus return + portal rendering). Require type-the-name confirmation: user types "delete" to enable the Confirm button. No shadcn `Dialog`.

- [x] **Step 7.6.4:** Run GREEN.

- [x] **Step 7.6.5:** Commit.

```bash
git commit -m "Part03 01 Phase 7.6: Delete all with type-the-name confirmation modal"
```

### Task 7.7: 🎯 First clickable UI — manual smoke

**Files:** none modified. Live verification.

- [x] **Step 7.7.1:** Build the frontend.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
npm run build
```

Expected: `dist/index.html`, `dist/assets/index-<hash>.js`, `dist/assets/index-<hash>.css` written.

- [x] **Step 7.7.2:** Start Express in another terminal.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03
npm start
```

- [x] **Step 7.7.3:** Open http://localhost:8080/ in a browser. Confirm:
  - Default route redirects to `/library`.
  - Library renders existing assets from live RDS+S3.
  - Photo cards show Rekognition labels.
  - Document cards (if any exist) show "OCR coming soon" placeholder.
  - Click a photo card → AssetDetail shows image + labels.
  - Navigate to /upload, pick a small JPG, upload → success toast → library refreshes with new card.
  - Search "Animal" → filtered grid.
  - Delete all → confirmation → library empty.

- [x] **Step 7.7.4:** Capture evidence:

```bash
# Capture a screenshot if useful (manual via browser DevTools or:)
# Or just take notes on what worked/didn't in this commit message.
```

- [x] **Step 7.7.5:** Atomic doc update + commit.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md
git commit -m "Part03 01 Phase 7.7: 🎯 First clickable UI verified — manual smoke against live RDS+S3 green"
```

**Phase 7 wrap:** Master Tracker Phase 7 → ✅. **🎯 MILESTONE: clickable UI lives at http://localhost:8080.**

---

## Phase 8: Acceptance + DEMO-QUICKSTART

**Reference:** 01 §Phase 8 (Tasks 8.1, 8.2).

### Task 8.1: Phase 8 acceptance checklist

**Files:** none modified directly; this task verifies the items from 01 Phase 8.1.

Walk through each acceptance item and tick it off. If any fails, surface as a blocker + fix before continuing.

- [ ] **Step 8.1.1:** L1 — Visiting `/` redirects to `/library` directly (no Login interception). Verify in browser.
- [ ] **Step 8.1.2:** L2 — `/login` and `/register` reachable; submit toggles `mockAuth` in Zustand (no fetch). Verify by clicking submit + checking Zustand state via React DevTools.
- [ ] **Step 8.1.3:** L3 — All in-scope routes render without auth gate. Verify by visiting each route directly.
- [ ] **Step 8.1.4:** LIB1 — Library first-paints with ≤50 assets in <2s on wired connection. Verify via DevTools Network tab.
- [ ] **Step 8.1.5:** LIB2 — Grid responsive: 2 cols <480px, 3 cols 480–768, 4 cols 768–1024, 5 cols ≥1024. Verify via DevTools responsive design mode.
- [ ] **Step 8.1.6:** LIB3 — Photo cards show ≤3 labels with "+N" pill for overflow. Verify with an asset that has >3 labels.
- [ ] **Step 8.1.7:** LIB4 — Document cards render metadata (filename, size, date, kind badge) + "OCR coming soon" placeholder. Verify after uploading a PDF.
- [ ] **Step 8.1.8:** U1 — Upload a JPG, returns assetid, library refreshes with new photo card + labels.
- [ ] **Step 8.1.9:** U2 — Upload error surfaced via toast.
- [ ] **Step 8.1.10:** U3 — Upload a PDF, returns assetid, library shows document card + "OCR coming soon".
- [ ] **Step 8.1.11:** U4 — File >50 MB → server 400 → friendly error toast.
- [ ] **Step 8.1.12:** A1 — Asset detail (photo) shows labels in confidence-DESC order.
- [ ] **Step 8.1.13:** A2 — Asset detail (document) shows file preview (PDF embed or download link) + "OCR coming soon" empty state.
- [ ] **Step 8.1.14:** A3 — File preview loads via `/api/images/:id/file` (no base64) for both kinds.
- [ ] **Step 8.1.15:** A11Y1 — Manual a11y review (focus-visible, keyboard nav, screen-reader landmarks). Walk the app via keyboard only; verify focus indicators.
- [x] **Step 8.1.16:** `npm test` (Vitest) green.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
npm test
```

- [x] **Step 8.1.17:** `npm run build` clean; TypeScript strict zero errors.

```bash
npm run build
```

- [x] **Step 8.1.18:** Manual CLI smoke per `Part03/MetaFiles/HumanTestInstructions/README.md` Tier 3+ passes against the built frontend served by Express. (5/5 CLI tests in `Human-Feature-Test-Suite.md` passed 2026-04-27; CLI-5 surfaced a finding — Express default HTML 404 instead of JSON envelope for unmatched `/api/*` — TODO'd; the SPA-fallback safety property still holds.)

- [ ] **Step 8.1.19:** Atomic doc update + commit.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md projects/project01/Part03/MetaFiles/Approach/01-ui-workstream.md
git commit -m "Part03 01 Phase 8.1: acceptance checklist green (L1–L3, LIB1–LIB4, U1–U4, A1–A3, A11Y1)"
```

### Task 8.2: DEMO-QUICKSTART.md for video teammate

**Files:**

- Create: `Part03/DEMO-QUICKSTART.md`

- [x] **Step 8.2.1:** Author `Part03/DEMO-QUICKSTART.md` with the following sections:

```markdown
# Part 03 Demo Quickstart

## Prerequisites

- Docker running (verify via `utils/lab-status` from repo root).
- `npm install` from `Part03/`.
- `npm install` from `Part03/frontend/`.
- AWS credentials in `projects/project01/client/photoapp-config.ini` (already present per Part 02 setup).

## Build + start

```bash
cd ~/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
npm run build
cd ..
npm start
# → "**Web service running, listening on port 8080..."
```

## Open the demo

Browser: http://localhost:8080/

The default route redirects to `/library`.

## Demo path (5 minutes)

1. Library → see existing assets from live RDS+S3.
2. Click an asset card → Asset Detail. Photos show Rekognition labels; documents show PDF preview + "OCR coming soon" placeholder.
3. Navigate to `/upload`, select a small JPG, click Upload → success → library refreshes with new card.
4. Search "Animal" in the Library page header → filtered grid.
5. (Optional) Upload a small PDF → library shows document card with "OCR coming soon" placeholder.
6. (Optional) Delete-all from LeftRail → confirmation modal → type "delete" → confirm → library shows empty state.

## Talking points (per Andrew's spec §3)

- Asset-first vocabulary: Library renders both photos and documents.
- Single coral accent (`#CC785C`) on cream paper background (`#F0EEE6`).
- Keyboard-first navigation for all assignment-critical controls.
- Login/Register exist as visual scaffolds (Q10) — they don't gate access.
- OCR for documents is Future-State (Q9 — Textract workstream queued).

## Troubleshooting

- **Library empty + 500 from `/api/ping`:** AWS credentials issue. Check `projects/project01/client/photoapp-config.ini` has `[s3readwrite]` profile.
- **`npm start` fails on port 8080:** kill the process holding 8080: `lsof -ti:8080 | xargs kill`.
- **Upload fails for >50 MB file:** expected — multer's 50 MB limit; show the friendly toast + retry with a smaller file.
```

- [x] **Step 8.2.2:** Atomic doc update + commit.

```bash
git add projects/project01/Part03/DEMO-QUICKSTART.md projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md
git commit -m "Part03 01 Phase 8.2: DEMO-QUICKSTART.md for video teammate"
```

### Task 8.3: Add visualization-update TODO + MVP closeout

**Files:**

- Modify: `Part03/MetaFiles/TODO.md` (add visualization update task)

- [ ] **Step 8.3.1:** Append to `Part03/MetaFiles/TODO.md` Active section:

```markdown
- [ ] **[Visualization] Update Target-State-project01-part03-photoapp-architecture-v1.md** — UI MVP shipped 2026-04-XX with Vite + React 18.3.x + TypeScript strict + Tailwind + custom Tailwind-styled primitives (shadcn descoped 2026-04-27) + Zustand. Update the architecture diagram + prose to reflect the actual implementation stack. (Erik handles outside the implementation session per 2026-04-27 routing.)
```

- [ ] **Step 8.3.2:** Verify Master Tracker has all phases ✅:

```bash
grep "✅\|⏳\|⚠️" projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md | head -20
```

Expected: all phases ✅.

- [ ] **Step 8.3.3:** Final commit.

```bash
git add projects/project01/Part03/MetaFiles/TODO.md projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md
git commit -m "Part03 01 Phase 8.3: MVP closeout — visualization-update TODO queued; Master Tracker all ✅"
```

**Phase 8 wrap:** Master Tracker Phase 8 → ✅. **01 MVP COMPLETE.**

---

## Subagent Calibration Notes (logged at each parallel-dispatch boundary)

Append to `claude-workspace/scratch/system-plane-notes.md` Subagents section after each calibration test:

**Test #3 — Phase 3 parallel (3 subagents on shell components, independent files):**
- Wall time vs. estimated sequential
- Total token usage
- Scope discipline (any subagent touch files outside its remit?)
- Coherence (any naming/import drift?)
- Side-findings surfaced
- Verdict: parallel won? broke even? lost?

**Test #4 — Phase 5+6 parallel (4 subagents on screens, independent component sets):**
- Wall time vs. estimated sequential
- Total token usage
- Coordination: did 4-way parallel break any patterns from 3-way?
- Coherence outcome
- Side-findings surfaced
- Verdict

**Hypotheses:**
- Reproduces H1 (parallel wins for independent files) on the frontend toolchain.
- Tests if 4-subagent dispatch maintains the same coherence as 3-subagent.

---

## Acceptance Evidence (filled at end)

_(Captured after Task 8.3 closeout.)_
