# cursor-compact

> `/compact` for Cursor — summarize your chat, auto-inject context into the next window, copy continuation prompt to clipboard.

---

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/rohangore1999/cursor-compact/main/install.sh | sh
```

That's it. One command, zero dependencies (Node.js built-ins only, no `npm install`).

To update, re-run the same command — it overwrites the existing files with the latest version.

---

## Usage

In any Cursor chat, type one of:

| Trigger | Effect |
|---|---|
| `compact` | Summarize and create handoff |
| `/compact` | Same |
| `summarize this chat` | Same |
| `compress session` | Same |
| `chat summary` | Same |

The agent reads the skill, summarizes the full conversation from memory, runs the script, and reports back:

```
✓ session-handoff.mdc written to .cursor/rules/
✓ Continuation prompt copied to clipboard
```

A native macOS notification pops up instantly. The continuation prompt is on your clipboard — ready to paste anywhere.

---

## How it works

### Step 1 — You type `/compact`

The agent reads `~/.cursor/skills/compact-chat/SKILL.md` and extracts a structured summary from the live conversation context (no file reads needed — the full chat is already in the context window).

### Step 2 — Structured JSON summary is produced

```json
{
  "sessionContext": "Project name, overall goal, tech stack",
  "keyDecisions": [
    { "decision": "What was decided", "rationale": "Why" }
  ],
  "filesModified": [
    { "path": "relative/path", "change": "One-line description" }
  ],
  "patternsEstablished": ["Conventions locked in this session"],
  "currentState": "What works, what is pending or broken",
  "nextSteps": ["Next concrete action"]
}
```

### Step 3 — Script runs

```bash
node ~/.cursor/skills/compact-chat/scripts/generate-handoff.js '<json>'
```

`generate-handoff.js` does three things atomically:

1. **Writes `.cursor/rules/session-handoff.mdc`** in the current workspace with `alwaysApply: true` — this gets auto-injected into the next chat window by Cursor's rules system, with no action required from you.
2. **Copies the continuation prompt** to your clipboard via `pbcopy`.
3. **Fires a macOS notification** via `osascript` — no extra packages.

### Step 4 — Open a new chat

The new-chat agent auto-reads `session-handoff.mdc` via Cursor rules and says:

> "I see a session handoff. Previous session covered [X]. What would you like to work on next?"

It then **deletes the file immediately** (its first action, before responding to anything else) — so the handoff is a one-shot injection. No stale context, no manual cleanup.

### Lifecycle

```
/compact triggered   → session-handoff.mdc created in .cursor/rules/
New chat opens       → rule auto-injected → agent deletes file first
                     → agent acknowledges context, asks what to work on next
Subsequent chats     → file is gone, no handoff (you didn't /compact)
/compact again       → fresh file created
```

---

## Architecture

```
~/.cursor/skills/compact-chat/
├── SKILL.md                   ← Cursor reads this when /compact is triggered
└── scripts/
    └── generate-handoff.js    ← Writes rule, copies clipboard, fires notification

<workspace>/
└── .cursor/rules/
    └── session-handoff.mdc    ← Written per /compact, deleted after pickup
```

The skill lives in `~/.cursor/skills/` (personal, available across all projects). The rule file is written per-project at runtime — each workspace gets its own handoff.

---

## Comparison with existing tools

| Feature | douglac/compact-chat | chat-compactor | cursor-mem | **cursor-compact** |
|---|:---:|:---:|:---:|:---:|
| Triggered on demand | ✅ | ✅ | ❌ always-on | ✅ |
| Auto-injects into new chat | ❌ manual paste | ❌ manual ref | ✅ | ✅ |
| Self-deletes after pickup | ❌ | ❌ | ❌ | ✅ |
| Clipboard copy | ❌ | ❌ | ❌ | ✅ |
| macOS notification | ❌ | ❌ | ❌ | ✅ |
| Zero dependencies | ✅ | ✅ | ❌ pip install | ✅ |
| Works across all projects | ✅ | ✅ | ✅ | ✅ |
| No manual cleanup needed | ❌ | ❌ | ❌ | ✅ |

### Tools compared

- **[douglac/compact-chat](https://github.com/douglac/compact-chat)** — Type "compact" → structured handoff doc + git status. User must manually paste into new chat.
- **[chat-compactor by zhanlincui](https://agentskills.so/skills/zhanlincui-ultimate-agent-skills-collection-chat-compactor)** — Saves a `session-[topic]-[date].md` file to project root. User manually references it in the next chat.
- **[cursor-mem](https://github.com/liuhao6741/cursor-mem)** — SQLite-backed persistent memory (`pip install cursor-mem`). Always-on background tracking. Auto-injects but never self-deletes. Overkill for session handoff.

---

## File reference

### `SKILL.md`
The Cursor agent skill definition. Placed at `~/.cursor/skills/compact-chat/SKILL.md`. Cursor picks it up automatically — no registration needed.

### `scripts/generate-handoff.js`
Node.js script (no npm dependencies). Accepts a JSON summary as a CLI argument, writes the handoff rule, copies to clipboard, and fires the macOS notification.

### `.cursor/rules/session-handoff.mdc` _(generated at runtime)_
Written by the script into each workspace. Has `alwaysApply: true` so Cursor auto-injects it into the next chat. The rule instructs the new-chat agent to delete it as its first action.

---

## Requirements

- macOS (clipboard via `pbcopy`, notification via `osascript`)
- Node.js (any version — uses only built-in modules)
- Cursor with personal skills support (`~/.cursor/skills/`)

---

## Uninstall

```bash
rm -rf ~/.cursor/skills/compact-chat
```
