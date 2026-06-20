# OMO Capability Parity

This document lists every OhMyOpenCode capability and its status in the Pi extension. Capabilities fall into three categories:

- **Supported** - Ported and working in the Pi extension
- **Partially supported** - Available but with documented limitations
- **Unsupported** - Not ported due to Pi extension API limits

The source of truth for the full inventory is `src/inventory/omo-capabilities.json`. The migration matrix in `docs/migration-matrix.md` shows the initial category assignment for every inspected capability.

## Supported capabilities

These capabilities are fully ported to the Pi extension. They work the same way as in OpenCode, adapted to Pi's extension API.

### Commands

| OMO command | Pi command | Rationale |
|---|---|---|
| `omo:ultrawork` | `omo:ultrawork` | Slash-command prompt data is portable. The autonomous loop adapter routes through Pi's command system. |
| `omo:ulw` | `omo:ulw` | Shorthand alias for ultrawork. |
| `omo:hyperplan` | `omo:hyperplan` | The planning prompt is data. Multi-agent orchestration uses Pi's task primitives. |
| `omo:init-deep` | `omo:init-deep` | File APIs, project discovery, and confirmation behavior adapted to Pi. |
| `omo:handoff` | `omo:handoff` | Summary template portable; session context collected through Pi's extension API. |
| `omo:start-work` | `omo:start-work` | Plan context and work execution adapted to Pi-native planner/session model. |
| `omo:remove-ai-slops` | Not yet registered | Cleanup workflow is conceptually portable; subagent and review loops need Pi-native orchestration. |
| `omo:refactor` | Not yet registered | Refactor workflow is portable but LSP, AST-grep, codemap integrations must bind to Pi APIs. |
| `omo:workflow:ultrawork` | `omo:workflow:ultrawork` | Multi-step workflow combining ultrawork command, lifecycle hooks, and tools. |
| `omo:workflow:plan-execute` | `omo:workflow:plan-execute` | Plan-to-execution workflow combining hyperplan, start-work, and cleanup. |

### Tools

| OMO tool | Pi tool | Permission class |
|---|---|---|
| Config inspection | `omo-inspect-config` | read-only |
| Project state reading | `omo-read-project-state` | read-only |
| Project config writing | `omo-write-project-config` | project-write |
| Project command execution | `omo-run-project-command` | process-spawn (stubbed) |
| Release metadata fetching | `omo-fetch-release-metadata` | network (stubbed) |
| Global settings writing | `omo-write-global-settings` | global-config (stubbed) |
| Background session control | `omo-start-background-session` | long-lived-process (stubbed) |

Restricted tools (process-spawn, network, global-config, long-lived-process) are registered with stubs that return a blocked response unless the required permission is granted. Production implementations for these tools are not yet wired in.

### Lifecycle hooks

| OMO hook/behavior | Pi event | Status |
|---|---|---|
| Context/prompt injection | `before_agent_start` | Supported. Injects OMO lifecycle context into the system prompt. |
| Tool wrapping and guard | `tool_call` | Supported. Applies policy checks before tool execution. Can block with reason. |
| Response decorators | `message_end` | Supported. Observes completed assistant messages. |
| User message preprocessing | `input` | Supported. Can continue, transform, or handle input. |
| Session startup | `session_start` | Supported. Tracks session start reasons. |
| Session teardown | `session_shutdown` | Supported. Tracks shutdown reasons. |

### Resources (data ports)

These OMO resources are ported as static data in the `resources/` directory:

- **Skills**: ast-grep, debugging, frontend, git-master, init-deep, lsp-setup, programming, refactor, remove-ai-slops, review-work, hyperplan, pre-publish-review, security-audit, Docker, Java, Python, Python-dev, Python-code-review, React, UI-UX-pro-max
- **Prompts**: oracle, prometheus, hephaestus, sisyphus, explore, librarian, metis, momus agent prompt templates
- **Assets**: OMO logo and branding assets
- **Command configs**: OpenCode and Claude command prompt files (static Markdown, not executable without a Pi command adapter)

All resources are accessible through `omo.resources.get` and `omo.resources.list` commands.

### Permission classes

| Permission class | OMO equivalent | Pi extension status |
|---|---|---|
| read-only | Config/project inspection | Supported and enforced |
| project-write | Project-local config writes | Supported and enforced |
| process-spawn | Shell/process spawning | Defined, enforced, stubbed |
| network | External network requests | Defined, enforced, stubbed |
| global-config | User-home config writes | Defined, enforced, stubbed |
| long-lived-process | Background jobs/daemons | Defined, enforced, stubbed |

## Partially supported capabilities

These capabilities are available but have limitations compared to the OMO original.

