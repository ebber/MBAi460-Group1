#!/usr/bin/env bash
#
# DEPRECATED IN PROJECT02 PHASE 1 (docker-native-deployment plan)
# ----------------------------------------------------------------
# This script remains executable so historical Gradescope reproductions
# still work. It is no longer the canonical Project02 client-submission
# deploy path. The canonical deploy path is the Docker image built by
# `projects/project02/server/Dockerfile` plus the standalone client at
# `projects/project02/client/photoapp.py`.
#
# Phase 1.5 will decide whether to remove this file. Until then:
#   - Do NOT extend it.
#   - Do NOT use it as authority for what Project02 does.
#   - See projects/project02/scratch/phase1-strays-inventory.md (Class B)
#     and projects/project02/tools/DEPRECATED.md.
# ----------------------------------------------------------------
#
# package-client-submission.sh — produce a self-contained submission directory
# + tarball for Project 02 CLIENT API Gradescope submission (30/30).
#
# Course ID:           1288073
# Server assignment:   8052758  (separate; see tools/package-submission.sh)
# Client assignment:   8052765  ← this script
#
# Why this exists / mirror relationship:
#   The client Gradescope submission is "server submission + photoapp.py" per
#   the assignment PDF page 21:
#     /gradescope/gs submit 1288073 8052765 *.js *.ini photoapp.py
#   Approach docs and the Makefile call this out as a literal mirror of the
#   server packaging flow. Originally `make submit-client` was stubbed (per
#   Plan.md § Phase 3.6 + the Makefile target's pre-2026-05-04 STUB body)
#   and the existing `dist/p02-client-submission-20260505T041027Z` tarball was
#   built manually by running tools/package-submission.sh and dropping
#   photoapp.py into the result. This script wires that pattern formally so
#   the Phase 2.10 Gradescope filename-compatibility wrappers (api_*.js) flow
#   through to the client submission via the SAME code path the server uses.
#
# How this differs from package-submission.sh:
#   1. SUBMISSION_DIR/TARBALL prefixed `p02-client-submission-` instead of `p02-server-submission-`
#   2. After staging the server payload, copies projects/project02/client/photoapp.py to top level
#   3. "Next steps" output uses Gradescope client assignment ID 8052765 + adds *.py to the find glob
#
# Approach pointers:
#   - 03-client-api.md § Phase 6 (Gradescope submission)
#   - Plan.md § Phase 2.10 (filename-compat wrappers — flow through to client too)
#   - Plan.md § Phase 3.6 (client Gradescope submission)
#   - tools/package-submission.sh (the server-side analog; KEEP IN SYNC)
#
# Usage:
#   ./projects/project02/tools/package-client-submission.sh
#   # or:
#   make -C projects/project02 submit-client
#
# Output:
#   projects/project02/dist/p02-client-submission-<TS>/        (the dist tree)
#   projects/project02/dist/p02-client-submission-<TS>.tar.gz  (the tarball)
#
# Exit:   non-zero on any failure; safe to re-run (idempotent staging).

set -euo pipefail

# Resolve repo paths from the script location so this works regardless of
# the caller's cwd (Erik may invoke from anywhere; CI may invoke from root).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# tools/ → project02/ → projects/ → MBAi460-Group1/  (three levels up)
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
P02="${REPO_ROOT}/projects/project02"
P02_SERVER="${P02}/server"
P02_CLIENT="${P02}/client"
LIB="${REPO_ROOT}/lib/photoapp-server"
DIST="${P02}/dist"

# --- Sanity: required inputs are present ----------------------------------
[ -f "${P02_SERVER}/package.json" ] || { echo "ERROR: ${P02_SERVER}/package.json missing"; exit 2; }
[ -f "${P02_SERVER}/app.js" ]       || { echo "ERROR: ${P02_SERVER}/app.js missing"; exit 2; }
[ -f "${P02_SERVER}/server.js" ]    || { echo "ERROR: ${P02_SERVER}/server.js missing"; exit 2; }
[ -f "${P02_CLIENT}/photoapp.py" ]  || { echo "ERROR: ${P02_CLIENT}/photoapp.py missing"; exit 2; }
[ -f "${LIB}/package.json" ]        || { echo "ERROR: ${LIB}/package.json missing"; exit 2; }
[ -d "${LIB}/src" ]                 || { echo "ERROR: ${LIB}/src missing"; exit 2; }
command -v jq   >/dev/null 2>&1 || { echo "ERROR: jq not on PATH (brew install jq)"; exit 2; }
command -v node >/dev/null 2>&1 || { echo "ERROR: node not on PATH"; exit 2; }
command -v npm  >/dev/null 2>&1 || { echo "ERROR: npm not on PATH"; exit 2; }
command -v tar  >/dev/null 2>&1 || { echo "ERROR: tar not on PATH"; exit 2; }

