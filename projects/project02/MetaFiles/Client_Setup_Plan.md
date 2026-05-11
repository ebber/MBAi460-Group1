# Client setup plan — local browser GUI + API (Streamlit + Docker)

This plan gets a developer from **no containers running** to **PhotoApp in the browser** (Streamlit) talking to the **Node service** on port 8080, then tightens the workflow via the Makefile.

**Context:** `make docker-up-aws` / `make docker-up-localstack` start only the **server** service. The **Streamlit** app (`client/gui.py`) is started **on the host** unless/until a `client` Compose service exists.

---

## Phase 1 — Manual test

**Goal:** Prove the path works on your machine before automating anything.

### 1.1 Start the API (Docker)

From the Project 02 root (`projects/project02/`):

```bash
cd /path/to/MBAi460-Group1/projects/project02
```

**AWS lane** (real RDS / S3 / Rekognition):

- Prerequisite: `client/photoapp-config.ini` present and valid.
```bash
make docker-up-aws
```

**LocalStack lane** (offline mocks):

```bash
make docker-up-localstack
```

Smoke optional:

```bash
curl -s http://localhost:8080/healthz
```

### 1.2 Client config points at the API (from the host)

Edit `client/photoapp-client-config.ini`:

```ini
[client]
webservice=http://localhost:8080
```

Use `http`, **no trailing slash**.

### 1.3 Run the GUI on the host (Streamlit)

```bash
cd client
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install streamlit pillow requests tenacity
streamlit run gui.py
```

Open the URL Streamlit prints (typically **http://localhost:8501**). Exercise **Status**, **Users**, and one flow that hits the API (e.g. **Browse Images**).

### 1.4 Tear down (when finished)

From Project 02 root:

```bash
make docker-down
```

**Exit criteria for Phase 1:** GUI loads, `initialize` succeeds, at least one API-backed action works (or a clear, documented infra error if AWS/LocalStack is misconfigured).

---

## Phase 2 — Review and make any changes

**Goal:** Turn the one-off manual path into a repeatable, documented setup with minimal friction.

### 2.1 Dependencies

- Decide whether `client` should use **`requirements.txt`** or **`pyproject.toml`** (Makefile’s `install` / `test` already anticipate `pyproject.toml` in Phase 3 of the broader roadmap). List **Streamlit**, **Pillow**, **requests**, **tenacity**, and anything `photoapp.py` imports.
- Pin versions lightly if the team wants reproducibility.

### 2.2 Configuration

- Document **`photoapp-client-config.ini`** for local dev (`localhost:8080`) vs EB (`http://…elasticbeanstalk.com`).
- Add or extend **`client/README.md`** with “Run the GUI” steps (or link to this file).

### 2.3 Gaps vs course / Compose

- Note that **Compose** does not start the Python client today (`client` service commented). If the team runs GUI only on the host, state that explicitly.
- If GUI should run **inside Docker** later, capture requirements (image with Streamlit, port **8501**, `webservice=http://server:8080` on the Compose network)—that becomes input to Phase 3 or a follow-up.

### 2.4 Optional quality checks

- Run `client.py` or `pytest` on `tests.py` against the running server.
- Confirm **LocalStack** lane: `make docker-up-localstack` then GUI against the same `webservice=http://localhost:8080` (server publishes 8080 to host).

**Exit criteria for Phase 2:** Written dependency list, config notes, and any fixes from real friction (paths, ports, missing packages).

---

## Phase 3 — Formalize (Makefile + helpers)

**Goal:** Automate or shorten the **client** side without removing clarity; keep Docker lane targets as the source of truth for the API.

### 3.1 Proposed Makefile targets (implement after Phase 2 is stable)

| Target | Purpose |
|--------|---------|
| `client-venv` | Create `client/.venv` if missing (`python3 -m venv`). |
| `client-install` | `pip install -r client/requirements.txt` (or equivalent) inside `.venv`. |
| `client-gui` | Activate venv + `streamlit run gui.py` from `client/` (document that this is long-running / interactive). |

**Constraints:**

- Do not assume Streamlit runs **inside** Docker unless a `client` Dockerfile and Compose service exist; default remains **host** Streamlit + **Docker** API.
- `client-gui` may be implemented as a documented shell recipe in the Makefile (`cd client && . .venv/bin/activate && streamlit run gui.py`) so operators have one command.

### 3.2 Optional follow-ups

- **`make dev`:** `docker-up-aws` (or `localstack`) in background + print reminder to run `make client-gui` (avoid running Streamlit in background blindly).
- **`.PHONY`:** Register new targets next to existing `help` awk so `make help` lists them.
- **CI:** Optional job that only checks `pip install` + `python -c "import photoapp"` (no long-running Streamlit).

### 3.3 Documentation sync

- Update **`README.md` “Run options”** with a **“Run the Streamlit client (GUI)”** subsection pointing at `make client-install` / `make client-gui` once merged.

**Exit criteria for Phase 3:** `make help` shows client targets; a new clone can follow README + Makefile to reach the GUI with minimal copy-paste.

---

## Reference — quick command chain (post–Phase 3 target)

```text
make docker-up-localstack    # or: make docker-up-aws
make client-install          # once per venv refresh
make client-gui              # browser → Streamlit URL
# … when done …
make docker-down
```

---

## Related files

- `Makefile` — server Docker lanes (`docker-up-aws`, `docker-up-localstack`, `docker-down`).
- `docker-compose.yml` — `server` service; `client` service placeholder.
- `client/gui.py` — Streamlit UI.
- `client/photoapp-client-config.ini` — `webservice` base URL.
