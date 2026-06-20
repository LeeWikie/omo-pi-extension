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

mkdir -p -- "$target_project/.pi"

(
	cd -- "$package_root"
	npm run build
)

(
	cd -- "$target_project"
	pi install -l --approve "$package_root"
)

cat <<EOF
Installed omo-pi-extension into project-local Pi settings:
  $target_project/.pi/settings.json

Run Pi from the target project with no startup network checks:
  cd "$target_project"
  PI_OFFLINE=1 pi --approve

To verify the package can be loaded without persisting settings, run:
  cd "$target_project"
  PI_OFFLINE=1 pi -e "$package_root" --approve --help
EOF
