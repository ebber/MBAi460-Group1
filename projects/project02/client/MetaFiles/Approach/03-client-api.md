# Client API Workstream Approach

> **For agentic workers:** Execute as a TDD checklist. For each API function: define the response contract from the web service, write the failing pytest using `responses` to mock the HTTP call, implement the function with `tenacity` retry, then verify against `make up` integration. **Precondition: `02-web-service.md` is complete and Gradescope-green at 60/60.** Goal: pass the Gradescope client API autograder at 30/30.

> **Behavioural reference: `projects/project01/client/photoapp.py`** (Project 01 Part 02). That file is a fully working PhotoApp client that talks **directly** to AWS (S3 + RDS + Rekognition) — no web service. Its function signatures, return shapes, error semantics, and ordering are the **public contract** that downstream callers (`client.py`, `gui.py`, the original `tests.py`) depend on. Project 02's job is to keep that public contract identical while routing every function through HTTP to the web service instead of direct AWS calls. The "instructor's assignment-provided baseline" version of `photoapp.py` (with `initialize`, `get_ping`, `get_users` already calling the web service) sits on top of that contract; this workstream implements the remaining six functions in the same style.

## Goal

Rewrite `client/photoapp.py` so every API function communicates with the web service over HTTP. The provided functions (`initialize`, `get_ping`, `get_users`) already follow this pattern; this workstream extends it to the remaining six functions, applies the consistent retry decoration, and submits to Gradescope. The client must hide the fact that it's talking to a web service — `client.py` and `tests.py` continue to call the API functions exactly as they did in Project 01 Part 02.

## Scope

This workstream owns:

- `client/photoapp.py` — the six remaining API functions (`get_images`, `post_image`, `get_image`, `get_image_labels`, `get_images_with_label`, `delete_images`).
- `client/photoapp-client-config.ini` — adds an `api_version` key (defaults to `v1`).
- `client/tests.py` — extended with at least one happy-path test per API function (existing scaffold preserved).
- Pytest test suites under `client/tests/`:
  - `unit/` — every function tested with `responses` mocks of the web service.
  - `integration/` — every function tested against `make up` web service.
  - `live/` — gated; against real AWS-backed web service.
  - `contract/` — assert the request bodies + URLs the client emits conform to the OpenAPI spec.
- Submission to Gradescope at 30/30.

This workstream does **not** own:

- `client.py` or `gui.py` — those remain as-shipped.
- Web service implementation — `02-web-service.md`.
- `/v2` client variants — `04-engineering-surface.md` adds an opt-in branch.

## Dependencies

Read first:

