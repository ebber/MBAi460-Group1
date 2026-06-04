# NoteFlow — Architecture Specification

> **Status:** Design / ideation — **not yet implemented.** This is the architecture spec for the MBAI 460 Final Project.
> **Date:** 2026-06-03
> **Posture:** Scalable showcase — ships the MVP while opening clean headroom for future expansion.
> **Scope note:** This spec deliberately **excludes the AWS IAM world** (roles, policies, least-privilege wiring) — that is a separate layer. It also treats the **Obsidian vault API as a black box** (an external interface), and treats note **structuring as Obsidian's job** (NoteFlow only extracts).

---

## 1. Overview

**NoteFlow** turns captured notes into organized knowledge. A user uploads a **picture of handwritten notes** plus a **meeting transcript (as text)** and optionally other media. NoteFlow **extracts** the note content (via Amazon Rekognition for the MVP), **packages** the results, and hands them to the user's **Obsidian vault** (via the vault's API), which **structures and stores** them. NoteFlow then returns a **link to the specific vault page** back to the user.

The product is delivered through three surfaces over one service:

| Surface | Role |
|---|---|
| **Web frontend** | UI wrapper over the public API |
| **Mobile app** | UI wrapper over the public API |
| **Public API** | Raw access — accessing the service directly |

**Authentication:** Google SSO (application-level identity; distinct from the excluded AWS-IAM layer).

---

## 2. Functional flow (async, fire-and-forget)

Processing is **asynchronous fire-and-forget**: the user is not held waiting. They get an immediate "received" acknowledgment with a job handle, and later retrieve the finished vault link.

```
1. Client authenticates (Google SSO) and requests an upload slot.
2. API mints a presigned S3 URL and creates a PENDING job record.
3. Client uploads the image + media DIRECTLY to S3 (bytes never transit the API).
4. The object landing in S3 enqueues a processing job (SQS).
5. Processor (Lambda) reads the object, runs Rekognition extraction.
6. Processor packages three outputs:
      • extracted content
      • couldn't-extract remainder  (→ "DONE_WITH_GAPS")
      • raw input (references)
7. Processor calls the external Obsidian vault API → receives a vault page link.
8. Processor writes status = DONE + the vault link to the job record.
9. Client polls job status; on DONE, it shows/returns the vault page link.
```

**Inputs handling.** The note **image** and any **other media** upload directly to S3 via presigned URL; only **images** are Rekognition-processed in the MVP (other media is stored and passed through as part of the *raw input* bucket). The **meeting transcript** is text — it rides with the job request, is stored in the job record, and is included in the package sent to Obsidian. (Note: the original "structured information" output is named **"extracted content"** here, since NoteFlow extracts and Obsidian structures.)

---

## 3. Architecture shape

**Fully serverless, event-driven** — chosen for "scalable showcase + future expansion": scale-to-zero economics at MVP volume (≤5 concurrent users, <100 uploads/day), automatic elasticity for 10×–100× growth, and the cleanest seam to add services later. Serverless's usual weak point — cold-start latency — is **neutralized by the fire-and-forget design** (nobody is waiting on the synchronous path).

### Resolved decisions

| Decision | Choice | Rationale (short) |
|---|---|---|
| Compute shape | **Serverless, event-driven** (API Gateway + Lambda) | Scale-to-zero; elastic; modern idiom; async hides cold starts |
| State store | **DynamoDB** | Pure key-lookup access; $0 idle; conditional-write idempotency; Streams for fan-out |
| Notification | **Client polling** (`GET /jobs/{id}`) | Tail latency is the external Obsidian call; polling is stateless, reconnection-safe, and the natural contract for the raw API client |
| Upload path | **Presigned-S3 direct** | Multi-MB images exceed API GW (10 MB) / Lambda (6 MB) limits; keeps bytes out of paid compute; Rekognition reads from S3 anyway |
| Pipeline backbone | **SQS → Lambda + DLQ** | Lean, durable, idiomatic; DLQ catches poison jobs; Step Functions is the named seam when the pipeline branches |

---

## 4. Component inventory (excludes the IAM world)

> This is the concrete component set the architecture diagram will render. **Open sub-decisions** are flagged ⬚ for confirmation.

**Clients / consumers**
- Web frontend (SPA) — UI wrapper
- Mobile app — UI wrapper
- Raw public-API consumers

**Identity (external)**
- **Google SSO** (OIDC identity provider)
- ⬚ *Optional broker:* Amazon Cognito as the OIDC federation/token layer, vs. validating Google tokens directly at an API Gateway JWT authorizer. *(Sub-decision — default lean: API Gateway JWT authorizer against Google, no Cognito, unless multi-tenant user management is wanted.)*

**Edge / API**
- **Amazon API Gateway** (HTTP API) with routes:
  - `POST /uploads` — mint presigned S3 URL + create PENDING job
  - `GET /jobs/{jobId}` — status polling (returns vault link when DONE)
  - `GET /jobs` — list the authenticated user's jobs

