# Project 02 PhotoApp web service — split-MVP Docker image.
#
# Build from the monorepo root (NOT this directory):
#
#   docker build -t mbai460-project02:dev -f projects/project02/server/Dockerfile .
#
# Uses the root lockfile for deterministic installs, but Project 02 runtime code
# is self-contained under projects/project02/server.
# Layer ordering: package descriptors first (install layer cached) then source.

FROM node:24-alpine AS base
WORKDIR /app

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

# Source trees (tests, MetaFiles, _assignment-template excluded via .dockerignore)
COPY projects/project02/server ./projects/project02/server

# Run from the server directory so '../client/photoapp-config.ini' resolves to
# projects/project02/client/photoapp-config.ini (mounted via compose volume).
WORKDIR /app/projects/project02/server

USER node

EXPOSE 8080
CMD ["node", "server.js"]
