# UI Workstream Approach

> **For agentic workers:** This workstream should be implemented with test-first behavior where practical. Before adding UI behavior, write or update a test that describes the expected rendered state, event, or API call. If visual conversion is exploratory, isolate that exploration, then lock behavior with tests before integrating.

## Goal

Convert the Claude Design output into a maintainable React/Vite frontend that renders the PhotoApp UI and communicates with the FastAPI backend through `/api/*` calls.

## Scope

This workstream owns the browser-facing application only:

- Create a safe drop zone for Claude Design export files.
- Bring the Claude Design output into the repository.
- Convert static HTML/CSS/JS into React/Vite structure.
- Build reusable UI components for the PhotoApp workflows.
- Wire components to the frontend API client.
- Add tests and smoke checks so the UI can be validated independently from the backend where possible.

This workstream does **not** own:

- FastAPI server setup.
- Backend route implementation.
- `photoapp.py` integration.
- Docker server runtime.
- AWS/RDS/S3/Rekognition behavior.

Those belong to the Server Foundation and API Routes workstreams.

## Dependencies

This workstream can begin with mock data before the backend is complete.

It depends on the coordination/API contract doc for endpoint names and response shapes. Until real endpoints exist, the UI should call a frontend API module that can be mocked in tests.

Expected API contract:

- `GET /api/ping`
- `GET /api/users`
- `GET /api/images`
- `GET /api/images?userid={userid}`
- `POST /api/images`
- `GET /api/images/{assetid}/file`
- `GET /api/images/{assetid}/labels`
- `GET /api/search?label={label}`
- `DELETE /api/images`

## Target Files

Create or modify:

- `projects/project01/Part03/frontend/`
- `projects/project01/Part03/frontend/src/main.jsx`
- `projects/project01/Part03/frontend/src/App.jsx`
- `projects/project01/Part03/frontend/src/api/photoappApi.js`
- `projects/project01/Part03/frontend/src/components/UserSelector.jsx`
- `projects/project01/Part03/frontend/src/components/UploadPanel.jsx`
- `projects/project01/Part03/frontend/src/components/ImageGallery.jsx`
- `projects/project01/Part03/frontend/src/components/LabelSearch.jsx`
- `projects/project01/Part03/frontend/src/components/StatusPanel.jsx`
- `projects/project01/Part03/frontend/src/styles/`
- `projects/project01/Part03/frontend/tests/` or colocated component tests

Create a design drop zone:

- `projects/project01/Part03/ClaudeDesignDrop/`

Optional staging folders:

- `projects/project01/Part03/ClaudeDesignDrop/raw/`
- `projects/project01/Part03/ClaudeDesignDrop/notes/`
- `projects/project01/Part03/ClaudeDesignDrop/assets/`

## Workstream Rules

- Do not put AWS credentials, database config, or `photoapp-config.ini` in frontend code.
- Do not call `photoapp.py` from frontend code.
- Frontend talks only to `/api/*`.
- Preserve visual intent from Claude Design, but prefer React component boundaries over copying static HTML verbatim.
- If conversion becomes difficult, create a project TODO and preserve the raw design files rather than blocking the whole workstream.
- Keep the public UI simple enough for the assignment demo: all API functions must be demonstrable.

---

## Phase 1: Create Claude Design Drop Zone

### Task 1.1: Make directory for Claude Design output

**Files:**

- Create: `projects/project01/Part03/ClaudeDesignDrop/README.md`
- Create: `projects/project01/Part03/ClaudeDesignDrop/raw/`
- Create: `projects/project01/Part03/ClaudeDesignDrop/assets/`
- Create: `projects/project01/Part03/ClaudeDesignDrop/notes/`

**Steps:**

- [ ] Create the drop-zone folders.
- [ ] Add a README explaining what collaborators should place there.
- [ ] State that raw Claude Design files are source material, not the final app structure.
- [ ] State that secrets/config must not be added.

Suggested README content:

```markdown
# Claude Design Drop Zone

Place exported Claude Design files here before React integration.

Expected contents:

- `raw/` - original exported HTML/CSS/JS files
- `assets/` - images, icons, fonts, or static visual assets
- `notes/` - screenshots, export notes, design prompts, or integration observations

Rules:

- Do not place AWS credentials, database config, or `photoapp-config.ini` here.
- Preserve the original export as much as possible.
- Integration work should happen in `../frontend/`, not directly in this raw drop zone.
```

**Check your work:**

- Unit: not applicable.
- Integration: confirm the folder exists and the README is clear.
- Smoke: collaborator can understand where to drop files without asking for repo context.

---

## Phase 2: Export Claude Design Output