| Capability | Limitation | Rationale |
|---|---|---|
| Tool result transforms (`tool_result`) | Deferred | Pi supports this event, but the first adapter unit only registers pre-tool policy to avoid porting host-specific output assumptions. |
| AST-grep skill | Core guidance ported as data; helper scripts and tool invocation not wired | Requires Pi-safe tool wiring before full migration. |
| Refactor skill | Workflow guidance ported; LSP, AST-grep, codemap, planning, verification tool contracts not wired | Depends on tool integrations that need Pi-native adapters. |
| Remove AI slops skill | Single-file instructions ported; multi-file orchestration and review not wired | Multi-file orchestration and review calls require Pi adapters. |
| Review work skill | Guidance ported; multi-agent post-implementation review not wired | Must be reimplemented using Pi's agent and task model. |
| Hyperplan skill | Adversarial planning instructions ported; team-mode orchestration not wired | Team-mode orchestration is host-specific to OpenCode. |
| Pre-publish review skill | Guidance ported; CI/PR integration not wired | Depends on CI system integration. |
| Security audit skill | Guidance ported; auto-fix mode not wired | Auto-fix requires process-spawn and network permissions. |
| Oracle/Prometheus/Hephaestus/Sisyphus/etc agents | Prompt templates ported as data; agent orchestration not wired | Agent orchestration requires Pi-native agent and task model. |
| Built-in MCP registry | Not registered as tools | MCP tools need Pi-specific registration. |
| LSP MCP | Not registered as tool | LSP integration needs Pi-safe wiring. |
| Codegraph MCP | Not registered as tool | Codegraph integration needs Pi-safe wiring. |
| Slash command manifest | Mapping ported conceptually; not all commands are registered | Some commands (stop-continuation, cancel-ralph, ralph-loop) are unsupported. |

## Unsupported capabilities

These capabilities are not ported because Pi's extension API does not expose the required primitives.

### Commands (unsupported-extension-api)

| OMO command | Reason not ported |
|---|---|
| `stop-continuation` | Stops OpenCode continuation mechanisms and background loops that are not exposed as stable Pi extension primitives. |
| `cancel-ralph` | Cancels an internal autonomous continuation loop with host-specific control state outside ordinary command registration. |
| `ralph-loop` | Implements self-referential autonomous continuation that depends on OpenCode's internal run loop and task scheduling. |

### Lifecycle hooks (unsupported)

| OMO hook/behavior | Reason not ported |
|---|---|
| OpenCode config and plugin composition hooks | Pi extension registration replaces OpenCode plugin composition. No direct runtime hook parity. |
| OpenCode tool definition and native tool registry hooks | Pi tools are registered through `registerTool`. Native OpenCode registry mutation is not exposed. |
| Claude Code hook command execution bridge | Requires host-specific hook command execution and environment semantics unavailable through Pi lifecycle events. |
| Compaction-specific OMO hooks | Pi has compaction events, but OMO compaction behavior depends on OpenCode session internals. |
| Autonomous continuation loops and background task lifecycle | OMO Ralph/Sisyphus/background loops require scheduler and session control APIs not available as Pi lifecycle equivalents. |

### Skills (unsupported)

| OMO skill | Reason not ported |
|---|---|
| Customize opencode skill | Modifies OpenCode configuration and plugin system, which Pi does not expose. |
| Playwright skill | Browser automation requires Playwright MCP and process-spawn permission; deferred to security review. |
| Context fetching skill | Network-dependent; deferred to security review. |
| Security research skill | Network-dependent; deferred to security review. |
| Publish skill | Requires network and process-spawn; deferred to security review. |
| Terminal control skill | Requires process-spawn and tmux; deferred to security review. |

### Other unsupported subsystems

| Subsystem | Reason not ported |
|---|---|
| Codex MCP configuration | Codex is an OpenCode-specific component. |
| Lifecycle hook factory registry | Pi uses direct `on()` registration, not a factory pattern. |
| Lifecycle event router | Pi dispatches events directly; no router needed. |
| Codex lifecycle hook JSON | Codex-specific format; not applicable to Pi. |
| OpenCode adapter package | OpenCode-specific; Pi has its own adapter model. |
| Codex adapter package | Codex-specific. |
| Telemetry (PostHog, Codex) | Not applicable to Pi extension. |
| Platform binary packages | Pi uses its own binary resolution. |
| LazyCodex installer | Codex-specific installation. |
| Runtime executable resolver | Pi has its own resolver. |

## Summary

| Category | Count |
|---|---|
| Supported (commands) | 10 |
| Supported (tools) | 7 |
| Supported (lifecycle hooks) | 6 |
| Supported (resources) | 35+ |
| Supported (permission classes) | 6 |
| Partially supported | 14 |
| Unsupported (commands) | 3 |
| Unsupported (lifecycle) | 5 |
| Unsupported (skills) | 6 |
| Unsupported (other) | 7 |

See the migration matrix at `docs/migration-matrix.md` for the complete per-capability breakdown. See `src/inventory/omo-capabilities.json` for the raw inventory data.
