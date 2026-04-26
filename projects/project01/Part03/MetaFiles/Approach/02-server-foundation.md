# Server Foundation Workstream Approach

> **For agentic workers:** Execute this as a checklist. Prefer TDD for behavior-bearing server code: write the test, watch it fail, implement the smallest change, then verify it passes. Configuration-only steps still need integration or smoke checks.

## Goal

Create the local Express/Node server foundation for Project 01 Part 03: an Express app skeleton, a thin listen entrypoint, static React build serving from `frontend/dist`, an `/api` placeholder router mount, a server liveness endpoint, local run commands, and documentation that lets UI and API Routes workstreams plug in cleanly.

## Scope

This workstream owns:

- `server/app.js` (Express app: middleware, mounts, exports `app` — does **not** call `listen`).
- `server/server.js` (thin entrypoint: imports `app`, calls `listen` on `config.web_service_port`).
- `server/config.js` (already present; preserve as-is for this workstream).
- Static web app hosting from `frontend/dist`.
- Placeholder `frontend/dist/index.html` so the static host has something to serve before UI workstream produces a real Vite build.
- `server/routes/` directory and a placeholder `/api` mount.
- Server liveness endpoint `GET /health` (deliberately outside `/api/*`).
- Local run commands (`npm install`, `npm start`).
- Server-level tests (Jest + supertest) that prove the shell works before real `/api/*` business logic exists.
- `Part03/README.md` server-related sections.

This workstream does **not** own:

- Final Claude Design UI conversion.
- Detailed `/api/*` endpoint behavior (beyond the placeholder).
- AWS SDK + `mysql2` service-module implementation.
- Multipart upload middleware (`multer`).
- Error/status-code mapping middleware.

Those are owned by UI and API Routes workstreams.

## Dependencies

Read first:

- `00-coordination-and-contracts.md`
- `01-ui-workstream.md`
- `MetaFiles/refactor-log.md` (2026-04-26 Q1–Q6 Express pivot decisions)

This workstream should produce enough server structure for later workstreams to add:

- `server/routes/photoapp_routes.js`
- `server/services/photoapp.js`
- `server/services/aws.js`
- `server/middleware/upload.js`
- `server/middleware/error.js`
- `server/schemas.js`

## Target Files

Create or modify (matches the Directory Contract in `00-coordination-and-contracts.md`):

```text
projects/project01/Part03/
  server/
    app.js                          # Express app: middleware, mounts, exports app
    server.js                       # listen() entrypoint; imports app
    config.js                       # web service config (port, config file path) — preserved
    routes/
      photoapp_routes.js            # placeholder /api mount this workstream; real routes added by API Routes workstream
    tests/
      app.test.js                   # app object + middleware mounts
      health.test.js                # GET /health
      static.test.js                # GET / and GET /assets/*
      api_placeholder.test.js       # GET /api placeholder envelope

  frontend/
    dist/
      index.html                    # placeholder until UI workstream ships a Vite build
      assets/
        app.css                     # placeholder static asset

  package.json                      # adds jest + supertest devDeps; "start": "node server/server.js"
  jest.config.js                    # (optional) Jest configuration
  README.md                         # run instructions + workstream pointers
```

## Design Decisions

- One Express server process: `node server/server.js`, listening on `config.web_service_port` (8080).
- Express serves both:
  - Static web app: `GET /`, `GET /assets/*` from `frontend/dist`.
  - API routes: `/api/*` (placeholder mount this workstream; real routes added by API Routes workstream).
- `server/app.js` exports an Express app instance and **does not** call `listen()`. This is required so Jest + supertest can drive the app in-process without binding a port.
- `server/server.js` is the sole `listen()` site. It imports `app`, calls `listen(config.web_service_port)`, and logs startup.
- Mount order in `app.js` is load-bearing:
  1. JSON body parser middleware.
  2. **API router under `/api` first** (so static catchall cannot absorb `/api/*`).
  3. `express.static` mount over `frontend/dist`.
  4. Explicit `GET /` fallback that returns `frontend/dist/index.html` (SPA index).
- `GET /health` is mounted at `/health`, **not** `/api/health`. The `/api/*` namespace is reserved for the PhotoApp API contract in `00-coordination-and-contracts.md`. `/health` is a server liveness probe owned by this workstream.
- Path resolution uses `path.join(__dirname, '..', 'frontend', 'dist')`. `__dirname` for `server/app.js` is `Part03/server`, so `..` resolves to `Part03/`. This makes static serving robust to CWD as long as the file layout is preserved.
- Local dev mode is **built-only**: UI builds `frontend/dist`; Express serves it via static middleware. No Vite dev server proxy. (Recorded in `refactor-log.md` 2026-04-26 Q5.)
- Response envelope for the `/api` placeholder follows the shared contract: `{message: "success", data: {...}}` on success, `{message: "error", error: "..."}` on failure. (Recorded in `refactor-log.md` 2026-04-26 Q3.)
- Test stack is **Jest + supertest** in `devDependencies`. (Recorded in `refactor-log.md` 2026-04-26 Q4.)

