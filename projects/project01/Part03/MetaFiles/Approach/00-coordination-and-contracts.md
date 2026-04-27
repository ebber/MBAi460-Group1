# Coordination And Contracts Approach

> **For agentic workers:** This document is the shared contract for all Part 03 workstreams. Before implementing UI, Server Foundation, or API Routes work, confirm the relevant contract section here. If a workstream needs to change an endpoint, response shape, file path, or ownership boundary, update this document first.

## Goal

Define the coordination rules, API contract, response shapes, ownership boundaries, and verification checkpoints that let the UI, Server Foundation, and API Routes workstreams proceed independently without drifting apart.

## Workstreams

### 1. UI Workstream

Owns:

- Claude Design drop zone.
- React/Vite frontend.
- Browser-side UI state and interactions.
- Frontend API client wrapper.
- Component tests and UI smoke checks.

Does not own:

- Backend server setup.
- Backend route behavior.
- `photoapp.py` integration.
- AWS credentials or server config.

### 2. Server Foundation Workstream

Owns:

- Local Express server application skeleton.
- Static web app hosting from `frontend/dist`.
- Local run commands.
- Docker/runtime wiring.
- Server project structure.

Does not own:

- Final UI design.
- All detailed `/api/*` route behavior.
- AWS SDK + `mysql2` service-module implementation (owned by API Routes).

### 3. API Routes Workstream

Owns:

- `/api/*` Express routes.
- Request validation and response shaping.
- Tuple/row-to-object converters and envelope helpers.
- PhotoApp service module (Node-native AWS SDK + `mysql2` orchestration).
- Multipart upload middleware (multer).
- Error/status-code mapping.
- Server unit, integration, and smoke tests for API behavior.

Does not own:

- React component structure.
- Claude Design conversion.
- Static asset build process except where needed for server integration.

### UI Primitive Set

The Frontend MVP (Andrew, 2026-04-26, in `ClaudeDesignDrop/raw/MBAi-460/`) ships a working primitive set the UI Workstream carries forward — re-stacking the styling layer per Q7 (TS strict + Tailwind + shadcn/ui + Zustand) while preserving the component boundaries and behaviors:

**MVP carry-forward (Part 03 in scope):**

| Primitive | Andrew's source | MVP carry-forward |
|---|---|---|
| Toast (`ToastProvider` / `useToast`) | `src/shell.jsx` | TS rewrite; same tone variants, auto-dismiss, bottom-right stack. (Selective shadcn `Toaster` if it accelerates the upload/delete flows; otherwise custom.) |
| Modal | `src/shell.jsx` | shadcn `Dialog` (ESC-to-close, focus return, click-outside) — used for delete confirmation. |
| TopBar | `src/shell.jsx` | TS rewrite; **MVP shape**: wordmark + avatar (shadcn `DropdownMenu`, driven by `mockAuth` flag from Zustand store). ⌘K trigger, tweaks toggle, and notifications bell are **omitted** in MVP — see deferred-primitives note below. |
| LeftRail | `src/shell.jsx` | TS rewrite; Workspace / You / Help groups; route-active highlighting. (Admin group is auth-gated; deferred.) |
| PageHeader | `src/shell.jsx` | TS rewrite; title + subtitle + breadcrumbs + actions slot |
| Library (grid + list) | `src/library.jsx` | TS rewrite; Tailwind grid; filter, sort, view toggle, empty state, search input in page header. (Batch select is polish; deferred.) |
| AssetCard / ListView | `src/library.jsx` | TS rewrite; **photo cards** render Rekognition labels (top 3 + "+N" pill); **document cards** render metadata (filename, size, date, kind badge) + an "OCR coming soon" placeholder where the labels/excerpt would go. Real OCR excerpts on document cards are Future-State (per Q9 — Documents + Textract workstream replaces the placeholder). |
| LoginScreen / RegisterScreen | `src/auth.jsx` | TS rewrite as **non-blocking visual scaffolds** (Q10); shadcn `Input`; password-rules checklist |

**Deferred primitives** (kept in their Future-State workstream docs; not in Part 03 MVP):

