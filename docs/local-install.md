# Local Pi install workflow

This package can be loaded by Pi as a local package without publishing to npm.
Pi supports two local extension paths:

- `pi -e <source>` / `pi --extension <source>` for one-run, non-persistent loading.
- `pi install -l <source>` for project-local registration in `.pi/settings.json`.

The local scripts use only project-local `.pi/` settings. They do not write to
`~/.pi/agent/settings.json` or any other home-directory Pi configuration.

## Prerequisites

```bash
cd /root/openpi/omo-pi-extension
npm install
```

The `pi` CLI must be available on `PATH`. To install into a different Pi
project directory, set `OMO_PI_TARGET_PROJECT` when running the scripts.

## 1. Build the extension package

```bash
cd /root/openpi/omo-pi-extension
npm run build
```

The build emits `dist/index.js`, which is declared in `package.json` under the
Pi package manifest:

```json
{
  "pi": {
    "extensions": ["./dist/index.js"]
  }
}
```

## 2. Install/link locally into Pi

Install into the current package directory's project-local Pi settings:

```bash
cd /root/openpi/omo-pi-extension
npm run local:install:pi
```

Install into another local Pi project without touching global settings:

```bash
cd /root/openpi/omo-pi-extension
OMO_PI_TARGET_PROJECT=/path/to/pi/project npm run local:install:pi
```

The script runs the equivalent of:

```bash
cd /path/to/pi/project
pi install -l --approve /root/openpi/omo-pi-extension
```

`--approve` allows Pi to trust project-local files for this command instead of
prompting interactively. Pi records the local package path in
`/path/to/pi/project/.pi/settings.json`.
Local paths are linked from disk rather than copied, so rebuilding this package
updates what Pi loads on the next run.

## 3. Run Pi with the extension loaded, no API-key startup request

For a persistent project-local install:

```bash
cd /path/to/pi/project
PI_OFFLINE=1 pi --approve
```

For a one-run smoke load that does not change `.pi/settings.json`:

```bash
cd /path/to/pi/project
PI_OFFLINE=1 pi -e /root/openpi/omo-pi-extension --approve --help
```

`PI_OFFLINE=1` disables startup network operations. The `--help` smoke command
exercises Pi CLI argument parsing and local package path resolution without
starting a model request or requiring API keys.

## 4. Verify the extension loaded

Syntax-only/package-load smoke command:

```bash
cd /root/openpi/omo-pi-extension
npm run verify:pi-load
```

The command prints the exact Pi invocation to run:

```bash
cd /path/to/pi/project
PI_OFFLINE=1 pi -e /root/openpi/omo-pi-extension --approve --help
```

When Pi is run interactively from a trusted project after `local:install:pi`, the
extension is loaded from the package manifest. For future commands/tools added
by this package, confirm they are visible in Pi's slash-command/tool listings or
by invoking the documented command/tool name in an interactive Pi session.

## 5. Roll back the local installation

Roll back the project-local install from the default target:

```bash
cd /root/openpi/omo-pi-extension
npm run local:rollback
```

Roll back from another target project:

```bash
cd /root/openpi/omo-pi-extension
OMO_PI_TARGET_PROJECT=/path/to/pi/project npm run local:rollback
```

The rollback script runs the equivalent of:

```bash
cd /path/to/pi/project
pi remove -l --approve /root/openpi/omo-pi-extension
```

This removes the package entry from `/path/to/pi/project/.pi/settings.json` and
does not modify global Pi settings. The script also removes Pi's normalized
project-relative package entry when Pi stores the local source relative to the
target project. If rollback leaves the project-local package list empty, the
script removes the empty `.pi/settings.json` file so projects that had no Pi
settings before installation return to that pre-install state.
