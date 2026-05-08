# Project 02 Architecture

Project 02 is self-contained for the split MVP. It demonstrates the PhotoApp behavior with Project 02-owned runtime code, local development infrastructure, and Terraform shape.

## Owned By Project 02

- `server/src/photoapp-core/`: local copy of the PhotoApp app core used by Project 02.
- `server/routes/`: Project 02 wire contract and route adapters.
- `server/services/`: Project 02 runtime adapters such as pool and circuit breakers.
- `server/tests/`: Project 02 route, adapter, and local-core coverage.
- `infra/migrations/01-schema.sql`: Project 02 schema bootstrap.
- `infra/policies/`: Project 02 IAM policy files.
- `client/photoapp-config.ini.example`: Project 02 runtime config template.
- `docker-compose.yml`: Project 02 local infrastructure.

## Boundary Rules

- Runtime code must not read files from `projects/project01`.
- Runtime code must not import `@mbai460/photoapp-server`.
- Terraform must not reference Project 1 files.
- Docker runtime images must copy Project 2 server code, not `lib/photoapp-server/src`.

## Future Shared Core Candidates

Future extraction candidates are services, repositories, schemas, and generic middleware patterns in `server/src/photoapp-core/`.

Routes, config paths, Docker, Terraform, assignment packaging, and Project 2-specific response shapes stay project-owned.

## Visualization

The split design checkpoint lives in `scratch/project02-split-before-after.md` while the refactor is in progress. Move or copy the final diagram into a durable visualization location after review.