- **CommandPalette** (⌘K launcher) → `Future-State-command-palette-workstream.md`. The MVP search lives as a Library-header input (Phase 7.5 of `01-ui-workstream.md`).
- **TweaksPanel** (theme / accent / density / mock-data seed controls) → `Future-State-tweaks-panel-workstream.md`. Design-time helper; not assignment-critical.
- **Full shadcn/Radix primitive migration** (replacing every Andrew custom primitive) → `Future-State-shadcn-primitive-migration-workstream.md`. MVP uses shadcn selectively (initial target: Button, Input, Dialog, plus DropdownMenu/Toast on demand).
- TopBar's ⌘K trigger, tweaks toggle, and notifications bell are removed from the MVP TopBar (rather than left as no-op visual elements) so the demo doesn't surface UX traps.

Design tokens live in `src/tokens.css` and are translated into a `tailwind.config.ts` theme (Q7). `src/data.jsx` exposes `window.MOCK` for demo runs; the production frontend imports test fixtures from `__tests__/fixtures/` rather than referencing the global.

These are the **ground-truth visual contract**. The production implementation re-stacks the styling layer (Tailwind + custom primitives — shadcn descoped 2026-04-27 per R1) but should preserve the component boundaries and keyboard/accessibility behaviors.

## Naming Conventions

Three forms of "MBAi" appear across this project. They all refer to the same lab; choose by context:

| Form | Where it appears | Why |
|---|---|---|
| **`MBAi 460`** (with space) | User-facing copy: TopBar wordmark, login screen subhead, `<title>` tag, anywhere a human reads it. Also Andrew's brand placeholder throughout `UI-Design-Requirements.md`. | Reads as a course name; matches the brand placeholder. |
| **`MBAi-460`** (hyphenated) | Andrew's original drop-folder name (`ClaudeDesignDrop/raw/MBAi-460/`); occasional cross-references in his spec when a kebab-case identifier is wanted. | Filesystem-safe variant of the brand. Not used in our shipped MVP code. |
| **`MBAi460-Group1`** | The GitHub repo name (`git@github-personal:ebber/MBAi460-Group1.git`); paths like `MBAi460-Group1/projects/project01/Part03/...` in commit messages and docs. | No spaces (URL-safe), no hyphens between MBAi and 460 (matches the repo identifier convention). |

When linking files in docs, prefer **repo-relative paths from the `MBAi460-Group1` root** (e.g., `projects/project01/Part03/server/app.js`). Inside Part 03 docs, paths starting with `Part03/...` are also acceptable as a shortcut.

When writing user-facing UI copy, always use **`MBAi 460`** (with space) — this is the brand placeholder that ships in the wordmark + page title.

(Provenance: clarified 2026-04-27 during Outstanding Integrations sub-A Phase 6, in response to row 6 of `Andrew-MVP-Integration.md` flagging the naming drift.)

## Shared Architecture Rules

- Browser calls only HTTP endpoints under `/api/*` plus static website routes.
- Browser never reads `photoapp-config.ini`.
- Browser never accesses AWS credentials or AWS SDK code directly.
- There should be one local Express server process for the Part 3 app.
- The Express server reads `photoapp-config.ini` server-side (via the `ini` package) for AWS profile + RDS connection details.
- The server uses Node-native AWS SDK (`@aws-sdk/client-s3`, `@aws-sdk/client-rekognition`) for S3 + Rekognition and `mysql2` for RDS access. Part 2 `photoapp.py` is **not** imported at runtime — it is preserved as a behavioral reference only.
- Multipart browser uploads are handled by Express middleware (multer). The initial implementation buffers uploads to a temp directory or in memory; future stream-through directly to S3 is tracked as a TODO.
- The frontend uses the design-token system in `src/tokens.css` (cream paper background `#F0EEE6`, single coral accent `#CC785C`, light+dark modes, 4px-grid spacing scale, typography scale, motion tokens), translated into `tailwind.config.ts` per Q7. Component primitives come from shadcn/ui (Q7) styled with Tailwind classes that consume the theme.

## Directory Contract

Target structure:

