# Visualizations — ActionQueue

## Active

- [ ] **[Naming] Normalize visualization filenames** — current names mix broad "lab" scope with specific "lab01" scope inconsistently; apply convention `<scope>-<subject>-v<N>.md` uniformly; update README table after rename
- [x] **[Stale] lab01-iam-design-v1.md** — CLOSED 2026-04-20: diagram regenerated, Claude-Conjurer updated to PowerUserAccess throughout.
- [ ] **[Review] Design-agent review of `Target-State-project01-part03-photoapp-architecture-v1.md`** — viz updated 2026-04-26 to be language/implementation-agnostic following the Express pivot (FastAPI/Python labels removed; "PhotoApp Service Module" replaces "imported photoapp.py"). Design agent to review and propose any redraw needed. (Express pivot Q6, 2026-04-26)

- [ ] **[Update] `Target-State-project01-part03-photoapp-architecture-v1.md` — add concrete stack post-MVP** — Part 03 UI MVP shipped 2026-04-27; the viz can be loosened from "agnosticized per Q6" to reflect the actual implementation stack. **Frontend stack to render:** Vite 5.4 + React 18.3.x + TypeScript strict (with `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`) + Tailwind CSS 3.x + custom Tailwind-styled primitives (shadcn descoped 2026-04-27 per R1) + Zustand 5 + react-router-dom 6 + lucide-react (named imports only). **Backend stack:** Express 5 + multer + AWS SDK v3 + mysql2/promise. **Test infrastructure:** Vitest + RTL + jsdom (frontend) + Jest + supertest (backend). Cross-ref: `projects/project01/Part03/MetaFiles/plans/01-ui-workstream-plan.md` Master Tracker for the canonical stack snapshot; `Andrew-MVP-Integration.md` row 126 for stack-vs-spec audit. **Owner: Erik external** per 2026-04-27 routing. (Surfaced via Outstanding Integrations sub-D 2026-04-27.)

## Backlog

- [ ] Add project02 architecture diagram when project02 is complete
- [ ] Add project03 architecture diagram when project03 is complete
