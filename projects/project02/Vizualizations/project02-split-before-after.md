# Project 02 Split MVP: Application-Centered View

Use this as the targeted visualization checkpoint for the Project 02 split MVP.

Review the application flow first, then inspect the surrounding infrastructure and operational support layers.

Legend:

- Blue: core application runtime
- Green: project-owned target components
- Yellow: support/test/ops
- Red: leakage or coupling being removed
- Gray: accepted temporary debt or out-of-scope support

## Application Flow

### Before

```mermaid
flowchart TB
  subgraph appLayer["Application JS Flow - Before"]
    p02Routes["Project 02 routes\nserver/routes + api wrappers"]
    p02Server["Project 02 server.js"]
    p02Pool["Project 02 services/pool.js"]
    p02Tests["Project 02 server tests"]
    sharedCore["lib/photoapp-server\nshared live workspace core"]
    p01Config["Project 01 client/photoapp-config.ini"]
  end

  p02Routes --> sharedCore
  p02Tests --> sharedCore
  p02Server -->|"mutates config path"| sharedCore
  sharedCore -->|"default/config bridge"| p01Config
  p02Pool -->|"fallback config"| p01Config

  classDef core fill:#dbeafe,stroke:#1d4ed8,color:#111
  classDef support fill:#fef3c7,stroke:#d97706,color:#111
  classDef leak fill:#fee2e2,stroke:#dc2626,color:#111

  class p02Routes,p02Server,p02Pool core
  class p02Tests support
  class sharedCore,p01Config leak
```

### After

```mermaid
flowchart TB
  subgraph appLayer["Application JS Flow - After"]
    p02Routes["Project 02 routes\nProject 02 wire contract"]
    p02LocalCore["Project 02 server/src/photoapp-core\nlocal copied app core"]
    p02Services["Local services.photoapp"]
    p02AwsAdapter["Local services.aws"]
    p02Repos["Local repositories"]
    p02Schemas["Local schemas"]
    p02Middleware["Local middleware"]
    p02Config["Project 02 config\nPHOTOAPP_CONFIG_PATH or local fallback"]
    p02Tests["Project 02 tests\nroutes + local core"]
  end

  p02Routes --> p02LocalCore
  p02Tests --> p02Routes
  p02Tests --> p02LocalCore
  p02LocalCore --> p02Services
  p02LocalCore --> p02AwsAdapter
  p02LocalCore --> p02Repos
  p02LocalCore --> p02Schemas
  p02LocalCore --> p02Middleware
  p02Services --> p02AwsAdapter
  p02AwsAdapter --> p02Config

  classDef core fill:#dbeafe,stroke:#1d4ed8,color:#111
  classDef owned fill:#dcfce7,stroke:#16a34a,color:#111
  classDef support fill:#fef3c7,stroke:#d97706,color:#111

  class p02Routes,p02Services,p02AwsAdapter,p02Repos,p02Schemas,p02Middleware core
  class p02LocalCore,p02Config owned
  class p02Tests support
```

## Infrastructure

### Before

```mermaid
flowchart TB
  subgraph dockerLayer["Docker And Local Infrastructure - Before"]
    p02Compose["Project 02 docker-compose.yml\nmysql + localstack + server"]
    p02Dockerfile["Project 02 server/Dockerfile"]
    localMysql["Local MySQL\ncompose service"]
    localStack["LocalStack\ncompose service"]
    p02Migration["Project 02 infra/migrations/01-schema.sql"]
    sharedCore["lib/photoapp-server\nshared live workspace core"]
  end

  subgraph awsLayer["AWS And Terraform Infrastructure - Before"]
    p02Terraform["Project 02 infra/envs/dev + prod"]
    p01Policy["Project 01 s3-read-write-policy.json.txt"]
    p01Schema["Project 01 create-photoapp.sql\ncreate-photoapp-labels.sql"]
    awsRds["AWS RDS"]
    awsS3["AWS S3"]
    awsRekognition["AWS Rekognition"]
  end

  p02Compose --> p02Dockerfile
  p02Dockerfile -->|"COPY lib/photoapp-server/src"| sharedCore
  p02Compose --> localMysql
  p02Compose --> localStack
  localMysql --> p02Migration

  p02Terraform -->|"policy path"| p01Policy
  p02Migration -.->|"lineage treated as source"| p01Schema
  sharedCore --> awsRds
  sharedCore --> awsS3
  sharedCore --> awsRekognition

  classDef infra fill:#e0f2fe,stroke:#0369a1,color:#111
  classDef leak fill:#fee2e2,stroke:#dc2626,color:#111

  class p02Compose,p02Dockerfile,localMysql,localStack,p02Terraform,awsRds,awsS3,awsRekognition infra
  class sharedCore,p01Policy,p01Schema leak
```

### After