mkdir -p "${DIST}"

# --- Output paths (timestamped so re-runs don't clobber prior attempts) ---
TS="$(date -u +%Y%m%dT%H%M%SZ)"
SUBMISSION_DIR="${DIST}/p02-client-submission-${TS}"
TARBALL="${DIST}/p02-client-submission-${TS}.tar.gz"

mkdir -p "${SUBMISSION_DIR}"

echo "==> Staging in: ${SUBMISSION_DIR}"

# --- Server source (identical to package-submission.sh) -------------------
echo "==> Copying Project 02 server source (top-level + 5 subdirs)"
cp "${P02_SERVER}/app.js"    "${SUBMISSION_DIR}/app.js"
cp "${P02_SERVER}/server.js" "${SUBMISSION_DIR}/server.js"
for dir in routes middleware services schemas observability; do
  if [ -d "${P02_SERVER}/${dir}" ]; then
    cp -R "${P02_SERVER}/${dir}" "${SUBMISSION_DIR}/${dir}"
    echo "    + ${dir}/"
  else
    echo "    - ${dir}/ (not present; skipped)"
  fi
done

# --- api_*.js wrappers (Phase 2.10 — flow through to client too) ---------
# Identical logic to package-submission.sh: top-level api_*.js wrappers from
# server/ — covers both server (60/60) and client (30/30) Gradescope sites
# since the client submission is "server payload + photoapp.py".
echo "==> Copying top-level api_*.js wrappers (Gradescope filename compat — Phase 2.10)"
shopt -s nullglob
api_wrapper_count=0
for f in "${P02_SERVER}"/api_*.js; do
  cp "${f}" "${SUBMISSION_DIR}/$(basename "${f}")"
  echo "    + $(basename "${f}")"
  api_wrapper_count=$((api_wrapper_count + 1))
done
shopt -u nullglob
if [ "${api_wrapper_count}" -eq 0 ]; then
  echo "    (none present)"
fi

# --- Rewrite server.js for Gradescope's flat layout -----------------------
# (Identical to package-submission.sh — see that script's commentary for why.)
echo "==> Rewriting server.js config-bridge path for Gradescope (./photoapp-config.ini)"
node - "${SUBMISSION_DIR}/server.js" <<'NODE_EOF'
const fs = require('fs');
const file = process.argv[2];
let src = fs.readFileSync(file, 'utf8');
const before = `libConfig.photoapp_config_filename = path.resolve(\n  __dirname,\n  '../../project01/client/photoapp-config.ini',\n);`;
const after = `libConfig.photoapp_config_filename = path.resolve(__dirname, 'photoapp-config.ini');`;
if (!src.includes("'../../project01/client/photoapp-config.ini'")) {
  console.error('FAIL: server.js does not contain the expected libConfig bridge path');
  console.error('      The script expected to find: ../../project01/client/photoapp-config.ini');
  console.error('      If server.js was refactored, update package-client-submission.sh to match.');
  process.exit(3);
}
src = src.replace(before, after);
fs.writeFileSync(file, src);
console.log('    server.js bridge path rewritten OK');
NODE_EOF

# --- Stage the lib at top-level photoapp-server-lib/ (Phase 2.10 Step 6) -
# Mirror of server flow — see tools/package-submission.sh § Step 6 commentary
# for the diagnostic chain that led to this. Short version: Gradescope's
# autograder either strips node_modules/ on ingest or prunes extraneous
# packages during its npm install, so the previously-inlined
# node_modules/@mbai460/photoapp-server/ wasn't reaching the grader's
# resolution. Fix: ship lib at top-level + use file: ref so the grader's
# own npm install creates the resolution path.
echo "==> Staging lib at photoapp-server-lib/ (Gradescope file: dep target)"
mkdir -p "${SUBMISSION_DIR}/photoapp-server-lib"
cp -R "${LIB}/src"          "${SUBMISSION_DIR}/photoapp-server-lib/src"
cp    "${LIB}/package.json" "${SUBMISSION_DIR}/photoapp-server-lib/package.json"

# --- Submission package.json (identical to server flow) ------------------
echo "==> Building flat submission package.json (P02 deps ∪ lib deps + file: ref to lib)"
jq -s '
  .[0].dependencies as $p02 |
  .[1].dependencies as $lib |
  {
    name: .[0].name,
    version: .[0].version,
    description: "Project 02 PhotoApp client API + web service — Gradescope client submission (lib via file: ref; photoapp.py at top level).",
    main: "server.js",
    scripts: {
      test: "jest --passWithNoTests",
      start: "node server.js"
    },
    engines: .[0].engines,
    dependencies: (
      ($p02 + $lib)
      | del(."@mbai460/photoapp-server")
      | . + {"@mbai460/photoapp-server": "file:./photoapp-server-lib"}
    ),
    devDependencies: .[0].devDependencies
  }
