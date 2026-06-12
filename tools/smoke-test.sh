#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if command -v php >/dev/null 2>&1; then
  find . -name '*.php' -print0 | while IFS= read -r -d '' file; do
    php -l "$file" >/dev/null
    echo "PHP OK: $file"
  done
else
  echo "SKIP: php not found"
fi

if command -v node >/dev/null 2>&1; then
  find assets blocks -name '*.js' -print0 | while IFS= read -r -d '' file; do
    node --check "$file"
    echo "JS OK: $file"
  done
else
  echo "SKIP: node not found"
fi

echo "Smoke tests completed."
