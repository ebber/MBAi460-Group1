# Server Foundation Workstream Approach

> **For agentic workers:** Execute this as a checklist. Prefer TDD for behavior-bearing server code: write the test, watch it fail, implement the smallest change, then verify it passes. Configuration-only steps still need integration or smoke checks.

## Goal

Create the local FastAPI/Uvicorn server foundation for Project 01 Part 03: a backend app skeleton, static React build serving, router mounting, local run commands, and documentation that lets UI and API Routes workstreams plug in cleanly.

## Scope

This workstream owns:

- `backend/main.py`
- FastAPI app creation
- Uvicorn run target
- Static web app hosting from `frontend/dist`
- Placeholder frontend build serving
- Backend package structure
- Basic health/root behavior
- Local development/run documentation
- Server-level tests that prove the shell works before real API routes exist

This workstream does **not** own:

- Final Claude Design UI conversion
- Detailed `/api/*` endpoint behavior
- Part 2 `photoapp.py` adapter behavior
- AWS/RDS/S3/Rekognition logic
- Real upload/download implementation

Those are owned by UI and API Routes workstreams.

## Dependencies

Read first:

- `00-coordination-and-contracts.md`
- `01-ui-workstream.md`
- `visualizations/Target-State-project01-part03-photoapp-architecture-v1.md`

This workstream should produce enough server structure for later workstreams to add:

- `backend/routes/photoapp_routes.py`
- `backend/services/photoapp_service.py`
- `backend/adapters/part02_photoapp.py`

## Target Files

Create or modify:

```text
projects/project01/Part03/
  backend/
    __init__.py
    main.py
    routes/
      __init__.py
    services/
      __init__.py
    adapters/
      __init__.py
    tests/
      __init__.py
      test_main.py

  frontend/
    dist/
      index.html

  README.md
```

Optional, depending on package/dependency strategy:

```text
projects/project01/Part03/requirements.txt
projects/project01/Part03/pyproject.toml
```

## Design Decisions

- One Python server process: `uvicorn backend.main:app --host 0.0.0.0 --port 8080`.
- FastAPI serves both:
  - Static web app: `GET /`, `GET /assets/*`
  - API routes: `/api/*`
- Before real frontend exists, use a placeholder `frontend/dist/index.html`.
- Before real API routes exist, expose a minimal app health route or placeholder router mount for server verification.
- Keep static serving and API route mounting in `backend/main.py`.
- Avoid adding route business logic to `backend/main.py`.

---

## Phase 1: Create Backend Package Skeleton

### Task 1.1: Create backend directories

**Files:**

- Create: `projects/project01/Part03/backend/__init__.py`
- Create: `projects/project01/Part03/backend/routes/__init__.py`
- Create: `projects/project01/Part03/backend/services/__init__.py`
- Create: `projects/project01/Part03/backend/adapters/__init__.py`
- Create: `projects/project01/Part03/backend/tests/__init__.py`

**Checklist:**

- [ ] Create `backend/`.
- [ ] Create `backend/routes/`.
- [ ] Create `backend/services/`.
- [ ] Create `backend/adapters/`.
- [ ] Create `backend/tests/`.
- [ ] Add `__init__.py` files so Python imports are stable.

**Check your work:**

- Unit: not applicable.
- Integration: run `python -c "import backend"` from `projects/project01/Part03`.
- Smoke: no import error.

---

## Phase 2: Dependency Baseline

### Task 2.1: Define backend dependencies

**Files:**

Choose one:

- Create: `projects/project01/Part03/requirements.txt`

Recommended initial contents:

```text
fastapi
uvicorn[standard]
pytest
httpx
python-multipart
```

If using `pyproject.toml` instead, keep dependency names equivalent.

**Checklist:**

- [ ] Add FastAPI.
- [ ] Add Uvicorn.
- [ ] Add pytest.
- [ ] Add httpx for FastAPI test client compatibility.
- [ ] Add `python-multipart` so upload routes will work later.
- [ ] Do not add boto3/pymysql here unless needed; existing environment may already support Part 2. API Routes workstream can revisit.

**Check your work:**

- Unit: not applicable.
- Integration: from `Part03`, install dependencies in the intended environment.
- Smoke: run `python -c "import fastapi, uvicorn"`.

---

## Phase 3: FastAPI App Factory

### Task 3.1: Test app import and app object

**Files:**

- Create: `projects/project01/Part03/backend/tests/test_main.py`

**Write failing test first:**

```python
from fastapi import FastAPI

from backend.main import app


def test_app_is_fastapi_instance():
    assert isinstance(app, FastAPI)
```

**Checklist:**

- [ ] Write the test before creating `backend/main.py`.
- [ ] Run the test.
- [ ] Confirm it fails because `backend.main` or `app` does not exist.

