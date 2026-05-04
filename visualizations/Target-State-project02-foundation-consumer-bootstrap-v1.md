# Target State — Project 02 Foundation Consumer Bootstrap (v1)

> **Status:** Proposed (sub-phase 1.0 of Project 02 Part 01 quest, in progress on `feat/p02-foundation`).
> When sub-phase 1.0 closes, rename to `project02-foundation-consumer-bootstrap-v1.md` per `claude-workspace/memory/feedback_visualization_naming.md`.
>
> **Source Approach doc:** `MBAi460-Group1/projects/project02/client/MetaFiles/Approach/01-foundation.md` § Phase 0
>
> **Plan reference:** `MBAi460-Group1/projects/project02/client/MetaFiles/Approach/Plan.md` § Phase 1.0
>
> **Builds on:** `Target-State-mbai460-photoapp-server-lib-extraction-v1.md` (Phase 0 of the quest landed the library; this viz shows Project 02 wiring up as the second consumer).
>
> **Last updated:** 2026-05-04 — v1 authored.

---

## Story

`@mbai460/photoapp-server@1.0.0` already sits at `MBAi460-Group1/lib/photoapp-server/` with Part 03 as its first consumer. Sub-phase 1.0 brings Project 02 online as the **second consumer**:

1. **Workspace root** declares `projects/project02/server` as a workspace.
2. **`npm install`** from the root resolves the library through a **node_modules symlink**, not an npm registry pull.
3. **Project 02's smoke `app.js`** `requires` the library and exercises one re-export (`schemas.envelopes.successResponse`) via a temporary `/__bootcheck` route to prove the symlink end-to-end.
4. The **DI seams** Project 02 will inject in subsequent sub-phases (1.5 errorMiddleware, 1.7 pool, 1.7 breakers) are signposted here as future work; sub-phase 1.0 wires only the smoke import.

**Sub-phase 1.0 outcome:** Project 02 boots, prints "listening on :8080", `/__bootcheck` returns the library's success-envelope shape, the route is deleted, and a permanent 5-line `library_resolution.test.js` keeps the symlink under CI watch.

## Focus (color semantics)

- **⚫ Gray-bordered subgraph — Library boundary** (`@mbai460/photoapp-server`). Do not modify here in any consumer workstream; library changes go through the library's own PR cycle (CL2 + CL12).
- **🟠 Amber — DI seams.** Factories the consumer constructs: `createErrorMiddleware({...})` (Phase 1.5), `pool` injection into `services/photoapp` (Phase 1.7), `opossum` breakers wrapping `getBucket()` / `getRekognition()` (Phase 1.7). All three are *future* work in sub-phase 1.0; shown dashed-amber as forward references.
- **🟢 Green — Project 02 net-new files.** Files this sub-phase or later sub-phases of Phase 1 add under `projects/project02/server/`. The smoke `app.js` + `server.js` are solid green (1.0); the rest are dashed-green (forward references to 1.3–1.7).
- **🟡 Yellow — Smoke artifacts.** `/__bootcheck` route + the library exports check; both are temporary or permanent-but-tiny.

---

## Consumer bootstrap architecture

