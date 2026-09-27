#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
expected_wordpress="6.3"

plugin_minimum="$(sed -n 's/^[[:space:]]*\* Requires at least: \([0-9][0-9.]*\).*/\1/p' "$root/mermaid-content-blocks.php" | head -1)"
test "$plugin_minimum" = "$expected_wordpress"

grep -Fq "WordPress-$expected_wordpress%2B-blue.svg" "$root/README.md"
grep -Fq "**WordPress:** $expected_wordpress or later" "$root/README.md"
grep -Fq "WordPress $expected_wordpress or later" "$root/CONTRIBUTING.md"

grep -Eq '"apiVersion"[[:space:]]*:[[:space:]]*3' "$root/blocks/mermaid/block.json"
grep -Eq "'strategy'[[:space:]]*=>[[:space:]]*'defer'" "$root/mermaid-content-blocks.php"

echo "WordPress compatibility metadata validated ($expected_wordpress+)."
