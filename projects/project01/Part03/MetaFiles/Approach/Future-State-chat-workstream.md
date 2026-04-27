# Future-State Workstream — Chat (Project 03 webhook + SSE shim)

**Status:** Aspirational. **Not committed to Part 03.** Ships when Project 03's chat infrastructure (`chatapp` schema + chat Lambda handlers + webhook delivery model) lands.
**Source:** distilled from Andrew's `UI-Design-Requirements.md` §6 (chat endpoints), §13.4 — and the working `ChatScreen` MVP in `screens.jsx` lines 130–228.

---

## Goal

Wire Andrew's `ChatScreen` (already built as a working visual MVP) to Project 03's webhook-based chat infrastructure. Add an SSE shim so the UI receives messages in near-real-time without long-polling.

## Scope

**In scope (when this workstream lands):**

- Backend chat service:
  - `GET /api/chat/messages?since=<message_id>` — returns messages newer than the given id (cursor-based polling fallback).
  - `POST /api/chat/messages` body `{ to: <userid>, text: <string> }` — registers a chat message; the Project 03 chat Lambda's webhook callbacks deliver it to recipients.
  - `GET /api/chat/participants` — lists registered chat users from `chatapp.registered`.
  - `GET /api/chat/stream` — Server-Sent Events endpoint; the **shim** that converts the webhook delivery model into a browser-friendly real-time stream.
- Backend chat infrastructure:
  - SSE shim (Express): when a Project 03 chat-Lambda fires a webhook to our server, the shim broadcasts the message to all connected SSE clients (filtered by recipient).
  - Webhook registration: on user login, the server registers the user's `displaynamehook` + `messagehook` URLs (pointing back at our SSE shim) with the Project 03 chat Lambda.
