#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
plugin="$root/mermaid-content-blocks.php"

header_version="$(sed -n 's/^[[:space:]]*\* Version: \([0-9][0-9.]*\).*/\1/p' "$plugin" | head -1)"
constant_version="$(sed -n "s/^define( 'MCB_VERSION', '\([^']*\)' );$/\1/p" "$plugin" | head -1)"

test -n "$header_version"
test "$constant_version" = "$header_version"
grep -Eq "^## \[$header_version\] - [0-9]{4}-[0-9]{2}-[0-9]{2}$" "$root/CHANGELOG.md"

if [[ "${GITHUB_REF_TYPE:-}" == "tag" ]]; then
	test "${GITHUB_REF_NAME:-}" = "v$header_version"
fi

echo "Plugin version metadata validated ($header_version)."
