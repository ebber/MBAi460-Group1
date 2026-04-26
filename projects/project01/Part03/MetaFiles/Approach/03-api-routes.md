# API Routes Workstream Approach

> **For agentic workers:** Execute this as a checklist. Use TDD for every route, service function, adapter function, and conversion helper. Write the failing test first, verify the failure, implement the minimal code, then verify it passes. Do not wire real `photoapp.py` behavior before the route/service contract is tested with stubs.

## Goal

Implement the FastAPI `/api/*` backend for Project 01 Part 03. The backend should expose browser-friendly JSON and file endpoints, call the PhotoApp Service Layer, bridge browser uploads/downloads to the existing Part 2 local-file API, and reuse `projects/project01/client/photoapp.py` through a small adapter.

## Scope

This workstream owns:

- `/api/*` routes.
- Request and response models.
- Tuple-to-object conversion helpers.
- PhotoApp Service Layer.
- Local File Bridge.
- Part 2 API Adapter.
- Error/status-code mapping.
- Backend unit, integration, and smoke tests for API behavior.

This workstream does **not** own:

- React component implementation.
- Claude Design conversion.
- Static web app hosting mechanics.
- FastAPI app skeleton beyond including routes.
- Original Part 2 `photoapp.py` implementation.

## Dependencies

Read first:

- `00-coordination-and-contracts.md`
- `02-server-foundation.md`
- `visualizations/Target-State-project01-part03-photoapp-architecture-v1.md`
- `projects/project01/Part02/MetaFiles/Implementation-Notes.md`
- `projects/project01/client/photoapp.py`

Expected server foundation:

- `backend/main.py` exists.
- `backend/routes/photoapp_routes.py` may contain placeholder `/api`.
- `backend/tests/` exists.
- FastAPI TestClient works.
- `GET /health` works.
- Static serving works independently.

## Target Files

Create or modify:

```text
projects/project01/Part03/
  backend/
    routes/
      photoapp_routes.py
    services/
      photoapp_service.py
      file_bridge.py
    adapters/
      part2_photoapp.py
    schemas.py
    tests/
      test_routes.py
      test_photoapp_service.py
      test_file_bridge.py
      test_part2_adapter.py
```

Possibly modify:

```text
projects/project01/Part03/backend/main.py
projects/project01/Part03/requirements.txt
projects/project01/Part03/README.md
```

## API Contract Summary

Routes to implement:

- `GET /api/ping`
- `GET /api/users`
- `GET /api/images`
- `GET /api/images?userid={userid}`
- `POST /api/images`
- `GET /api/images/{assetid}/file`
- `GET /api/images/{assetid}/labels`
- `GET /api/search?label={label}`
- `DELETE /api/images`

Response shape for JSON success:

```json
{
  "message": "success",
  "data": {}
}
```

Response shape for JSON errors:

```json
{
  "message": "error",
  "error": "human-readable failure message"
}
```

## Design Decisions

- Route handlers stay thin.
- Service layer owns PhotoApp use cases.
- Adapter owns Part 2 import/init compatibility.
- File bridge owns temporary file mechanics.
- Response conversion happens in service or schema helpers, not in React.
- Backend should be testable with stubbed adapter before touching live AWS.
- Real AWS smoke tests happen late and intentionally.

---

## Phase 1: Schemas And Conversion Helpers

### Task 1.1: Define response helper conventions

**Files:**

- Create/modify: `backend/schemas.py`
- Create/modify: `backend/tests/test_routes.py` or `backend/tests/test_schemas.py`

**Write failing tests first:**

```python
from backend.schemas import success_response, error_response


def test_success_response_wraps_data():
    assert success_response({"count": 3}) == {
        "message": "success",
        "data": {"count": 3},
    }


def test_error_response_wraps_error_message():
    assert error_response("no such userid") == {
        "message": "error",
        "error": "no such userid",
    }
```

**Implement minimal helpers:**

```python
def success_response(data):
    return {"message": "success", "data": data}


def error_response(message):
    return {"message": "error", "error": str(message)}
```

**Check your work:**

- Unit: schema helper tests pass.
- Integration: not applicable yet.
- Smoke: not applicable yet.

### Task 1.2: Add tuple conversion helpers

**Files:**

- Modify: `backend/schemas.py`
- Modify: `backend/tests/test_schemas.py`

