# Target State - Project 01 Part 03 PhotoApp Local Architecture

**Generated:** 2026-04-25  
**Updated:** 2026-04-26 — language/implementation-agnostic pass following the Express direction confirmation. Awaiting design-agent review.  
**Scope:** Project 01 Part 03 local web application architecture  
**Status:** PROPOSED - architecture discussion artifact  
**Related diagrams:** `docker-environment-v1.md`, `project01-part02-api-flow-v1.md`

---

## Human Summary

Target state for Part 03 is a local, framework-based web app:

- **React + Vite frontend** owns layout, interaction state, upload forms, image gallery, label display, and search UI.
- **Local web server** owns HTTP API routes, static serving for the built frontend, upload/download handling, error translation, and the PhotoApp service module.
- **PhotoApp Service Module** coordinates Part 03 use cases (S3, RDS, and Rekognition orchestration) so frontend code never accesses credentials, AWS SDKs, or database drivers directly.
- **Docker containers** provide the reproducible local runtime. The rendered web app runs in the client-side browser context, and requests flow to the server container.
- **Off-box AWS services** are called by the server's PhotoApp Service Module; the web server itself remains local.

---

## Layered Request Flow

```mermaid
flowchart LR
  subgraph host["Host machine"]
    direction LR
    repo["Repo working tree\nPart03/frontend + Part03/server\nbind-mounted into Docker during development"]
    port["Host TCP :8080\npublished Docker port"]
  end

  subgraph client_container["Docker container: Client"]
    direction TB
    subgraph browser["Browser"]
      direction TB
      webapp["Rendered Web Application\nReact UI + bundled frontend API calls"]
    end
  end

  subgraph server_container["Docker container: Server"]
    direction LR

    subgraph app["Local Web Server Application\nserver/app.js (exports app)\nserver/server.js (listen entrypoint)"]
      direction TB
      ingress["HTTP server entrypoint\nlistens on container :8080"]
      static["Static Web App Host\nserves frontend/dist"]
      api["API Routes\nJSON + file endpoints under /api/*"]
    end

    subgraph static_assets["Built frontend assets\nfrontend/dist"]
      direction LR
      index["index.html"]
      bundle["bundled assets"]
    end

    subgraph backend["Server-side application layer"]
      direction LR
      service["PhotoApp Service Module\nuse-case orchestration + response shaping"]
      upload["Upload Buffer\nmultipart upload handling"]
    end

    subgraph runtime_clients["Server-side runtime clients"]
      direction LR
      aws_clients["AWS service clients\nS3 + Rekognition"]
      db_driver["RDS / MySQL driver"]
      configfile["photoapp-config.ini\nserver-side only"]
    end
  end

  subgraph aws["Off-box AWS services"]
    direction TB
    s3["S3 photo bucket"]
    rds["RDS MySQL photoapp database"]
    rekognition["Rekognition label detection"]
  end

  webapp -->|"GET /"| port
  port -->|"Docker publish 8080:8080"| ingress
  ingress --> static
  static --> index
  index --> bundle
  bundle -->|"loaded by browser"| webapp

  webapp -->|"fetch('/api/users')\nfetch('/api/images')\nfetch('/api/search?label=...')"| api
  webapp -->|"multipart upload\nPOST /api/images"| api
  webapp -->|"download / preview\nGET /api/images/{assetid}/file"| api

  api --> service
  service --> upload
  service --> aws_clients
  service --> db_driver
  aws_clients --> configfile
  db_driver --> configfile
  aws_clients --> s3
  aws_clients --> rekognition
  db_driver --> rds
```

## Local Runtime Shape

```mermaid
flowchart LR
  subgraph client_container["Docker container: Client"]
    direction TB
    subgraph browser["Browser"]
      direction TB
      webapp["Rendered Web Application\nReact UI + bundled frontend API calls\nbundled web app loaded in browser"]
    end
  end

  subgraph server_container["Docker container: Server"]
    direction TB
    subgraph server_app["Local Web Server Application\nserver/app.js + server/server.js"]
      direction TB
      ingress["HTTP server entrypoint\nlistens on container :8080"]
      subgraph handlers["HTTP request handlers"]
        direction LR
        static["Static Web App Host\nserves frontend/dist\nGET / and /assets/*"]
        api["API Routes\nserver/routes/photoapp_routes\n/api/ping, /api/users, /api/images, /api/search"]
      end
    end
    service["PhotoApp Service Module\nserver/services/photoapp\nuse-case orchestration + response shaping"]
    upload["Upload Buffer\nserver/middleware/upload\nmultipart upload handling"]
    runtime_clients["Server-side runtime clients\nAWS service clients + RDS driver\nserver/services/aws"]
    config["Server-side config\nphotoapp-config.ini"]
  end

  subgraph aws["Off-box AWS services"]
    direction TB
    s3["S3 photo bucket"]
    rds["RDS MySQL photoapp database"]
    rekognition["Rekognition label detection"]
  end

  webapp -->|"GET http://server:8080/"| ingress
  ingress -->|"serve app shell + static assets"| static
  static -->|"bundled web app loaded in browser"| webapp

  webapp -->|"HTTP JSON + multipart requests\nhttp://server:8080/api/*"| ingress
  ingress --> api
  api -->|"service call"| service
  service --> upload
  service --> runtime_clients
  runtime_clients --> config
  runtime_clients -->|"AWS SDK"| s3
  runtime_clients -->|"DB driver"| rds
  runtime_clients -->|"Rekognition DetectLabels"| rekognition

  subgraph spacer[" "]
    blank[" "]
  end

  subgraph legend["Flow color legend"]
    direction LR
    serving_legend["Serving the website"]
    api_legend["API request flow"]
  end

  rekognition ~~~ blank
  blank ~~~ serving_legend

  linkStyle 0,1,2 stroke:#16a34a,stroke-width:3px
  linkStyle 3,4,5,6,7,9,10,11 stroke:#ea580c,stroke-width:3px
  linkStyle 8 stroke:#6b7280,stroke-width:3px
  linkStyle 12,13 stroke:transparent
  style serving_legend fill:#dcfce7,stroke:#16a34a,stroke-width:2px
  style api_legend fill:#ffedd5,stroke:#ea580c,stroke-width:2px
  style blank fill:transparent,stroke:transparent
  style spacer fill:transparent,stroke:transparent
```

