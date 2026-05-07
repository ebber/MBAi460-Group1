# Docker full lab — architectural blueprints

- **Image store ≠ runtime**: **Tags** like **`mbai460-client`** and **`mysql:8.4`** name **artifacts**; **containers** are **instances** with **processes** inside.
- **Two runtime domains** in one **Docker/Colima** engine: **Compose application stack** (Project 02) vs **class dev environment** (**`mbai460-client`** instance, **bash**).
- **Host↔container** is **`published port`** and **`bind mount`** on **edges**; **Compose bridge `photoapp`** is an **internal** boundary for **server ↔ mysql ↔ LocalStack**.

---

## 1. Full lab blueprint

High-level topology: **host**, **runtime engine**, **image artifacts**, **two domains**, **interfaces** on crossing edges.

```mermaid
flowchart TB
  subgraph LEG1["Legend"]
    direction LR
    LG1["━━ active wiring"] 
    LG2["┈┈ image → instance"]
    LG3["┈┈ optional / conditional"]
  end

  subgraph HOST["Host machine"]
    direction LR
    CL["Clients\nHTTP, MySQL, S3 tools"]
    FILES["Workspace files\n(project tree)"]
  end

  subgraph DR["Docker / Colima runtime"]

    subgraph ART["Image artifacts (local store)"]
      direction LR
      IM_DEV["mbai460-client"]
      IM_3["mysql:8.4 • localstack:3\n• p02-server build"]
    end

    subgraph DEV["Class dev environment"]
      subgraph DEV_INST["Container instance (from mbai460-client)"]
        BASH["bash"]
      end
      N_IDLE["ⓘ available tooling, not active processes"]
    end
    IM_DEV -.->|instantiates| DEV_INST

    subgraph COMPOSE["Compose application stack"]
      subgraph BR["Bridge network — photoapp"]
        direction LR
        subgraph W_M["mysql container"]
          MY["mysqld"]
        end
        subgraph W_L["localstack container"]
          LS["LocalStack"]
        end
        subgraph W_S["server container"]
          EX["Express\nserver.js"]
        end
      end
    end
  end

  FILES -->|bind mount| EX
  FILES -->|bind mount| DEV_INST
  N_IDLE -.-> DEV_INST

  CL -->|HTTP • published :8080| EX
  CL -->|MySQL TCP • published :3307→3306| MY
  CL -->|HTTP • published :4566| LS
```

---

## 2. Runtime application stack blueprint

**Compose only**: **bridge**, **three containers**, **active listeners**, **host boundary** = **published port** on edges (no separate port “hub” node).

```mermaid
flowchart TB
  subgraph LEG2["Legend"]
    direction LR
    L2A["MySQL TCP"] 
    L2B["AWS SDK HTTP"] 
    L2C["HTTP + published port"]
  end

  subgraph H2["Host machine"]
    C2["Clients"]
  end

  subgraph DR2["Docker / Colima runtime"]

    subgraph CP2["Compose application stack"]
      subgraph BR2["Bridge network — photoapp"]
        subgraph M2["mysql container"]
          MY2["mysqld\n:3306"]
        end
        subgraph L2["localstack container"]
          LS2["LocalStack\n:4566"]
        end
        subgraph S2["server container"]
          X2["Node / Express\nserver.js :8080"]
        end

        X2 -->|MySQL TCP| MY2
        X2 -->|AWS SDK HTTP| LS2
      end
    end
  end

  C2 -->|HTTP • published :8080| X2
  C2 -->|MySQL TCP • published :3307→3306| MY2
  C2 -->|HTTP • published :4566| LS2
```

---

## 3. Class dev environment blueprint

**Class tooling image** vs **running instance**; **bash** active; **everything else** in the **note**.

```mermaid
flowchart TB
  subgraph LEG3["Legend"]
    direction LR
    L3A["bind mount"]
    L3B["instantiate"]
    L3C["network mode"]
  end

  subgraph ART3["Image artifact (not running)"]
    IMG3["mbai460-client\n(Dockerfile at repo /docker)"]
  end

  subgraph H3["Host machine"]
    R3["Monorepo root\nbind source"]
  end

  subgraph DR3["Docker / Colima runtime"]

    subgraph CLASS["Class dev environment"]
      direction TB
      subgraph RUN3["Container instance"]
        B3["bash"]
      end
      IF3["Network: run.bash — host network\nrun-8080.bash — published :8080"]
      N3["ⓘ available tooling, not active processes\nPython • FastAPI • NiceGUI • boto3 • cloudflared • gs • …"]
    end
  end

  IMG3 -.->|instantiate| RUN3
  R3 -->|bind mount| RUN3
  IF3 -.->|network mode| RUN3

  subgraph HA3["Optional host reachability"]
    O3["localhost:8080\nonly if a process inside\nlistens on 8080\n(typical: run-8080.bash)"]
  end
  O3 -.-> RUN3
```

---

## Notes (minimal)

| Label | Confidence |
|--------|------------|
| **`IM_3`** | **Known** names from **compose** + **server** build; **not linked** to containers in the diagram — **no data-plane** implication, only **artifact** context. |
| **Optional :8080** | **Inferred**: **`run-8080.bash`** **publishes** **8080**; **no listener** until you **start** an app in **bash**. |
| **`run.bash` host network** | **Known** from script **flags**; exact behavior on **Docker Desktop/Colima** may differ from **Linux**. |

*(Static sources: `docker/_image-name.txt`, `docker/run.bash`, `docker/run-8080.bash`, `docker/Dockerfile`, `projects/project02/docker-compose.yml`, `server/server.js`.)*
