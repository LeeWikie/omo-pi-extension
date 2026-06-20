# OMO Lifecycle to Pi Event Matrix

This matrix maps OhMyOpenCode/OpenCode lifecycle behavior to the Pi ExtensionAPI event surface. It intentionally does not assume one-to-one parity; host-specific OMO hooks without Pi equivalents are recorded as unsupported gaps.

| OMO hook or behavior | Pi event | Adapter status | Notes |
| --- | --- | --- | --- |
| Context and prompt injection hooks, including rules, skill reminders, team status, mailbox, and monitor context | `before_agent_start` | Supported | Pi exposes the assembled prompt and allows returning a replacement `systemPrompt`, which is the safest insertion point for portable OMO context. |
| Tool wrapping, guard, and argument policy behavior | `tool_call` | Supported | Pi fires before tool execution and supports blocking via `{ block, reason }`; argument mutation is possible but must stay Pi-native. |
| Response decorators and finalized assistant/user message transforms | `message_end` | Supported | Pi can replace finalized messages while preserving role; streaming token decorators are not mapped here. |
| User message preprocessing and keyword-style detectors | `input` | Supported | Pi can continue, transform, or handle input before agent processing. |
| Session lifecycle startup hooks | `session_start` | Supported | Pi exposes session start reasons for startup, reload, new, resume, and fork. |
| Session lifecycle teardown hooks | `session_shutdown` | Supported | Pi exposes shutdown reasons for quit, reload, new, resume, and fork; this is the closest Pi equivalent to OMO session end behavior. |
| Tool result transforms and output truncation | `tool_result` | Deferred | Pi supports this event, but this first adapter unit only registers pre-tool policy to avoid porting host-specific output assumptions. |
| OpenCode config and plugin composition hooks | Unsupported | Unsupported | Pi extension registration replaces OpenCode plugin composition; no direct runtime hook parity exists. |
| OpenCode tool definition and native tool registry hooks | Unsupported | Unsupported | Pi tools are registered through `registerTool`; native OpenCode registry mutation is not exposed. |
| Claude Code hook command execution bridge | Unsupported | Unsupported | Requires host-specific hook command execution and environment semantics unavailable through Pi lifecycle events. |
| Compaction-specific OMO hooks | Unsupported | Unsupported | Pi has compaction events, but OMO compaction behavior depends on OpenCode session internals and should be handled in a dedicated adapter. |
| Autonomous continuation loops and background task lifecycle | Unsupported | Unsupported | OMO Ralph/Sisyphus/background loops require scheduler and session control APIs that are not available as Pi lifecycle equivalents. |
