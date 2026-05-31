#!/usr/bin/env sh
# install.sh — one-liner installer for cursor-compact
# Usage: curl -fsSL https://raw.githubusercontent.com/rohangore1999/cursor-compact/main/install.sh | sh

set -e

REPO="https://raw.githubusercontent.com/rohangore1999/cursor-compact/main"
SKILL_DIR="$HOME/.cursor/skills/compact-chat"
SCRIPTS_DIR="$SKILL_DIR/scripts"

echo "→ Installing cursor-compact skill..."

# Create directories
mkdir -p "$SCRIPTS_DIR"

# Download SKILL.md
curl -fsSL "$REPO/SKILL.md" -o "$SKILL_DIR/SKILL.md"
echo "  ✓ SKILL.md → $SKILL_DIR/SKILL.md"

# Download generate-handoff.js
curl -fsSL "$REPO/scripts/generate-handoff.js" -o "$SCRIPTS_DIR/generate-handoff.js"
chmod +x "$SCRIPTS_DIR/generate-handoff.js"
echo "  ✓ generate-handoff.js → $SCRIPTS_DIR/generate-handoff.js"

echo ""
echo "✓ cursor-compact installed successfully!"
echo ""
echo "  In any Cursor chat, type:"
echo "    compact   /compact   summarize this chat   compress session"
echo ""
echo "  The agent will summarize the session, write .cursor/rules/session-handoff.mdc,"
echo "  copy the continuation prompt to your clipboard, and fire a macOS notification."
