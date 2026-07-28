#!/usr/bin/env bash
# Compose a Thunder reel MP4 from an unzipped media package (requires ffmpeg).
# Usage:
#   npm run media:reel -- /path/to/unzipped-package
#   ./scripts/compose-reel.sh ./exports/my-package
set -euo pipefail

ROOT="${1:-.}"
cd "$ROOT"

if [[ ! -f compose-reel.sh ]]; then
  echo "No compose-reel.sh in $ROOT — unzip a Thunder media package first."
  exit 1
fi

bash compose-reel.sh