' "${P02_SERVER}/package.json" "${LIB}/package.json" > "${SUBMISSION_DIR}/package.json"

# --- npm install (resolves file: ref + all other deps) -------------------
echo "==> npm install --omit=dev --no-package-lock (in staging)"
( cd "${SUBMISSION_DIR}" && npm install --omit=dev --no-package-lock --silent )

# --- Belt-and-suspenders: also inline at node_modules path --------------
# Fallback resolution path in case grader's npm install doesn't resolve the
# file: ref correctly. See package-submission.sh § same step for rationale.
if [ ! -e "${SUBMISSION_DIR}/node_modules/@mbai460/photoapp-server/src/index.js" ]; then
  echo "==> Inlining lib at node_modules/@mbai460/photoapp-server/ (fallback)"
  mkdir -p "${SUBMISSION_DIR}/node_modules/@mbai460/photoapp-server"
  cp -R "${LIB}/src"          "${SUBMISSION_DIR}/node_modules/@mbai460/photoapp-server/src"
  cp    "${LIB}/package.json" "${SUBMISSION_DIR}/node_modules/@mbai460/photoapp-server/package.json"
else
  echo "==> Lib resolved at node_modules/@mbai460/photoapp-server/ via npm install"
fi

# --- Photoapp-config.ini (real AWS credentials) ---------------------------
# See tools/package-submission.sh § "Photoapp-config.ini" for the contract
# rationale. Mirror of server flow.
INI_REAL="${P02_PHOTOAPP_CONFIG_INI:-${REPO_ROOT}/projects/project01/client/photoapp-config.ini}"
INI_EXAMPLE="${P02_CLIENT}/photoapp-config.ini.example"

if [ -f "${INI_REAL}" ]; then
  if grep -qE '^[^#]*=\s*TODO\b' "${INI_REAL}"; then
    echo "ERROR: ${INI_REAL} contains TODO placeholders. Fill in real AWS credentials before submitting."
    grep -nE '^[^#]*=\s*TODO\b' "${INI_REAL}" | sed 's/^/        /'
    exit 2
  fi
  if grep -qE '^endpoint\s*=\s*mysql\s*$' "${INI_REAL}"; then
    echo "ERROR: ${INI_REAL} has [rds] endpoint=mysql (docker-compose service name)."
    echo "       Gradescope's env can't resolve 'mysql' — set this to your RDS endpoint."
    exit 2
  fi
  echo "==> Shipping REAL photoapp-config.ini (live AWS credentials)"
  echo "    Source: ${INI_REAL}"
  cp "${INI_REAL}" "${SUBMISSION_DIR}/photoapp-config.ini"
elif [ -f "${INI_EXAMPLE}" ]; then
  echo "WARN: ${INI_REAL} not found; falling back to ${INI_EXAMPLE}"
  echo "      The .example uses docker-compose hostnames that WILL fail on Gradescope."
  cp "${INI_EXAMPLE}" "${SUBMISSION_DIR}/photoapp-config.ini"
else
  echo "ERROR: no photoapp-config.ini source found at:"
  echo "       ${INI_REAL}"
  echo "       ${INI_EXAMPLE}"
  exit 2
fi

# --- CLIENT-SPECIFIC: drop photoapp.py at top level ----------------------
# The whole point of the client submission is shipping the rewritten Python
# client API alongside the web service. Per assignment PDF page 21:
#   /gradescope/gs submit 1288073 8052765 *.js *.ini photoapp.py
echo "==> Copying client API (photoapp.py)"
cp "${P02_CLIENT}/photoapp.py" "${SUBMISSION_DIR}/photoapp.py"