```mermaid
flowchart TB
  subgraph dockerLayer["Docker And Local Infrastructure - After"]
    p02Compose["Project 02 docker-compose.yml"]
    p02Dockerfile["Project 02 server/Dockerfile\ncopies Project 02 server only"]
    localMysql["Local MySQL\ncompose service"]
    localStack["LocalStack\ncompose service"]
    p02Migration["Project 02 infra/migrations/01-schema.sql\nowned copy"]
    p02LocalCore["Project 02 server/src/photoapp-core"]
  end

  subgraph awsLayer["AWS And Terraform Infrastructure - After"]
    p02Terraform["Project 02 infra/envs/dev + prod"]
    p02Policy["Project 02 infra/policies/s3-read-write-policy.json"]
    awsRds["AWS RDS"]
    awsS3["AWS S3"]
    awsRekognition["AWS Rekognition"]
  end

  p02Compose --> p02Dockerfile
  p02Dockerfile --> p02LocalCore
  p02Compose --> localMysql
  p02Compose --> localStack
  localMysql --> p02Migration

  p02Terraform --> p02Policy
  p02Terraform --> awsRds
  p02Terraform --> awsS3
  p02Terraform -.->|"permissions for analyzer path"| awsRekognition

  p02Migration -.->|"schema lineage note only"| p02LocalCore

  classDef infra fill:#e0f2fe,stroke:#0369a1,color:#111
  classDef owned fill:#dcfce7,stroke:#16a34a,color:#111

  class p02Compose,p02Dockerfile,localMysql,localStack,p02Terraform,awsRds,awsS3,awsRekognition infra
  class p02LocalCore,p02Policy,p02Migration owned
```

## Runpath And Support

### Before

```mermaid
flowchart TB
  subgraph runpathLayer["Runpath And Support - Before"]
    rootPackage["Root package.json\nnpm workspaces"]
    rootLock["Root package-lock.json\nsingle lockfile"]
    sharedCore["lib/photoapp-server\nshared live workspace core"]
    p02Makefile["Project 02 Makefile"]
    p02PackageScripts["Project 02 packaging scripts"]
    p02Tests["Project 02 server tests"]
    p01Part03["Project 01 Part03 server"]
    p01Config["Project 01 client/photoapp-config.ini"]
  end

  rootPackage --> sharedCore
  rootLock --> sharedCore
  p02Tests --> sharedCore
  p01Part03 --> sharedCore
  p02Makefile -->|"clean reaches into"| p01Part03
  p02PackageScripts -->|"historical config packaging"| p01Config

  classDef support fill:#fef3c7,stroke:#d97706,color:#111
  classDef leak fill:#fee2e2,stroke:#dc2626,color:#111

  class rootPackage,rootLock,p02Makefile,p02PackageScripts,p02Tests support
  class sharedCore,p01Part03,p01Config leak
```

### After

```mermaid
flowchart TB
  subgraph runpathLayer["Runpath And Support - After"]
    rootPackage["Root package.json\ntemporary install debt"]
    rootLock["Root package-lock.json\ntemporary install debt"]
    p02LocalCore["Project 02 server/src/photoapp-core"]
    p02Makefile["Project 02 Makefile\nProject 02 scoped cleanup"]
    p02PackageScripts["Project 02 packaging scripts\nout of scope for resubmission"]
    p02Config["Project 02 config\nPHOTOAPP_CONFIG_PATH or local fallback"]
    p02Tests["Project 02 tests\nroutes + local core"]
    sharedCore["lib/photoapp-server\nkept for Project 01 only"]
    p01Part03["Project 01 Part03 server\nunchanged"]
  end

  rootPackage -.->|"operational install debt"| p02LocalCore
  rootLock -.->|"operational install debt"| p02LocalCore
  p02Tests --> p02LocalCore
  p02Makefile --> p02LocalCore
  p02PackageScripts -.->|"accepted temporary debt"| p02Config
  p01Part03 --> sharedCore

  classDef owned fill:#dcfce7,stroke:#16a34a,color:#111
  classDef support fill:#fef3c7,stroke:#d97706,color:#111
  classDef debt fill:#e5e7eb,stroke:#6b7280,color:#111

  class p02LocalCore,p02Makefile,p02Config owned
  class rootPackage,rootLock,p02PackageScripts,p02Tests support
  class sharedCore,p01Part03 debt
```

## Visual Checkpoint

Questions to answer before promotion to `visualizations/`:

- Does the Application JS layer keep Project 02 runtime inside `server/src/photoapp-core`?
- Does the Infrastructure section show Docker/local and AWS/Terraform separately from runpath support?
- Does the Docker/local infrastructure avoid copying `lib/photoapp-server`?
- Does the AWS/Terraform layer use only Project 02-owned policy/schema paths?
- Does the Runpath And Support section show root workspace coupling as temporary debt, not application runtime coupling?
- Does `lib/photoapp-server` staying alive for Project 01 only match the MVP scope?

Accepted temporary debt for this execution:

- Root npm workspace and root lockfile remain for install determinism.
- Project 02 submission-packaging scripts may still contain historical Project 1 config assumptions because resubmission is explicitly out of scope.