---

## Phase 1: Test Toolchain Setup

### Task 1.1: Add Jest and supertest as devDependencies

**Files:**

- Modify: `projects/project01/Part03/package.json`

**Checklist:**

- [ ] Add `jest` to `devDependencies`.
- [ ] Add `supertest` to `devDependencies`.
- [ ] Add `"test": "jest"` to `scripts`.
- [ ] Confirm `"main": "server/server.js"` (or leave existing `main`, but `start` must run `server.js`).
- [ ] Add `"start": "node server/server.js"` to `scripts`.
- [ ] Run `npm install` from `Part03/`.

**Check your work:**

- Unit: not applicable.
- Integration: `npx jest --version` prints a version.
- Smoke: `npm test` runs and reports "no tests found" (expected — tests come next).

### Task 1.2: Configure Jest for the server tree

**Files:**

- Create: `projects/project01/Part03/jest.config.js` (optional; can also be a `jest` block in `package.json`).

Suggested config:

```js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/server/tests/**/*.test.js'],
};
```

**Checklist:**

- [ ] Tell Jest to look in `server/tests/`.
- [ ] Use `node` test environment (not `jsdom`).
- [ ] Confirm `npm test` still reports "no tests found" before any test file exists.

**Check your work:**

- Unit: not applicable.
- Integration: `npm test` exits cleanly with 0 tests.
- Smoke: not applicable.

---

## Phase 2: Express App Object (split listen out)

The current `server/app.js` calls `app.listen()` at module load. That has to change so Jest + supertest can import the app without binding a port.

### Task 2.1: Failing test for app object export

**Files:**

- Create: `projects/project01/Part03/server/tests/app.test.js`

**Write failing test first:**

```js
const app = require('../app');

test('app exports an Express application function', () => {
  expect(typeof app).toBe('function');
  // Express app is a function with .use, .get, .listen on it
  expect(typeof app.use).toBe('function');
  expect(typeof app.get).toBe('function');
});

test('importing app does not bind a port', () => {
  // If require('../app') called listen(), the test process would
  // already be holding a socket. We just assert the export shape;
  // the absence of a port-in-use error during repeated require()
  // is the real signal here.
  expect(app).toBeDefined();
});
```

**Checklist:**

- [ ] Add the test.
- [ ] Run `npm test`.
- [ ] Confirm it currently fails (or that loading `app.js` opens a listening socket — both are signals to refactor).

### Task 2.2: Split `app.js` and create `server.js`

**Files:**

- Modify: `projects/project01/Part03/server/app.js`
- Create: `projects/project01/Part03/server/server.js`

`server/app.js` (new shape — strip `listen()` and route handlers that belong to API Routes workstream; preserve JSON middleware):

```js
const express = require('express');
const app = express();

app.use(express.json({ strict: false, limit: '50mb' }));

// API routes mount goes here in Phase 7 (BEFORE static middleware).
// Static middleware mount goes here in Phase 5.
// SPA index fallback goes here in Phase 5.

module.exports = app;
```

`server/server.js`:

```js
const app = require('./app');
const config = require('./config');

const port = config.web_service_port;

app.listen(port, () => {
  console.log(`**Web service running, listening on port ${port}...`);
  process.env.AWS_SHARED_CREDENTIALS_FILE = config.photoapp_config_filename;
});
```

**Checklist:**

- [ ] Remove `app.listen(...)` from `app.js`.
- [ ] Remove the legacy `app.get('/', ...)` uptime handler from `app.js` (it conflicts with the SPA index in Phase 5).
- [ ] Remove the legacy `api_get_*` requires from `app.js` for now — those belong to API Routes workstream and will be re-introduced through the router placeholder in Phase 7.
- [ ] Add `module.exports = app;` at the bottom of `app.js`.
- [ ] Create `server.js` with the snippet above.
- [ ] Run `npm test`.
- [ ] Confirm `app.test.js` passes.

**Check your work:**

- Unit: `app.test.js` passes.
- Integration: `node -e "const a = require('./server/app'); console.log(typeof a);"` prints `function`.
- Smoke: `npm start` starts the server and prints the listening message.

---

## Phase 3: Server Liveness Endpoint

