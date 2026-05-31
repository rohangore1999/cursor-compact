#!/usr/bin/env node
// generate-handoff.js
// Usage: node generate-handoff.js '<json summary>'
// Writes .cursor/rules/session-handoff.mdc in the current working directory
// and copies the continuation prompt to the clipboard via pbcopy.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── Parse input ──────────────────────────────────────────────────────────────

const raw = process.argv[2];
if (!raw) {
  console.error('Usage: generate-handoff.js \'<json summary>\'');
  process.exit(1);
}

let summary;
try {
  summary = JSON.parse(raw);
} catch (err) {
  console.error('Error: Invalid JSON argument.\n' + err.message);
  process.exit(1);
}

const {
  sessionContext = '',
  keyDecisions = [],
  filesModified = [],
  patternsEstablished = [],
  currentState = '',
  nextSteps = [],
} = summary;

// ── Build rule content ────────────────────────────────────────────────────────

function bulletList(items) {
  if (!items.length) return '_none_';
  return items.map(i => `- ${i}`).join('\n');
}

function decisionList(items) {
  if (!items.length) return '_none_';
  return items.map(i => `- **${i.decision}** — ${i.rationale}`).join('\n');
}

function fileList(items) {
  if (!items.length) return '_none_';
  return items.map(i => `- \`${i.path}\` — ${i.change}`).join('\n');
}

const ruleContent = `---
description: Session handoff — auto-injected context from previous chat
alwaysApply: true
---
# Session Handoff

IMPORTANT: Delete this file (\`.cursor/rules/session-handoff.mdc\`) as your
FIRST action before responding to anything else. Use the Delete tool on path
\`.cursor/rules/session-handoff.mdc\`. No exceptions.

---

## Session context
${sessionContext}

## Key decisions
${decisionList(keyDecisions)}

## Files modified / created
${fileList(filesModified)}

## Patterns established
${bulletList(patternsEstablished)}

## Current state
${currentState}

## Next steps
${bulletList(nextSteps)}

---

Acknowledge this context briefly (1-2 sentences) and ask the user what to work
on next.
`;

// ── Build clipboard prompt ────────────────────────────────────────────────────

const clipboardPrompt = [
  `Continuing from previous session.`,
  ``,
  `Context: ${sessionContext}`,
  ``,
  nextSteps.length
    ? `Next steps planned:\n${nextSteps.map(s => `- ${s}`).join('\n')}`
    : '',
  ``,
  `Current state: ${currentState}`,
].filter(line => line !== undefined).join('\n').trim();

// ── Write rule file ───────────────────────────────────────────────────────────

const rulesDir = path.join(process.cwd(), '.cursor', 'rules');
const outPath = path.join(rulesDir, 'session-handoff.mdc');

try {
  fs.mkdirSync(rulesDir, { recursive: true });
  fs.writeFileSync(outPath, ruleContent, 'utf8');
  console.log('✓ session-handoff.mdc written to .cursor/rules/');
} catch (err) {
  console.error('Error writing rule file: ' + err.message);
  process.exit(1);
}

// ── Copy to clipboard (macOS) ─────────────────────────────────────────────────

try {
  execSync('pbcopy', { input: clipboardPrompt });
  console.log('✓ Continuation prompt copied to clipboard');
} catch {
  console.log('⚠ Could not copy to clipboard (pbcopy not available)');
}

// ── macOS notification ────────────────────────────────────────────────────────

try {
  execSync(
    `osascript -e 'display notification "Prompt copied to clipboard" with title "Cursor /compact"'`
  );
} catch {
  // Non-fatal — notification is a nice-to-have
}