### Task 2.1: Receive and preserve raw design export

**Files:**

- Modify: `projects/project01/Part03/ClaudeDesignDrop/raw/*`
- Modify: `projects/project01/Part03/ClaudeDesignDrop/assets/*`
- Create if useful: `projects/project01/Part03/ClaudeDesignDrop/notes/export-notes.md`

**Steps:**

- [ ] Ask collaborator to export or commit the Claude Design HTML/CSS/JS.
- [ ] Preserve the raw files before editing.
- [ ] Add notes describing the export source and any known dependencies.
- [ ] Identify whether design output is plain static HTML/CSS/JS, React-ish JSX, Tailwind, CDN-based, or framework-specific.

Suggested `export-notes.md` content:

```markdown
# Claude Design Export Notes

## Source

Exported from Claude Design by: <name>
Date: <date>

## File Type

- [ ] Plain HTML/CSS/JS
- [ ] React/JSX
- [ ] Tailwind classes
- [ ] External CDN dependencies
- [ ] Other

## Known Issues

- List missing assets, broken paths, or design assumptions here.

## Integration Notes

- Components likely needed:
  - User selector
  - Upload panel
  - Image gallery
  - Label/search panel
  - Status/error panel
```

**Check your work:**

- Unit: not applicable.
- Integration: open raw HTML locally if possible and confirm assets load.
- Smoke: take one screenshot of the raw design rendering or note why it cannot render yet.

---

## Phase 3: Bootstrap React/Vite Frontend

### Task 3.1: Create React/Vite app skeleton

**Files:**

- Create: `projects/project01/Part03/frontend/package.json`
- Create: `projects/project01/Part03/frontend/index.html`
- Create: `projects/project01/Part03/frontend/src/main.jsx`
- Create: `projects/project01/Part03/frontend/src/App.jsx`

**Test-first expectation:**

Before adding meaningful components, add a simple render test that proves the app shell renders.

Suggested test:

```jsx
import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renders PhotoApp application shell', () => {
  render(<App />);
  expect(screen.getByText(/PhotoApp/i)).toBeInTheDocument();
});
```

**Steps:**

- [ ] Add frontend dependencies.
- [ ] Add minimal app shell.
- [ ] Write failing app-shell test.
- [ ] Run test and verify failure.
- [ ] Implement minimal shell.
- [ ] Run test and verify pass.
- [ ] Run `npm run build`.

**Check your work:**

- Unit: app shell test passes.
- Integration: `npm run build` creates `frontend/dist`.
- Smoke: open Vite dev server and confirm the placeholder app renders.

---

## Phase 4: Create Frontend API Client

### Task 4.1: Add frontend API wrapper

**Files:**

- Create: `projects/project01/Part03/frontend/src/api/photoappApi.js`
- Create: `projects/project01/Part03/frontend/src/api/photoappApi.test.js`

**Purpose:**

Centralize all `fetch()` calls so React components do not hardcode endpoint behavior everywhere.

Expected functions:

- `getPing()`
- `getUsers()`
- `getImages(userid)`
- `uploadImage(userid, file)`
- `getImageFileUrl(assetid)`
- `getImageLabels(assetid)`
- `searchImages(label)`
- `deleteImages()`

**Test-first examples:**

```js
test('getUsers calls /api/users and returns parsed JSON', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ message: 'success', data: [] }),
  });

  const result = await getUsers();

  expect(fetch).toHaveBeenCalledWith('/api/users');
  expect(result).toEqual({ message: 'success', data: [] });
});
```

```js
test('uploadImage sends userid and file as FormData', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ message: 'success', assetid: 1001 }),
  });

  const file = new File(['fake'], 'test.jpg', { type: 'image/jpeg' });
  await uploadImage(80001, file);

  expect(fetch).toHaveBeenCalledWith(
    '/api/images',
    expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData),
    })
  );
});
```

**Check your work:**

- Unit: API client tests pass with mocked `fetch`.
- Integration: once backend exists, call `/api/ping` from the browser console through `photoappApi.getPing()`.
- Smoke: frontend displays a friendly error if backend is unavailable.

---

## Phase 5: Convert Claude Design Into React Structure

### Task 5.1: Map design sections to React components

**Files:**

- Create/modify components under `frontend/src/components/`
- Modify: `frontend/src/App.jsx`
- Modify: frontend styles under `frontend/src/styles/`

Likely components:

- `StatusPanel.jsx`
- `UserSelector.jsx`
- `UploadPanel.jsx`
- `ImageGallery.jsx`
- `ImageCard.jsx`
- `LabelSearch.jsx`
- `LabelsPanel.jsx`
- `DangerZone.jsx`

