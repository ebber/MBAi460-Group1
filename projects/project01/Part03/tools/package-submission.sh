#!/usr/bin/env bash
#
# package-submission.sh — produce a self-contained submission tarball for
# Part 03 with its local PhotoApp core included under server/src/photoapp-core.
#
# Why this exists: Part 03 keeps submission packaging as a contingency path.
# The split-MVP runtime is already self-contained under server/src/photoapp-core,
# so the tarball only needs Part 03 source + npm dependencies.
#
# Approach:
#   Project 01 split MVP — local core packaging.
#
# Usage:
#   ./projects/project01/Part03/tools/package-submission.sh
#
# Output: a .tar.gz in projects/project01/Part03/dist/
# Exit:   non-zero on any failure; safe to re-run (idempotent staging).
#
# Note: Part 03 was originally submitted to Canvas, not Gradescope. This
# script is a contingency packager kept current so the project remains
# self-contained if a submission-style tarball is ever needed.

set -euo pipefail

# Resolve repo paths from the script location so this works regardless of
# the caller's cwd (Erik may invoke from anywhere; CI may invoke from root).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"
PART03="${REPO_ROOT}/projects/project01/Part03"
DIST="${PART03}/dist"

# --- Sanity: required inputs are present ----------------------------------
[ -f "${PART03}/package.json" ] || { echo "ERROR: ${PART03}/package.json missing"; exit 2; }
[ -d "${PART03}/server/src/photoapp-core" ] || { echo "ERROR: ${PART03}/server/src/photoapp-core missing"; exit 2; }
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
# Build a flat package.json from Part 03's direct deps. The local PhotoApp core
# is source code under server/src/photoapp-core and has no package identity.
echo "==> Building flat submission package.json (Part 03 deps)"
jq '
  {
    name: .name,
    version: .version,
    description: "Part 03 PhotoApp web service — self-contained submission tarball.",
    main: .main,
    scripts: {
      test: "jest --passWithNoTests",
      start: "node server/server.js"
    },
    engines: .engines,
    dependencies: .dependencies,
    devDependencies: .devDependencies
  }
' "${PART03}/package.json" > "${STAGING}/package.json"

# --- Pre-install other deps so the boot smoke can run --------------------
# This both validates the package.json shape and lets the smoke test below
# exercise the require graph without expecting the grader to do the work.
# --no-package-lock keeps the tarball's lockfile decisions out of the
# grader's reproducibility surface.
#
echo "==> npm install --omit=dev --no-package-lock (in staging)"
( cd "${STAGING}" && npm install --omit=dev --no-package-lock --silent )

# --- Boot smoke before tar ------------------------------------------------
echo "==> Boot smoke: require local photoapp core from staging"
( cd "${STAGING}" && node -e "
  const lib = require('./server/src/photoapp-core');
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