### Task 3.1: Failing test for `GET /health`

**Files:**

- Create: `projects/project01/Part03/server/tests/health.test.js`

**Write failing test first:**

```js
const request = require('supertest');
const app = require('../app');

test('GET /health returns running', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'running' });
});
```

**Checklist:**

- [ ] Add the test.
- [ ] Run `npm test`.
- [ ] Confirm it fails with `404`.

### Task 3.2: Implement `GET /health`

**Files:**

- Modify: `projects/project01/Part03/server/app.js`

Add (above any static or API mounts):

```js
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'running' });
});
```

**Checklist:**

- [ ] Add the endpoint.
- [ ] Run `npm test`.
- [ ] Confirm `health.test.js` passes.
- [ ] Confirm the endpoint is at `/health`, **not** `/api/health`.

**Check your work:**

- Unit: `health.test.js` passes.
- Integration: `npm start` then `curl http://localhost:8080/health` returns `{"status":"running"}`.
- Smoke: a teammate can confirm liveness without touching `/api/*`.

---

## Phase 4: Placeholder Frontend Build Artifact

The static host needs something to serve before UI workstream produces a real Vite build.

### Task 4.1: Add placeholder `index.html`

**Files:**

- Create: `projects/project01/Part03/frontend/dist/index.html`

Initial placeholder:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>PhotoApp Part 03</title>
    <link rel="stylesheet" href="/assets/app.css" />
  </head>
  <body>
    <div id="root">PhotoApp Part 03 placeholder frontend</div>
  </body>
</html>
```

**Checklist:**

- [ ] Create `frontend/dist/`.
- [ ] Add placeholder `index.html`.
- [ ] Note: this is a temporary artifact; UI workstream will overwrite it via Vite build output.

**Check your work:**

- Unit: not applicable.
- Integration: file exists at expected path.
- Smoke: open the file directly in a browser if desired (rendered standalone, no server).

---

## Phase 5: Static Web App Host

### Task 5.1: Failing test for `GET /` serving HTML

**Files:**

- Create: `projects/project01/Part03/server/tests/static.test.js`

**Write failing test first:**

```js
const request = require('supertest');
const app = require('../app');

test('GET / serves the SPA index HTML', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/text\/html/);
  expect(res.text).toContain('PhotoApp Part 03');
});
```

**Checklist:**

- [ ] Add the test.
- [ ] Run `npm test`.
- [ ] Confirm it fails (currently `404` since the legacy `/` handler was removed in Phase 2).

### Task 5.2: Mount static middleware and SPA index fallback

**Files:**

- Modify: `projects/project01/Part03/server/app.js`

Add near the top:

```js
const path = require('path');
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
```

Add (after `/health`, after the API mount that arrives in Phase 7, but for now after `/health`):

```js
app.use(express.static(FRONTEND_DIST));

app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});
```

**Checklist:**

- [ ] Add `path` import and `FRONTEND_DIST` constant.
- [ ] Add `express.static(FRONTEND_DIST)` middleware.
- [ ] Add `GET /` fallback that returns `index.html`.
- [ ] Run `npm test`.
- [ ] Confirm `static.test.js` `GET /` test passes.

**Check your work:**

- Unit: `static.test.js` `GET /` test passes.
- Integration: `npm start`, then `curl http://localhost:8080/` returns HTML containing `PhotoApp Part 03`.
- Smoke: browser at `http://localhost:8080/` displays placeholder frontend.

---

## Phase 6: Static Assets

### Task 6.1: Add placeholder asset

**Files:**

- Create: `projects/project01/Part03/frontend/dist/assets/app.css`

Example asset:

```css
body {
  font-family: system-ui, sans-serif;
}
```

**Checklist:**

- [ ] Create `frontend/dist/assets/`.
- [ ] Add `app.css` with a recognizable rule (e.g., `font-family`).
- [ ] Confirm `index.html` already references `/assets/app.css` from Phase 4.

### Task 6.2: Failing test for `/assets/*`

**Files:**

- Modify: `projects/project01/Part03/server/tests/static.test.js`

Add:

```js
test('GET /assets/app.css is served by static middleware', async () => {
  const res = await request(app).get('/assets/app.css');
  expect(res.status).toBe(200);
  expect(res.text).toContain('font-family');
});
```

**Checklist:**

- [ ] Add the test.
- [ ] Run `npm test`.
- [ ] If `express.static` is already mounted from Phase 5, this test should pass on the first run after the CSS file exists. If it fails with `404`, confirm `FRONTEND_DIST` is correct and the file is on disk.

**Check your work:**