```mermaid
flowchart LR
    subgraph ROOT["Workspace root · MBAi460-Group1/"]
        R_PKG["package.json<br/>(workspaces declares<br/>projects/project02/server)"]
        R_LOCK["package-lock.json"]
        R_NPMRC[".npmrc<br/>engine-strict=true"]
    end

    subgraph LIB["@mbai460/photoapp-server@1.0.0 · lib/photoapp-server/src/"]
        L_CFG["config.js"]
        L_SVC["services/photoapp.js"]
        L_AWS["services/aws.js"]
        L_ERR["middleware/error.js<br/>createErrorMiddleware()"]
        L_UPL["middleware/upload.js<br/>createUploadMiddleware()"]
        L_REPO["repositories/*"]
        L_SCH["schemas/envelopes.js<br/>successResponse() / errorResponse()"]
    end

    subgraph P02["projects/project02/server/"]
        P_PKG["package.json<br/>(consumer manifest)"]
        P_NM[("node_modules/<br/>@mbai460/photoapp-server<br/>symlink → ../../../lib/photoapp-server")]
        P_APP["app.js<br/>(smoke 1.0 → real 2.x)"]
        P_SRV["server.js"]
        P_BOOT(["/__bootcheck<br/>(temp; deleted after 0.5)"])
        P_TEST["tests/unit/library_resolution.test.js<br/>(permanent, 5 lines)"]

        P_ERR_DI[/"errorMiddleware<br/>(DI: statusCodeMap,<br/>errorShapeFor, logger)"/]
        P_POOL_DI[/"pool injection<br/>(mysql2.createPool)"/]
        P_BRK_DI[/"breakers<br/>(opossum wraps<br/>getBucket / getRekognition)"/]

        P_POOL["services/pool.js<br/>(future: 1.7)"]
        P_BRK["services/breakers.js<br/>(future: 1.7)"]
        P_REQID["middleware/request_id.js<br/>(future: 1.4)"]
        P_LOG["middleware/logging.js<br/>(future: 1.3)"]
        P_VAL["middleware/validate.js<br/>(future: 1.6)"]
    end

    %% Bootstrap flow (sub-phase 1.0)
    R_PKG -- "npm install" --> P_PKG
    R_PKG -- "creates" --> P_NM
    P_NM -. "symlink resolves" .-> LIB
    P_PKG -- "requires" --> P_NM
    P_APP -- "requires" --> P_NM
    P_APP --> P_BOOT
    P_BOOT -- "uses" --> L_SCH
    P_SRV -- "boots" --> P_APP
    P_TEST -- "asserts shape" --> P_NM

    %% DI seams (forward references; dashed amber)
    P_APP -. "future: injects" .-> P_ERR_DI
    P_ERR_DI -. "configures" .-> L_ERR
    P_POOL -. "future: injects" .-> P_POOL_DI
    P_POOL_DI -. "into" .-> L_SVC
    P_BRK -. "future: wraps" .-> P_BRK_DI
    P_BRK_DI -. "around" .-> L_AWS

    %% Library boundary - gray
    classDef libBoundary fill:#f5f5f5,stroke:#555,stroke-width:2px,color:#333
    class L_CFG,L_SVC,L_AWS,L_ERR,L_UPL,L_REPO,L_SCH libBoundary

    %% Net-new (solid green - sub-phase 1.0)
    classDef p02Now fill:#dfe,stroke:#391,stroke-width:2px,color:#222
    class P_PKG,P_APP,P_SRV,P_TEST p02Now

    %% Net-new (dashed green - forward references)
    classDef p02Later fill:#eef7ee,stroke:#391,stroke-dasharray: 4 3,color:#555
    class P_POOL,P_BRK,P_REQID,P_LOG,P_VAL p02Later

    %% DI seams - amber dashed
    classDef diSeam fill:#fff3d6,stroke:#cc8800,stroke-dasharray: 4 3,color:#553300
    class P_ERR_DI,P_POOL_DI,P_BRK_DI diSeam

    %% Smoke artifact - yellow
    classDef smokeArt fill:#ffffcc,stroke:#aa9900,color:#444
    class P_BOOT smokeArt

    %% Symlink cylinder - neutral
    classDef symlink fill:#fafafa,stroke:#666,color:#222
    class P_NM symlink
```

**Reading:**

- The **gray library subgraph** is internals-only and immutable from a consumer's vantage point. Project 02 reaches it only through the symlinked `node_modules/@mbai460/photoapp-server`.
- **Solid green** (`package.json`, `app.js`, `server.js`, `library_resolution.test.js`) lands in sub-phase 1.0.
- **Dashed green** (`pool.js`, `breakers.js`, `request_id.js`, `logging.js`, `validate.js`) is forward-referenced from the Approach's later sub-phases (1.3–1.7) so the architecture is legible; sub-phase 1.0 does not create these.
- **Amber trapezoids** are the **DI seams** — the configuration points where Project 02's wiring will diverge from Part 03's. Dashed because they aren't constructed yet; solid in v2 once Phase 1 closes.
- **Yellow `/__bootcheck`** is the temporary route that proves the import path. Acceptance criterion: the route round-trips `{"message":"success","ok":true}`, then the route is deleted; the 5-line `library_resolution.test.js` (permanent) replaces its CI value.

---

## Reading the bootstrap flow

1. `npm install` from `MBAi460-Group1/` reads root `package.json`'s `workspaces` array, then resolves Project 02's `package.json` deps.
2. Because `@mbai460/photoapp-server` matches the workspace package, npm creates a **symlink** at `projects/project02/server/node_modules/@mbai460/photoapp-server` → `../../../lib/photoapp-server` (or hoists to root `node_modules/`).
3. Project 02's `app.js` calls `require('@mbai460/photoapp-server')`; Node resolves through the symlink and returns the library's exports object.
4. `server.js` boots `app.listen(8080)`; `curl /__bootcheck` returns the success envelope from `schemas.envelopes.successResponse({ ok: true })`.
5. `tests/unit/library_resolution.test.js` asserts the same exports shape from a unit-test vantage point — permanent CI guard for the symlink.

---

## What this viz does NOT show (intentional scope cut)

- **Routing.** No `/v1` / `/v2` / `/healthz` / `/readyz` mounts — those land in Phases 2–4 of the Approach (sub-phases 1.x of the Plan).
- **Observability.** No `pino` / `pino-http` / OTel — those land in Approach Phase 3 (Plan sub-phase 1.3).
- **Pool / breakers / Rekognition transactions.** Forward-referenced as dashed nodes; constructed in Approach Phase 7 (Plan sub-phase 1.7).
- **docker-compose / Terraform.** Approach Phases 10 + 12 (Plan sub-phases 1.1 + 1.2/1.12).
- **OpenAPI 3.1 contract.** Approach Phase 9 (Plan sub-phase 1.8).

The Plan's `02-web-service.md` will need a different viz (`Target-State-project02-v1-layered-flow-v1.md`) once Phase 2 opens.