**Write failing tests first:**

```python
from backend.schemas import (
    image_row_to_dict,
    label_row_to_dict,
    search_row_to_dict,
    user_row_to_dict,
)


def test_user_row_to_dict_converts_part2_tuple():
    assert user_row_to_dict((80001, "p_sarkar", "Pooja", "Sarkar")) == {
        "userid": 80001,
        "username": "p_sarkar",
        "givenname": "Pooja",
        "familyname": "Sarkar",
    }


def test_image_row_to_dict_converts_part2_tuple():
    assert image_row_to_dict((1001, 80001, "01degu.jpg", "p_sarkar/uuid-01degu.jpg")) == {
        "assetid": 1001,
        "userid": 80001,
        "localname": "01degu.jpg",
        "bucketkey": "p_sarkar/uuid-01degu.jpg",
    }


def test_label_row_to_dict_converts_part2_tuple():
    assert label_row_to_dict(("Animal", 99)) == {
        "label": "Animal",
        "confidence": 99,
    }


def test_search_row_to_dict_converts_part2_tuple():
    assert search_row_to_dict((1001, "Animal", 99)) == {
        "assetid": 1001,
        "label": "Animal",
        "confidence": 99,
    }
```

**Check your work:**

- Unit: conversion tests pass.
- Integration: service tests can now use these helpers.
- Smoke: not applicable yet.

---

## Phase 2: Part 2 Adapter

### Task 2.1: Add adapter import/init shape with dependency seam

**Files:**

- Create: `backend/adapters/part2_photoapp.py`
- Create: `backend/tests/test_part2_adapter.py`

**Purpose:**

Keep Part 2 compatibility details out of routes and services.

Adapter responsibilities:

- Locate/import `projects/project01/client/photoapp.py`.
- Initialize it once.
- Expose thin wrapper functions:
  - `get_ping()`
  - `get_users()`
  - `get_images(userid=None)`
  - `post_image(userid, local_filename)`
  - `get_image(assetid, local_filename=None)`
  - `get_image_labels(assetid)`
  - `get_images_with_label(label)`
  - `delete_images()`

**Write failing tests first with monkeypatch/stub module:**

```python
from backend.adapters import part2_photoapp


class FakePhotoApp:
    def __init__(self):
        self.initialize_calls = 0

    def initialize(self, config_file, s3_profile, mysql_user):
        self.initialize_calls += 1
        return True

    def get_users(self):
        return [(80001, "p_sarkar", "Pooja", "Sarkar")]


def test_adapter_initializes_photoapp_once(monkeypatch):
    fake = FakePhotoApp()
    monkeypatch.setattr(part2_photoapp, "_photoapp", fake)
    monkeypatch.setattr(part2_photoapp, "_initialized", False)

    part2_photoapp.ensure_initialized()
    part2_photoapp.ensure_initialized()

    assert fake.initialize_calls == 1


def test_adapter_delegates_get_users(monkeypatch):
    fake = FakePhotoApp()
    monkeypatch.setattr(part2_photoapp, "_photoapp", fake)
    monkeypatch.setattr(part2_photoapp, "_initialized", True)

    assert part2_photoapp.get_users() == [(80001, "p_sarkar", "Pooja", "Sarkar")]
```

**Implementation notes:**

- Use module-level `_initialized = False`.
- Use constants for:
  - config file path
  - S3 profile: `s3readwrite`
  - MySQL user: `photoapp-read-write`
- Do not expose config values to frontend.
- Keep adapter wrappers boring.

**Check your work:**

- Unit: adapter tests pass with monkeypatched fake module.
- Integration: from `Part03`, `python -c "from backend.adapters import part2_photoapp"` works.
- Smoke: defer real `ensure_initialized()` until live config is confirmed.

### Task 2.2: Add real import path handling

**Files:**

- Modify: `backend/adapters/part2_photoapp.py`
- Modify: `backend/tests/test_part2_adapter.py`

**Behavior:**

The adapter must import the existing Part 2 module from:

```text
projects/project01/client/photoapp.py
```

Potential implementation:

```python
from pathlib import Path
import sys

PART03_DIR = Path(__file__).resolve().parents[2]
PROJECT01_DIR = PART03_DIR.parent
CLIENT_DIR = PROJECT01_DIR / "client"

if str(CLIENT_DIR) not in sys.path:
    sys.path.insert(0, str(CLIENT_DIR))

import photoapp as _photoapp
```

