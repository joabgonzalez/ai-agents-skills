# Copilot Instructions

## Framework Purpose

This project uses an agent and skill system to modularize reasoning and code actions. All global rules and context are in AGENTS.md.

## Reasoning Policy

- Use Internal Monologue (/_ Reasoning _/ or markdown blocks) ONLY if the task requires multi-step reasoning, complex decision-making, or explicit justification.
- For simple, direct actions, omit the reasoning block and proceed directly.

## Structure and Equivalent Conventions

- Always use reasoning blocks before making changes:
  - Copilot: /_ Reasoning _/ or markdown blocks
- Always consult skills for migrations, refactors, or audits.
- Consult agents when the task requires orchestration or workflow.

## Example Prompt

```text
/_ Reasoning _/
Analyze the impact of applying refactor-logic.md on the current module dependencies.
```

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
