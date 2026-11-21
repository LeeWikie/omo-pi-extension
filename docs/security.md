# OMO Pi Extension Security Model

This package defines a first-stage permission and configuration boundary for
the OhMyOpenCode Pi extension. The boundary is intentionally conservative: the
initial package may describe capabilities, but it must not perform privileged
actions until a later implementation explicitly wires those actions through the
permission model.

## Pi extension sandbox

The extension runs inside Pi's extension execution environment and should treat
that environment as the outer sandbox boundary for extension registration and
tool dispatch. The OMO Pi extension adds its own in-package permission classes
so every tool can declare the boundary it crosses before it is enabled.

Pi's official security documentation notes that Pi does not provide an
operating-system sandbox for extension code. Pi extensions run as TypeScript
modules with the permissions of the user account that started Pi. Stronger
isolation must come from a container, VM, micro-VM, or host policy sandbox.

Reference: upstream Pi security documentation in the
`@earendil-works/pi-coding-agent` package (`docs/security.md`).

## Permission classes

The extension uses these permission classes to label tool behavior:

| Permission class | Allows |
| --- | --- |
| `read-only` | Inspecting project files, extension config, and local system state without making changes. |
| `project-write` | Writing only inside the current project directory or project-local OMO config path. |
| `process-spawn` | Launching child processes such as shells, package scripts, test runners, or tmux commands. |
| `network` | Making external network requests, including release checks, downloads, API calls, or telemetry-like traffic. |
| `global-config` | Writing user-home configuration paths such as `~/.pi`, `~/.config`, `.opencode`, or `.agents`. |
| `long-lived-process` | Creating background jobs, daemon-like processes, long-running tmux sessions, watchers, or persistent services. |

Tool registration should map each tool name to exactly one required permission
class. A tool may only run when that permission class is present in the loaded
extension config's `allowedPermissions` list and the extension is enabled.

## Configuration isolation

The first-stage config loader is a no-side-effect stub. Loading configuration
must not create directories, write files, mutate global settings, spawn
processes, or contact the network. The default project-local config root is
`.pi/omo/`, but the stub only returns that string; it does not create the path.

Future config loading must remain project-scoped unless the user explicitly
grants `global-config` and the operation is documented as writing outside the
project.

## Forbidden first-stage behavior

This first-stage package must not:

- write to `~/.pi`, `~/.config`, `.opencode`, `.agents`, or any other global
  configuration path;
- create project config directories as a side effect of loading defaults;
- spawn shells, test runners, package managers, tmux sessions, watchers, or
  background services;
- make network requests, including telemetry, release checks, downloads, or
  auto-update checks;
- install, update, or auto-update any package or extension;
- persist identifiers, usage events, prompts, code, or tool results for
  telemetry.

Any later implementation that needs one of these behaviors must add an explicit
tool entry, assign the correct permission class, test the permission check, and
document the behavior before enabling it.
