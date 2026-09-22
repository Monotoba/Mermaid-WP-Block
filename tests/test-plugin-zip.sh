#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
archive="$root/build/mermaid-content-blocks.zip"
test -s "$archive"
unzip -tq "$archive" >/dev/null
listing="$(unzip -Z1 "$archive")"
printf '%s\n' "$listing" | grep -Fxq 'mermaid-content-blocks/mermaid-content-blocks.php'
printf '%s\n' "$listing" | grep -Fxq 'mermaid-content-blocks/LICENSE'
printf '%s\n' "$listing" | grep -Eq '^mermaid-content-blocks/assets/.+\.js$'
printf '%s\n' "$listing" | grep -Eq '^mermaid-content-blocks/blocks/.+\.js$'
if printf '%s\n' "$listing" | grep -Eq '^(\.github|tests|build)/|(^|/)(\.git|README\.md)$'; then
  echo 'Unexpected development file in plugin ZIP' >&2
  exit 1
fi
version="$(sed -n 's/^[[:space:]]*\* Version: \([0-9][0-9.]*\).*/\1/p' "$root/mermaid-content-blocks.php" | head -1)"
test -n "$version"
unzip -p "$archive" mermaid-content-blocks/mermaid-content-blocks.php | grep -Fq "Version: $version"
echo 'Plugin ZIP structure validated.'
