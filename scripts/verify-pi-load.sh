#!/usr/bin/env bash
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
package_root=$(cd -- "$script_dir/.." && pwd)
target_project=${OMO_PI_TARGET_PROJECT:-$package_root}

if ! command -v pi >/dev/null 2>&1; then
	cat >&2 <<'EOF'
error: pi CLI was not found on PATH.
Install Pi or run this script from an environment where `pi` is available.
EOF
	exit 127
fi

(
	cd -- "$package_root"
	npm run build
)

cat <<EOF
Pi local package load smoke command:
  cd "$target_project"
  PI_OFFLINE=1 pi -e "$package_root" --approve --help

Expected verification signal:
  Pi prints CLI help after resolving the local package path. This exercises
  the extension loader without starting a model request or requiring API keys.
EOF