---

## Boundary Rules

| Boundary | Rule |
|---|---|
| Browser to server | Browser only uses HTTP. No direct credential or AWS SDK access from frontend code. |
| Frontend to API | Frontend calls `/api/*` and receives JSON or file responses. |
| API to service | HTTP routes stay thin: request parsing, status codes, response shapes. Business logic lives in the service module. |
| Service to AWS / RDS | Service module orchestrates AWS SDK and RDS driver calls; converts row results into web-shaped objects; never exposes credentials. |
| Docker to host | Host browser reaches the app through a published local port, typically `8080:8080`. |
| Off-box AWS services | Server runs locally; AWS service clients call S3, RDS, and Rekognition over the network. |

---

## Directory Structure Target

```text
projects/project01/Part03/
  server/
    app.js                          # creates server app, mounts static files, mounts /api router
    server.js                       # listen() entrypoint
    config.js                       # web service config (port, config file path)
    routes/
      photoapp_routes.js            # /api/* endpoints; HTTP request/response concerns
    services/
      photoapp.js                   # PhotoApp use cases: list, upload, download, labels, search, delete
      aws.js                        # AWS service clients + RDS driver factories
    middleware/
      upload.js                     # multipart upload handling
      error.js                      # JSON error mapping
    schemas.js                      # row-to-object converters; envelope helpers
    tests/

  frontend/
    src/
      api/
        photoappApi.js              # browser fetch wrappers for /api/*
      components/
        UserSelector.jsx
        UploadPanel.jsx
        ImageGallery.jsx
        LabelSearch.jsx
      App.jsx
      main.jsx
    index.html
    package.json
    dist/                           # Vite build output; served by the local web server

  package.json                      # server-side runtime + test deps
  README.md                         # run instructions + demo notes

projects/project01/client/
  photoapp.py                       # Part 02 reference (NOT imported by Part 03 server)
  photoapp-config.ini               # server-side config; never loaded by browser
```

---

## Request Lifecycle Examples

### Website Load

```mermaid
sequenceDiagram
  participant Browser
  participant Server as Local Web Server
  participant StaticHost as Static Web App Host
  participant WebApp as Rendered Web Application

  Browser->>Server: GET /
  Server->>StaticHost: route to static host
  StaticHost-->>Browser: index.html
  Browser->>Server: GET /assets/*
  Server->>StaticHost: route asset requests
  StaticHost-->>Browser: bundled React assets
  Browser->>WebApp: execute bundle and render UI
```

### Image Upload

```mermaid
sequenceDiagram
  participant WebApp as Rendered Web Application
  participant Route as API Routes
  participant Service as PhotoApp Service Module
  participant Upload as Upload Buffer
  participant AWSClients as AWS service clients
  participant DB as RDS / MySQL driver
  participant AWS as Off-box AWS services

  WebApp->>Route: POST /api/images (userid + multipart file)
  Route->>Upload: receive multipart file
  Upload-->>Service: buffered file + metadata
  Service->>DB: validate userid exists
  Service->>AWSClients: upload to S3 (bucketkey: username/uuid-localname)
  AWSClients->>AWS: S3 PutObject
  Service->>AWSClients: detect labels
  AWSClients->>AWS: Rekognition DetectLabels
  AWS-->>AWSClients: labels
  Service->>DB: INSERT asset row + INSERT IGNORE label rows
  Service->>Upload: cleanup temp file
  Service-->>Route: { assetid }
  Route-->>WebApp: JSON envelope { message, data: { assetid } }
```

### Read/Search/Download API Calls

```mermaid
sequenceDiagram
  participant WebApp as Rendered Web Application
  participant Route as API Routes
  participant Service as PhotoApp Service Module
  participant AWSClients as AWS service clients
  participant DB as RDS / MySQL driver
  participant AWS as Off-box AWS services

  WebApp->>Route: GET /api/users or /api/images or /api/search
  Route->>Service: call matching use case
  Service->>DB: SELECT users / assets / labels rows
  DB->>AWS: RDS query
  AWS-->>DB: rows
  DB-->>Service: result set
  Service-->>Route: web-shaped response
  Route-->>WebApp: JSON envelope { message, data: [...] }

  WebApp->>Route: GET /api/images/{assetid}/file
  Route->>Service: download_image(assetid)
  Service->>DB: SELECT bucketkey FROM assets WHERE assetid = ?
  DB-->>Service: bucketkey
  Service->>AWSClients: GetObject (bucketkey)
  AWSClients->>AWS: S3 GetObject
  AWS-->>AWSClients: object stream
  AWSClients-->>Service: response stream
  Service-->>Route: pipe stream + Content-Type
  Route-->>WebApp: image file response
```

---

## Temporary TODOs For Architecture Discussion

- [ ] Consider a future stream-through upload path that pipes the multipart upload directly to S3 without buffering to a temp file. Initial Part 03 target uses temp-file buffering (via the upload middleware) for parity with the original assignment's local-file expectations and to keep the service module simple. A future refactor could thread the upload stream end-to-end. Keep the public web API as `POST /api/images` either way so the frontend contract does not change.