- `00-overview-and-conventions.md` (especially the **Inherited Assets — From Project 01 Part 02** subsection — that's the behavioural contract).
- `01-foundation.md` — Python tooling section (`pyproject.toml`, `pytest`, `responses`, `ruff`, `black`).
- `02-web-service.md` — must be Gradescope-green; the wire contract is locked.
- `MBAi460-Group1/projects/project01/client/photoapp.py` — Part 02's direct-AWS implementation; this file's function signatures and tuple shapes are the **public contract**.
- `MBAi460-Group1/projects/project01/client/tests.py` — Part 02's test pattern (`setUpClass` skip if missing ini, `setUp` calls `delete_images()`).
- `MBAi460-Group1/labs/lab02/shorten.py` + `tests.py` — lab-level reset pattern (`setUp` + `tearDown` both call reset for strict isolation).
- `MBAi460-Group1/projects/project01/Part02/MetaFiles/RETROSPECTIVE.md` if present — carry-forward conventions.

Required state:

- `make up` web service responds correctly on every v1 route.
- Gradescope web service score: 60/60 (recorded in `MetaFiles/refactor-log.md`).
- `client/tests/conftest.py` and `client/tests/unit|integration|live|contract/` directories exist with the harness wired (foundation Phase 11.5).
- The Part 02 `photoapp.py` is checked-in and reachable for cross-reference (`projects/project01/client/photoapp.py`).

## Target Files

```text
client/
  photoapp.py                        # rewritten: all six remaining API functions
  photoapp-client-config.ini.example # already exists; gains `api_version` key
  tests.py                           # extended; existing scaffold preserved
  tests/
    conftest.py
    unit/
      test_get_images.py
      test_post_image.py
      test_get_image.py
      test_get_image_labels.py
      test_get_images_with_label.py
      test_delete_images.py
      test_envelopes.py              # already from foundation; extended here
    integration/
      test_against_compose.py        # extended: every function exercised
    contract/
      test_request_conformance.py    # body / URL shape conformance to OpenAPI
    live/
      test_against_real.py
    fixtures/
      photoapp-client-config.ini     # gitignored fixture; `tests.py` uses this
```

## Design Decisions

- **C1 — `requests.Session` per process.** The module-level session lets us add default timeouts, headers, and a connection pool. Avoids per-call reconnects.
- **C2 — Standard `tenacity` decoration on every function.** The PDF specifies the exact decorator — we copy-paste it verbatim and apply uniformly. Retry only on `ConnectionError` / `Timeout`; HTTP errors do not trigger retries (per the PDF rationale: server is doing its own retries).
- **C3 — Errors propagate as exceptions to the caller.** API functions raise `HTTPError` on 400 / 500 responses. `client.py` and `tests.py` catch and display.
- **C4 — `api_version` selects the URL prefix.** Default `v1`; engineering tests can flip to `v2` to exercise the presigned flow once `04-engineering-surface.md` lands.
- **C5 — Logging via the standard library.** `logging.error` with the function name + the exception. No structured logs on the client (matches the assignment style).
- **C6 — Base64 round-trip uses the standard library.** No new deps for the client. Matches the PDF's example code.
- **C7 — `responses` library mocks the web service in unit tests.** No real HTTP traffic in unit; integration uses `make up`; live uses real cloud.
- **C8 — Client functions cannot know about server-side rewrites.** The function signatures and return types match Project 01 Part 02's `photoapp.py` exactly. If a function used to return `(M, N)`, it still does. If it raised on `400`, it still does. If it returned `[]` on no match, it still does.
- **C9 — Reuse Part 02 + Lab 02 test isolation patterns.** Part 02 `tests.py` uses `setUp` → `delete_images()` for clean state per test. Lab 02 `tests.py` uses `setUp` + `tearDown` symmetric reset. For Project 02 unit tests (mocked HTTP), neither cleanup is required; for integration tests against `make up` and live tests, follow the Lab 02 symmetric reset pattern (call `delete_images` mock in setUp + tearDown) so a failed test doesn't poison the next one. The `responses` library's `@responses.activate` decorator already gives unit-test isolation.
- **C10 — Reuse Part 02 client config conventions.** `photoapp-client-config.ini` lives at `projects/project02/client/photoapp-client-config.ini` (gitignored). The `.example` template is committed (workstream 01 Phase 1). The `cred-sweep` util already pattern-matches this filename — no extra work needed.

## Wire Contract Summary (from `02-web-service.md`)

The client's URL base is `WEB_SERVICE_URL` (read from `photoapp-client-config.ini`); routes are appended without the `/v1` prefix because the server uses `STRIP_V1_PREFIX=1` for Gradescope.

| Function                        | Method | Path                                 | Body                                                   | Success → Python return                                       | Error                                                        |
| ------------------------------- | ------ | ------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------ |
| `get_ping()`                    | GET    | `/ping`                              | n/a                                                    | `(M, N)`                                                       | `HTTPError`                                                  |
| `get_users()`                   | GET    | `/users`                             | n/a                                                    | `[User(...), ...]`                                             | `HTTPError`                                                  |
| `get_images(userid=None)`       | GET    | `/images` or `/images?userid=`       | n/a                                                    | `[Image(...), ...]`                                            | `HTTPError`                                                  |
| `post_image(userid, filename)`  | POST   | `/image/<userid>`                    | `{local_filename, data: <base64>}`                     | `assetid: int`                                                 | `HTTPError` on 400 / 500; `FileNotFoundError` on bad path    |
| `get_image(assetid, target?)`   | GET    | `/image/<assetid>`                   | n/a                                                    | `local_filename: str` (file written to disk)                   | `HTTPError`                                                  |
| `get_image_labels(assetid)`     | GET    | `/image_labels/<assetid>`            | n/a                                                    | `[Label(label, confidence), ...]`                              | `HTTPError`                                                  |
| `get_images_with_label(label)`  | GET    | `/images_with_label/<label>`         | n/a                                                    | `[ImageWithLabel(assetid, label, confidence), ...]`            | `HTTPError`                                                  |
| `delete_images()`               | DELETE | `/images`                            | n/a                                                    | `True`                                                         | `HTTPError`                                                  |

`User`, `Image`, `Label`, `ImageWithLabel` are the dataclasses already declared in `photoapp.py` (kept from the assignment baseline). Function signatures match Project 01.

## Standard Retry Decoration

```python
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    retry=retry_if_exception_type((ConnectionError, Timeout)),
    reraise=True,
)
```

Apply this **unmodified** to every API function.

> **Optional Mermaid Visualization Step** — suggested file `visualizations/Target-State-project02-client-adapter-v1.md`
>
> Before writing the first new function, render a `flowchart LR` of the **client as the adapter between two contracts** so the architecture is concrete.
>
> - **Story**: "Caller speaks the public-tuple contract (Part 02). Server speaks the wire-JSON contract (Project 02). The client adapts in both directions per call."
> - **Focus**: highlight the **two transformation arrows** (input adapt + output adapt) in **red** — that's where field name / shape bugs hide. Highlight the **`@retry` decorator boundary** in **amber** so the viewer sees retries wrap the entire HTTP call (not just the transformation).
> - **Shape vocab**: stadium `([...])` = caller (`client.py` / `tests.py`); rounded `(...)` = `photoapp.py` function; trapezoid = transformation step; cloud-style subgraph = web service; hexagon `{{...}}` = retry boundary.
> - **Brevity**: function name only on the rounded; tuple-shape and JSON-shape labels on the trapezoids.
> - **Direction**: `flowchart LR`.

---

## Phase 1: Tests And Module Bootstrap

### Task 1.1: Read and preserve the assignment-provided code

**Files:**

- `client/photoapp.py` — already contains `initialize()`, `get_ping()`, `get_users()`, dataclasses, and module-level `WEB_SERVICE_URL`.

**Checklist:**

- [ ] Read the existing file end to end.
- [ ] Confirm `WEB_SERVICE_URL` is loaded once at module import.
- [ ] Confirm dataclass definitions for `User`, `Image`, `Label`, `ImageWithLabel`.
- [ ] Confirm imports (`requests`, `tenacity`, `logging`, `base64`, `os`).
- [ ] Document any deviation from the PDF in `MetaFiles/refactor-log.md`.

### Task 1.2: `tests/conftest.py` per-test base URL fixture

**Files:**

- Create or modify: `client/tests/conftest.py`

**Behavior:**

- A `web_service_url` fixture reads `WEB_SERVICE_URL` from `client/tests/fixtures/photoapp-client-config.ini` (a test-only fixture, gitignored).
- A `mock_web_service` fixture using `responses.activate` for unit tests.
- An `api_version` fixture parameterising on `('v1',)` for now; `('v1', 'v2')` once the engineering surface lands.

**Checklist:**

- [ ] Failing test in `tests/unit/test_envelopes.py` asserts the fixtures load.
- [ ] Implement; tests green.

### Task 1.3: `photoapp-client-config.ini` gains `api_version`

**Files:**

- Modify: `client/photoapp-client-config.ini.example`
- Modify: `client/photoapp.py` — read the optional key with a default of `v1`.

**Behavior:**

```ini
[client]
web_service = http://localhost:8080
api_version = v1            ; or v2 once engineering surface lands; not submitted to gradescope
```

**Checklist:**

- [ ] `photoapp.py` reads `api_version` and prepends `/v<n>/` to URLs only when the value is `v2` (default `v1` keeps the prefix-stripped URLs that Gradescope expects).
- [ ] Failing unit test asserts URL construction for both versions.
- [ ] Implement; tests green.

> **Optional Utility Step** — suggested artifact `tools/run-client-suite` (Bash) or `make test-client`
>
> Six pytest-friendly test layers (unit / integration / live / contract / smoke / happy-path) means six different invocations with different env-var combinations (`PHOTOAPP_RUN_LIVE_TESTS=1`, `WEB_SERVICE_URL=http://compose-host:8080`, etc.). Wrapping into a single command with `--layer` and `--against=<compose|live>` flags is a 20-line script that ends a class of "did I remember the env vars?" mistakes.
>
> - **What it does**: `tools/run-client-suite --layer integration --against compose` sets the right `WEB_SERVICE_URL`, runs `pytest -m integration`, prints a green/red summary. `--layer live --against live` adds `PHOTOAPP_RUN_LIVE_TESTS=1`. `--layer all --against compose` runs every non-live layer.
> - **Why now**: Phase 1 is the moment the harness exists; subsequent phases will run it 50+ times. Earlier the wrapper has nothing to wrap; later you've memorized verbose forms and the wrapper feels redundant.
> - **Decision branches**: build now (recommended — pairs with `make test-layer` from `01-foundation.md` Phase 11; same shape, different language), queue, skip (acceptable for solo work; cost only at onboarding).

> **Optional Test Step** — suggested file `client/tests/contract/test_tuple_shape_compatibility.py`
>
> Project 02's client must produce *byte-identical* dataclass instances and tuples to Project 01 Part 02 — `client.py` and `gui.py` rely on the shape (Part 02 `photoapp.py` is the public contract). A single test that imports both modules (Part 02 reference + Project 02 rewrite) and asserts shape parity per function locks the contract before drift accumulates.
>
> - **What to lock down**: for each function (`get_users`, `get_images`, `get_image_labels`, `get_images_with_label`), call against a `responses`-mocked web service that returns the documented JSON; assert the *type* and *field order* of the returned dataclass / tuple matches Part 02's. Use `dataclasses.asdict` to compare structurally rather than by `==` (which would fail on different dataclass identities).
> - **Why this catches bugs**: a refactor that renames `localname` → `local_filename` in the dataclass silently breaks `client.py`'s display logic. Gradescope might catch it; `client.py` users definitely will, and they'll blame `client.py`.
> - **Decision branches**: build now (recommended — costs ~30 lines and replaces tribal knowledge with mechanical assertion), queue (defer to Phase 2 once the first read function is implemented and you have a real reference shape), skip (only viable if `client.py` and `gui.py` are also being rewritten, which they aren't per scope).

---

## Phase 2: Read Use Cases

### Task 2.1: `get_images(userid=None)`

**Files:**

- Modify: `client/photoapp.py`
- Create: `client/tests/unit/test_get_images.py`

**Failing tests (highlights):**

```python
@responses.activate
def test_get_images_no_filter_returns_list_of_images(web_service_url):
    responses.add(
        responses.GET,
        f"{web_service_url}/images",
        json={"message": "success", "data": [
            {"assetid": 1001, "userid": 80001, "localname": "01degu.jpg", "bucketkey": "abc/def-01degu.jpg"},
        ]},
        status=200,
    )
    result = photoapp.get_images()
    assert len(result) == 1
    assert result[0].assetid == 1001

@responses.activate
def test_get_images_with_userid_appends_query_param(web_service_url):
    responses.add(
        responses.GET,
        f"{web_service_url}/images",
        json={"message": "success", "data": []},
        status=200,
    )
    photoapp.get_images(userid=80001)
    assert responses.calls[0].request.url.endswith("?userid=80001")

@responses.activate
def test_get_images_500_raises_httperror(web_service_url):
    responses.add(
        responses.GET,
        f"{web_service_url}/images",
        json={"message": "boom", "data": []},
        status=500,
    )
    with pytest.raises(HTTPError):
        photoapp.get_images()

@responses.activate
def test_get_images_retries_on_connection_error(web_service_url):
    responses.add(responses.GET, f"{web_service_url}/images", body=ConnectionError("nope"))
    responses.add(responses.GET, f"{web_service_url}/images", body=ConnectionError("nope"))
    responses.add(responses.GET, f"{web_service_url}/images", json={"message": "success", "data": []}, status=200)
    result = photoapp.get_images()
    assert result == []
    assert len(responses.calls) == 3
```

**Implementation:**

```python
@retry(...)  # standard decoration
def get_images(userid=None):
    url = f"{WEB_SERVICE_URL}/images"
    if userid is not None:
        url = f"{url}?userid={userid}"
    response = requests.get(url, timeout=10)
    if response.status_code == 200:
        body = response.json()
        return [Image(**row) for row in body["data"]]
    if response.status_code in (400, 500):
        body = response.json()
        raise HTTPError(f"status code {response.status_code}: {body.get('message')}")
    response.raise_for_status()
```

**Checklist:**

- [ ] Failing tests added.
- [ ] Implement.
- [ ] Tests green.
- [ ] Integration: `make up && pytest tests/integration/test_against_compose.py::test_get_images` passes (after seeded data is in place).

### Task 2.2: `get_image(assetid, target_filename=None)`

**Files:**

- Modify: `client/photoapp.py`
- Create: `client/tests/unit/test_get_image.py`

**Behavior:**

- GET `/image/{assetid}` returns base64-encoded bytes in the JSON body.
- The function decodes the base64 and writes the bytes to `target_filename` (or `local_filename` from the response if `target_filename` is None).
- Returns the path it wrote.

**Failing tests:**

- 200 response with base64 → file written, function returns filename.
- 400 response (`no such assetid`) → `HTTPError` raised; no file written.
- 500 response → `HTTPError`.
- `ConnectionError` → retried; eventually succeeds.

**Implementation skeleton:**

```python
@retry(...)
def get_image(assetid, target_filename=None):
    url = f"{WEB_SERVICE_URL}/image/{assetid}"
    response = requests.get(url, timeout=20)
    if response.status_code == 200:
        body = response.json()
        local_filename = target_filename or body["local_filename"]
        with open(local_filename, "wb") as outfile:
            outfile.write(base64.b64decode(body["data"]))
        return local_filename
    if response.status_code in (400, 500):
        body = response.json()
        raise HTTPError(f"status code {response.status_code}: {body.get('message')}")
    response.raise_for_status()
```

**Checklist:**

- [ ] Failing tests; implement; green.

### Task 2.3: `get_image_labels(assetid)`

**Files:**

- Modify: `client/photoapp.py`
- Create: `client/tests/unit/test_get_image_labels.py`

**Failing tests:**

- 200 with empty data → `[]`.
- 200 with labels → `[Label(...), ...]`.
- 400 (`no such assetid`) → `HTTPError`.
- 500 → `HTTPError`.

**Checklist:**

- [ ] Failing tests; implement; green.

### Task 2.4: `get_images_with_label(label)`

**Files:**

- Modify: `client/photoapp.py`
- Create: `client/tests/unit/test_get_images_with_label.py`

**Failing tests:**

- 200 with rows → list of `ImageWithLabel`.
- 200 empty → `[]`.
- 500 → `HTTPError`.
- URL encoding: label `boat sail` is URL-encoded properly.

**Checklist:**

- [ ] Failing tests; implement; green.
- [ ] `urllib.parse.quote` used to encode the label.

---

## Phase 3: Write Use Cases

> **Optional Mermaid Visualization Step** — suggested file `visualizations/Target-State-project02-client-post-image-flow-v1.md`
>
> Before implementing `post_image`, render a `flowchart LR` of the **base64 round-trip** for upload so the encode/decode pair is unambiguous.
>
> - **Story**: "Open file → read bytes → base64-encode → JSON body → POST → server decodes → S3 → response → return assetid."
> - **Focus**: highlight the **two encode/decode boundaries** (client-side `base64.b64encode` and server-side `Buffer.from(..., 'base64')`) in **red** — these are paired and any drift breaks the round-trip silently. Highlight the **`local_filename` field** in **amber** — it's the only spec-required body key besides `data`.
> - **Shape vocab**: stadium `([...])` = caller; rounded `(...)` = client step; trapezoid = transform (encode/decode); cloud-style subgraph = web service; cylinder `[(...)]` = file on disk.
> - **Brevity**: ≤ 4 words / node; edges = verbs (`reads`, `encodes`, `posts`, `decodes`, `puts`).
> - **Direction**: `flowchart LR`, with the round-trip nature visible (the bytes form a horizontal arc).

### Task 3.1: `post_image(userid, local_filename)`

**Files:**

- Modify: `client/photoapp.py`
- Create: `client/tests/unit/test_post_image.py`

**Behavior:**

- Reads the file from disk; raises `FileNotFoundError` if missing — this is a client-side error, not retried.
- Base64-encodes the bytes; sends `{"local_filename": <basename>, "data": <base64>}` in the JSON body.
- Returns the integer `assetid` from the success response.

**Failing tests:**

- File missing → `FileNotFoundError`; no HTTP call made.
- 200 success → returns `assetid`.
- 400 (`no such userid`) → `HTTPError`.
- 500 → `HTTPError`.
- `ConnectionError` → retried.
- Confirm the request body contains `local_filename` (just the basename, not the full path) and base64-encoded bytes that round-trip.

**Implementation:**

```python
@retry(...)
def post_image(userid, local_filename):
    if not os.path.isfile(local_filename):
        raise FileNotFoundError(f"no such file: {local_filename}")

    with open(local_filename, "rb") as infile:
        encoded = base64.b64encode(infile.read()).decode()

    url = f"{WEB_SERVICE_URL}/image/{userid}"
    body = {"local_filename": os.path.basename(local_filename), "data": encoded}
    response = requests.post(url, json=body, timeout=60)

    if response.status_code == 200:
        return response.json()["assetid"]
    if response.status_code in (400, 500):
        body = response.json()
        raise HTTPError(f"status code {response.status_code}: {body.get('message')}")
    response.raise_for_status()
```

**Checklist:**

- [ ] Failing tests; implement; green.
- [ ] `tests.py` test exercises this against compose.

### Task 3.2: `delete_images()`

**Files:**

- Modify: `client/photoapp.py`
- Create: `client/tests/unit/test_delete_images.py`

**Failing tests:**

- 200 → returns `True`.
- 500 → `HTTPError`.
- `ConnectionError` → retried.

**Implementation:**

```python
@retry(...)
def delete_images():
    url = f"{WEB_SERVICE_URL}/images"
    response = requests.delete(url, timeout=30)
    if response.status_code == 200:
        return True
    if response.status_code in (400, 500):
        body = response.json()
        raise HTTPError(f"status code {response.status_code}: {body.get('message')}")
    response.raise_for_status()
```

**Checklist:**

- [ ] Failing tests; implement; green.

---

## Phase 4: Integration & Contract Coverage

### Task 4.1: Integration test sweep against compose

**Files:**

- Modify: `client/tests/integration/test_against_compose.py`

**Flow (mirrors the server happy-path):**

1. `get_ping()` → `(M, N)` with both ≥ 0.
2. `get_users()` → list including seeded test user.
3. `post_image(seeded_userid, "00no-labels.jpg")` → returns `assetid`.
4. `get_images()` → contains the new asset.
5. `get_images(userid=seeded_userid)` → contains the new asset.
6. `get_image(assetid, target_filename="<tmp>/round_trip.jpg")` → file written; bytes match the original.
7. `get_image_labels(assetid)` → list (may be empty for `00no-labels.jpg`).
8. `post_image(seeded_userid, "01degu.jpg")` → returns `assetid_2`.
9. `get_image_labels(assetid_2)` → non-empty (Rekognition canned mock returns `Animal`-family labels).
10. `get_images_with_label("Animal")` → contains `assetid_2`.
11. `delete_images()` → `True`.
12. `get_images()` → empty.

**Checklist:**

- [ ] Test passes against `make up`.
- [ ] Cleanup: even on test failure, the test calls `delete_images()` in `teardown_function` so subsequent runs start clean.

### Task 4.2: Contract conformance

**Files:**

- Create: `client/tests/contract/test_request_conformance.py`

**Behavior:**

- For each function: with `responses.activate`, call the function with canned inputs, capture the request, and assert (URL, method, body shape) matches the OpenAPI spec.
- `prance` or `openapi-core` Python libraries can validate requests against the OpenAPI document; alternatively, hand-roll URL pattern matching against `api/openapi.yaml` paths.

**Checklist:**

- [ ] Every API function has a contract test.
- [ ] Tests green.

### Task 4.3: Live integration

**Files:**

- Modify: `client/tests/live/test_against_real.py`

**Behavior:**

- Same flow as `test_against_compose.py` but pointing at a real-AWS-backed deployment (Part 02 territory; for now, the test exists but is gated and skipped).
- `pytest -m live` opts in.

**Checklist:**

- [ ] Test exists; gated correctly.
- [ ] Documented in `MetaFiles/EXPECTED-OUTCOMES.md` how to run live.

---

## Phase 5: `tests.py` Update

The Gradescope autograder is suspected to use the assignment-provided `tests.py` style as the basis for its own internal tests. Keep it readable and minimal.

### Task 5.1: Extend `tests.py` with one happy-path call per function

**Files:**

- Modify: `client/tests.py`

**Behavior:**

- Preserve the existing scaffold (imports, config loading, the existing `get_ping` / `get_users` calls).
- Add one happy-path call per remaining function: `get_images`, `post_image`, `get_image`, `get_image_labels`, `get_images_with_label`, `delete_images`.
- Use the seeded compose user / fixtures.

**Checklist:**

- [ ] `python tests.py` from the client image runs without error against `make up`.
- [ ] Output is human-readable.

---

## Phase 6: Gradescope Submission — Client API

### Task 6.1: Pre-flight checks

**Checklist:**

- [ ] `make lint` clean.
- [ ] `pytest -m "not live"` clean — every layer green.
- [ ] `pytest -m live` skipped without env var.
- [ ] `python tests.py` from client image passes.
- [ ] `photoapp-client-config.ini` (with real `WEB_SERVICE_URL`) is the only client config that ships in the submission.

> **Optional Utility Step** — suggested artifact `tools/gradescope-preview-client` (Bash + Python) or `make gradescope-preview-client`
>
> Mirror of `02-web-service.md` Phase 9's `tools/gradescope-preview` — closes the submit-wait-debug loop on the client side. Builds the submission bundle (`server/*.js + server/*.ini + client/photoapp.py`), runs the *server's* contract suite + *client's* `tests.py` against compose, prints a "you'd score N/30" estimate.
>
> - **What it does**: (1) copies `client/photoapp.py` over a fresh extract of the latest server tarball, (2) starts the bundle on a random port, (3) runs `python tests.py` against it, (4) parses the test output for pass/fail, (5) reports.
> - **Why now**: same logic as the server preview tool — the iteration loop is where this earns its keep.
> - **Decision branches**: build now (recommended if `tools/gradescope-preview` was built; this one is a 30-line extension), queue (acceptable if you anticipate first-shot success), skip (acceptable for a single-iteration submission).

> **Optional Test Step** — suggested file `client/tests/contract/test_request_envelopes.py`
>
> Symmetric to `02-web-service.md`'s spec-envelope-table test, but from the *client's* perspective: assert that for each function, the HTTP request the client emits matches the spec contract (correct verb, path, body shape). Uses `responses` to capture the request and assert against the expected shape.
>
> - **What to lock down**: for each function, the request the client emits is exactly what `api/openapi.yaml` describes (path, method, content-type, body keys for POST). One row per function in a `pytest.mark.parametrize` table.
> - **Why this catches bugs**: a typo in the URL template (`/image/{userid}` vs `/images/{userid}`) is the kind of thing the server's contract test won't catch — the client never reaches the server's spec layer with a typo'd URL. This test catches it on the request side.
> - **Decision branches**: build now (recommended for the same reasons as the server-side spec-envelope-table), queue, skip.

### Task 6.2: Submit

**Files:**

- Manual run: from inside the **server** docker image (per the assignment's submission shape, the client API submission is bundled with the server files):

```bash
# 1. Copy client/photoapp.py into server/
cp /path/to/client/photoapp.py /path/to/server/photoapp.py

# 2. Submit from server image
/gradescope/gs submit 1288073 8052765 *.js *.ini photoapp.py
```

**Checklist:**

- [ ] Submitted.
- [ ] Score recorded in `MetaFiles/refactor-log.md`.
- [ ] Iterate until 30/30: identify failing tests, augment internal pytest suite to reproduce, fix, resubmit.

### Task 6.3: Lock the wire contract

**Checklist:**

- [ ] After 30/30 lands, tag the commit `gradescope-client-30-30`.
- [ ] Update `MetaFiles/refactor-log.md` with date, commit SHA, snapshot.
- [ ] Open `04-engineering-surface.md` for the next workstream.

### Task 6.4: Documentation touchpoint (per CL11)

The client rewrite changes how a contributor *runs* the client (env var instead of direct AWS profile) and what `tests.py` exercises (HTTP, not direct AWS).

- [ ] Update `projects/project02/client/README.md` (create if absent): "the client talks to the web service over HTTP; configure `WEB_SERVICE_URL` in `photoapp-client-config.ini`; run `python client.py` or `python tests.py`."
- [ ] Update `MBAi460-Group1/MetaFiles/QUICKSTART.md`: append a "Working on the Project 02 client" subsection with the env-var path and the standard pytest invocation.
- [ ] If the client now requires Python deps a fresh checkout doesn't have (`requests`, `tenacity`, `pytest`, `responses`), add a "Python dependencies" subsection to the client README with the install command.
- [ ] **Fresh-clone smoke test:** a teammate (or yourself, in a fresh checkout) follows the updated README + QUICKSTART and reaches green tests for the client (`pytest -m "not live"`). Friction discovered → file under `MetaFiles/QUICKSTART.md` and re-run until clean.

---

## Acceptance Checklist

Before marking this workstream complete:

- [ ] `photoapp.py` implements all six remaining functions (`get_images`, `post_image`, `get_image`, `get_image_labels`, `get_images_with_label`, `delete_images`).
- [ ] Every function carries the standard retry decoration verbatim.
- [ ] Every function returns the exact Project 01 type (dataclass instance, list of dataclasses, tuple, int, bool, str).
- [ ] Errors propagate as `HTTPError` (400 / 500) or `FileNotFoundError` (`post_image` missing file).
- [ ] Unit tests cover happy path + every error branch + retry behaviour for every function.
- [ ] Integration test sweep against `make up` is green.
- [ ] Contract conformance test passes.
- [ ] `tests.py` exercises every function happily against compose.
- [ ] Gradescope client API: 30/30.
- [ ] No regression in the server-side workstream (server tarball still 60/60).

## Suggested Commit Points

- After Phase 1: `chore(client): bootstrap pytest harness + api_version config`.
- After Phase 2: `feat(client): get_images / get_image / get_image_labels / get_images_with_label`.
- After Phase 3: `feat(client): post_image + delete_images`.
- After Phase 4: `test(client): integration + contract + live coverage`.
- After Phase 5: `feat(client): tests.py exercises every api function`.
- After Phase 6: `chore(client): gradescope client api 30/30`.

## Risks And Mitigations

- **Risk:** `tenacity` retry exhausts attempts on a server-side flake during Gradescope grading.
  - **Mitigation:** the retry is bounded (3 attempts, exponential backoff); the server's own retries are independent. Total worst-case latency per call is ~30 s, well within Gradescope's per-test timeout.
- **Risk:** `post_image` reads the entire file into memory before encoding.
  - **Mitigation:** assignment scope; the largest fixture is < 5 MB. `get_image` symmetrically buffers. Engineering `/v2` resolves this with streaming uploads.
- **Risk:** URL encoding for `get_images_with_label` mishandles characters like `+` or `/`.
  - **Mitigation:** `urllib.parse.quote(label, safe='')` encodes everything; tests cover `boat`, `sail boat`, and label edge cases.
- **Risk:** Error response body is not JSON (e.g., a 502 from a load balancer).
  - **Mitigation:** the function falls through to `response.raise_for_status()` for unexpected status codes, which raises a generic `HTTPError`.
- **Risk:** `requests.Session` retry-via-`HTTPAdapter` collides with `tenacity`.
  - **Mitigation:** the module-level session uses default retries (zero); `tenacity` is the single retry mechanism on the client.
- **Risk:** Gradescope calls `tests.py` with a different `WEB_SERVICE_URL` than the one in our config.
  - **Mitigation:** `WEB_SERVICE_URL` is read from the config at module import; Gradescope's autograder either mounts its own config or expects a specific value. Confirm during first submission and document in `MetaFiles/refactor-log.md`.
- **Risk:** A request body with millions of base64 characters trips a server limit.
  - **Mitigation:** server's `express.json({limit: '50mb'})` handles up to 50 MB; the largest assignment fixture is well under that. The PDF agrees with the cap.

## Footnote: Behavioural Reference vs Wire Contract

Two contracts govern this workstream and they must not be conflated:

1. **Public contract (caller-facing):** the function signatures, return types, and exception semantics of `photoapp.py` as established in `projects/project01/client/photoapp.py` (Part 02). `client.py`, `gui.py`, the original `tests.py`, and Gradescope's `gs submit` test suite all depend on this. **Project 02 must not change it.**
2. **Wire contract (server-facing):** the HTTP routes / verbs / bodies / envelopes from `02-web-service.md`. Project 02 *adds* this contract — Part 02 didn't have it because it talked to AWS directly.

The Project 02 client is the **adapter** between the two. Every implementation function in this workstream:

- Reads the public-contract function signature from Part 02's `photoapp.py`.
- Translates input to the wire contract from `02-web-service.md`.
- Sends the HTTP call.
- Translates the wire response back to the public contract's return type.
- Maps wire errors back to public-contract exceptions (`HTTPError`, `FileNotFoundError`, etc.).

If the two contracts ever fundamentally disagree — say, Part 02 returns a list of tuples but the assignment baseline returns a list of dataclasses — defer to the **assignment baseline** (`projects/project02/client/photoapp.py` as shipped by the instructor) since that's what Gradescope tests against. Document the divergence from Part 02 in `MetaFiles/refactor-log.md` so future readers don't get confused.

## Footnote: Client-Side Spec Compatibility

`photoapp.py` is a Project 01 contract: callers use it without knowing it routes through a web service. The PDF says:

> _"All the client-side API functions must behave as they did in project 01, hiding the fact that they are now communicating with a web service."_

Every implementation in this workstream preserves that contract. If a Project 01 caller used `try/except HTTPError` around `post_image`, it still works. If a Project 01 caller iterated over `get_images()` results and accessed `.assetid`, it still works. If a Project 01 caller passed `userid=None`, the function still defaults to "all images".

The only observable difference: a connection / timeout error to the web service raises after retry exhaustion. That is in line with the PDF's specified retry policy and is the documented failure mode.
