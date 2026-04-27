# Part 03 — Human Feature Test Suite

> **Purpose:** Hand-on-keyboard acceptance walk for the Part 03 PhotoApp UI MVP. Each section is a discrete test you (the human) walk through, with explicit setup, steps, and expected results. Tick the `[ ]` next to each test ID as you confirm it.
> **Audience:** Erik (or any reviewer) verifying the implementation. Companion to `README.md` (which covers backend-only CLI testing).
> **Source of acceptance criteria:** `MetaFiles/plans/01-ui-workstream-plan.md` Phase 8.1 (acceptance items L1–A11Y1).
> **Last updated:** 2026-04-27.

---

## Before you begin

### One-time setup

1. Backend deps installed (from `Part03/`):

   ```bash
   cd ~/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03
   npm install
   ```

2. Frontend deps installed + production build present (from `Part03/frontend/`):

   ```bash
   cd ~/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend
   npm install
   npm run build
   ```

   This produces `Part03/frontend/dist/` which Express's static middleware serves.

3. AWS credentials present at `projects/project01/client/photoapp-config.ini` (already there from Part 02; contains `[s3]`, `[rds]`, `[s3readwrite]` sections).

### Each session

1. **Terminal A** — start the server (foreground):

   ```bash
   cd ~/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03
   npm start
   ```

   Expected output: `**Web service running, listening on port 8080...**`. Leave this terminal running for the duration of the walk.

2. **Browser** — open http://localhost:8080.

### Test data to have on hand

| For test | Need |
|---|---|
| U1, A1, LIB3 | A small JPEG (any photo). Rekognition usually returns 5+ labels per photo, which exercises LIB3's overflow pill. |
| U3, A2, LIB4 | A small PDF. |
| U4 | A file >50 MB (any large video / zip / dataset). |

---

## Routing & Auth (L1–L3)

### `[ ]` L1 — Default route redirects to `/library`

**Steps:**

1. In a fresh browser tab, type `http://localhost:8080/` and press Enter.

**Expected:**

- URL bar updates to `http://localhost:8080/library`.
- Library page renders: asset grid, "MBAi 460" wordmark in TopBar, LeftRail visible on the left.
- **No login interception** — you are NOT redirected to `/login` (Q10 non-blocking auth).

---

### `[ ]` L2 — Login + Register reachable; submit toggles mockAuth

**Steps:**

