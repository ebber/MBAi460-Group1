# Part 03 PhotoApp web service — workspace-aware Docker image.
#
# This Dockerfile is built from the monorepo root, not the Part 03 directory:
#
#   docker build -t mbai460-part03:dev -f projects/project01/Part03/Dockerfile .
#
# It is the reference implementation of the npm-workspaces copy-and-install
# pattern (Approach 00-shared-library-extraction.md § Phase 4.2). Project 02
# Phase 1.10 will use the same pattern.
#
# Layer ordering is deliberate: package descriptors are copied (and the
# install layer is cached) BEFORE source code, so editing server.js does
# not invalidate the install layer.
#
# References:
#   - npm workspaces docs: https://docs.npmjs.com/cli/v10/using-npm/workspaces
#   - Docker layering best practice: https://docs.docker.com/build/cache/

FROM node:24-alpine AS base
WORKDIR /app

# ---------------------------------------------------------------------------
# Stage 1 — install dependencies for the Part 03 workspace + the lib it
# transitively depends on. We copy the *minimum* needed for `npm ci` to
# resolve the workspace graph: the root descriptors, plus every workspace
# package.json (preserving directory structure).
# ---------------------------------------------------------------------------
FROM base AS deps

# Root descriptors. .npmrc carries lockfile + engine-strict flags; if it
# isn't present at the root you'll get a less-deterministic install.
COPY package.json package-lock.json .npmrc ./

# Workspace descriptors. Note: projects/project02/server has no package.json
# yet (Phase 1 scaffolds it), so it's intentionally absent here. When Phase 1
# lands, append:
#   COPY projects/project02/server/package.json projects/project02/server/
COPY lib/photoapp-server/package.json lib/photoapp-server/
COPY projects/project01/Part03/package.json projects/project01/Part03/

# Install only the Part 03 workspace + its workspace deps (the lib).
# --include-workspace-root pulls root devDeps if any are needed for postinstall;
# omit=dev keeps the production tree lean.
RUN npm ci --workspace=projects/project01/Part03 --include-workspace-root --omit=dev

# ---------------------------------------------------------------------------
# Stage 2 — copy source code into the install tree and form the runtime image.
# ---------------------------------------------------------------------------
FROM base AS runtime

# Bring in the populated node_modules tree and the package descriptors so
# require() resolution finds the workspace packages.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/package-lock.json /app/.npmrc ./
COPY --from=deps /app/lib/photoapp-server/package.json ./lib/photoapp-server/
COPY --from=deps /app/projects/project01/Part03/package.json ./projects/project01/Part03/

# Source code. Tests, frontend src, and IDE artifacts are excluded via
# .dockerignore, so this COPY only brings in what the runtime needs.
COPY lib/photoapp-server/src ./lib/photoapp-server/src
COPY projects/project01/Part03/server ./projects/project01/Part03/server

# Pre-built SPA assets are served as static files by app.js. If they aren't
# built locally, app.js falls back to a placeholder index — the COPY is best
# effort. Excluded from .dockerignore so this path does land in the image.
COPY projects/project01/Part03/frontend/dist ./projects/project01/Part03/frontend/dist

WORKDIR /app/projects/project01/Part03

# Drop privileges. The base node:24-alpine image ships a `node` user (uid 1000).
USER node

EXPOSE 8080
CMD ["node", "server/server.js"]
