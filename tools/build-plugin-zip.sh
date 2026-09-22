#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT

mkdir -p "$root/build" "$stage/mermaid-content-blocks"
cp "$root/mermaid-content-blocks.php" "$root/LICENSE" "$stage/mermaid-content-blocks/"
cp -R "$root/assets" "$root/blocks" "$stage/mermaid-content-blocks/"
rm -f "$root/build/mermaid-content-blocks.zip"
(cd "$stage" && zip -qr "$root/build/mermaid-content-blocks.zip" mermaid-content-blocks)
echo "Built $root/build/mermaid-content-blocks.zip"