- UI:
  - Andrew's `ChatScreen` from `screens.jsx` lines 130–228 — already built; just needs wiring.
  - Replace mock messages with real `GET /api/chat/messages` on mount + EventSource on `/api/chat/stream`.
  - Send: replace the local `setMsgs` simulation with `POST /api/chat/messages`; optimistically append; reconcile on receipt confirmation.
  - Read receipts ("sent" → "delivered") driven by webhook acknowledgements.
  - SSE connection status indicator (already in Andrew's MVP — green dot + "SSE · GET /chat/stream" text).
  - Exponential-backoff reconnection on SSE drop (mentioned in Andrew's MVP placeholder text).
- Schema reads (per Project 03):
  - `chatapp.registered` — webhook registrations.
  - Project 03 doesn't ship a `chatapp.messages` table per `create-chatapp.sql` (it's webhook-delivered, not persisted) — confirm; add a local `chat_history` table on our server if persistence is desired.

**Out of scope:**

- Group chats / channels (v1 is 1:1 only — Andrew's design has a "# general" channel as visual scaffold; real implementation is direct-message-only first).
- File attachments in chat.
- Reactions / threaded replies / mentions.
- Search across chat history.
- E2E encryption (the webhook model isn't designed for it).

## Dependencies

**Workstream-blocking:**

- Project 03's chat Lambda deployed.
- Project 03's webhook delivery model documented (URL format, payload shape, retry semantics).
- `chatapp.registered` schema live in RDS.
- Decision: do we persist messages on our server (for replay-on-reconnect)? If yes: new `chat_history` table; if no: clients lose missed messages on disconnect.

**Non-blocking but recommended:**

- Authenticated users only (depends on Future-State Auth workstream — token resolution for SSE auth).
- Rate-limiting on `POST /api/chat/messages` (Express middleware).

## Implementation phases (sketch)

### Phase A — Webhook registration

- On user login (Phase B of Auth workstream), our Express server registers two webhook URLs with the Project 03 chat Lambda:
  - `displaynamehook` → `https://<our-server>/webhooks/chat/displayname`
  - `messagehook` → `https://<our-server>/webhooks/chat/message`
- These webhooks are how Project 03's chat Lambda *delivers* messages to us.

### Phase B — SSE shim

- New: `server/routes/chat-stream.js` — Express SSE endpoint.
- Maintain in-memory map: `userid → SSE response stream`.
- Webhook receivers (`/webhooks/chat/message`) push messages onto the recipient's SSE stream.
- Heartbeat every 15s to keep the connection alive.
- Reconnect-since support: client passes `Last-Event-ID` header; server replays from in-memory buffer (last N messages).

### Phase C — Backend routes

- `GET /api/chat/participants` → `SELECT * FROM chatapp.registered WHERE active = 1`.
- `POST /api/chat/messages` → calls Project 03's chat Lambda's "send message" endpoint; expects fan-out to recipients via webhooks.
- `GET /api/chat/messages?since=<id>` → reads from local `chat_history` table (if persistence enabled) or empty list (if pure-webhook model).

### Phase D — UI wire-up

- Wire `ChatScreen` (Andrew's `screens.jsx` lines 130–228) to real endpoints.
- Replace `window.MOCK.MESSAGES` with `apiFetch('/api/chat/messages?since=0')` on mount.
- Replace `window.MOCK.CHAT_USERS` with `apiFetch('/api/chat/participants')`.
- Replace local `setMsgs` simulation with `POST /api/chat/messages` + optimistic append + EventSource update on confirmation.
- Wire SSE status indicator to actual EventSource connection state.

### Phase E — Reconnect + acceptance

- Test: kill SSE connection → reconnect with backoff → replay missed messages.
- Test: send while offline → queue locally → flush on reconnect.
- Acceptance: 1:1 chat works between two browser sessions in <2s end-to-end latency.

## Risks and Mitigations

- **Risk:** Webhook delivery is not guaranteed in-order; messages may arrive out of sequence.
  - **Mitigation:** every message has a server-assigned `id` (sequential per user-pair); client sorts on receipt; backfill on reconnect.
- **Risk:** SSE shim is in-memory; server restart loses connections + buffer.
  - **Mitigation:** v1 accepts: clients reconnect after server restart; replay from `chat_history` if persisted (Phase A decision).
- **Risk:** Webhook registration depends on stable URLs for our server. In dev (`localhost:8080`), webhooks can't reach us from the Project 03 Lambda.
  - **Mitigation:** local-dev story uses `cloudflared` or `ngrok` tunnel — capture as a dev-loop note in `MBAi460-Group1/MetaFiles/Future-State-Ideal-Lab.md` (already references cloudflared).
- **Risk:** Andrew's `ChatScreen` MVP simulates state transitions ("sent" → "delivered" via setTimeout); real wire-up changes the UX timing.
  - **Mitigation:** preserve the visual state machine; just drive it from real events. Acceptance assertion: states still transition in the same order.
- **Risk:** No persistence (pure-webhook) means a missed message during disconnect is lost forever.
  - **Mitigation:** v1 enables a small `chat_history` table on our server; cap at last 1000 messages per user-pair; archive older.

## Source / cross-refs

- Andrew's `UI-Design-Requirements.md`: §6 (chat endpoints), `screens.jsx` ChatScreen demo + status indicator
- `ClaudeDesignDrop/raw/MBAi-460/src/screens.jsx` lines 130–228 (ChatScreen MVP — already production-quality visual)
- `ClaudeDesignDrop/raw/MBAi-460/src/data.jsx` (MOCK_MESSAGES, MOCK_CHAT_USERS — example shapes)
- Project 03 source: `projects/project03/create-chatapp.sql`, `projects/project03/client/client.py` (reference webhook client)
- `MBAi460-Group1/MetaFiles/Future-State-Ideal-Lab.md` (cloudflared tunnel for local webhook testing — already in backlog)

---

## Andrew's accelerator artifacts (added 2026-04-27 per sub-A Phase 5)

Andrew's `ChatScreen` demo lives in `ClaudeDesignDrop/raw/MBAi-460/src/screens.jsx` (lines 130–228 per the existing source-refs). The curated copy is at `Part03/Accelerators/ArtifactsForFormLibrary/screens.jsx` (cross-workstream sharing — see `Accelerators/ArtifactsForFormLibrary/README.md` for the per-screen split note).

There's no separate `ArtifactsForChat/` subfolder — chat-specific source code is bounded to the ChatScreen demo + mock data shapes (`data.jsx`'s `MOCK_MESSAGES` / `MOCK_CHAT_USERS`). When this workstream activates, the executing agent extracts the ChatScreen patterns from the multi-screen file.

**Audit cross-refs:** rows 26 (J5 chat journey), 76 (chat full screen layout + states), 99 (FR-CHAT-1..8 grouped) in `Andrew-MVP-Integration.md`.