**Check your work:**

- Unit: import path test passes.
- Integration: importing adapter does not initialize AWS by itself.
- Smoke: `python -c "from backend.adapters import part2_photoapp; print(part2_photoapp)"`.

---

## Phase 3: Local File Bridge

### Task 3.1: Test saving upload bytes to temp file

**Files:**

- Create: `backend/services/file_bridge.py`
- Create: `backend/tests/test_file_bridge.py`

**Write failing test first:**

```python
from io import BytesIO

from backend.services.file_bridge import save_upload_to_temp_file


class FakeUploadFile:
    filename = "test.jpg"
    file = BytesIO(b"image-bytes")


def test_save_upload_to_temp_file_writes_bytes_and_preserves_suffix():
    path = save_upload_to_temp_file(FakeUploadFile())

    try:
        assert path.exists()
        assert path.suffix == ".jpg"
        assert path.read_bytes() == b"image-bytes"
    finally:
        path.unlink(missing_ok=True)
```

**Implementation notes:**

- Return a `Path`.
- Preserve suffix from uploaded filename when possible.
- Use a safe temp directory.
- Do not trust the original filename as a full path.

**Check your work:**

- Unit: temp file write test passes.
- Integration: use FastAPI UploadFile object in route test later.
- Smoke: not applicable yet.

### Task 3.2: Test cleanup helper

**Files:**

- Modify: `backend/services/file_bridge.py`
- Modify: `backend/tests/test_file_bridge.py`

**Write failing test first:**

```python
from backend.services.file_bridge import cleanup_temp_file


def test_cleanup_temp_file_ignores_missing_file(tmp_path):
    missing = tmp_path / "missing.jpg"
    cleanup_temp_file(missing)
    assert not missing.exists()
```

**Check your work:**

- Unit: cleanup tests pass.
- Integration: upload service uses cleanup in success and failure paths.
- Smoke: repeated upload tests do not leak obvious temp files.

---

## Phase 4: PhotoApp Service Layer

### Task 4.1: Test list users use case

**Files:**

- Create: `backend/services/photoapp_service.py`
- Create: `backend/tests/test_photoapp_service.py`

**Write failing test first:**

```python
from backend.services import photoapp_service


class FakeAdapter:
    def get_users(self):
        return [(80001, "p_sarkar", "Pooja", "Sarkar")]


def test_list_users_returns_web_shaped_users(monkeypatch):
    monkeypatch.setattr(photoapp_service, "part2_photoapp", FakeAdapter())

    result = photoapp_service.list_users()

    assert result == [
        {
            "userid": 80001,
            "username": "p_sarkar",
            "givenname": "Pooja",
            "familyname": "Sarkar",
        }
    ]
```

**Implementation:**

- Import adapter as `part2_photoapp`.
- Call adapter.
- Convert tuples using schema helper.

**Check your work:**

- Unit: service test passes.
- Integration: route can call service later.
- Smoke: not yet.

### Task 4.2: Add list images use case

**Write failing tests:**

- `list_images()` calls `get_images(None)`.
- `list_images(userid=80001)` calls `get_images(80001)`.
- Returns list of image objects.

**Check your work:**

- Unit: tests pass with fake adapter.
- Integration: route test later checks query parameter wiring.

### Task 4.3: Add labels and search use cases

**Write failing tests:**

- `get_image_labels(assetid)` converts `(label, confidence)` tuples.
- `search_images(label)` converts `(assetid, label, confidence)` tuples.
- Empty label search raises `ValueError("label is required")` or returns empty list. Choose one and align with route behavior.

Recommended:

```python
def search_images(label):
    if not label or not label.strip():
        return []
```

**Check your work:**

- Unit: labels/search service tests pass.
- Integration: route test later checks `/api/search?label=...`.

### Task 4.4: Add upload use case

**Write failing tests:**

- Saves upload through `file_bridge`.
- Calls adapter `post_image(userid, temp_path)`.
- Cleans temp file after success.
- Cleans temp file after adapter failure.
- Returns `{"assetid": new_id}`.

Test shape:

