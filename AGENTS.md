# AGENTS.md

## Behavior rules

- Before creating or modifying ANY file, state the file path,
  describe the change in one sentence, and ask "Should I proceed?"
- Wait for explicit approval before writing any code
- Make one change at a time — never batch multiple files
- Never rewrite a file from scratch unless explicitly asked
- Never add features that were not requested
- If anything is unclear, ask before assuming

## Code rules
- Read a file before editing it
- Preserve all existing logic when making targeted changes
- Use existing CSS variables and utility classes
- No hardcoded colors — always use var(--color-*)
- No use of TypeScript 'any' type
- Add "use client" to any component that uses state or hooks

## Never do this
- Do not add routing or navigation unless asked
- Do not install libraries unless explicitly requested
- Do not run destructive commands without confirmation
- Do not change UI when only logic changes are needed