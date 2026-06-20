# OMO Pi Extension

A [Pi](https://github.com/earendil-works/pi-coding-agent) extension that ports OhMyOpenCode (OMO) capabilities to Pi's extension API. This package lets you run OMO-style commands, tools, and workflows inside Pi without the OpenCode host.

## Why this exists

OhMyOpenCode was built on OpenCode's host APIs: slash commands, lifecycle hooks, tool registries, session control. Pi has a different extension model. Rather than rewriting everything from scratch, this package adapts the OMO patterns that can be ported and documents the gaps that can't.

The package takes a specific approach: **OMO entrypoints are forced through Pi extension registration. Native Pi paths that bypass OMO wrappers are documented as unsupported.** The extension does not attempt full Pi lockdown or complete OMO parity.

## Quick start

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Run tests
npm test

# Type-check without emitting
npm run typecheck
```

## Install into Pi

See [docs/local-install.md](docs/local-install.md) for detailed instructions.

```bash
# Build first, then install into a Pi project
npm run build
npm run local:install:pi

# Or install into a specific project directory
OMO_PI_TARGET_PROJECT=/path/to/pi/project npm run local:install:pi
```

The install script links the package from disk. Rebuilding this package updates what Pi loads on the next run.

## Available commands

The extension registers these slash commands with Pi:

| Command | Description |
|---------|-------------|
| `omo:ultrawork` | Start the ultrawork autonomous loop |
| `omo:ulw` | Shorthand alias for omo:ultrawork |
| `omo:hyperplan` | Adversarial multi-agent planning via team-mode |
| `omo:init-deep` | Initialize hierarchical AGENTS.md knowledge base |
| `omo:handoff` | Create a detailed context summary for session handoff |
| `omo:start-work` | Start a Sisyphus work session from a Prometheus plan |
| `omo:workflow:ultrawork` | Multi-step ultrawork workflow (command + lifecycle + tool) |
| `omo:workflow:plan-execute` | Plan-to-execution workflow (hyperplan + start-work + cleanup) |
| `omo.config` | Inspect the OMO Pi extension default configuration |

Commands route through the orchestration policy engine before execution. If a command is blocked, the policy result explains why.

## Available tools

The extension registers these tools:

| Tool | Permission class | Description |
|------|-----------------|-------------|
| `omo-inspect-config` | read-only | Inspect active extension configuration |
| `omo-read-project-state` | read-only | Read static OMO project state |
| `omo-write-project-config` | project-write | Preview a project-local config update |
| `omo-run-project-command` | process-spawn | Run a project command (stubbed) |
| `omo-fetch-release-metadata` | network | Fetch release metadata (stubbed) |
| `omo-write-global-settings` | global-config | Write global OMO settings (stubbed) |
| `omo-start-background-session` | long-lived-process | Start a background session (stubbed) |

Safe tools (read-only, project-write) are registered with executable stubs. Restricted tools (process-spawn, network, global-config, long-lived-process) require the corresponding permission to be granted and return a stub response until a production implementation is wired in.

## Lifecycle hooks

The extension registers handlers for six Pi lifecycle events:

- `before_agent_start` - Injects OMO lifecycle context into the system prompt
- `tool_call` - Applies policy checks before tool execution
- `message_end` - Observes completed assistant messages
- `input` - Intercepts user input
- `session_start` - Tracks session lifecycle start
- `session_shutdown` - Tracks session lifecycle end

See [docs/lifecycle-matrix.md](docs/lifecycle-matrix.md) for the full OMO-to-Pi event mapping.

## Resources

The extension bundles ported OMO resources as static data:

- **Skills**: SKILL.md files for ast-grep, debugging, frontend, git-master, init-deep, lsp-setup, programming, refactor, remove-ai-slops, review-work, hyperplan, pre-publish-review, security-audit, Docker, Java, Python, Python-dev, Python-code-review, React, UI-UX-pro-max
- **Prompts**: Prompt templates for oracle, prometheus, hephaestus, sisyphus, explore, librarian, metis, momus agents
- **Assets**: OMO logo and branding assets

Resources are loaded through `omo.resources.get` and `omo.resources.list` commands and served from the `resources/` directory.

## TDD approach

This package is developed test-first. Every module has a corresponding test file in `test/`. Run the full suite with:

```bash
npm test
```

Key test categories:

- **Commands** - Verify every OMO command registers with the right name, description, and argument hints
- **Tools** - Verify tool registration, permission checking, and stub behavior
- **Lifecycle** - Verify event handler registration and policy routing
- **Orchestration** - Verify routing targets, bypass detection, and policy evaluation
- **Config** - Verify config loading is side-effect-free and returns defaults
- **Security** - Verify permission classes and high-risk tool blocking
- **Workflows** - Verify workflow step routing and policy enforcement
- **Resources** - Verify manifest loading and resource content serving

## Project structure

```
src/
  commands/       Pi slash command adapters (ultrawork, hyperplan, etc.)
  config/         Extension configuration loader and types
  inventory/      OMO capability inventory (JSON)
  lifecycle/      Pi lifecycle event handlers
  orchestration/  Policy engine for routing and permission checks
  resources/      Resource manifest and content loader
  security/       Permission class definitions
  tools/          Pi tool adapters (safe and restricted)
  workflows/      Multi-step workflow definitions
  index.ts        Extension factory entry point
  register.ts     Registration orchestrator
test/             Test files (mirrors src/ structure)
docs/             Documentation
resources/        Ported OMO skills, prompts, and assets
```

## Detailed documentation

| Document | Description |
|----------|-------------|
| [docs/local-install.md](docs/local-install.md) | Local Pi install workflow |
| [docs/security.md](docs/security.md) | Security model and permission classes |
| [docs/migration-matrix.md](docs/migration-matrix.md) | OMO capability migration status |
| [docs/lifecycle-matrix.md](docs/lifecycle-matrix.md) | OMO lifecycle to Pi event mapping |
| [docs/parity.md](docs/parity.md) | Capability parity documentation |
| [docs/unsupported-bypasses.md](docs/unsupported-bypasses.md) | Native bypass documentation |

## License

Same as the parent OhMyOpenCode project.