- Unit: `/assets/app.css` test passes.
- Integration: browser dev tools show the CSS loaded with status `200`.
- Smoke: no missing-asset 404s when loading `/`.

---

## Phase 7: API Router Placeholder Mount

This phase reserves the `/api` namespace for the API Routes workstream. The placeholder route is replaced with real endpoints in workstream 03.

### Task 7.1: Failing test for `GET /api` placeholder

**Files:**

- Create: `projects/project01/Part03/server/tests/api_placeholder.test.js`

**Write failing test first:**

```js
const request = require('supertest');
const app = require('../app');

test('GET /api returns placeholder envelope', async () => {
  const res = await request(app).get('/api');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    message: 'success',
    data: {
      service: 'photoapp-api',
      status: 'placeholder',
    },
  });
});
```

**Checklist:**

- [ ] Add the test.
- [ ] Run `npm test`.
- [ ] Confirm it fails with `404` (or with the static middleware swallowing the request — that is the exact failure mode Phase 7 prevents).

### Task 7.2: Implement placeholder router and mount it BEFORE static

**Files:**

- Create: `projects/project01/Part03/server/routes/photoapp_routes.js`
- Modify: `projects/project01/Part03/server/app.js`

`server/routes/photoapp_routes.js`:

```js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'success',
    data: {
      service: 'photoapp-api',
      status: 'placeholder',
    },
  });
});

module.exports = router;
```

`server/app.js` final mount order (load-bearing):

```js
const express = require('express');
const path = require('path');
const photoappRoutes = require('./routes/photoapp_routes');

const app = express();
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');

app.use(express.json({ strict: false, limit: '50mb' }));

// 1. Liveness probe (outside /api/*)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'running' });
});

// 2. API router FIRST so static catchall cannot absorb /api/*
app.use('/api', photoappRoutes);

// 3. Static frontend
app.use(express.static(FRONTEND_DIST));

// 4. SPA index fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

module.exports = app;
```

**Checklist:**

- [ ] Create the placeholder router.
- [ ] Mount `/api` **before** `express.static`.
- [ ] Run `npm test`.
- [ ] Confirm `api_placeholder.test.js` passes.
- [ ] Confirm `health.test.js` and `static.test.js` still pass.

**Check your work:**

- Unit: `api_placeholder.test.js` passes.
- Integration: `npm start`, then `curl http://localhost:8080/api` returns the placeholder envelope.
- Smoke: API Routes workstream has a confirmed mount point at `/api`.

---

## Phase 8: Run Documentation

### Task 8.1: Update Part 03 README

**Files:**

- Create or modify: `projects/project01/Part03/README.md`

Include:

````markdown
# Project 01 Part 03 - PhotoApp Web UI

## Local Server

From this directory:

```bash
npm install
npm start
```

The server listens on the port configured in `server/config.js` (default `8080`).

Open:

```text
http://localhost:8080/
```

Liveness check (NOT under `/api`):

```text
http://localhost:8080/health
```

API placeholder (replaced by API Routes workstream):

```text
http://localhost:8080/api
```

## Tests

```bash
npm test
```

Runs Jest against `server/tests/`.

## Current Architecture

Express serves:

- `GET /` from `frontend/dist/index.html`
- `GET /assets/*` from `frontend/dist/assets` via `express.static`
- `/api/*` through the PhotoApp router (placeholder until API Routes workstream lands)
- `GET /health` as a server liveness probe (outside `/api/*`)

The UI workstream owns `frontend/`; it produces `frontend/dist/` via Vite build.
The API Routes workstream owns detailed `/api/*` behavior, AWS SDK + `mysql2` integration, and multipart upload middleware.
````

**Checklist:**

- [ ] Add `npm install` + `npm start` instructions.
- [ ] Add browser URL.
- [ ] Add `/health` URL with note that it is **not** under `/api`.
- [ ] Add `/api` placeholder URL.
- [ ] Add `npm test` instructions.
- [ ] Explain ownership boundaries.

**Check your work:**

- Unit: not applicable.
- Integration: copy/paste commands work.
- Smoke: someone with no context can start the server from README.

---

## Phase 9: Server Foundation Acceptance

### Task 9.1: Full local verification

**Checklist:**

- [ ] `npm install` runs cleanly from `Part03/`.
- [ ] `npm test` passes (`app`, `health`, `static`, `api_placeholder` suites).
- [ ] `npm start` starts the server and prints the listening message.
- [ ] `curl http://localhost:8080/health` returns `{"status":"running"}`.
- [ ] `curl http://localhost:8080/api` returns the placeholder envelope `{message:"success", data:{service:"photoapp-api", status:"placeholder"}}`.
- [ ] `curl http://localhost:8080/` returns placeholder HTML.
- [ ] Browser loads `http://localhost:8080/` without console errors.
- [ ] Browser dev tools show `/assets/app.css` loaded with status `200`.
- [ ] No AWS credentials or `photoapp-config.ini` values are referenced by this foundation layer (those are loaded in `server.js` startup hook only and consumed by API Routes workstream).
- [ ] `app.js` does **not** call `listen()`.