```text
projects/project01/Part03/
  ClaudeDesignDrop/
    README.md
    raw/
    assets/
    notes/

  frontend/
    package.json
    tsconfig.json                   # "strict": true (Q7)
    tailwind.config.ts              # theme = translated tokens.css (Q7)
    index.html
    src/
      api/
        photoappApi.ts              # typed fetch wrapper for /api/*
        types.ts                    # Asset, User, Label, ApiEnvelope<T>
      components/                   # all .tsx (Q7); shadcn primitives in components/ui/
      App.tsx
      main.tsx
    dist/                           # Vite build output; served by Express

  server/
    app.js                          # Express app: middleware, mounts, exports app
    server.js                       # listen() entrypoint; imports app
    config.js                       # web service config (port, config file path)
    routes/
      photoapp_routes.js            # /api/* routes; HTTP request/response concerns
    services/
      photoapp.js                   # PhotoApp use cases: list, upload, download, labels, search, delete
      aws.js                        # AWS SDK + mysql2 client factories (formerly helper.js)
    middleware/
      upload.js                     # multer config for multipart uploads
      error.js                      # JSON error mapping
    schemas.js                      # row-to-object converters; envelope helpers
    tests/
      app.test.js
      health.test.js
      schemas.test.js
      photoapp_service.test.js
      photoapp_routes.test.js

  package.json                      # server-side: Express, mysql2, AWS SDK, multer, jest, supertest
  README.md                         # run instructions + workstream pointers

projects/project01/client/
  photoapp.py                       # Part 2 reference (NOT imported by Part 03 server)
  photoapp-config.ini               # server-side config; never loaded by browser
```

Ownership:

- UI owns `ClaudeDesignDrop/` and `frontend/`.
- Server Foundation owns `server/app.js`, `server/server.js`, `server/config.js`, static mounting, app startup, run docs, and the foundation-level test files (`server/tests/app.test.js`, `health.test.js`, `static.test.js`, `api_placeholder.test.js`).
- API Routes owns `server/routes/`, `server/services/`, `server/middleware/`, `server/schemas.js`, and the API/service-level test files (`server/tests/schemas.test.js`, `photoapp_service.test.js`, `photoapp_routes.test.js`, `live_integration.test.js`).
- `server/tests/` is co-owned: Foundation seeds the harness (`jest.config.js`, package.json `test` script); API Routes adds the bulk of behavior tests on top. Neither workstream should modify the other's test files without coordination.
- Any workstream may update `Part03/README.md`, but changes should preserve run instructions from other workstreams.

## API Contract

All API responses should be JSON except file/image download routes.

### `GET /api/ping`

Purpose:

- Check server connectivity through the PhotoApp service module (`server/services/photoapp.js` `getPing()`), which queries S3 + RDS via `services/aws.js` clients.

Success response:

```json
{
  "message": "success",
  "data": {
    "s3_object_count": 3,
    "user_count": 3
  }
}
```

Failure response:

```json
{
  "message": "error",
  "error": "human-readable failure message"
}
```

UI behavior:

- Show server health as connected/disconnected.
- Do not block rendering the whole UI if ping fails; show a useful error state.

### `GET /api/users`

Purpose:

- Return all PhotoApp users for upload user selection.

Success response:

```json
{
  "message": "success",
  "data": [
    {
      "userid": 80001,
      "username": "p_sarkar",
      "givenname": "Pooja",
      "familyname": "Sarkar"
    }
  ]
}
```

Implementation note:

- `mysql2` returns rows as objects keyed by column name; map to the documented field set in a converter helper.
- Sort by `userid` ASC.

UI behavior:

- Populate a user selector.
- Display full name and username.

### `GET /api/images`

Purpose:

- Return all images.

Optional query:

```text
?userid=80001
```

Success response:

```json
{
  "message": "success",
  "data": [
    {
      "assetid": 1001,
      "userid": 80001,
      "localname": "01degu.jpg",
      "bucketkey": "p_sarkar/uuid-01degu.jpg"
    }
  ]
}
```

Implementation note:

