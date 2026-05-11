# Project 02 PhotoApp web service — canonical Docker image.
#
# Build from the monorepo root (NOT this directory):
#
#   docker build -t mbai460-project02:dev -f projects/project02/server/Dockerfile .
#
# Uses the root lockfile for deterministic installs. Project 02 runtime code
# is self-contained under projects/project02/server (no shared lib copy).
# Layer ordering: package descriptors first (install layer cached) then source.
#
# This Dockerfile is the canonical Project02 app image. It is the build target
# for both local Compose (docker-compose.yml) and the planned Elastic Beanstalk
# deployment. The instructor/class container source has been archived under
# `submission artifacts/images/archieve_mbai460-server/` (see tools/DEPRECATED.md
# for the full archive inventory and rationale).

FROM node:24-alpine AS base
WORKDIR /app

# OCI labels so the produced image is identifiable from `docker inspect`.
LABEL org.opencontainers.image.title="mbai460-project02-server"
LABEL org.opencontainers.image.source="projects/project02/server"
LABEL org.opencontainers.image.description="MBAi460 Project02 PhotoApp web service (canonical app image)"

# ---------------------------------------------------------------------------
# Stage 1 — install workspace deps for project02-server.
# Copy the minimum needed for `npm ci` to resolve the workspace graph.
# ---------------------------------------------------------------------------
FROM base AS deps

# Root descriptors (.npmrc carries engine-strict + lockfile flags)
COPY package.json package-lock.json .npmrc ./

# Workspace package descriptor — preserving directory structure
COPY projects/project02/server/package.json projects/project02/server/

# Install only the project02-server workspace.
# --omit=dev keeps the production image lean.
RUN npm ci --workspace=projects/project02/server --include-workspace-root --omit=dev

# ---------------------------------------------------------------------------
# Stage 2 — copy source into the install tree and form the runtime image.
# ---------------------------------------------------------------------------
FROM base AS runtime

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/package-lock.json /app/.npmrc ./
COPY --from=deps /app/projects/project02/server/package.json ./projects/project02/server/

# Source tree. The COPY pulls everything under projects/project02/server.
# The root .dockerignore (at MBAi460-Group1/.dockerignore) currently excludes
# **/node_modules, **/tests, **/__tests__, **/*.test.js, **/jest.config.js,
# IDE configs, **/photoapp-config.ini, and various lab-side directories.
# It does NOT currently exclude server/_assignment-template/, so the
# instructor starter copy ships in the image. See scratch/phase1-strays-
# inventory.md for the full list of cross-scope references touching this
# image build.
COPY projects/project02/server ./projects/project02/server

# Run from the server directory so '../client/photoapp-config.ini' resolves to
# projects/project02/client/photoapp-config.ini (mounted via compose volume).
WORKDIR /app/projects/project02/server

USER node

EXPOSE 8080
CMD ["node", "server.js"]
