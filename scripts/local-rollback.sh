#!/usr/bin/env bash
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
package_root=$(cd -- "$script_dir/.." && pwd)
target_project=${OMO_PI_TARGET_PROJECT:-$package_root}
relative_package=$(node -e '
	const path = require("node:path");
	const targetProject = process.argv[1];
	const packageRoot = process.argv[2];
	console.log(path.relative(path.join(targetProject, ".pi"), packageRoot));
' "$target_project" "$package_root")

if ! command -v pi >/dev/null 2>&1; then
	cat >&2 <<'EOF'
error: pi CLI was not found on PATH.
Install Pi or run this script from an environment where `pi` is available.
EOF
	exit 127
fi

(
	cd -- "$target_project"
	pi remove -l --approve "$package_root" || true
	if [[ "$relative_package" != "$package_root" ]]; then
		pi remove -l --approve "$relative_package" || true
	fi
)

settings_file="$target_project/.pi/settings.json"
if [[ -f "$settings_file" ]]; then
	if node -e '
		const fs = require("node:fs");
		const settingsPath = process.argv[1];
		const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
		process.exit(Array.isArray(settings.packages) && settings.packages.length === 0 ? 0 : 1);
	' "$settings_file"; then
		rm -- "$settings_file"
	fi
fi

cat <<EOF
Removed omo-pi-extension from project-local Pi settings:
  $target_project/.pi/settings.json

No global Pi settings or home-directory files were modified by this rollback script.
EOF
