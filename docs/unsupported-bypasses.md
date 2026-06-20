# Unsupported Native Bypasses

The OMO Pi extension registers commands, tools, and lifecycle handlers through Pi's extension API. But Pi is a standalone host with its own native capabilities. The extension cannot intercept or override everything.

This document lists the Pi native paths that bypass OMO's wrappers. These are not bugs. They are inherent limits of the Pi extension model. The extension's orchestration policy explicitly categorizes these as `unsupported-native-bypass` and returns a `blocked` result when they are detected as routing targets. But detection only works when a target is routed through the policy engine. Direct Pi native execution never hits the policy engine at all.

## Design principle

**OMO entrypoints are forced. Native bypasses are documented.** The extension registers OMO commands and tools that route through the policy engine. If a user (or an agent) calls Pi directly instead of the OMO wrapper, the extension has no way to intercept or block that call. This is by design: the extension controls its own registrations, not Pi's core.

## Bypass categories

The orchestration policy defines three bypass categories in `UNSUPPORTED_NATIVE_BYPASS_TARGETS`:

| Policy target | Type | What it represents |
|---|---|---|
| `pi.native.command` | command | Direct Pi slash command execution |
| `pi.native.tool` | tool | Direct Pi native tool invocation |
| `pi.native.lifecycle` | lifecycle | Pi native lifecycle behavior |

These are sentinel records. The policy engine returns `{ allowed: false, category: "unsupported-native-bypass" }` when they are evaluated. They document the concept rather than intercepting real Pi calls.

## 1. Direct Pi command execution

### What it is

Pi has its own set of slash commands that are registered by Pi's core, not by this extension. A user can type `/help`, `/config`, `/review`, or any other Pi native command directly. These commands never pass through the OMO extension's command handlers.

### Why it can't be blocked

Pi's extension API lets extensions register new commands. It does not let extensions unregister, override, or intercept Pi's built-in commands. The extension can only add to the command namespace, not control it.

### What users should expect

- Pi native commands (`/help`, `/config`, etc.) work normally alongside OMO commands
- There is no way to force users through OMO command wrappers
- The extension's policy engine only applies to commands that are explicitly routed through it

### Examples

| Pi native command | What happens |
|---|---|
| `/help` | Pi's built-in help, not affected by OMO |
| `/config` | Pi's configuration command, not affected by OMO |
| `/review` | Pi's review command, not affected by OMO |
| Any unregistered command | Handled by Pi's default command resolution |

## 2. Direct Pi native tool invocation

### What it is

Pi exposes tools to the agent through `registerTool`. The OMO extension registers its own tools (`omo-inspect-config`, `omo-read-project-state`, etc.). But Pi also has built-in tools (file read/write, bash execution, web fetching, etc.) that the agent can call directly. The agent may also call OMO-registered tools through Pi's tool dispatch rather than through the OMO policy engine.

### Why it can't be blocked

Pi's `tool_call` lifecycle event fires before every tool execution, and the OMO extension registers a handler for it. In theory, this handler could block any tool call. In practice:

- Blocking Pi's built-in tools would break Pi's core functionality
- The `tool_call` handler currently only applies policy checks to tools it knows about
- Pi's tool dispatch does not require going through the OMO policy engine first

The extension's `tool_call` handler checks the orchestration policy. For tools registered by the OMO extension, it can block execution if the required permission is not granted. For Pi's built-in tools, it currently passes through without blocking.

### What users should expect

- Pi's built-in tools (file system, bash, web fetch) work normally
- OMO-registered tools go through permission checks via the `tool_call` lifecycle event
- An agent can bypass OMO tool wrappers by calling Pi tools directly
- The extension cannot prevent an agent from using Pi's native `bash` tool instead of `omo-run-project-command`

### Examples

| Tool invocation | Bypasses OMO? | Why |
|---|---|---|
| `omo-inspect-config` via Pi dispatch | No | Routes through OMO policy |
| Pi's built-in `read` tool | Yes | Pi native tool, not registered by OMO |
| Pi's built-in `bash` tool | Yes | Pi native tool, not registered by OMO |
| Pi's built-in `grep` tool | Yes | Pi native tool, not registered by OMO |
| Pi's built-in `write` tool | Yes | Pi native tool, not registered by OMO |
| `omo-run-project-command` via Pi dispatch | Partially | Permission check applies, but stub returns blocked |

