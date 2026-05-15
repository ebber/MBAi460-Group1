#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  stage-eb-node-app.sh \
    --source-dir PATH \
    --config-file PATH \
    --output-dir PATH \
    [--bundle-name NAME] \
    [--entrypoint FILE]

Creates a deterministic Elastic Beanstalk Node.js application bundle:
  - recursively copies the app source tree
  - omits common dev/test/build artifacts
  - copies the supplied config file to photoapp-config.ini at bundle root
  - validates package.json and the entrypoint exist
  - writes NAME.zip and NAME.manifest.txt in output-dir
USAGE
}

SOURCE_DIR=""
CONFIG_FILE=""
OUTPUT_DIR=""
BUNDLE_NAME=""
ENTRYPOINT="server.js"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --source-dir)
      SOURCE_DIR="${2:-}"; shift 2 ;;
    --config-file)
      CONFIG_FILE="${2:-}"; shift 2 ;;
    --output-dir)
      OUTPUT_DIR="${2:-}"; shift 2 ;;
    --bundle-name)
      BUNDLE_NAME="${2:-}"; shift 2 ;;
    --entrypoint)
      ENTRYPOINT="${2:-}"; shift 2 ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      usage >&2
      exit 2 ;;
  esac
done

[ -n "$SOURCE_DIR" ] || { echo "ERROR: --source-dir is required" >&2; exit 2; }
[ -n "$CONFIG_FILE" ] || { echo "ERROR: --config-file is required" >&2; exit 2; }
[ -n "$OUTPUT_DIR" ] || { echo "ERROR: --output-dir is required" >&2; exit 2; }

[ -d "$SOURCE_DIR" ] || { echo "ERROR: source dir not found: $SOURCE_DIR" >&2; exit 2; }
[ -f "$CONFIG_FILE" ] || { echo "ERROR: config file not found: $CONFIG_FILE" >&2; exit 2; }

if [ -z "$BUNDLE_NAME" ]; then
  BUNDLE_NAME="$(basename "$SOURCE_DIR")-$(date -u +%Y%m%dT%H%M%SZ)"
fi

mkdir -p "$OUTPUT_DIR"

python3 - "$SOURCE_DIR" "$CONFIG_FILE" "$OUTPUT_DIR" "$BUNDLE_NAME" "$ENTRYPOINT" <<'PY'
import os
import shutil
import sys
import zipfile
from pathlib import Path

source = Path(sys.argv[1]).resolve()
config = Path(sys.argv[2]).resolve()
output = Path(sys.argv[3]).resolve()
bundle_name = sys.argv[4]
entrypoint = sys.argv[5]

stage = output / f".{bundle_name}.stage"
zip_path = output / f"{bundle_name}.zip"
manifest_path = output / f"{bundle_name}.manifest.txt"

excluded_dirs = {
    ".git",
    ".terraform",
    "_assignment-template",
    "__tests__",
    "coverage",
    "dist",
    "node_modules",
    "tests",
}

excluded_files = {
    ".DS_Store",
    "Dockerfile",
    "commitlint.config.cjs",
    "eslint.config.js",
    "jest.config.js",
}

excluded_suffixes = (
    ".test.js",
    ".spec.js",
    ".log",
)

if stage.exists():
    shutil.rmtree(stage)
stage.mkdir(parents=True)

for root, dirs, files in os.walk(source):
    root_path = Path(root)
    rel_root = root_path.relative_to(source)
    dirs[:] = [d for d in dirs if d not in excluded_dirs]

    for filename in files:
        if filename in excluded_files:
            continue
        if filename.endswith(excluded_suffixes):
            continue
        src = root_path / filename
        rel = rel_root / filename
        dest = stage / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)

shutil.copy2(config, stage / "photoapp-config.ini")

required = [
    Path("package.json"),
    Path(entrypoint),
    Path("photoapp-config.ini"),
]
missing = [str(p) for p in required if not (stage / p).is_file()]
if missing:
    raise SystemExit(f"ERROR: staged bundle missing required files: {', '.join(missing)}")

entries = sorted(
    p.relative_to(stage).as_posix()
    for p in stage.rglob("*")
    if p.is_file()
)

with manifest_path.open("w", encoding="utf-8") as manifest:
    for entry in entries:
        manifest.write(entry + "\n")

if zip_path.exists():
    zip_path.unlink()
with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
    for entry in entries:
        zf.write(stage / entry, entry)

shutil.rmtree(stage)

print(f"bundle={zip_path}")
print(f"manifest={manifest_path}")
print(f"files={len(entries)}")
PY
