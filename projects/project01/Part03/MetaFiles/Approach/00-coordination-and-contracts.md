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

- FastAPI setup.
- Backend route behavior.
- `photoapp.py` integration.
- AWS credentials or server config.

### 2. Server Foundation Workstream

Owns:

- FastAPI/Uvicorn application skeleton.
- Static web app hosting from `frontend/dist`.
- Local run commands.
- Docker/runtime wiring.
- Backend project structure.

Does not own:

- Final UI design.
- All detailed `/api/*` route behavior.
- Part 2 AWS/RDS/Rekognition function implementation.

### 3. API Routes Workstream

Owns:

- `/api/*` FastAPI routes.
- Request/response schemas.
- PhotoApp service layer.
- Local file bridge.
- Part 2 adapter.
- Backend unit, integration, and smoke tests for API behavior.

Does not own:

- React component structure.
- Claude Design conversion.
- Static asset build process except where needed for server integration.

## Shared Architecture Rules

- Browser calls only HTTP endpoints under `/api/*` plus static website routes.
- Browser never reads `photoapp-config.ini`.
- Browser never imports Python code.
- FastAPI is the only local backend server process.
- `photoapp.py` is imported as a Python module, not run as a separate service.
- `photoapp.py` may call off-box AWS services through `boto3` and `pymysql`.
- The `Local File Bridge` remains in scope for the initial implementation because Part 2 expects local filenames.
- Future stream-through upload is tracked as a TODO, not part of the initial contract.

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
    index.html
    src/
      api/
        photoappApi.js
      components/
      App.jsx
      main.jsx
    dist/

  backend/
    main.py
    routes/
      photoapp_routes.py
    services/
      photoapp_service.py
      file_bridge.py
    adapters/
      part02_photoapp.py
    schemas.py
    tests/

  README.md

projects/project01/client/
  photoapp.py
  photoapp-config.ini
```

Ownership:

- UI owns `ClaudeDesignDrop/` and `frontend/`.
- Server Foundation owns `backend/main.py`, static mounting, app startup, and run docs.
- API Routes owns `backend/routes/`, `backend/services/`, `backend/adapters/`, `backend/schemas.py`, and backend tests.
- Any workstream may update `Part03/README.md`, but changes should preserve run instructions from other workstreams.

## API Contract

All API responses should be JSON except file/image download routes.

### `GET /api/ping`

Purpose:

- Check backend connectivity through `photoapp.get_ping()`.

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

- Part 2 returns tuples: `(userid, username, givenname, familyname)`.
- API Routes workstream converts tuples to objects.

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

- Part 2 returns tuples: `(assetid, userid, localname, bucketkey)`.
- API Routes workstream converts tuples to objects.

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

- Initial implementation writes upload to a temp local file.
- Then calls Part 2 `post_image(userid, local_filename)`.
- Temp file should be cleaned up after success or failure.

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

- Initial implementation allocates a temp output path.
- Calls Part 2 `get_image(assetid, temp_path)`.
- Returns file response.
- Cleanup strategy must not delete the file before FastAPI finishes sending it.

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

- Part 2 returns tuples: `(label, confidence)`.
- API converts tuples to objects.

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

- Part 2 returns tuples: `(assetid, label, confidence)`.
- API converts tuples to objects.

UI behavior:

- Search input calls endpoint on submit or debounced interaction.
- Empty search should not spam backend.

### `DELETE /api/images`

Purpose:

- Delete all images and labels through existing Part 2 behavior.

Success response:

```json
{
  "message": "success",
  "data": {
    "deleted": true
  }
}
```

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

Unit tests:

- Static route returns `index.html` when `frontend/dist` exists.
- App includes API router under `/api`.
- Health or root route behaves predictably.

Integration tests:

- Build frontend and serve it through FastAPI.
- Confirm `GET /` returns HTML.
- Confirm `GET /assets/*` returns JS/CSS.

Smoke tests:

- Run one local command to start server.
- Open browser at local port.
- Confirm app loads without Vite dev server if using built assets.

### API Routes Workstream

Unit tests:

- Tuple-to-object conversion helpers.
- Request validation and error mapping.
- Service methods call adapter with expected values.
- File bridge writes and cleans temp uploads.

Integration tests:

- API routes with FastAPI test client and stubbed adapter.
- Upload route accepts multipart file.
- File route returns bytes response.
- Error paths return documented JSON shape.

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
- [ ] `Part03/backend` exists.
- [ ] `GET /` can serve either placeholder or built frontend.
- [ ] `GET /api/ping` contract is agreed, even if mocked.
- [ ] UI has `photoappApi.js` wrapper.
- [ ] Backend has router placeholder.

### Checkpoint 2: Mock Integration

Before real Part 2 integration:

- [ ] UI can render users/images from mocked API responses.
- [ ] Backend can return mock JSON matching this contract.
- [ ] Upload form can send multipart request to a stub route.
- [ ] Delete/search/labels UI paths can call expected endpoints.

### Checkpoint 3: Real Integration

Before demo recording:

- [ ] Backend adapter initializes `photoapp.py`.
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

- Should local development use Vite dev server plus FastAPI proxy, or built assets served by FastAPI only?
- Which exact Docker command should be the canonical demo command?
- Should backend return `bucketkey` to UI, or hide it as backend/internal metadata?
- Should image preview route stream from temp file or return a generated one-time file response?
- Should API Routes use Pydantic models for every response, or simple dictionaries for assignment speed?
- Do we need a mock mode for UI demos if AWS is temporarily unavailable?

## Change Control

If a workstream needs to change:

- endpoint path
- response JSON shape
- directory ownership
- run command
- shared test command

then update this document first, then update the affected workstream approach docs.