## 3. Pi native lifecycle behavior

### What it is

Pi has its own lifecycle event system (`session_start`, `session_shutdown`, `before_agent_start`, `tool_call`, `message_end`, `input`). The OMO extension registers handlers for these events. But Pi's core lifecycle behavior (session creation, agent start/stop, message processing) happens regardless of what the extension does.

### Why it can't be blocked

The extension registers event handlers through `pi.on()`. These handlers can observe and modify event data (e.g., modifying the system prompt, blocking a tool call). But they cannot prevent Pi from starting a session, processing messages, or shutting down. The lifecycle events are hooks into Pi's process, not controls over it.

### What users should expect

- Pi's session lifecycle works normally regardless of the OMO extension
- Extension lifecycle handlers can modify behavior within the Pi event model
- The extension cannot add lifecycle events that Pi does not support
- OMO lifecycle hooks without Pi equivalents (compaction hooks, autonomous loops) are simply not available

### Examples

| Lifecycle behavior | Bypasses OMO? | Why |
|---|---|---|
| Session start/end | Yes | Pi manages sessions; extension observes only |
| Agent context assembly | No (partially) | Extension can modify system prompt via `before_agent_start` |
| Tool dispatch routing | Yes | Pi dispatches tools; extension hooks into `tool_call` |
| Message streaming | Yes | Pi streams messages; extension sees finalized messages only |
| Compaction | Yes | Pi has its own compaction; OMO compaction hooks not ported |

## 4. Pi configuration and settings

### What it is

Pi has its own configuration system (`.pi/settings.json`, `~/.pi/agent/settings.json`, CLI flags, environment variables). The OMO extension has its own config (`.pi/omo/`), but Pi's config is separate and unaffected.

### Why it can't be blocked

Pi loads its configuration before any extension runs. The extension cannot intercept or modify Pi's config loading. The extension's config system is additive: it reads from `.pi/omo/` but does not control Pi's own settings.

### What users should expect

- Pi config changes (API keys, model selection, etc.) work normally
- OMO extension config is separate from Pi config
- The extension cannot prevent users from changing Pi settings directly
- `PI_OFFLINE=1`, `--approve`, and other Pi flags are outside OMO control

## 5. Pi extension loading and lifecycle

### What it is

Pi loads extensions from its own configuration. The OMO extension is one of potentially many extensions. Pi loads, enables, and disables extensions independently.

### Why it can't be blocked

The extension cannot prevent Pi from loading other extensions, nor can it prevent itself from being disabled. Pi's extension management is external to any single extension.

### What users should expect

- Multiple Pi extensions can be loaded alongside the OMO extension
- The OMO extension can be disabled without affecting other extensions
- Other extensions' commands, tools, and lifecycle handlers run independently
- The OMO extension cannot intercept or block other extensions' registrations

## Policy engine behavior

The orchestration policy engine explicitly handles bypass targets:

```typescript
// From src/orchestration/policy.ts
export const UNSUPPORTED_NATIVE_BYPASS_TARGETS: readonly RouteTarget[] = Object.freeze([
    { type: "command", name: "pi.native.command" },
    { type: "tool", name: "pi.native.tool" },
    { type: "lifecycle", event: "pi.native.lifecycle" },
]);
```

When the policy engine evaluates one of these targets, it returns:

```typescript
{
    allowed: false,
    category: "unsupported-native-bypass",
    reason: "Pi native path is outside OMO extension ownership",
}
```

This is a documentation signal, not an enforcement mechanism. Real Pi native calls never hit the policy engine because they are not routed through it. The sentinel records exist so that tests and documentation can verify the concept is captured.

## Future considerations

These bypasses could be addressed if Pi's extension API evolves to support:

- Command interception or override hooks
- Tool dispatch middleware that runs before any tool executes
- Extension priority or exclusivity modes
- Configuration lockdown from extensions
- Other extension isolation controls

Until then, the bypasses are accepted limitations. The extension documents them rather than attempting fragile workarounds.

## Related

- See `src/orchestration/policy.ts` for the policy implementation
- See `test/bypass-policy.test.ts` for policy tests
- See `docs/parity.md` for the full capability parity breakdown
