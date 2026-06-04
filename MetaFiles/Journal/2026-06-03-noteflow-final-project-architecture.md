# 2026-06-03 — NoteFlow (Final Project) architecture spec + diagram

**Session type:** Design / ideation. Produced an architecture spec and diagram for the Final Project. **No code, no infrastructure** was written — this is a design artifact to build *from*.

## What landed

Two artifacts, committed and pushed under `FinalProject/`:
- **`spec.md`** — the NoteFlow architecture specification.
- **`architecture.html`** — a self-contained architecture diagram (open it by double-clicking; it renders offline, no server needed).

## What NoteFlow is

A capture-to-knowledge app. A user uploads a **picture of handwritten notes** plus a **meeting transcript (text)** and other media. NoteFlow **extracts** the content (Amazon Rekognition for the MVP), **packages** it (extracted content · couldn't-extract remainder · raw input), and hands it to the user's **Obsidian vault via its API** — Obsidian does the *structuring*. NoteFlow returns a **link to the resulting vault page**. Delivered through three surfaces over one service: **web frontend**, **mobile app**, and a **raw public API**. Auth is **Google SSO**.

## The architecture (and why)

**Fully serverless, event-driven, asynchronous fire-and-forget.** Chosen as a "scalable showcase": near-zero cost at MVP volume (≤5 concurrent users, <100 uploads/day), automatic elasticity, clean room to grow.

Component decisions were each pressure-tested (cost vs. latency vs. capacity), and converged on:

| Decision | Choice | Why |
|---|---|---|
| Compute | Serverless (API Gateway + Lambda) | scale-to-zero, elastic; async hides cold starts |
| State store | **DynamoDB** | key-lookup access (job status, user↔vault map); ~$0 idle; idempotent conditional writes |
| Notification | **Client polling** `GET /jobs/{id}` | the tail latency is the external Obsidian call; polling is stateless and right for the raw API client |
| Upload | **Presigned-S3 direct** | images exceed API/Lambda payload limits; keeps bytes out of paid compute; Rekognition reads from S3 |
| Pipeline | **SQS → Lambda + DLQ** | durable, idiomatic; DLQ isolates poison jobs; Step Functions is the named seam for when the pipeline branches |

Reliability is built in: DLQ + `jobId`-keyed idempotency (no duplicate vault pages on redelivery); partial extraction surfaces as `DONE_WITH_GAPS` (mapping to the "couldn't-extract" output); `DONE` is only written after the vault link is durably persisted.

See `spec.md` §8 for the full tradeoff log.

## Decisions left open (defaults baked, easy to flip)

The diagram renders three default leans, labeled on it:
1. **No Cognito** — a JWT authorizer validates Google tokens at API Gateway directly.
2. **S3-event → SQS** enqueue (S3 object key = `jobId`), robust to client death.
3. **JWT authorizer as config** (no dedicated authorizer Lambda).

Flag if any of these should change before this becomes the implementation baseline.

## Scope boundaries (so no one is surprised)

- **Excludes the IAM layer** (roles/policies/least-privilege) — a separate design pass.
- **The Obsidian vault API is a black box** in this spec — it must be defined concretely before implementation.
- MVP extraction is **Rekognition only**. Textract / Transcribe / Bedrock are named future-expansion seams, not built.

## Open threads / next steps for whoever picks this up

- Implementation would start from `spec.md` (the brainstorming stopped deliberately at spec + diagram).
- Resolve the three open sub-decisions above.
- Define the Obsidian vault API contract (auth, endpoints, the page-link format).
- Design the IAM layer separately.