## Suggested Commit Points

- After Phase 1: Jest + supertest devDeps added; `npm test` runs with no tests.
- After Phase 2: `app.js` exports app, `server.js` calls listen, `app.test.js` passes.
- After Phase 3: `GET /health` test passes.
- After Phase 5: `GET /` static serving test passes.
- After Phase 6: `/assets/*` test passes.
- After Phase 7: `/api` placeholder test passes; mount order locked in.
- After Phase 8: README is accurate and someone fresh can start the server.
- After Phase 9: full acceptance checklist green.

## Handoff To Other Workstreams

After this workstream:

UI can:

- Replace placeholder `frontend/dist/` with a real Vite build.
- Continue using `GET /` and `/assets/*` as the static serving contract.
- Rely on `/api/*` as the only HTTP namespace it needs to call (plus `/health` if it wants a connectivity probe outside the API contract).

API Routes can:

- Replace `server/routes/photoapp_routes.js` placeholder handler with real endpoints (`/api/ping`, `/api/users`, `/api/images`, `/api/images/:assetid/file`, `/api/images/:assetid/labels`, `/api/search`, `DELETE /api/images`).
- Add `server/services/photoapp.js`, `server/services/aws.js`, `server/middleware/upload.js`, `server/middleware/error.js`, and `server/schemas.js`.
- Keep router mounting through `server/app.js` (`app.use('/api', photoappRoutes)`).
- Trust that `app.js` exports the app and does not call `listen()`, so supertest-based integration tests work without port conflicts.

## Risks And Mitigations

- Risk: `express.static` catchall absorbs `/api/*`.
  - Mitigation: mount `/api` **before** `express.static` in `app.js`. Phase 7 test pins this.
- Risk: `frontend/dist/` does not exist when server starts (e.g., UI workstream has not run a build yet).
  - Mitigation: ship a placeholder `index.html` and `assets/app.css` from this workstream; document build order in README.
- Risk: `path.join(__dirname, '..', 'frontend', 'dist')` resolves wrong because the process was started from an unexpected CWD.
  - Mitigation: use `__dirname` (file-relative), not `process.cwd()`. Document in README that the server is started via `npm start` from `Part03/`.
- Risk: ESM/CJS mismatch — current `server/*.js` uses CommonJS (`require`), and Jest defaults align with that.
  - Mitigation: keep CommonJS for now. If UI workstream brings ESM and someone is tempted to flip the server, do that as a deliberate refactor with a `refactor-log.md` entry, not silently.
- Risk: `app.listen()` accidentally re-introduced in `app.js`, which breaks supertest tests by binding a port at import time.
  - Mitigation: `app.test.js` asserts the export shape; reviewers should reject any PR that calls `listen()` outside `server.js`.
- Risk: port `8080` already in use locally.
  - Mitigation: standardize on `8080` in `config.js` and README; document override path (edit `config.js`) for teammates whose port is taken.
- Risk: putting the liveness probe under `/api/health` would pollute the PhotoApp API contract documented in `00`.
  - Mitigation: this workstream mounts liveness at `/health` outside `/api/*` and documents the boundary in README.

## Footnote: Server Baseline Provenance

On 2026-04-25, the team copied a Project 2 Express server baseline into Part 3:

- `projects/project01/Part03/server/`
- `projects/project01/Part03/package.json`

On 2026-04-26, the team confirmed Express/Node as the Part 03 backend direction (Q1–Q6 in `MetaFiles/refactor-log.md`):

- Q1 — keep `/api/*` URL prefix.
- Q2 — Part 2 `photoapp.py` is reference-only; the server uses Node-native AWS SDK + `mysql2`.
- Q3 — response envelope is `{message, data}` / `{message, error}`.
- Q4 — test stack is Jest + supertest.
- Q5 — local dev is built-only (Express serves `frontend/dist`; no Vite proxy).
- Q6 — visualization is agnosticized (handled by design agent).

This workstream's job is to smooth the copied baseline into the shape this checklist describes: split `app.js` and `server.js`, mount `/api` before static, ship a placeholder frontend build, add Jest + supertest, and document run commands. Refactor notes for any deviations belong in `projects/project01/Part03/MetaFiles/refactor-log.md`.
