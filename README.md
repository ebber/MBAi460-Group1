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
| `MetaFiles/` | Class Project coordination: governing docs, ActionQueue |

## Key Facts

- **AWS region:** us-east-2 (course requirement)
- **Database schema:** defined in `projects/project01/create-photoapp.sql` — this is the canonical photoapp DDL; all projects build on it
- **Backbone configs:** `infra/config/` holds consolidated runtime configs (RDS endpoints, credentials); configs may live inside a project folder during active development, but should be graduated to `infra/config/` when the assignment closes
- **Terraform:** run from `MBAi460-Group1/infra/terraform/`
- **All utils:** run from repo root (`/Users/erik/Documents/Lab/mbai460-client`)

## Orientation

See `../MetaFiles/orientation.md` (repo root) for the full three-sphere Lab overview.
Governing principles: `MetaFiles/Manifesto-AWS-Lab-Sanctum.md`
Long-term design target: `MetaFiles/Future-State-Ideal-Lab.md`