- `mysql2` rows map directly to the documented field set; preserve original column casing in the SQL and shape via a converter helper.
- `bucketkey` shape: `username/uuid-localname` (Part 2 convention).
- Each asset row includes `kind: "photo" | "document"` (per Q8). Server-derived from the file extension at upload time: image extensions (`.jpg|.jpeg|.png|.heic|.heif`) → `"photo"`; **everything else** (including `.pdf`, `.txt`, unknown / extensionless) → `"document"`. Stored as a column on the `assets` table; not client-supplied.
- **Part 03 accepts ALL file types.** Multer applies only a 50 MB size limit; no MIME filter. Photos go through Rekognition `DetectLabels` and produce label rows; documents are stored in S3 + DB with `kind='document'` and **no labels** (Textract OCR for documents is Future-State per Q9; existing document rows can be retroactively OCR'd when that workstream lands). UI uses `kind` to render photo cards (with Rekognition labels) vs. document cards (with metadata + "OCR processing coming soon" placeholder in Part 03).

Example response with `kind`:

```json
{
  "message": "success",
  "data": [
    {
      "assetid": 1001,
      "userid": 80001,
      "localname": "01degu.jpg",
      "bucketkey": "p_sarkar/uuid-01degu.jpg",
      "kind": "photo"
    }
  ]
}
```

UI behavior:

- Render gallery/list.
- Allow filter by selected user if useful.

### `POST /api/images`

Purpose:

- Upload a browser-selected image for a selected user.

Request:

- `multipart/form-data`
- Field: `userid`
- Field: `file`

Success response:

```json
{
  "message": "success",
  "data": {
    "assetid": 1001
  }
}
```

Failure examples:

```json
{
  "message": "error",
  "error": "no such userid"
}
```

Implementation note:

- Multer middleware accepts the multipart `file` field; initial implementation buffers to disk in a temp directory (parity with Part 2 semantics).
- Service then performs the shared upload path: validates `userid` exists, derives `kind`, generates `bucketkey = <username>/<uuid>-<localname>`, uploads the buffer to S3, and inserts the asset row in MySQL.
- If `kind === "photo"`: call Rekognition `DetectLabels` and insert label rows in MySQL.
- If `kind === "document"`: skip Rekognition and insert no label rows. Textract OCR is Future-State; document rows can be OCR'd retroactively when that workstream lands.
- Temp file is cleaned up after success or failure (do not rely on multer auto-cleanup alone).

UI behavior:

- Require user and file before enabling upload.
- Show loading state during upload.
- Refresh image list after success.

### `GET /api/images/{assetid}/file`

Purpose:

- Return the actual image file for preview/download.

Response:

- File response with image bytes.
- `Content-Type` should be best-effort based on file extension or detected MIME type.
- `404` or JSON error if asset does not exist.

Implementation note:

- Service looks up `bucketkey` from the assets table; missing → 404.
- Streams the S3 object body directly to the Express response (`response.setHeader('Content-Type', …)` + `s3GetResponse.Body.pipe(response)`); avoids a temp-file roundtrip.
- `Content-Type` is best-effort from `localname` extension or S3 `ContentType` if available.

UI behavior:

- Use route as preview `src` or download link.
- If preview fails, show fallback text.

### `GET /api/images/{assetid}/labels`

Purpose:

- Return labels for a given image.

Success response:

```json
{
  "message": "success",
  "data": [
    {
      "label": "Animal",
      "confidence": 99
    }
  ]
}
```

Implementation note:

- SQL: `SELECT label, confidence FROM labels WHERE assetid = ? ORDER BY confidence DESC`.
- Missing assetid → 404.

UI behavior:

- Show labels for selected image.
- If no labels, show empty-state message.

### `GET /api/search?label={label}`

Purpose:

- Search images by label text.

Success response:

```json
{
  "message": "success",
  "data": [
    {
      "assetid": 1001,
      "label": "Animal",
      "confidence": 99
    }
  ]
}
```

Implementation note:

- SQL joins `assets` and `labels` on `assetid`; filter `labels.label LIKE ?` or `= ?` per scope decision.
- Empty/whitespace-only `label` → **400 always** at the route boundary. The service may also raise `Error('label is required')` defensively; the route validates first.

UI behavior:

- Search input calls endpoint on submit or debounced interaction.
- Empty search should not spam backend.

### `DELETE /api/images`

Purpose:

- Delete all images and labels.

Success response:

```json
{
  "message": "success",
  "data": {
    "deleted": true
  }
}
```

Implementation note:

- **Order: DB-first, S3-second** (per Part 2 semantics): `DELETE FROM labels`, `DELETE FROM assets`, then `S3 DeleteObjects` for every bucketkey collected before the DB delete. Keeps S3 ↔ DB consistent if the second step fails.
- Use `S3 DeleteObjects` (batched) where possible.

UI behavior:

- Require confirmation.
- Refresh image list after success.
- Show warning that this is destructive.

## Error Contract

Use consistent response shape:

```json
{
  "message": "error",
  "error": "human-readable failure message"
}
```

Status code guidance:

- `200`: success.
- `400`: invalid user input, missing file, bad query, known `ValueError`.
- `404`: missing asset where route is asset-specific.
- `500`: unexpected server error.
- `503`: backend dependency unavailable, if distinguishable.

UI should never depend on raw traceback text.

## TDD And Verification Expectations

### UI Workstream

Unit tests:

- API client calls correct endpoint and handles success/error responses.
- Components render expected state from props.
- Components call handlers on user actions.
- Upload/delete controls enforce required confirmation/inputs.

Integration tests:

- App renders with mocked API responses.
- App handles backend unavailable state.
- App refreshes image list after upload/delete.

Smoke tests:

- Start frontend dev server.
- Load app in browser.
- Confirm placeholder or real backend state displays correctly.

### Server Foundation Workstream

Unit tests (Jest + supertest):

- App imports cleanly and exports an Express `app` instance.
- Static route returns `index.html` when `frontend/dist` exists.
- App mounts API router under `/api` (placeholder before API Routes work).
- Health route behaves predictably.

Integration tests:

- Build frontend and serve it through Express static middleware.
- Confirm `GET /` returns HTML.
- Confirm `GET /assets/*` returns JS/CSS.

Smoke tests:

- Run one local command to start server (`npm start`).
- Open browser at local port.
- Confirm app loads from built assets (no Vite dev server needed at runtime).

### API Routes Workstream

Unit tests (Jest):

- Row-to-object converter helpers.
- Envelope helpers (`successResponse` / `errorResponse`).
- Request validation and error mapping.
- Service methods call AWS SDK / `mysql2` clients with expected values (use mocked clients).
- Multipart upload middleware writes and cleans temp uploads.

Integration tests (Jest + supertest):

- API routes against the Express app with stubbed service module.
- Upload route accepts multipart file.
- File route returns image bytes / streamed response.
- Error paths return documented JSON envelope shape.

Smoke tests:

- Run server against real Part 2 config.
- Call `/api/ping`.
- Call `/api/users`.
- Upload a known image.
- List images.
- Fetch labels.
- Search by known label.
- Download/preview image.
- Delete all images.

## Cross-Workstream Checkpoints

### Checkpoint 1: Skeleton Contract

Before deep UI or API work:

- [ ] `Part03/frontend` exists.
- [ ] `Part03/server` exists with `app.js`, `server.js`, `routes/`, `tests/`.
- [ ] `GET /` can serve either placeholder or built frontend.
- [ ] `GET /api` returns the placeholder envelope; `/api/ping` contract is agreed, even if mocked.
- [ ] UI has `photoappApi.ts` wrapper (typed; envelope-aware).
- [ ] Server has `/api` placeholder router mounted.

### Checkpoint 2: Mock Integration

Before real Part 2 integration:

- [ ] UI can render users/images from mocked API responses.
- [ ] Backend can return mock JSON matching this contract.
- [ ] Upload form can send multipart request to a stub route.
- [ ] Delete/search/labels UI paths can call expected endpoints.

### Checkpoint 3: Real Integration

Before demo recording:

- [ ] Server connects to RDS, S3, and Rekognition successfully (live config).
- [ ] `/api/ping` works against live config.
- [ ] `/api/users` returns seeded users.
- [ ] Upload creates an image and asset ID.
- [ ] Gallery refreshes after upload.
- [ ] Labels/search work after upload.
- [ ] Download/preview returns image file.
- [ ] Delete/reset clears images.

### Checkpoint 4: Submission Readiness

Before Canvas submission:

- [ ] UI demonstrates every required Part 2 function.
- [ ] `npm test` passes.
- [ ] frontend build passes.
- [ ] backend tests pass.
- [ ] smoke test against real backend passes.
- [ ] README run instructions are accurate.
- [ ] Zip contains implementation files needed to run UI.
- [ ] Reflection includes framework choice, run instructions, and AI usage.

## Shared Open Questions

- Which exact Docker command should be the canonical demo command for the video teammate?
- Should the server return `bucketkey` to the UI in `/api/images` responses, or hide it as server-internal metadata?
- For `/api/images/{assetid}/file`: stream S3 object body directly into the Express response, or buffer to memory first? (Initial direction: stream.)
- Should the server validate request shapes with a schema library (`zod`/`joi`/`ajv`), or rely on per-route checks for assignment speed?
- Do we need a mock mode for UI demos if AWS is temporarily unavailable?

(Resolved: local dev uses built assets only — no Vite proxy. Resolved: response envelope `{message, data}`/`{message, error}`. Resolved: `/api/*` URL prefix. See `refactor-log.md` 2026-04-26.)

## Change Control

If a workstream needs to change:

- endpoint path
- response JSON shape
- directory ownership
- run command
- shared test command

then update this document first, then update the affected workstream approach docs.

## Footnote: Implementation Provenance

On 2026-04-25, merged collaborator work from `origin/main` provided a Project 2 Express web-service baseline and Streamlit UI reference. Useful files were copied into `projects/project01/Part03` to accelerate implementation while keeping Part 3 self-contained for submission.

On 2026-04-26, the team committed to **Express/Node** as the Part 03 backend (rather than the FastAPI/Python target initially described). Decision drivers: future compatibility with the Project 2 baseline, avoidance of a Python↔Node bridge, alignment with collaborator team. See `refactor-log.md` 2026-04-26 for the full Q1–Q6 decision record.

This provenance does not change the functional contract above. Executors should implement and verify the behavior described in this document — endpoint shapes, response envelope, ownership boundaries, and TDD discipline.

Copied baseline locations (Project 2 → Part 03, 2026-04-25):

- `projects/project01/Part03/server/`
- `projects/project01/Part03/package.json`
- `projects/project01/Part03/MetaFiles/Reference/project02-streamlit-gui.py`
- `projects/project01/Part03/MetaFiles/Reference/project02-client-photoapp.py`

Refactor decisions and cleanup notes belong in `projects/project01/Part03/MetaFiles/refactor-log.md`.

On 2026-04-26 (later same day), Andrew Tapple's "Frontend MVP" commit (`1f3c067`) landed via merge commit `e76d4d9`. The Claude Design export + the 1609-line `UI-Design-Requirements.md` spec independently arrived at Express + React + AWS SDK v3 + MySQL2, validating the Q1–Q6 decisions. Components live at `ClaudeDesignDrop/raw/MBAi-460/src/` as the visual contract; the spec is preserved at `ClaudeDesignDrop/raw/MBAi-460/uploads/UI-Design-Requirements.md` as authoritative product/UI requirements. The Part-03-relevant subset is distilled into `01-ui-workstream.md`; broader vision is split into four focused Future-State approach docs (auth + account management, documents + Textract, chat, production hardening) — index at `Future-State-roadmap.md`. Q7 (frontend stack: TS strict + Tailwind + shadcn + Zustand + Vitest+RTL; defer TanStack Query + axe-core CI gate; **Playwright E2E descoped 2026-04-27 to `Future-State-playwright-e2e-workstream.md`**), Q8 (asset `kind` server-derived from extension), Q9 (Textract deferred), and Q10 (Login/Register non-blocking) resolved 2026-04-26 — see `DesignDecisions.md`.
