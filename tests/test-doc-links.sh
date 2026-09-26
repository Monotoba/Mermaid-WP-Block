#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

if grep -Rni --exclude='test-doc-links.sh' 'github\.com/Monotoba/mermaid-content-blocks' \
  README.md CONTRIBUTING.md CHANGELOG.md examples.md tests tools; then
  echo 'Found a stale GitHub repository URL.' >&2
  exit 1
fi

grep -Fq 'https://github.com/Monotoba/Mermaid-WP-Block/issues' README.md
grep -Fq 'actions/workflows/test.yml/badge.svg' README.md
grep -Fq 'https://github.com/YOUR_USERNAME/Mermaid-WP-Block.git' CONTRIBUTING.md

echo 'Documentation repository links validated.'