# --- Boot smoke #1: validate lib resolves via @mbai460/photoapp-server ---
echo "==> Boot smoke #1: require('@mbai460/photoapp-server') + require('./app') from staging"
( cd "${SUBMISSION_DIR}" && node -e "
  try {
    const lib = require('@mbai460/photoapp-server');
    const wantTopKeys = ['config', 'middleware', 'repositories', 'schemas', 'services'];
    const got = Object.keys(lib).sort();
    for (const k of wantTopKeys) {
      if (!got.includes(k)) {
        console.error('FAIL: missing top-level lib export ' + k + '; got: ' + got.join(','));
        process.exit(1);
      }
    }
    const app = require('./app');
    if (typeof app !== 'function' && typeof app.use !== 'function') {
      console.error('FAIL: ./app did not export an Express app');
      process.exit(1);
    }
    console.log('    lib resolves via @mbai460 specifier; app.js requires cleanly');
  } catch (err) {
    console.error('FAIL: boot smoke #1 threw: ' + (err && err.message));
    console.error(err && err.stack);
    process.exit(1);
  }
" )

# --- Vendoring rewrite (Phase 2.10 Step 7 — mirror of server flow) -------
# See tools/package-submission.sh § Step 7 commentary for the diagnostic
# chain that led to this. Short version: after 6 prior iterations failed
# with `Cannot find module '@mbai460/photoapp-server'` despite shipping
# the lib via every npm-canonical path, vendoring rewrites every require
# of the lib to a relative path against ./photoapp-server-lib/src so
# resolution doesn't depend on npm install or node_modules preservation.
echo "==> Vendoring rewrite: require('@mbai460/photoapp-server') → relative path to ./photoapp-server-lib/src"
node - "${SUBMISSION_DIR}" <<'NODE_EOF'
const fs = require('fs');
const path = require('path');

const root = process.argv[2];
const libTarget = path.join(root, 'photoapp-server-lib/src');
if (!fs.existsSync(libTarget)) {
  console.error('FAIL: vendoring target missing: ' + libTarget);
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      if (entry.name === 'photoapp-server-lib') continue;
      if (entry.name === 'tests') continue;
      out.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(root);
const pattern = /require\((['"])@mbai460\/photoapp-server\1\)/g;

let rewriteCount = 0;
let fileCount = 0;
for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  if (!pattern.test(src)) continue;
  pattern.lastIndex = 0;

  let rel = path.relative(path.dirname(file), libTarget);
  if (!rel.startsWith('.')) rel = './' + rel;

  const replaced = src.replace(pattern, `require('${rel}')`);
  const matches = src.match(pattern) || [];
  fs.writeFileSync(file, replaced);
  rewriteCount += matches.length;
  fileCount += 1;
  console.log('    ' + path.relative(root, file) + ' → ' + rel + '  (' + matches.length + ' require' + (matches.length === 1 ? '' : 's') + ')');
}

console.log('    Rewrote ' + rewriteCount + ' require(s) across ' + fileCount + ' file(s).');
if (fileCount === 0) {
  console.error('FAIL: no files matched — vendoring step is a no-op (regression check)');
  process.exit(1);
}
NODE_EOF

# --- Boot smoke #2: validate vendored requires resolve --------------------
echo "==> Boot smoke #2: validate vendored require paths resolve"
( cd "${SUBMISSION_DIR}" && \
  if grep -rn "require(['\"]@mbai460/photoapp-server['\"])" --include="*.js" \
        --exclude-dir=node_modules --exclude-dir=photoapp-server-lib . ; then
    echo "FAIL: residual @mbai460 specifier found post-vendoring (above)"
    exit 1
  fi && \
  node -e "
    try {
      Object.keys(require.cache).forEach((k) => delete require.cache[k]);
      const app = require('./app');
      if (typeof app !== 'function' && typeof app.use !== 'function') {
        console.error('FAIL: ./app did not export an Express app post-vendoring');
        process.exit(1);
      }
      console.log('    app.js requires cleanly via vendored relative paths');
    } catch (err) {
      console.error('FAIL: boot smoke #2 threw: ' + (err && err.message));
      console.error(err && err.stack);
      process.exit(1);
    }
  " )

# --- FLATTEN + RENAME (Phase 2.10 Step 8 — Gradescope flat-ingest fix) --
# Mirror of server flow — see tools/package-submission.sh § Step 8 for the
# diagnostic that revealed Gradescope flattens our entire upload to top
# level. Applies the same flatten + require-rewrite logic to the client
# submission so the client autograder (which spins up the same web service
# from the same shipped files) sees the expected flat layout.
echo "==> Flatten + rename for Gradescope flat-ingest (Phase 2.10 Step 8)"
node - "${SUBMISSION_DIR}" <<'NODE_EOF'
const fs = require('fs');
const path = require('path');

const root = process.argv[2];

function walkJsFiles(dir, baseDir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(baseDir, full);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      out.push(...walkJsFiles(full, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      out.push(rel);
    }
  }
  return out;
}

const jsFiles = walkJsFiles(root, root);

function flatName(rel) {
  if (!rel.includes(path.sep)) return rel;
  return rel.split(path.sep).join('_');
}

const flatMap = new Map();
for (const rel of jsFiles) {
  flatMap.set(rel, flatName(rel));
}

const reverseMap = new Map();
for (const [rel, flat] of flatMap) {
  if (reverseMap.has(flat)) {
    console.error('FAIL: flatten collision: ' + rel + ' AND ' + reverseMap.get(flat) + ' both → ' + flat);
    process.exit(1);
  }
  reverseMap.set(flat, rel);
}

function resolveRequireTarget(fromFileRel, requireArg) {
  if (!requireArg.startsWith('./') && !requireArg.startsWith('../')) return null;
  const fromDir = path.dirname(fromFileRel);
  let resolved = path.normalize(path.join(fromDir, requireArg));
  const candidates = [resolved, resolved + '.js', resolved + '.json', path.join(resolved, 'index.js')];
  for (const c of candidates) {
    if (flatMap.has(c)) return c;
    if (fs.existsSync(path.join(root, c)) && fs.statSync(path.join(root, c)).isFile()) {
      return c;
    }
  }
  return null;
}

const requirePattern = /require\((['"])(\.[^'"]+)\1\)/g;
let totalRewrites = 0;
const fileRewrites = [];

for (const rel of jsFiles) {
  const fullPath = path.join(root, rel);
  let src = fs.readFileSync(fullPath, 'utf8');
  let fileRewriteCount = 0;
  src = src.replace(requirePattern, (match, quote, requireArg) => {
    const targetRel = resolveRequireTarget(rel, requireArg);
    if (!targetRel) return match;
    if (!flatMap.has(targetRel)) return match;
    const flatTarget = flatMap.get(targetRel);
    const flatStem = flatTarget.replace(/\.js$/, '');
    fileRewriteCount += 1;
    return `require(${quote}./${flatStem}${quote})`;
  });
  if (fileRewriteCount > 0) {
    fs.writeFileSync(fullPath, src);
    fileRewrites.push({ rel, count: fileRewriteCount });
    totalRewrites += fileRewriteCount;
  }
}

const moves = [];
for (const [rel, flat] of flatMap) {
  if (rel === flat) continue;
  const oldPath = path.join(root, rel);
  const newPath = path.join(root, flat);
  if (fs.existsSync(newPath)) {
    console.error('FAIL: target already exists, would clobber: ' + flat);
    process.exit(1);
  }
  fs.renameSync(oldPath, newPath);
  moves.push({ from: rel, to: flat });
}

const libPkg = path.join(root, 'photoapp-server-lib', 'package.json');
if (fs.existsSync(libPkg)) {
  fs.unlinkSync(libPkg);
  console.log('    Dropped photoapp-server-lib/package.json (lib metadata, no longer needed)');
}

function rmEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const sub = path.join(dir, entry.name);
      if (entry.name === 'node_modules') continue;
      rmEmptyDirs(sub);
    }
  }
  if (dir !== root) {
    try {
      const remaining = fs.readdirSync(dir);
      if (remaining.length === 0) fs.rmdirSync(dir);
    } catch (e) { /* ignore */ }
  }
}
rmEmptyDirs(root);

console.log('    Rewrote ' + totalRewrites + ' require(s) across ' + fileRewrites.length + ' file(s).');
console.log('    Moved ' + moves.length + ' file(s) to top-level flat names.');
console.log('    Sample renames:');
for (const m of moves.slice(0, 8)) console.log('      ' + m.from + ' → ' + m.to);
if (moves.length > 8) console.log('      ... and ' + (moves.length - 8) + ' more');
NODE_EOF

# --- Shim missing npm modules (Phase 2.10 Step 9) -----------------------
# See tools/package-submission.sh § Phase 2.10 Step 9 for the diagnostic
# chain that revealed Gradescope's pre-baked node_modules is sized to the
# assignment template (bare express + console.log) and lacks our
# production-grade middleware deps (multer, pino, pino-http, opossum, zod).
# Mirror of server flow.
# --- Append Gradescope startup shim to app.js (Phase 2.10 Step 10) ------
# See tools/package-submission.sh § Phase 2.10 Step 10 for the diagnostic
# chain. Mirror of server flow — app.js needs an inline app.listen(8080)
# call appended at packaging time because the autograder runs `node app.js`
# directly and our source uses production-grade composition/bootstrap split.
# --- Strip lib's `kind` column from queries (Phase 2.10 Step 14) ---------
# See tools/package-submission.sh § Phase 2.10 Step 14 for the diagnostic
# chain. Mirror of server flow — autograder uses Northwestern's canonical
# 4-col assets schema; strip kind from queries in dist (source unchanged).
#
# === TOGGLE (added post-90/90) ===
# Step 14 is OPT-IN via P02_AUTOGRADER_BUILD=1. Default preserves the
# `kind` extension end-to-end. Use `make submit-client-autograder` (or
# set the env var) when re-submitting to Gradescope.
if [ "${P02_AUTOGRADER_BUILD:-0}" = "1" ]; then
echo "==> [P02_AUTOGRADER_BUILD=1] Strip 'kind' column from lib repositories/assets.js (Step 14)"
node - "${SUBMISSION_DIR}" <<'NODE_EOF'
const fs = require('fs');
const path = require('path');
const root = process.argv[2];

function findAssetsJs(dir) {
  const flat = path.join(dir, 'photoapp-server-lib_src_repositories_assets.js');
  if (fs.existsSync(flat)) return flat;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findAssetsJs(full);
      if (found) return found;
    } else if (entry.isFile() && entry.name === 'assets.js' && full.includes('repositories')) {
      return full;
    }
  }
  return null;
}
const assetsFile = findAssetsJs(root);
if (!assetsFile) {
  console.error('    ERROR: could not find repositories/assets.js in staged dist');
  process.exit(1);
}

let src = fs.readFileSync(assetsFile, 'utf8');
const before = src;
src = src.replace(
  "'SELECT assetid, userid, localname, bucketkey, kind FROM assets ORDER BY assetid ASC'",
  "'SELECT assetid, userid, localname, bucketkey FROM assets ORDER BY assetid ASC'"
);
src = src.replace(
  "'SELECT assetid, userid, localname, bucketkey, kind FROM assets WHERE userid = ? ORDER BY assetid ASC'",
  "'SELECT assetid, userid, localname, bucketkey FROM assets WHERE userid = ? ORDER BY assetid ASC'"
);
src = src.replace(
  "'INSERT INTO assets(userid, localname, bucketkey, kind) VALUES (?, ?, ?, ?)'",
  "'INSERT INTO assets(userid, localname, bucketkey) VALUES (?, ?, ?)'"
);
src = src.replace(
  '[userid, localname, bucketkey, kind]',
  '[userid, localname, bucketkey]'
);

if (src === before) {
  console.error('    ERROR: no rewrites applied — assets.js shape may have changed');
  process.exit(1);
}
fs.writeFileSync(assetsFile, src);
console.log('    Rewrote: ' + path.relative(root, assetsFile));
console.log('    Stripped kind from: findAll, findByUserId, insert (cols+vals+params)');
NODE_EOF
else
echo "==> Skipping Step 14 (kind-strip): preserving 'kind' extension end-to-end"
echo "    P02_AUTOGRADER_BUILD is unset/0 — extension stays in dist."
echo "    To re-engage strip for Gradescope autograder submission:"
echo "      P02_AUTOGRADER_BUILD=1 make submit-client   (or: make submit-client-autograder)"
fi

# --- Bridge lib's config_filename to flat-dist layout (Phase 2.10 Step 11.5) -
# Mirror of server flow. See tools/package-submission.sh § Step 11.5 for the
# diagnostic chain. Lib ships with relative-path default that doesn't resolve
# in Gradescope's flat /autograder/ env; rewrite to __dirname-relative.
echo "==> Bridge lib config_filename to flat-dist layout (Step 11.5)"
node - "${SUBMISSION_DIR}" <<'NODE_EOF'
const fs = require('fs');
const path = require('path');
const root = process.argv[2];
const cfgFile = path.join(root, 'photoapp-server-lib_src_config.js');
if (!fs.existsSync(cfgFile)) {
  console.error('    SKIP: photoapp-server-lib_src_config.js not present');
  process.exit(0);
}
let src = fs.readFileSync(cfgFile, 'utf8');
const before = src;
src = src.replace(
  /photoapp_config_filename:\s*["'][^"']+["']/,
  "photoapp_config_filename: require('path').resolve(__dirname, 'photoapp-config.ini')"
);
if (src === before) {
  console.error('    WARN: photoapp_config_filename pattern not found');
} else {
  fs.writeFileSync(cfgFile, src);
  console.log('    Rewrote photoapp_config_filename to __dirname-relative resolve');
}
NODE_EOF

echo "==> Append Gradescope startup shim (app.listen(8080)) to app.js"
cat >> "${SUBMISSION_DIR}/app.js" <<'APP_LISTEN_EOF'

// =============================================================================
// Gradescope startup shim — auto-appended at packaging time.
// See tools/package-submission.sh § Phase 2.10 Step 10/11 for diagnostic chain.
// =============================================================================
if (require.main === module) {
  process.on('uncaughtException', (err) => {
    try { console.error('[uncaughtException]', err && err.stack || err); } catch (e) {}
  });
  process.on('unhandledRejection', (reason) => {
    try { console.error('[unhandledRejection]', reason && reason.stack || reason); } catch (e) {}
  });

  try {
    const fs = require('fs');
    const path = require('path');
    console.error('[startup] cwd=' + process.cwd() + ' __dirname=' + __dirname);
    const cfgPath = path.join(__dirname, 'photoapp-config.ini');
    const cfgExists = fs.existsSync(cfgPath);
    console.error('[startup] photoapp-config.ini exists at __dirname: ' + cfgExists);
    if (cfgExists) {
      const raw = fs.readFileSync(cfgPath, 'utf8');
      const sections = (raw.match(/^\[[^\]]+\]/gm) || []).join(', ');
      console.error('[startup] photoapp-config.ini sections: ' + (sections || '<none>'));
      console.error('[startup] photoapp-config.ini bytes: ' + raw.length);
    }
    const cwdCfg = path.join(process.cwd(), 'photoapp-config.ini');
    if (cwdCfg !== cfgPath) {
      console.error('[startup] photoapp-config.ini exists at cwd: ' + fs.existsSync(cwdCfg));
    }
  } catch (e) {
    console.error('[startup] diagnostic threw:', e && e.stack || e);
  }

  const PORT = parseInt(process.env.PORT, 10) || 8080;
  app.listen(PORT, () => {
    console.log(`Web service listening on port: ${PORT}`);
  });
}
APP_LISTEN_EOF
echo "    Appended app.listen(8080) + uncaughtException/Rejection handlers + startup diagnostic to app.js"

echo "==> Shim missing npm modules (multer + pino + pino-http) for Gradescope's pre-baked node_modules"
node - "${SUBMISSION_DIR}" <<'NODE_EOF'
const fs = require('fs');
const path = require('path');

const root = process.argv[2];

const MULTER_SHIM = `// _shim_multer.js — Multer no-op shim (auto-generated; see package-submission.sh § Step 9)
'use strict';
function multer(opts) {
  const passthrough = (req, res, next) => next();
  return {
    single: (fieldName) => passthrough,
    array: (fieldName, maxCount) => passthrough,
    fields: (fieldsArg) => passthrough,
    none: () => passthrough,
    any: () => passthrough,
  };
}
multer.diskStorage = (opts) => ({});
multer.memoryStorage = () => ({});
class MulterError extends Error {
  constructor(code, field) { super(code); this.code = code; this.field = field; this.name = 'MulterError'; }
}
multer.MulterError = MulterError;
module.exports = multer;
module.exports.default = multer;
`;

const PINO_SHIM = `// _shim_pino.js — Pino partial-noop shim (auto-generated; see package-submission.sh § Step 9 rev. Step 11)
// .error/.fatal/.warn → console.error for autograder debugging visibility; .info/.debug/.trace stay no-op.
'use strict';
function makeLogger() {
  const noop = () => {};
  const errOut = (...args) => { try { console.error('[pino-shim]', ...args); } catch (e) {} };
  const logger = {
    info: noop, debug: noop, trace: noop, silent: noop,
    error: errOut, fatal: errOut, warn: errOut,
    level: 'info',
    levelVal: 30,
    bindings: () => ({}),
    flush: noop,
    isLevelEnabled: () => false,
  };
  logger.child = () => makeLogger();
  return logger;
}
function pino(opts, dest) { return makeLogger(); }
pino.default = pino;
pino.pino = pino;
pino.stdSerializers = { req: () => ({}), res: () => ({}), err: () => ({}), wrapRequestSerializer: (fn) => fn, wrapResponseSerializer: (fn) => fn };
pino.stdTimeFunctions = { isoTime: () => '', epochTime: () => '', unixTime: () => '', nullTime: () => '' };
pino.symbols = {};
pino.transport = () => ({ on: () => {}, end: () => {}, write: () => {} });
pino.destination = () => ({ write: () => {}, end: () => {}, on: () => {} });
pino.multistream = () => ({});
pino.levels = { values: { trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60, silent: Infinity }, labels: { 10: 'trace', 20: 'debug', 30: 'info', 40: 'warn', 50: 'error', 60: 'fatal' } };
pino.version = '0.0.0-shim';
module.exports = pino;
module.exports.default = pino;
`;

const PINO_HTTP_SHIM = `// _shim_pino_http.js — Pino-HTTP partial-noop shim (auto-generated; see package-submission.sh § Step 9 rev. Step 11)
'use strict';
function makeReqLogger() {
  const noop = () => {};
  const errOut = (...args) => { try { console.error('[pino-http-shim]', ...args); } catch (e) {} };
  const logger = {
    info: noop, debug: noop, trace: noop, silent: noop,
    error: errOut, fatal: errOut, warn: errOut,
    level: 'info',
  };
  logger.child = () => makeReqLogger();
  return logger;
}
function pinoHttp(opts) {
  const middleware = (req, res, next) => {
    req.log = makeReqLogger();
    if (typeof next === 'function') next();
  };
  middleware.logger = makeReqLogger();
  return middleware;
}
pinoHttp.default = pinoHttp;
pinoHttp.startTime = Symbol('startTime');
pinoHttp.stdSerializers = { req: () => ({}), res: () => ({}), err: () => ({}) };
module.exports = pinoHttp;
module.exports.default = pinoHttp;
`;

const SHIMS = {
  'multer': MULTER_SHIM,
  'pino': PINO_SHIM,
  'pino-http': PINO_HTTP_SHIM,
};

function shimFileName(moduleName) {
  return '_shim_' + moduleName.replace(/[^a-zA-Z0-9]/g, '_') + '.js';
}

for (const [moduleName, shimSrc] of Object.entries(SHIMS)) {
  const fileName = shimFileName(moduleName);
  fs.writeFileSync(path.join(root, fileName), shimSrc);
  console.log('    Shim written: ' + fileName + ' (for ' + moduleName + ')');
}

let totalRewrites = 0;
const fileRewrites = [];
const jsFiles = fs.readdirSync(root).filter(f => f.endsWith('.js') && !f.startsWith('_shim_'));
for (const jsFile of jsFiles) {
  const fullPath = path.join(root, jsFile);
  let src = fs.readFileSync(fullPath, 'utf8');
  let fileRewriteCount = 0;
  for (const moduleName of Object.keys(SHIMS)) {
    const shimStem = './' + shimFileName(moduleName).replace(/\.js$/, '');
    const escaped = moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp("require\\((['\"])" + escaped + "\\1\\)", 'g');
    const newSrc = src.replace(pattern, (match) => {
      fileRewriteCount += 1;
      return "require('" + shimStem + "')";
    });
    src = newSrc;
  }
  if (fileRewriteCount > 0) {
    fs.writeFileSync(fullPath, src);
    fileRewrites.push({ file: jsFile, count: fileRewriteCount });
    totalRewrites += fileRewriteCount;
  }
}

console.log('    Rewrote ' + totalRewrites + ' bare-specifier require(s) across ' + fileRewrites.length + ' file(s).');
for (const fr of fileRewrites) {
  console.log('      ' + fr.file + ': ' + fr.count + ' rewrite' + (fr.count === 1 ? '' : 's'));
}
NODE_EOF

# --- Boot smoke #3: validate flat structure resolves --------------------
echo "==> Boot smoke #3: validate flat structure resolves"
( cd "${SUBMISSION_DIR}" && \
  node -e "
    try {
      Object.keys(require.cache).forEach((k) => delete require.cache[k]);
      const app = require('./app');
      if (typeof app !== 'function' && typeof app.use !== 'function') {
        console.error('FAIL: ./app did not export an Express app post-flatten');
        process.exit(1);
      }
      console.log('    app.js requires cleanly via flat top-level paths');
    } catch (err) {
      console.error('FAIL: boot smoke #3 threw: ' + (err && err.message));
      console.error(err && err.stack);
      process.exit(1);
    }
  " )

# --- Tar -----------------------------------------------------------------
echo "==> Creating tarball: ${TARBALL}"
COPYFILE_DISABLE=1 tar --no-xattrs -czf "${TARBALL}" -C "${DIST}" "$(basename "${SUBMISSION_DIR}")"

echo ""
echo "============================================================"
echo "  Client submission package built successfully."
echo "============================================================"
echo ""
echo "  Directory: ${SUBMISSION_DIR}"
echo "  Tarball:   ${TARBALL}  ($(du -h "${TARBALL}" | cut -f1))"
echo ""
echo "  Top-level file count: $(find "${SUBMISSION_DIR}" -maxdepth 1 -type f | wc -l | tr -d ' ')"
echo "  Total .js files:      $(find "${SUBMISSION_DIR}" -name '*.js' ! -path '*/node_modules/*' | wc -l | tr -d ' ')"
echo "  Total .py files:      $(find "${SUBMISSION_DIR}" -name '*.py' ! -path '*/node_modules/*' | wc -l | tr -d ' ')"
echo "  node_modules size:    $(du -sh "${SUBMISSION_DIR}/node_modules" | cut -f1)"
echo ""
echo "============================================================"
echo "  Next steps — submit to Gradescope"
echo "============================================================"
echo ""
echo "  Course:              1288073"
echo "  Client assignment:   8052765  (Project 02 — client API, 30/30)"
echo ""
echo "  Inside the Gradescope-provided server Docker image (where"
echo "  /gradescope/gs is on PATH):"
echo ""
echo "  1. cd into the submission directory:"
echo ""
echo "       cd ${SUBMISSION_DIR##*/}"
echo ""
echo "  2. Pick ONE of the following submit invocations (try in order):"
echo ""
echo "     (a) FLAT (preferred — matches assignment template's documented"
echo "         invocation per PDF page 21; works because Step 8 flattens the dist):"
echo ""
echo "         /gradescope/gs submit 1288073 8052765 *.js *.ini *.json photoapp.py"
echo ""
echo "     (b) Tarball — single archive; works if Gradescope auto-extracts:"
echo ""
echo "         /gradescope/gs submit 1288073 8052765 ../$(basename "${TARBALL}")"
echo ""
echo "     (c) Recursive — only useful if Gradescope changes its flat-ingest"
echo "         behavior in the future; harmless on a flattened dist:"
echo ""
echo '         /gradescope/gs submit 1288073 8052765 \'
echo '             $(find . -type f \( -name "*.js" -o -name "*.ini" -o -name "*.json" -o -name "*.py" \) \'
echo '                  ! -path "./node_modules/*")'
echo ""
echo "  3. Web-upload fallback (no Docker needed):"
echo ""
echo "       Drag-drop ${TARBALL##*/}"
echo "       to 'Project 02 — client API' on Gradescope."
echo ""
echo "============================================================"
