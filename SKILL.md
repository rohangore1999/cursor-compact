---
name: compact-chat
description: >-
  Summarizes the current chat session into a structured handoff, writes
  .cursor/rules/session-handoff.mdc (auto-injected into the next chat window),
  and copies the continuation prompt to the clipboard. Use when the user types
  "compact", "/compact", "summarize this chat", "compress session", or
  "chat summary".
---

# Compact Chat (`/compact`)

Triggered by: "compact", "/compact", "summarize this chat", "compress session", "chat summary"

## What to do

1. Summarize the **current conversation from memory** — no file reads needed.
2. Produce a JSON object matching the schema below.
3. Pass the JSON as a single CLI argument to the script:

```bash
node ~/.cursor/skills/compact-chat/scripts/generate-handoff.js '<json>'
```

4. Echo the script's stdout to the user.

## JSON schema

```json
{
  "sessionContext": "Project name, overall goal, tech stack in one sentence.",
  "keyDecisions": [
    { "decision": "What was decided", "rationale": "Why" }
  ],
  "filesModified": [
    { "path": "relative/path", "change": "One-line description" }
  ],
  "patternsEstablished": [
    "Convention or coding style locked in during this session"
  ],
  "currentState": "What works right now, what is pending or broken.",
  "nextSteps": [
    "Concrete next action item"
  ]
}
```

## Rules

- Include only what was actually discussed — no invented content.
- `keyDecisions` and `nextSteps` must be arrays, even if empty (`[]`).
- Escape inner quotes in the JSON so the shell argument is valid.
- The script writes `.cursor/rules/session-handoff.mdc` in the **current working directory** (the open workspace). Run the command from the workspace root.

## Example invocation

```bash
node ~/.cursor/skills/compact-chat/scripts/generate-handoff.js '{"sessionContext":"Building compact-chat Cursor skill","keyDecisions":[{"decision":"Use alwaysApply rule for auto-injection","rationale":"No user action required in new chat"}],"filesModified":[{"path":".cursor/skills/compact-chat/SKILL.md","change":"Created skill file"}],"patternsEstablished":["Personal skills go in ~/.cursor/skills/"],"currentState":"SKILL.md written, script pending","nextSteps":["Write generate-handoff.js","Test end-to-end flow"]}'
```

## Handoff lifecycle

```
/compact triggered  → session-handoff.mdc created in .cursor/rules/
New chat opens      → rule auto-injected → agent deletes file immediately
                    → agent acknowledges context, asks what to work on next
Subsequent chats    → file is gone, no stale injection
/compact again      → file created fresh
```

The rule instructs the new-chat agent to **delete the file as its very first action** before responding to anything else.
