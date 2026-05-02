#!/usr/bin/env bash
#
# Test for package-submission.sh — verifies the produced tarball is
# self-contained: extracts cleanly, and `require('@mbai460/photoapp-server')`
# resolves inside the extracted tree without any further install step.
#
# This is the second checklist item from Approach § Phase 4.3:
#
#   "Tarball extracts cleanly and require('@mbai460/photoapp-server')
#    resolves inside the extracted tree."
#
# Lives outside Jest because the script being tested is a bash script
# orchestrating tar/cp/npm — running it through node-jest would either
# require shelling out anyway or rewriting the script in node. Plain bash
# keeps the system-test boundary honest.
#
# Usage:
#   ./projects/project01/Part03/tools/__tests__/package-submission.test.sh
# Exit codes:
#   0 — passes
#   non-zero — fail (with diagnostic output to stderr)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGER="${SCRIPT_DIR}/../package-submission.sh"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../../.." && pwd)"
DIST="${REPO_ROOT}/projects/project01/Part03/dist"

[ -x "${PACKAGER}" ] || { echo "FAIL: ${PACKAGER} not executable"; exit 1; }

# --- Run the packager ---
echo "==> Step 1: invoke package-submission.sh"
"${PACKAGER}" >/tmp/package-submission.test.log 2>&1 || {
  echo "FAIL: package-submission.sh exited non-zero"
  echo "--- log ---"
  cat /tmp/package-submission.test.log
  exit 1
}

# --- Locate the freshest tarball ---
TAR="$(ls -1t "${DIST}"/part03-submission-*.tar.gz 2>/dev/null | head -1 || true)"
[ -n "${TAR}" ] && [ -f "${TAR}" ] || { echo "FAIL: no tarball found in ${DIST}"; exit 1; }
echo "==> Step 2: tarball produced at ${TAR}"

# --- Extract to a clean temp dir ---
EXTRACT="$(mktemp -d -t part03-extract.XXXXXXXX)"
trap 'rm -rf "${EXTRACT}"' EXIT
echo "==> Step 3: extract to ${EXTRACT}"
tar -xzf "${TAR}" -C "${EXTRACT}"

# --- Verify the lib resolves WITHOUT any subsequent npm install ---
# The whole point of inlining is that the grader's `node` can require
# the lib straight out of node_modules/, even before `npm install` runs.
echo "==> Step 4: require('@mbai460/photoapp-server') from extracted tree"
( cd "${EXTRACT}" && node -e "
  const lib = require('@mbai460/photoapp-server');
  const wantTopKeys = ['config', 'middleware', 'repositories', 'schemas', 'services'];
  const got = Object.keys(lib).sort();
  for (const k of wantTopKeys) {
    if (!got.includes(k)) {
      console.error('FAIL: missing top-level export ' + k + '; got: ' + got.join(','));
      process.exit(1);
    }
  }
  if (typeof lib.middleware.createErrorMiddleware !== 'function') {
    console.error('FAIL: middleware.createErrorMiddleware not a function');
    process.exit(1);
  }
  if (typeof lib.middleware.createUploadMiddleware !== 'function') {
    console.error('FAIL: middleware.createUploadMiddleware not a function');
    process.exit(1);
  }
  if (!lib.repositories.users || !lib.repositories.assets || !lib.repositories.labels) {
    console.error('FAIL: repositories missing one of users/assets/labels');
    process.exit(1);
  }
" || { echo "FAIL: require check failed inside extracted tree"; exit 1; }
)

# --- Verify the boot graph (server.js → app.js → lib) resolves ---
echo "==> Step 5: server.js boot graph from extracted tree (listen stubbed)"
( cd "${EXTRACT}" && node -e "
  require('http').Server.prototype.listen = function() { process.exit(0); };
  require('./server/server.js');
" || { echo "FAIL: server.js boot from extracted tree threw"; exit 1; }
)

echo ""
echo "PASS — submission tarball is self-contained and lib resolves"
