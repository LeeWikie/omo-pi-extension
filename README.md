# OMO Pi Extension

A [Pi](https://github.com/earendil-works/pi-coding-agent) extension (`@earendil-works/pi-coding-agent`) that adapts OhMyOpenCode (OMO) slash commands, permission-gated tools, lifecycle hooks, workflows, and static skill/prompt resources to Pi's ExtensionAPI. It is built for Pi users and extension developers who want OMO-style orchestration boundaries and reusable resources inside Pi without running the OpenCode host.

## Scope and design boundary

OhMyOpenCode was designed around OpenCode's host runtime (custom plugin composition, session continuation loops, and host-specific tool registries). Pi exposes a narrower extension API. Rather than attempting fragile workarounds or pretending full parity, this package:

- Routes every OMO-registered command, tool, workflow step, and lifecycle hook through a central orchestration policy engine (`src/orchestration/policy.ts`).
- Enforces an explicit, default-deny permission boundary for tools (`src/security/permission-classes.ts`), granting only `read-only` by default.
- Documents Pi-native paths that bypass extension wrappers as unsupported (`docs/unsupported-bypasses.md`).

## Requirements

- Node.js `>=22.19`
- Peer dependency: `@earendil-works/pi-coding-agent` (`^0.79.0`)
- `pi` CLI on `PATH` (only required when running the local Pi install/verification scripts)

## Quick start

```bash
# Install dependencies
npm install

# Type-check without emitting
npm run typecheck

# Build to dist/
npm run build

# Run the Vitest test suite
npm test

# Run typecheck and tests together
npm run check
```

Note: `npm test` invokes `vitest` directly (watch mode in interactive terminals). Use `npx vitest run` for a single non-watch pass.

## Local install into Pi

The repository includes project-local Pi install scripts that write only to `.pi/settings.json` inside the target project and never modify `~/.pi/agent/settings.json`. See [docs/local-install.md](docs/local-install.md) for the full walkthrough.

```bash
# Build and install into the current directory's .pi/settings.json
npm run build
npm run local:install:pi

# Or install into another Pi project directory
OMO_PI_TARGET_PROJECT=/path/to/pi/project npm run local:install:pi

# Print the offline Pi load smoke-test command
npm run verify:pi-load

# Remove the project-local install
npm run local:rollback
```

## Architecture and engineering highlights

- **Entrypoint and registration orchestrator** (`src/index.ts`, `src/register.ts`): Exports a Pi `ExtensionFactory` that wires commands, tools, resources, workflows, and lifecycle handlers in a single pass. Shortcuts and CLI flags are intentionally deferred.
- **Centralized orchestration policy** (`src/orchestration/policy.ts`, `src/orchestration/index.ts`): Every registered entrypoint evaluates `route(target)` against `OMO_REGISTERED_TARGETS` and tool permission requirements, returning structured categories (`handled-by-omo`, `blocked-high-risk`, `unsupported-native-bypass`, or `requires-future-core-api`).
- **Default-deny permission classes** (`src/security/permission-classes.ts`, `src/config/index.ts`): Defines 6 permission classes (`read-only`, `project-write`, `process-spawn`, `network`, `global-config`, `long-lived-process`) using a frozen `as const` object instead of a TypeScript `enum` to stay compatible with `erasableSyntaxOnly` in `tsconfig.json`. `loadConfig()` is side-effect-free and grants only `read-only` by default.
- **Typed tool schemas** (`src/tools/safe-tools.ts`, `src/tools/restricted-tools.ts`): Tool inputs are defined with `@sinclair/typebox`. Read-only tools execute against in-memory config; `omo-write-project-config` returns a dry-run preview (`applied: false`); restricted tools return policy blocks by default and non-executing stubs when permitted.
- **Lazy, provenance-tracked resource loader** (`src/resources/index.ts`, `resources/manifest.json`): Lists all 26 bundled Markdown resources without eager disk reads and loads file contents on demand via `getResource(name)`, preserving each item's `sourcePath` from `oh-my-openagent`.

## Registered capabilities

### Commands (17 registrations)

Core OMO commands are registered with both colon (`omo:*`) and hyphen (`omo-*`) aliases, along with argument hints and static flag completions where applicable (`src/commands/`):

| Command | Alias(es) | Description |
|---------|-----------|-------------|
| `omo:ultrawork` | `omo-ultrawork`, `omo:ulw`, `omo-ulw` | Start ultrawork autonomous loop |
| `omo:hyperplan` | `omo-hyperplan` | Adversarial multi-agent planning via team-mode |
| `omo:init-deep` | `omo-init-deep` | Initialize hierarchical AGENTS.md knowledge base |
| `omo:handoff` | `omo-handoff` | Create a detailed context summary for continuing work in a new session |
| `omo:start-work` | `omo-start-work` | Start Sisyphus work session from Prometheus plan |
| `omo:workflow:ultrawork` | — | 5-step workflow (`omo:ultrawork` -> `before_agent_start` -> `tool_call` -> `message_end` -> `omo-read-project-state`) |
| `omo:workflow:plan-execute` | — | 3-step workflow (`omo:hyperplan` -> `omo:start-work` -> `session_shutdown`) |
| `omo.config` | — | Inspect the OMO Pi extension default configuration |
| `omo.resources.list` | — | List all available OMO resources from `resources/manifest.json` |
| `omo.resources.get` | — | Print a specific OMO resource and its content by name |

### Tools (7 registrations)

| Tool | Permission class | Default behavior |
|------|-----------------|------------------|
| `omo-inspect-config` | `read-only` | Allowed; returns active extension config |
| `omo-read-project-state` | `read-only` | Allowed; returns static state without touching the filesystem |
| `omo-write-project-config` | `project-write` | Blocked by default; when permitted, returns a dry-run preview (`applied: false`) |
| `omo-run-project-command` | `process-spawn` | Blocked by default; stubbed when permitted (`implemented: false`) |
| `omo-fetch-release-metadata` | `network` | Blocked by default; stubbed when permitted (`implemented: false`) |
| `omo-write-global-settings` | `global-config` | Blocked by default; stubbed when permitted (`implemented: false`) |
| `omo-start-background-session` | `long-lived-process` | Blocked by default; stubbed when permitted (`implemented: false`) |

### Lifecycle hooks (6 Pi events)

Registered in `src/lifecycle/index.ts` and implemented in `src/lifecycle/hooks.ts`:

- `before_agent_start`: Appends `<omo_lifecycle_context>` to `event.systemPrompt` when allowed by policy.
- `tool_call`: Evaluates lifecycle policy before tool execution and returns `{ block: true, reason }` if disallowed.
- `message_end`: Routes finalized message observation through policy.
- `input`: Routes user input interception through policy.
- `session_start`: Tracks session start lifecycle routing.
- `session_shutdown`: Tracks session shutdown lifecycle routing.

See [docs/lifecycle-matrix.md](docs/lifecycle-matrix.md) for the full OMO-to-Pi event mapping and deferred/unsupported hooks.

### Bundled resources (26 manifest entries)

Served from `resources/` via `resources/manifest.json` (`src/resources/index.ts`):

- **21 skills** (`resources/skills/*/SKILL.md`): `ast-grep`, `debugging`, `frontend`, `git-master`, `init-deep`, `lsp-setup`, `programming`, `refactor`, `remove-ai-slops`, `review-work`, `start-work`, `ultraresearch`, `ulw-plan`, `visual-qa`, `lcx-contribute-bug-fix`, `lcx-doctor`, `lcx-report-bug`, `github-triage`, `hyperplan`, `pre-publish-review`, `work-with-pr`.
- **5 prompts** (`resources/prompts/*.md`): `get-unpublished-changes`, `omomomo`, `publish`, `remove-deadcode`, `security-research`.

## Project structure

```text
src/
  commands/       Pi slash command adapters (ultrawork, hyperplan, init-deep, handoff, start-work)
  config/         Side-effect-free config loader and permission check helpers
  inventory/      OMO capability inventory (omo-capabilities.json)
  lifecycle/      Pi lifecycle event handlers (6 events)
  orchestration/  Central routing and policy engine
  resources/      Manifest loader and resource lookup commands
  security/       Permission class definitions and tool-to-permission map
  tools/          Safe and restricted Pi tool adapters
  workflows/      Multi-step workflow definitions and step router
  index.ts        Pi extension factory entrypoint
  register.ts     Top-level registration orchestrator
test/             21 Vitest test suites + mock ExtensionAPI helper
scripts/          Project-local Pi install, smoke-verify, and rollback scripts
docs/             Install, security, migration, lifecycle, parity, and bypass docs
resources/        Ported static OMO skills and prompts with manifest.json
```

## Verification

There are 21 Vitest test files under `test/` backed by a mock Pi `ExtensionAPI` (`test/helpers/mock-extension-api.ts`). They cover:

- Package export shape and duplicate-registration prevention
- Command registration, argument hints, static flag completions, and orchestration routing
- Safe and restricted tool behavior, permission classes, and high-risk blocking
- Lifecycle handler registration and matrix coverage
- Multi-step workflow routing and step-level permission enforcement
- Side-effect-free config loading and resource manifest/file integrity
- Documentation consistency (`test/docs-commands.test.ts`, `test/docs-bypass-policy.test.ts`, `test/local-install-docs.test.ts`)

Run verification locally:

```bash
npm run typecheck
npx vitest run
```

There is currently no CI workflow configured in this repository.

## Current status and known limitations

This package is a first-stage (`v0.1.0`) adapter and policy boundary implementation:

- **Command and workflow adapters are routing shells**: `omo:ultrawork`, `omo:hyperplan`, `omo:init-deep`, `omo:handoff`, `omo:start-work`, `omo.config`, and workflow commands evaluate orchestration policy and notify the UI, returning a `{ status: "routed" }` payload rather than executing full autonomous agent loops.
- **High-risk tools are stubbed**: `process-spawn`, `network`, `global-config`, and `long-lived-process` tools enforce permission checks but return `implemented: false` when permitted; `omo-write-project-config` only previews updates.
- **Static config defaults**: `loadConfig()` returns in-memory defaults (`projectRoot: ".pi/omo/"`, `allowedPermissions: ["read-only"]`) and does not yet read project-local config files from disk.
- **Pi native bypasses**: Pi's built-in commands, tools, and session lifecycle cannot be intercepted by extensions (documented in [docs/unsupported-bypasses.md](docs/unsupported-bypasses.md)).
- **Deferred surfaces**: Shortcuts, CLI flags, and `tool_result` lifecycle transforms are deferred.
- **Packaging note**: `package.json` currently lists only `"dist"` under `"files"`, so `resources/` is available in local/source installs but would need to be included in `"files"` before publishing to npm.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/local-install.md](docs/local-install.md) | Project-local Pi install, verification, and rollback workflow |
| [docs/security.md](docs/security.md) | Security model, permission classes, and first-stage prohibitions |
| [docs/migration-matrix.md](docs/migration-matrix.md) | Initial OMO capability audit and migration categories |
| [docs/lifecycle-matrix.md](docs/lifecycle-matrix.md) | OMO lifecycle to Pi event mapping and unsupported gaps |
| [docs/parity.md](docs/parity.md) | Supported, partially supported, and unsupported capability breakdown |
| [docs/unsupported-bypasses.md](docs/unsupported-bypasses.md) | Native Pi bypass paths outside extension ownership |

## Contact

For questions or feedback: me@neryc.net
