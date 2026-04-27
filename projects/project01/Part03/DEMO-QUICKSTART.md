# Part 03 Demo Quickstart

> **Purpose:** Five-minute walk-through of the Part 03 PhotoApp UI MVP for a teammate / reviewer / video recording.
> **Audience:** Anyone with this repo cloned who wants to see the demo running end-to-end against live AWS (S3 + RDS + Rekognition).
> **Source plan:** `MetaFiles/plans/01-ui-workstream-plan.md` §8.2.

## Prerequisites

- Docker running (verify via `utils/lab-status` from repo root).
- Node ≥ 24.
- Backend deps installed:
  ```bash
  cd ~/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03
  npm install
  ```
- Frontend deps installed:
  ```bash
  cd ~/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
  npm install
  ```
- AWS credentials in `projects/project01/client/photoapp-config.ini` (already present per Part 02 setup; contains `[s3]`, `[rds]`, `[s3readwrite]` profiles).

## Build + start

```bash
# From Part03/frontend/ — produces dist/index.html + bundled assets
cd ~/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
npm run build

# From Part03/ — Express serves dist/ on :8080
cd ..
npm start
```

Expected log line: `**Web service running, listening on port 8080...**`. Leave this terminal running.

## Open the demo

Browser: <http://localhost:8080/>

The default route redirects to `/library`.

## Demo path (5 minutes)

1. **Library** — see existing assets from live RDS+S3. Photo cards show ≤3 Rekognition labels with a "+N" overflow pill if the asset has more.
2. **Click an asset card** → Asset Detail. Photos show Rekognition labels in confidence-DESC order; documents (PDFs) show an inline preview with an "OCR coming soon" placeholder (Q9 — Textract is a Future-State workstream).
3. **Navigate to `/upload`**, select a small JPG, click Upload → success toast → return to Library → the new card appears with its labels.
4. **Search "Animal"** in the Library page header → filtered grid showing only matching assets (clear the search to restore the full grid).
5. *(Optional)* **Upload a small PDF** → Library shows a document card with "OCR coming soon" placeholder.
6. *(Optional)* **Delete-all** from the LeftRail → confirmation modal (type `delete` to enable Confirm) → confirm → Library shows the empty state.

## Talking points (per Andrew's spec §3)

- **Asset-first vocabulary.** Library renders both photos and documents — same component, per-kind branch.
- **Single coral accent** (`#CC785C`) on cream paper background (`#F0EEE6`) — Andrew's tokens translated into a Tailwind theme; no shadcn (descoped 2026-04-27 per R1 reviewer remediation in favor of custom Tailwind primitives).
- **Keyboard-first navigation** for all assignment-critical controls. Modal (Delete-All confirm) traps focus; Esc closes; focus returns to trigger.
- **Login / Register exist as visual scaffolds (Q10)** — they do NOT gate access. Submit toggles `mockAuth` in Zustand and routes to Library; no real auth fetch. Real auth lands in the Future-State Auth workstream.
- **OCR for documents is Future-State (Q9)** — Textract workstream queued; documents currently render filename + kind badge + "OCR coming soon" placeholder.
- **Live wiring touches every layer:** React + Vite + TS strict frontend → Express on port 8080 → typed `/api/*` routes → service layer → live S3 + Rekognition + RDS.

## Troubleshooting

- **Library empty + 500 from `/api/ping`.** AWS credentials issue. Check `projects/project01/client/photoapp-config.ini` has the `[s3readwrite]` profile populated. `lab-status` from repo root confirms Docker + AWS reachable.
- **`npm start` fails with `EADDRINUSE` on port 8080.** Another server is already bound: `lsof -ti:8080 | xargs kill` (or just confirm the existing one is responsive: `curl http://localhost:8080/health` → `{"status":"running"}`).
- **Upload fails for a >50 MB file.** Expected — multer's 50 MB limit. The UI surfaces a friendly toast and the request returns 400.
- **`/login` returns 404 from Express directly.** Should not happen post-`080456f` (the Phase 7 SPA-fallback hotfix). If it does, check `server/app.js` for the `app.use(...)` middleware that defers `/api/*` and serves `index.html` for everything else.
- **Browser shows stale JS/CSS after a rebuild.** Hard-refresh (Cmd+Shift+R) — Vite hashes the bundle filenames so the browser will fetch the new ones on a clean reload.

## Verifying the demo

For a thorough hand-on-keyboard acceptance walk, see `MetaFiles/HumanTestInstructions/Human-Feature-Test-Suite.md` — covers L1–A11Y1 (15 browser tests) plus an optional CLI smoke tier. For backend-only API verification (mocked + live tests, curl walkthroughs), see `MetaFiles/HumanTestInstructions/README.md`.
