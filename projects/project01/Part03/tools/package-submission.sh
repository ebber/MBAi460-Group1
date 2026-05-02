#!/usr/bin/env bash
#
# package-submission.sh — produce a self-contained submission tarball for
# Part 03 with @mbai460/photoapp-server inlined into node_modules.
#
# Why this exists: Gradescope's autograder cannot resolve the workspace
# protocol "@mbai460/photoapp-server": "*" — that name is unpublished on
# npm; it only exists as a workspace symlink inside our monorepo. The
# submission tarball must therefore ship the lib's source and metadata
# pre-staged at node_modules/@mbai460/photoapp-server/, with Part 03's
# package.json rewritten to drop the workspace ref so `npm install` on the
# grader side leaves the inlined module alone and resolves all *other*
# deps from npm.
#
# Approach:
#   00-shared-library-extraction.md § Phase 4.3 (Update Part 03's Gradescope
#   packaging).
#
# Usage:
#   ./projects/project01/Part03/tools/package-submission.sh
#
# Output: a .tar.gz in projects/project01/Part03/dist/
# Exit:   non-zero on any failure; safe to re-run (idempotent staging).
#
# Note: Part 03 was originally submitted to Canvas, not Gradescope. This
# script is a contingency packager, kept current as the reference pattern
# Project 02 will reuse for its actual Gradescope submissions in Phase 2.9
# / Phase 3.6.

set -euo pipefail

# Resolve repo paths from the script location so this works regardless of
# the caller's cwd (Erik may invoke from anywhere; CI may invoke from root).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"
PART03="${REPO_ROOT}/projects/project01/Part03"
LIB="${REPO_ROOT}/lib/photoapp-server"
DIST="${PART03}/dist"

# --- Sanity: required inputs are present ----------------------------------
[ -f "${PART03}/package.json" ] || { echo "ERROR: ${PART03}/package.json missing"; exit 2; }
[ -f "${LIB}/package.json" ]    || { echo "ERROR: ${LIB}/package.json missing"; exit 2; }
[ -d "${LIB}/src" ]             || { echo "ERROR: ${LIB}/src missing"; exit 2; }
command -v jq   >/dev/null 2>&1 || { echo "ERROR: jq not on PATH (brew install jq)"; exit 2; }
command -v node >/dev/null 2>&1 || { echo "ERROR: node not on PATH"; exit 2; }
command -v npm  >/dev/null 2>&1 || { echo "ERROR: npm not on PATH"; exit 2; }
command -v tar  >/dev/null 2>&1 || { echo "ERROR: tar not on PATH"; exit 2; }

mkdir -p "${DIST}"

# --- Staging dir ----------------------------------------------------------
STAGING="$(mktemp -d -t part03-pkg.XXXXXXXX)"
trap 'rm -rf "${STAGING}"' EXIT

echo "==> Staging in: ${STAGING}"

# --- Sources --------------------------------------------------------------
echo "==> Copying Part 03 server source"
cp -R "${PART03}/server" "${STAGING}/server"

# Frontend dist is best-effort; app.js falls back to a placeholder if absent.
if [ -d "${PART03}/frontend/dist" ]; then
  echo "==> Copying frontend/dist (pre-built SPA assets)"
  mkdir -p "${STAGING}/frontend"
  cp -R "${PART03}/frontend/dist" "${STAGING}/frontend/dist"
fi

# --- Submission package.json ---------------------------------------------
# Build a flat package.json: union of Part 03's deps and lib's deps, minus
# the workspace self-ref. The grader's `npm install` resolves all of these
# from npm; the inlined lib at node_modules/@mbai460/photoapp-server/
# satisfies require() without npm needing to fetch it.
echo "==> Building flat submission package.json (Part 03 deps ∪ lib deps − workspace ref)"
jq -s '
  .[0].dependencies as $p3 |
  .[1].dependencies as $lib |
  {
    name: .[0].name,
    version: .[0].version,
    description: "Part 03 PhotoApp web service — Gradescope submission tarball (lib inlined).",
    main: .[0].main,
    scripts: {
      test: "jest --passWithNoTests",
      start: "node server/server.js"
    },
    engines: .[0].engines,
    dependencies: (($p3 + $lib) | del(."@mbai460/photoapp-server")),
    devDependencies: .[0].devDependencies
  }
' "${PART03}/package.json" "${LIB}/package.json" > "${STAGING}/package.json"

# --- Pre-install other deps so the boot smoke can run --------------------
# This both validates the package.json shape and lets the smoke test below
# exercise the require graph without expecting the grader to do the work.
# --no-package-lock keeps the tarball's lockfile decisions out of the
# grader's reproducibility surface.
#
# Order matters: install BEFORE inlining the lib. npm 11 prunes any
# node_modules entry that isn't listed in `dependencies` (we deliberately
# removed @mbai460/photoapp-server from there). Inlining after install
# avoids that prune step.
echo "==> npm install --omit=dev --no-package-lock (in staging)"
( cd "${STAGING}" && npm install --omit=dev --no-package-lock --silent )

# --- Inline the lib (post-install) ---------------------------------------
# Now that npm has populated node_modules/ from npm registry, drop the
# library in. The grader's `npm install` will see the package isn't in
# `dependencies` and leave the inlined directory alone (npm leaves
# extraneous entries unless --force is passed; warns but doesn't delete).
echo "==> Inlining lib at node_modules/@mbai460/photoapp-server/"
mkdir -p "${STAGING}/node_modules/@mbai460/photoapp-server"
cp -R "${LIB}/src" "${STAGING}/node_modules/@mbai460/photoapp-server/src"
cp    "${LIB}/package.json" "${STAGING}/node_modules/@mbai460/photoapp-server/package.json"

# --- Boot smoke before tar ------------------------------------------------
echo "==> Boot smoke: require('@mbai460/photoapp-server') from staging"
( cd "${STAGING}" && node -e "
  const lib = require('@mbai460/photoapp-server');
  const wantTopKeys = ['config', 'middleware', 'repositories', 'schemas', 'services'];
  const got = Object.keys(lib).sort();
  for (const k of wantTopKeys) {
    if (!got.includes(k)) {
      console.error('FAIL: missing top-level export ' + k + '; got: ' + got.join(','));
      process.exit(1);
    }
  }
  console.log('OK: lib resolves with all top-level keys');
" )

# --- Tar ------------------------------------------------------------------
TS="$(date -u +%Y%m%dT%H%M%SZ)"
TAR="${DIST}/part03-submission-${TS}.tar.gz"

echo "==> Creating tarball: ${TAR}"
# COPYFILE_DISABLE=1 keeps macOS-specific ._* AppleDouble files out of the
# tarball (Gradescope graders running on Linux choke on them otherwise).
COPYFILE_DISABLE=1 tar --no-xattrs -czf "${TAR}" -C "${STAGING}" .

echo ""
echo "Tarball ready: ${TAR}"
echo "Size: $(du -h "${TAR}" | cut -f1)"