Expected command:

```bash
cd projects/project01/Part03
pytest backend/tests/test_main.py -v
```

Expected failure:

```text
ModuleNotFoundError: No module named 'backend.main'
```

### Task 3.2: Implement minimal FastAPI app

**Files:**

- Create: `projects/project01/Part03/backend/main.py`

Minimal implementation:

```python
from fastapi import FastAPI

app = FastAPI(title="PhotoApp Part 03")
```

**Checklist:**

- [ ] Create `backend/main.py`.
- [ ] Define `app`.
- [ ] Run the test again.
- [ ] Confirm it passes.

**Check your work:**

- Unit: `pytest backend/tests/test_main.py -v` passes.
- Integration: `python -c "from backend.main import app; print(app.title)"` prints `PhotoApp Part 03`.
- Smoke: not yet applicable.

---

## Phase 4: Server Health Route

### Task 4.1: Add test for server health endpoint

**Files:**

- Modify: `backend/tests/test_main.py`

Add:

```python
from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_health_endpoint_returns_running_status():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "running"}
```

**Checklist:**

- [ ] Add the test.
- [ ] Run it.
- [ ] Confirm it fails with `404`.

### Task 4.2: Implement health endpoint

**Files:**

- Modify: `backend/main.py`

Add:

```python
@app.get("/health")
def health():
    return {"status": "running"}
```

**Checklist:**

- [ ] Add endpoint.
- [ ] Run tests.
- [ ] Confirm tests pass.

**Check your work:**

- Unit: `test_health_endpoint_returns_running_status` passes.
- Integration: start Uvicorn and call `/health`.
- Smoke command:

```bash
cd projects/project01/Part03
uvicorn backend.main:app --host 0.0.0.0 --port 8080
```

In another terminal:

```bash
curl http://localhost:8080/health
```

Expected:

```json
{"status":"running"}
```

---

## Phase 5: Placeholder Static Web App

### Task 5.1: Add placeholder frontend build artifact

**Files:**

- Create: `projects/project01/Part03/frontend/dist/index.html`

Initial placeholder:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>PhotoApp Part 03</title>
  </head>
  <body>
    <div id="root">PhotoApp Part 03 placeholder frontend</div>
  </body>
</html>
```

**Checklist:**

- [ ] Create `frontend/dist/`.
- [ ] Add placeholder `index.html`.
- [ ] Confirm this file is understood as a temporary artifact until UI workstream generates a real build.

**Check your work:**

- Unit: not applicable.
- Integration: file exists at expected path.
- Smoke: open the file directly in a browser if desired.

---

## Phase 6: Static Web App Host

### Task 6.1: Test `GET /` serves frontend HTML

**Files:**

- Modify: `backend/tests/test_main.py`

Add:

```python
def test_root_serves_frontend_index():
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "PhotoApp Part 03" in response.text
```

**Checklist:**

- [ ] Add the test.
- [ ] Run it.
- [ ] Confirm it fails because `/` is not implemented yet.

### Task 6.2: Implement root static serving

**Files:**

- Modify: `backend/main.py`

Suggested implementation:

```python
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse

BASE_DIR = Path(__file__).resolve().parents[1]
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"
INDEX_HTML = FRONTEND_DIST / "index.html"

app = FastAPI(title="PhotoApp Part 03")


@app.get("/health")
def health():
    return {"status": "running"}


@app.get("/")
def serve_index():
    return FileResponse(INDEX_HTML)
```

**Checklist:**

- [ ] Add path constants.
- [ ] Add `serve_index()`.
- [ ] Run tests.
- [ ] Confirm root HTML test passes.

**Check your work:**

- Unit: root serving test passes.
- Integration: `curl http://localhost:8080/` returns HTML when server is running.
- Smoke: browser displays placeholder frontend at `http://localhost:8080/`.

---

## Phase 7: Static Assets Mount

### Task 7.1: Add placeholder asset

**Files:**

- Create: `projects/project01/Part03/frontend/dist/assets/app.css`
- Modify: `frontend/dist/index.html`

Example asset:

```css
body {
  font-family: system-ui, sans-serif;
}
```

Reference it in `index.html`:

```html
<link rel="stylesheet" href="/assets/app.css" />
```

### Task 7.2: Test assets route

**Files:**

- Modify: `backend/tests/test_main.py`

Add:

```python
def test_assets_route_serves_static_files():
    response = client.get("/assets/app.css")
    assert response.status_code == 200
    assert "font-family" in response.text
```

**Checklist:**

- [ ] Add placeholder CSS.
- [ ] Add test.
- [ ] Run test and confirm it fails with `404`.

### Task 7.3: Mount static assets

**Files:**

- Modify: `backend/main.py`

Add:

```python
from fastapi.staticfiles import StaticFiles

if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")
```