**Compute (AWS Lambda)**
- `create-upload` Lambda — authorizes, mints presigned S3 PUT, writes PENDING job
- `processor` Lambda — **SQS-triggered**: reads S3 object → Rekognition → packages 3 outputs → calls Obsidian API → writes DONE/link
- `status` Lambda — serves `GET /jobs/{jobId}` and `GET /jobs`
- ⬚ *Authorizer:* API Gateway JWT authorizer (config) vs. a dedicated authorizer Lambda *(sub-decision)*

**Messaging**
- **Amazon SQS** — processing queue
- **Amazon SQS (DLQ)** — dead-letter queue (redrive after ~3 attempts)
- ⬚ *Enqueue trigger:* **S3 event notification (ObjectCreated) → SQS** *(recommended — robust to client death; correlate via S3 key = `jobId`)* vs. client `confirm` call → API → SQS *(sub-decision)*

**Storage**
- **Amazon S3** — raw input bucket (images + media)
- **Amazon DynamoDB** — single table: job status + user↔vault mapping + metadata; TTL on terminal jobs

**AI / extraction**
- **Amazon Rekognition** — `DetectText` + `DetectLabels` (MVP)

**External interfaces**
- **Obsidian vault API** (black box) — receives packaged outputs, structures + stores, returns a vault **page link**
- **Google SSO** (see Identity)

**Observability (recommended, modern/production-grade)**
- Amazon CloudWatch — logs, metrics, alarms (e.g., DLQ depth alarm)

---

## 5. Data model sketch (DynamoDB, single-table)

| Entity | Key | Notable attributes |
|---|---|---|
| **Job** | `PK = JOB#<jobId>` | `status` (PENDING / PROCESSING / DONE / DONE_WITH_GAPS / FAILED), `userId`, `s3Key`, `transcriptRef`, `vaultPageLink`, `createdAt`, `updatedAt`, `ttl` |
| **User→Vault** | `PK = USER#<googleSub>` | vault identifier / handwaved Obsidian credentials ref, defaults |
| **List jobs (GSI)** | `GSI1PK = USER#<userId>`, `GSI1SK = JOB#<createdAt>` | supports `GET /jobs` |

---

## 6. Reliability & error handling

- **DLQ** behind the processing queue (redrive after ~3 attempts) isolates poison jobs (corrupt image, persistent Rekognition failure) without blocking the queue.
- **Idempotency keyed on `jobId`** — conditional DynamoDB writes + an idempotent Obsidian call, so SQS at-least-once redelivery never creates duplicate vault pages.
- **Partial extraction → `DONE_WITH_GAPS`** — content Rekognition can't read flows into the "couldn't-extract remainder" output bucket rather than failing the whole job. (This is also where handwriting Rekognition can't read lands — the future-Textract seam.)
- **Obsidian call** wrapped in a bounded timeout + limited backoff retry; on persistent outage → `FAILED` (visible to the poller) or DLQ — never hang.
- **`DONE` is only written after** the vault page-link is durably persisted to the job record (the link is what the user polls for).

---

## 7. Future-expansion seams

The MVP is built so these slot in without re-architecture:

- **Richer extraction** — Amazon **Textract** (better handwriting/documents), **Transcribe** (audio → transcript), **Bedrock/Comprehend** (semantic structuring, entities) added as additional processing steps.
- **Orchestration** — when a 2nd extraction service lands, lift the linear SQS→Lambda chain into **AWS Step Functions** (branching, per-step retry/timeout) while keeping SQS as the durable ingress buffer.
- **Real-time notification** — if near-real-time UX becomes a requirement, move from polling to **AppSync subscriptions** (ride the existing event-driven backbone; keep the poll contract for the raw API).
- **Multi-tenant** — tenant partition key in DynamoDB; Cognito for user/tenant management.
- **Cross-service routing** — EventBridge as the bus if/when multiple consumers subscribe to NoteFlow events.

---

## 8. Tradeoff log (latency ↔ capacity ↔ cost at the impactful forks)

Captured from a three-lens adversarial pressure-test (cost/scalability · latency/reliability · ops/modernity) — all three converged unanimously.

| Fork | Chosen | Latency | Capacity / scale | Cost | "Wrong when…" |
|---|---|---|---|---|---|
| **State store** | DynamoDB | single-digit-ms, no warm-up | elastic, no connection ceiling | ~$0 idle (on-demand) | roadmap turns genuinely relational/analytical (cross-user search, ad-hoc joins) |
| **Notification** | Polling | adequate (tail = external Obsidian) | trivial at MVP; AppSync if huge waiter counts | pennies; reuses status table | real-time/collaborative UX becomes the product |
| **Upload** | Presigned-S3 | one extra mint round-trip | S3 absorbs upload concurrency | PUT ≈ free; no Lambda byte-shuttle | must reject/scan bytes *before* they persist |
| **Backbone** | SQS→Lambda+DLQ | low; async | scales per-message; DLQ safety | per-invocation only | pipeline branches (→ Step Functions) |

---

## 9. Out of scope / non-goals (MVP)

- AWS IAM design (roles, policies, least-privilege) — separate layer.
- Obsidian vault internals + the structuring logic — Obsidian's responsibility.
- Audio transcription (transcript arrives as text); non-Rekognition extraction services.
- Real-time push notification; multi-tenant management; Step Functions orchestration — all named seams, not MVP.