1. Navigate to `http://localhost:8080/login`.
2. Confirm the LoginScreen renders with a "Sign in" heading.
3. Type any value in the username field (e.g., `erik`) and any password.
4. Click the "Sign in" submit button.
5. Open React DevTools → Components → find the Zustand `useUIStore` (or inspect via the store's getState() in the browser console: `useUIStore.getState()`).
6. Navigate to `http://localhost:8080/register`. Confirm RegisterScreen renders.

**Expected:**

- LoginScreen renders without errors.
- After Sign-in submit, the Zustand store shows `mockAuth.isMockAuthed === true` and `mockAuth.givenname === "erik"` (or whatever you typed). No network request to a real auth endpoint.
- RegisterScreen renders without errors. (Submit handler is a visual scaffold per Q10 — non-blocking.)

---

### `[ ]` L3 — All in-scope routes render without auth gate

**Steps:** In a fresh incognito window (or after clearing localStorage to defeat prior mockAuth state), visit each URL directly:

- http://localhost:8080/library
- http://localhost:8080/upload
- http://localhost:8080/profile
- http://localhost:8080/help
- http://localhost:8080/asset/&lt;id&gt; (pick a real asset id from the Library grid)

**Expected:**

- Each route renders its own page content without redirecting to `/login`.
- TopBar wordmark + LeftRail remain consistently visible across all routes.
- Visiting an unknown route (e.g., `/random-path`) shows the 404 page (not the SPA's empty shell).

---

## Library (LIB1–LIB4)

### `[ ]` LIB1 — Library first-paints in &lt;2s with ≤50 assets

**Steps:**

1. Open DevTools (Cmd+Option+I) → Network tab. Disable cache.
2. Hard-refresh `/library` (Cmd+Shift+R).
3. Watch the page render the asset grid.

**Expected:**

- Asset grid fully visible within 2 seconds of page load.
- The `/api/images` request in the Network tab returns ≤50 results (check Response → preview).
- No noticeable layout shift after the grid renders.

---

### `[ ]` LIB2 — Grid responsive (2 / 3 / 4 / 5 cols at breakpoints)

**Steps:**

1. DevTools → Toggle device toolbar (Cmd+Shift+M).
2. Resize the viewport across these widths and count grid columns:
   - <480 px
   - 480–768 px
   - 768–1024 px
   - ≥1024 px

**Expected:**

- 2 cols at <480
- 3 cols at 480–768
- 4 cols at 768–1024
- 5 cols at ≥1024

---

### `[ ]` LIB3 — Photo cards show ≤3 labels with "+N" overflow pill

**Setup:** Find a photo asset in Library that has >3 Rekognition labels. Most uploaded JPGs produce 5+ labels; verify by clicking through to Asset Detail (A1) and counting labels there if needed.

**Steps:**

1. Return to `/library`.
2. Locate the photo card for the asset with >3 labels.
3. Inspect the chips/labels rendered on the card.

**Expected:**

- The card shows at most 3 label chips.
- A "+N" overflow pill (e.g., "+2") appears at the end indicating the number of additional labels not shown.

---

### `[ ]` LIB4 — Document cards render metadata + "OCR coming soon" placeholder

**Setup:** Upload a PDF first via U3 below so at least one document asset exists in Library.

**Steps:**

1. Return to `/library`.
2. Locate the document card.
3. Inspect the rendered card content.

**Expected:**

- Card shows: filename, kind badge ("Document"), "OCR coming soon" placeholder text.
- *Note:* `size` + `uploaded_at` props for document cards are wired but not yet populated by the backend asset shape — see `Part03/MetaFiles/TODO.md` "Live metadata for AssetCard document branch" for the follow-up. Filename + kind badge + OCR-placeholder are the in-scope fields for this acceptance.

---

## Upload (U1–U4)

### `[ ]` U1 — Upload a JPG → assetid returned → library refreshes with new card + labels

**Steps:**

1. Navigate to `/upload`.
2. Click the file input (or drag a small JPG onto the drop zone).
3. Click Upload.

**Expected:**

- Success indication appears (toast or inline confirmation).
- You are routed (or auto-route) back to `/library`.
- The new photo card appears in the grid with its Rekognition labels visible.
- DevTools Network tab shows the `POST /api/images` request returned `200` with an `assetid` (number) in the response body.
- A subsequent `GET /api/images` call returns the new asset with `kind: "photo"` and `labels: [...]`.

---

### `[ ]` U2 — Upload error surfaces via toast

**Setup:** Induce a failure. Easiest: stop the Express server temporarily.

**Steps:**

1. In Terminal A, press Ctrl+C to stop the server.
2. In the browser, navigate to `/upload` and try to upload a JPG.
3. After confirming the toast, restart the server (`npm start` in Terminal A).

**Expected:**

- A toast appears with a friendly error message (e.g., "Upload failed — please try again" or similar).
- The UI does not crash; you stay on the Upload page (no white screen, no React error overlay).
- After server restart, a retry succeeds.

---

### `[ ]` U3 — Upload a PDF → document card with "OCR coming soon"

**Steps:**

1. Navigate to `/upload`.
2. Select a small PDF.
3. Click Upload.

**Expected:**

- Success indication.
- Library grid shows the new document card with kind badge + "OCR coming soon" placeholder (per Q9 — OCR via Textract is Future-State).
- DevTools Network shows `POST /api/images` returned `200` with the new asset; subsequent `GET /api/images` includes it with `kind: "document"`.

---

### `[ ]` U4 — File >50 MB → server 400 → friendly toast

**Setup:** Have a file >50 MB on disk.

**Steps:**

1. Navigate to `/upload`.
2. Select the large file.
3. Click Upload.

**Expected:**

- DevTools Network shows `POST /api/images` returned `400` (multer's `LIMIT_FILE_SIZE`).
- A toast appears with a friendly message like "File too large (50 MB max)".
- UI does not crash; you remain on the Upload page.

---

## Asset Detail (A1–A3)

### `[ ]` A1 — Photo asset detail shows labels in confidence-DESC order

**Steps:**

1. From `/library`, click any photo card.

**Expected:**

- Asset Detail page renders with the image preview and the list of Rekognition labels.
- Labels are sorted by **confidence descending** — the highest-confidence label is first.
- (Optional cross-check): in DevTools Network, find the `GET /api/images/:id/labels` response and confirm the `confidence` field decreases down the list.

---

### `[ ]` A2 — Document asset detail shows PDF preview + "OCR coming soon"

**Steps:**

1. From `/library`, click a document (PDF) card.

**Expected:**

- Asset Detail page renders.
- A PDF preview embeds inline (via `<embed>` or `<iframe>`), or a download link if the browser's PDF embed is unsupported.
- The labels area is replaced by an "OCR coming soon" empty state (no labels list, no error).

---

### `[ ]` A3 — File preview loads via `/api/images/:id/file` (no base64)

**Steps:**

1. With Asset Detail open for any asset, open DevTools → Network tab and refresh.
2. Find the request that fetches the asset's binary content.

**Expected:**

- The request URL is `http://localhost:8080/api/images/<id>/file`.
- The response Content-Type is binary (`image/jpeg`, `image/png`, `application/pdf`, etc.).
- The asset is NOT inlined as a `data:base64,...` URL anywhere in the page source.

---

## Accessibility (A11Y1)

### `[ ]` A11Y1 — Keyboard nav + focus indicators + screen reader

**Steps:** Walk the app using only the keyboard (no mouse).

1. Navigate to `/library`.
2. Press Tab repeatedly. Watch the focus ring move through controls (TopBar links, search input, asset cards, LeftRail items).
3. Press Enter or Space on a focused asset card — verify it opens Asset Detail.
4. Tab to the LeftRail's Delete-all (or Library) trigger and activate it.
5. When the Delete-all confirmation modal opens, press Tab repeatedly — verify focus stays inside the modal (focus trap). Press Esc — verify the modal closes and focus returns to the trigger.
6. (Optional) Enable VoiceOver on macOS (Cmd+F5). Navigate the app and verify landmarks are announced: header (TopBar), navigation (LeftRail), main (page content).

**Expected:**

- Every interactive control has a visible focus indicator (outline ring, color change, or similar).
- Tab order is logical (top-to-bottom, left-to-right within sections).
- Asset cards, nav links, search input, and modals are all reachable and operable via keyboard.
- Modal traps focus correctly; Esc closes it; focus returns to the trigger element.
- Screen reader announces page landmarks (header / nav / main) on each route.

---

## CLI Smoke (Tier 3+) — supplements the browser walk

These confirm the API surface from the terminal without a browser. The full walkthrough lives in `README.md` Tier 3+; the items below are the high-value subset.

### `[x]` CLI-1 — `/health` returns 200

```bash
curl -s http://localhost:8080/health
```

**Expected:** `{"status":"running"}`

---

### `[x]` CLI-2 — `/api/ping` returns counts

```bash
curl -s http://localhost:8080/api/ping | jq
```

**Expected:** Enveloped JSON `{"message":"success","data":{"s3_object_count":N,"user_count":M}}` where N and M are non-negative integers. (The envelope `{message, data}` is the universal API response shape per `server/schemas.js`.)

---

### `[x]` CLI-3 — `/api/images` returns asset list

```bash
curl -s http://localhost:8080/api/images | jq '.data | length'
```

**Expected:** Integer ≥ 0 (count of assets in the live DB; jq drills into `.data` because of the API envelope). Inspect a sample entry with `curl -s http://localhost:8080/api/images | jq '.data[0]'` — it should have `assetid`, `userid`, `localname`, `bucketkey`, `kind`.

---

### `[x]` CLI-4 — Unmatched non-API GET serves SPA `index.html`

```bash
curl -is http://localhost:8080/random-path | head -20
```

**Expected:** `200 OK`, `Content-Type: text/html`, body starts with `<!doctype html>` (the SPA shell). This confirms the SPA-fallback hotfix from Phase 7.

---

### `[x]` CLI-5 — Unmatched `/api/foo` returns 404 + JSON envelope (NOT masked by SPA HTML)

```bash
curl -is http://localhost:8080/api/foo | head -10
```

**Expected:** `404` status, `Content-Type: application/json; charset=utf-8`, body is the API envelope (e.g., `{"message":"No route for GET /api/foo"}`). Confirms two boundary properties at once: (1) the SPA fallback correctly defers `/api/*` rather than swallowing it; (2) the `/api` 404 fallback at `server/app.js` returns the same JSON envelope shape used by every other `/api/*` route. Regression-guarded by `server/tests/api_404.test.js`.

---

## Results template

When all items above are ticked, capture the run in a brief note (failures, observations, follow-ups). Suggested format:

```
Run: 2026-04-XX
Routing & Auth:    L1 ✅  L2 ✅  L3 ✅
Library:           LIB1 ✅  LIB2 ✅  LIB3 ✅  LIB4 ✅
Upload:            U1 ✅  U2 ✅  U3 ✅  U4 ✅
Asset Detail:      A1 ✅  A2 ✅  A3 ✅
Accessibility:     A11Y1 ✅
CLI Smoke:         CLI-1 ✅  CLI-2 ✅  CLI-3 ✅  CLI-4 ✅  CLI-5 ✅

Notes:
- (any deviations, observations, or follow-ups)
```

Once the run is complete, return to `Part03/MetaFiles/plans/01-ui-workstream-plan.md` Step 8.1.19 to capture the acceptance commit per the atomic-update gate.