```python
def test_upload_image_saves_temp_file_calls_adapter_and_cleans_up(monkeypatch):
    calls = []

    class FakeAdapter:
        def post_image(self, userid, local_filename):
            calls.append((userid, local_filename))
            return 1001

    # monkeypatch file_bridge save/cleanup helpers
    # assert result == {"assetid": 1001}
    # assert cleanup called
```

**Check your work:**

- Unit: upload service tests pass.
- Integration: multipart route test later.
- Smoke: real upload late in Phase 8.

### Task 4.5: Add download use case

**Behavior:**

- Allocate temp output path.
- Call adapter `get_image(assetid, temp_path)`.
- Return a path suitable for FastAPI `FileResponse`.
- Ensure cleanup strategy is compatible with response lifecycle.

Recommended design:

- Service returns `Path`.
- Route returns `FileResponse(path, background=BackgroundTask(cleanup_temp_file, path))`.

**Write failing tests:**

- Adapter called with assetid and temp path.
- Returned path exists or is passed through as expected.
- Missing asset exceptions bubble to route for HTTP mapping.

**Check your work:**

- Unit: download service tests pass.
- Integration: route returns file bytes later.
- Smoke: real preview/download in Phase 8.

### Task 4.6: Add delete use case

**Behavior:**

- Calls adapter `delete_images()`.
- Returns `{"deleted": True}` on success.

**Check your work:**

- Unit: delete service test passes.
- Integration: route test later.
- Smoke: real delete late in Phase 8.

---

## Phase 5: API Routes With Stubbed Service

### Task 5.1: Wire router to service

**Files:**

- Modify: `backend/routes/photoapp_routes.py`
- Create/modify: `backend/tests/test_routes.py`

**Testing strategy:**

Use FastAPI `TestClient(app)` and monkeypatch route module's `photoapp_service` object with a fake.

### Task 5.2: Implement `GET /api/ping`

**Write failing test first:**

```python
def test_get_ping_returns_service_result(monkeypatch):
    class FakeService:
        def get_ping(self):
            return {"s3_object_count": 2, "user_count": 3}

    monkeypatch.setattr(photoapp_routes, "photoapp_service", FakeService())

    response = client.get("/api/ping")

    assert response.status_code == 200
    assert response.json() == {
        "message": "success",
        "data": {"s3_object_count": 2, "user_count": 3},
    }
```

**Check your work:**

- Unit/integration: route test passes with fake service.
- Smoke: `curl /api/ping` works once real service is wired.

### Task 5.3: Implement `GET /api/users`

**Test:**

- Fake service returns list of user objects.
- Route wraps success response.

### Task 5.4: Implement `GET /api/images`

**Tests:**

- Without `userid`, route calls service with `None`.
- With `userid`, route calls service with int.
- Invalid non-int `userid` returns FastAPI validation error or `400`.

### Task 5.5: Implement `POST /api/images`

**Tests:**

- Multipart request with `userid` and file returns assetid.
- Missing file returns `422` or `400`; choose FastAPI default if acceptable.
- `ValueError("no such userid")` maps to `400`.

### Task 5.6: Implement `GET /api/images/{assetid}/labels`

**Tests:**

- Valid assetid returns labels.
- `ValueError("no such assetid")` maps to `404`.

### Task 5.7: Implement `GET /api/search`

**Tests:**

- `?label=animal` returns results.
- Missing label returns empty result or `400`; align with service decision.
- Recommended: missing label returns `400` at route boundary because it is user input.

### Task 5.8: Implement `GET /api/images/{assetid}/file`

**Tests:**

- Service returns temp path.
- Route returns `FileResponse`.
- Background cleanup is attached.
- `ValueError("no such assetid")` maps to `404`.

### Task 5.9: Implement `DELETE /api/images`

**Tests:**

- Route returns `{"deleted": True}`.
- Unexpected exception maps to `500`.

**Check your work for Phase 5:**

- Unit/integration: all route tests pass with fake service.
- Smoke: server starts and all routes return controlled responses if fakes are installed only in tests.

---

## Phase 6: Error Mapping

### Task 6.1: Centralize known error handling

**Files:**

- Modify: `backend/routes/photoapp_routes.py`
- Modify: `backend/tests/test_routes.py`

**Behavior:**

- `ValueError("no such userid")` -> `400`.
- `ValueError("no such assetid")` -> `404`.
- Missing upload fields -> FastAPI validation response or explicit `400`.
- Unexpected errors -> `500` with generic user-safe message.

**Write tests first:**

