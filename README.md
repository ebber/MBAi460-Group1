# MBAi 460 — Class Project

AWS-backed application built across a series of labs and projects.
Each lab/project part is graded separately and builds on a shared AWS environment.

## Structure

| Directory | Role |
|-----------|------|
| `docker/` | Docker image — runtime for all labs and projects |
| `infra/` | AWS backbone: Terraform (IaC) + backbone runtime configs |
| `labs/` | Lab assignments (lab01–lab04) |
| `projects/` | Project assignments (project01–project03) |
| `utils/` | Operational scripts — AWS, Docker, DB tooling |
| `setup/` | Host machine setup for the class environment |
| `visualizations/` | Architecture and design diagrams |
| `learnings/` | Process and methodology retrospectives — patterns, heuristics, compaction recovery |
| `MetaFiles/` | Class Project coordination: governing docs, ActionQueue, Journal |

## Key Facts

- **AWS region:** us-east-2 (course requirement)
- **Database schema:** defined in `projects/project01/create-photoapp.sql` — this is the canonical photoapp DDL; all projects build on it
- **Backbone configs:** `infra/config/` holds consolidated runtime configs (RDS endpoints, credentials); configs may live inside a project folder during active development, but should be graduated to `infra/config/` when the assignment closes
- **Terraform:** run from `MBAi460-Group1/infra/terraform/`
- **All utils:** run from repo root (`MBAi460-Group1/`)

## Getting Started

See [`MetaFiles/QUICKSTART.md`](MetaFiles/QUICKSTART.md) for a complete collaborator setup walkthrough (AWS credentials, Terraform, Docker, DB schema, verification).

## MetaFiles

`MetaFiles/` is the coordination layer for the Class Project — onboarding, governing docs, and the active action queue.

| File | Purpose |
|------|---------|
| [`MetaFiles/QUICKSTART.md`](MetaFiles/QUICKSTART.md) | **New collaborator environment setup — start here** |
| [`MetaFiles/Manifesto-AWS-Lab-Sanctum.md`](MetaFiles/Manifesto-AWS-Lab-Sanctum.md) | Governing principles |
| [`MetaFiles/Future-State-Ideal-Lab.md`](MetaFiles/Future-State-Ideal-Lab.md) | Long-term design target |
| [`MetaFiles/TODO.md`](MetaFiles/TODO.md) | Active action queue |
| [`MetaFiles/Journal/`](MetaFiles/Journal/) | Session journal — agents and collaborators may leave entries here at their discretion |