**Checklist:**

- [ ] Mount `/assets`.
- [ ] Run tests.
- [ ] Confirm assets route test passes.
- [ ] Confirm root page still passes.

**Check your work:**

- Unit: static file tests pass.
- Integration: browser loads placeholder CSS.
- Smoke: no 404s for placeholder static assets in browser dev tools.

---

## Phase 8: API Router Placeholder Mount

### Task 8.1: Create placeholder router test

**Files:**

- Create: `backend/routes/photoapp_routes.py`
- Modify: `backend/tests/test_main.py`

Test expectation:

```python
def test_api_router_placeholder_is_mounted():
    response = client.get("/api")
    assert response.status_code == 200
    assert response.json() == {
        "message": "success",
        "data": {
            "service": "photoapp-api",
            "status": "placeholder"
        }
    }
```

**Checklist:**

- [ ] Add failing test first.
- [ ] Run it.
- [ ] Confirm failure.

### Task 8.2: Implement placeholder API router

**Files:**

- Create: `backend/routes/photoapp_routes.py`
- Modify: `backend/main.py`

`photoapp_routes.py`:

```python
from fastapi import APIRouter

router = APIRouter(prefix="/api")


@router.get("")
def api_root():
    return {
        "message": "success",
        "data": {
            "service": "photoapp-api",
            "status": "placeholder",
        },
    }
```

`main.py`:

```python
from backend.routes.photoapp_routes import router as photoapp_router

app.include_router(photoapp_router)
```

**Checklist:**

- [ ] Implement placeholder router.
- [ ] Include router in `main.py`.
- [ ] Run tests.
- [ ] Confirm all pass.

**Check your work:**

- Unit: router placeholder test passes.
- Integration: `curl http://localhost:8080/api`.
- Smoke: confirms API Routes workstream has a mount point.

---

## Phase 9: Development Run Documentation

### Task 9.1: Add Part 03 README

**Files:**

- Create or modify: `projects/project01/Part03/README.md`

Include:

````markdown
# Project 01 Part 03 - PhotoApp Web UI

## Local Server

From this directory:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8080
```

Open:

```text
http://localhost:8080/
```

Health check:

```text
http://localhost:8080/health
```

API placeholder:

```text
http://localhost:8080/api
```

## Current Architecture

FastAPI serves:

- `GET /` from `frontend/dist/index.html`
- `GET /assets/*` from `frontend/dist/assets`
- `/api/*` through the PhotoApp API router

The real UI workstream owns `frontend/`.
The API Routes workstream owns detailed `/api/*` behavior.
````

**Checklist:**

- [ ] Add server command.
- [ ] Add browser URL.
- [ ] Add health check.
- [ ] Add API placeholder.
- [ ] Explain ownership boundaries.

**Check your work:**

- Unit: not applicable.
- Integration: copy/paste commands work.
- Smoke: someone with no context can start server from README.

---

## Phase 10: Server Foundation Acceptance

### Task 10.1: Full local verification

**Checklist:**

- [ ] `pytest backend/tests -v` passes.
- [ ] `uvicorn backend.main:app --host 0.0.0.0 --port 8080` starts cleanly.
- [ ] `curl http://localhost:8080/health` returns `{"status":"running"}`.
- [ ] `curl http://localhost:8080/api` returns placeholder API JSON.
- [ ] `curl http://localhost:8080/` returns placeholder HTML.
- [ ] Browser loads `http://localhost:8080/`.
- [ ] Browser dev tools show no missing `/assets/app.css`.
- [ ] README commands are accurate.
- [ ] No AWS credentials or `photoapp-config.ini` values are referenced by this foundation layer.

## Suggested Commit Points

- After backend skeleton imports cleanly.
- After health endpoint test passes.
- After static `GET /` serving passes.
- After `/assets` route passes.
- After `/api` placeholder route passes.
- After README and smoke checks pass.

## Handoff To Other Workstreams

After this workstream:

UI can:

- Replace placeholder `frontend/dist` with a Vite build.
- Continue using `GET /` and `/assets/*` as the static serving contract.

API Routes can:

- Replace `/api` placeholder with real endpoints.
- Add `backend/services/`, `backend/adapters/`, and schemas.
- Keep route mounting through `backend.main`.

## Risks And Mitigations

- Risk: `frontend/dist` does not exist when server starts.
  - Mitigation: tests should cover expected behavior; README should explain build order.
- Risk: static route catches `/api/*`.
  - Mitigation: mount/include API routes explicitly and test `/api`.
- Risk: cleanup conflict when UI workstream replaces placeholder files.
  - Mitigation: placeholder files are disposable; ownership belongs to UI once Vite build exists.
- Risk: Docker port mismatch.
  - Mitigation: standardize on port `8080` in README and coordination doc.