```python
def test_no_such_userid_maps_to_400(monkeypatch):
    class FakeService:
        def upload_image(self, userid, upload_file):
            raise ValueError("no such userid")

    monkeypatch.setattr(photoapp_routes, "photoapp_service", FakeService())

    response = client.post(
        "/api/images",
        data={"userid": "99999"},
        files={"file": ("test.jpg", b"fake", "image/jpeg")},
    )

    assert response.status_code == 400
    assert response.json() == {
        "message": "error",
        "error": "no such userid",
    }
```

**Check your work:**

- Unit/integration: error route tests pass.
- Smoke: bad inputs from browser produce friendly messages.

---

## Phase 7: Real Adapter Integration Tests

### Task 7.1: Add guarded live integration tests

**Files:**

- Create: `backend/tests/test_live_photoapp_integration.py`

**Important:**

Live tests should be skipped unless explicitly enabled.

Pattern:

```python
import os
import pytest

RUN_LIVE = os.getenv("PHOTOAPP_RUN_LIVE_TESTS") == "1"

pytestmark = pytest.mark.skipif(
    not RUN_LIVE,
    reason="Set PHOTOAPP_RUN_LIVE_TESTS=1 to run live PhotoApp integration tests",
)
```

Live tests:

- `/api/ping` returns success.
- `/api/users` returns 3 seeded users.
- `/api/images` returns a list.
- Upload known local image if test image is available.
- Labels/search/download/delete only after confirming live environment is safe.

**Check your work:**

- Unit: normal `pytest` skips live tests.
- Integration: `PHOTOAPP_RUN_LIVE_TESTS=1 pytest backend/tests/test_live_photoapp_integration.py -v`.
- Smoke: no accidental live AWS mutation without opt-in.

---

## Phase 8: End-To-End Smoke Checklist

Run only after UI and Server Foundation are ready.

**Checklist:**

- [ ] Start server with `uvicorn backend.main:app --host 0.0.0.0 --port 8080`.
- [ ] Open `http://localhost:8080/`.
- [ ] `GET /api/ping` returns success.
- [ ] `GET /api/users` returns seeded users.
- [ ] Select user in UI.
- [ ] Upload known image.
- [ ] Confirm upload returns assetid.
- [ ] Confirm gallery refreshes.
- [ ] Confirm labels can be fetched.
- [ ] Confirm search returns expected label/image.
- [ ] Confirm image preview/download works.
- [ ] Confirm delete/reset works.
- [ ] Confirm no raw traceback appears in UI.
- [ ] Confirm no credentials appear in browser dev tools or frontend source.

## Acceptance Checklist

Before marking API Routes complete:

- [ ] All schema/conversion tests pass.
- [ ] Adapter tests pass with fake module.
- [ ] File bridge tests pass.
- [ ] Service tests pass with fake adapter.
- [ ] Route tests pass with fake service.
- [ ] Error mapping tests pass.
- [ ] Normal test suite skips live tests by default.
- [ ] Live tests pass when explicitly enabled.
- [ ] End-to-end smoke checklist passes.
- [ ] README documents any route-specific run/test commands.
- [ ] API responses match `00-coordination-and-contracts.md`.

## Suggested Commit Points

- After schemas/conversion helpers.
- After Part 2 adapter wrapper tests pass.
- After file bridge tests pass.
- After service layer use cases pass.
- After routes pass with fake service.
- After error mapping is complete.
- After guarded live integration tests pass.
- After end-to-end smoke test.

## Risks And Mitigations

- Risk: adapter import path breaks depending on working directory.
  - Mitigation: compute paths from `__file__`, test import from `Part03`.
- Risk: `photoapp.py` initialization state leaks across tests.
  - Mitigation: adapter tests monkeypatch `_initialized`; live tests run separately.
- Risk: temp files leak.
  - Mitigation: file bridge cleanup tests; service tests cover success and failure cleanup.
- Risk: FileResponse cleanup deletes before response is sent.
  - Mitigation: use FastAPI/Starlette `BackgroundTask`.
- Risk: route tests accidentally hit live AWS.
  - Mitigation: route/service tests use fakes; live tests require `PHOTOAPP_RUN_LIVE_TESTS=1`.
- Risk: UI and API response shapes drift.
  - Mitigation: update `00-coordination-and-contracts.md` first for any contract change.