**Steps:**

- [ ] Read raw Claude Design files.
- [ ] Identify stable visual sections.
- [ ] Move static markup into React components.
- [ ] Keep visual class names/styles where reasonable.
- [ ] Replace hardcoded demo data with props.
- [ ] Preserve design assets under `frontend/src/assets/` or `frontend/public/` as appropriate.

**If difficult:**

Create a project TODO instead of blocking:

```markdown
- [ ] Refactor Claude Design static markup into smaller React components. Current fallback is a mostly-static React port with behavior wired at the page level.
```

**Test-first examples:**

For `UserSelector`:

```jsx
test('renders users and calls onSelect when a user is chosen', async () => {
  const users = [
    { userid: 80001, username: 'p_sarkar', givenname: 'Pooja', familyname: 'Sarkar' },
  ];
  const onSelect = vi.fn();

  render(<UserSelector users={users} selectedUserId="" onSelect={onSelect} />);

  await userEvent.selectOptions(screen.getByLabelText(/user/i), '80001');

  expect(onSelect).toHaveBeenCalledWith(80001);
});
```

For `UploadPanel`:

```jsx
test('disables upload until user and file are selected', () => {
  render(<UploadPanel selectedUserId="" onUpload={vi.fn()} />);
  expect(screen.getByRole('button', { name: /upload/i })).toBeDisabled();
});
```

**Check your work:**

- Unit: each component has at least one behavior/render test.
- Integration: `App.jsx` can render all major sections with mock data.
- Smoke: design visually resembles Claude Design output in the browser.

---

## Phase 6: Wire UI Workflows

### Task 6.1: App startup and health state

**Behavior:**

On page load, the app should:

- Call `getPing()`.
- Load users.
- Load current images.
- Show loading and error states clearly.

**Files:**

- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/api/photoappApi.js`
- Add/update tests.

**Check your work:**

- Unit: app shows loading, success, and error states with mocked API responses.
- Integration: with backend running, page loads users/images from real API.
- Smoke: reload browser and confirm app recovers cleanly.

### Task 6.2: Upload workflow

**Behavior:**

User selects a user and image file, clicks upload, then sees the new image appear.

**Check your work:**

- Unit: upload button calls `uploadImage(userid, file)`.
- Integration: against backend, upload returns an `assetid` and refreshes image list.
- Smoke: upload one known class image and confirm it appears in gallery.

### Task 6.3: Labels and search workflow

**Behavior:**

User can view labels for an image and search images by label text.

**Check your work:**

- Unit: label search calls `searchImages(label)`.
- Unit: empty search input disables or avoids unnecessary search.
- Integration: search known label after upload.
- Smoke: upload image, inspect labels, search for a visible label.

### Task 6.4: Download/preview workflow

**Behavior:**

User can download or preview an image through backend route.

**Check your work:**

- Unit: image card uses `/api/images/{assetid}/file` as preview/download source.
- Integration: browser can display or download the returned file.
- Smoke: upload image, refresh page, preview/download still works.

### Task 6.5: Delete/reset workflow

**Behavior:**

User can delete all images through the UI after confirmation.

**Check your work:**

- Unit: confirmation flow prevents accidental delete.
- Unit: confirmed delete calls `deleteImages()`.
- Integration: backend clears images and UI refreshes to empty state.
- Smoke: upload two images, delete all, confirm gallery is empty.

---

## Phase 7: UI Acceptance Checklist

Before handing off the UI workstream:

- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] App renders with backend unavailable and shows a useful error.
- [ ] App renders with backend available and loads users/images.
- [ ] Upload workflow works.
- [ ] Label workflow works.
- [ ] Search workflow works.
- [ ] Download/preview workflow works.
- [ ] Delete/reset workflow works.
- [ ] No frontend file contains AWS keys, DB credentials, or `photoapp-config.ini` values.
- [ ] Visual result is close enough to Claude Design to use in the project video.
- [ ] Any skipped conversion details are captured as explicit TODOs.

## Suggested Commit Points

- After creating Claude Design drop zone.
- After frontend skeleton and first passing test.
- After API client tests pass.
- After static design is converted into React components.
- After each major workflow: upload, labels/search, download, delete.
- After final UI smoke test.

## Open Questions

- Are Claude Design files plain HTML/CSS/JS, or generated from a framework?
- Does the design include external CDN assets that should be vendored locally?
- Should the UI prioritize gallery thumbnails, table/list layout, or both?
- Should image previews use direct backend file routes or explicit download buttons only?
- Do we need a "demo mode" with mock data for development before backend routes exist?
