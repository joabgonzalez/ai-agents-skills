# Claude Instructions

## Framework Purpose

This project uses agents and skills to modularize reasoning and code actions. All global rules are in AGENTS.md.

## Reasoning Policy

- Use Internal Monologue (<thinking>) ONLY if the task requires multi-step reasoning, complex decision-making, or explicit justification.
- For simple, direct actions, omit the reasoning block and proceed directly.

## Thinking Protocol

- Always use <thinking> blocks before making changes.
- For complex tasks, enter "Plan Mode" and outline the steps.

## Skills and Agents

- Skills are in ./skills/ for migrations, audits, and refactors.
- Always read skills when migration, refactor, or audit is mentioned.
- Read agents when the task requires orchestration or workflow.

## Example Prompt

```xml
<thinking>
Analyze the impact of refactor-logic.md on the current module dependencies.
</thinking>
```

## Example Output

```json
{
  "explanation": "Refactor applied to improve modularity.",
  "code_diff": "--- old.js\n+++ new.js\n..."
}
```

## Synchronization and Versioning

- If AGENTS.md changes, re-sync instructions.md using the scripts.
- This file is auto-generated. Do not edit manually.

## Fallback

If you have questions about the structure, consult AGENTS.md or request additional context.

<!-- Generated from AGENTS.md + templates. Do not edit manually. -->
