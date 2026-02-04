# Copilot Instructions

## Framework Purpose

This project uses an agent and skill system to modularize reasoning and code actions. All global rules and context are in AGENTS.md.

## Structure and Equivalent Conventions

- Always use reasoning blocks before making changes:
  - Claude: <thinking>
  - Gemini: <thinking> or # Reasoning
  - Copilot: /_ Reasoning _/ or markdown blocks
- Always consult skills for migrations, refactors, or audits.
- Consult agents when the task requires orchestration or workflow.

## Example Prompt

<thinking>
Analyze the impact of applying refactor-logic.md on the current module dependencies.
</thinking>

## Example Output

```json
{
  "explanation": "Refactor applied to improve modularity.",
  "code_diff": "--- old.js\n+++ new.js\n..."
}
```

## Coding Standards

Follow the rules in AGENTS.md.

- BAD: function getData(id) { ... }
- GOOD: export const getSpecificData = async (id: string): Promise<Data> => { ... }

## Context

Prioritize files in the active tab and their imports.

## Synchronization and Versioning

- If AGENTS.md changes, re-sync instructions.md using the scripts.
- This file is auto-generated. Do not edit manually.

## Fallback

If you have questions about the structure, consult AGENTS.md or request additional context.

# Generated from AGENTS.md + templates. Do not edit manually.
