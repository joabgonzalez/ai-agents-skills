# Gemini Instructions

## Framework Purpose

This project uses agents and skills to modularize code analysis and actions. All global rules are in AGENTS.md.

## Reasoning Policy

- Use Internal Monologue (<thinking> or # Reasoning) ONLY if the task requires multi-step reasoning, complex decision-making, or explicit justification.
- For simple, direct actions, omit the reasoning block and proceed directly.

## Context Strategy

- Use <thinking> blocks or # Reasoning before making changes.
- Leverage long context: review `/src` and related modules for consistency.

## Skills and Agents

- Skills are in ./skills/ for audits, migrations, and refactors.
- Always read skills when migration, refactor, or audit is mentioned.
- Read agents when the task requires orchestration or workflow.

## Example Prompt

```xml
<thinking>
Analyze the consistency of all modules in /src using repo-audit.md.
</thinking>
```

or

```markdown
# Reasoning

Analyze the consistency of all modules in /src using repo-audit.md.
```

## Example Output

```json
{
  "explanation": "Inconsistencies found in imports of 3 modules.",
  "code_diff": "--- moduleA.js\n+++ moduleA.js\n..."
}
```

## Synchronization and Versioning

- If AGENTS.md changes, re-sync instructions.md using the scripts.
- This file is auto-generated. Do not edit manually.

## Fallback

If you have questions about the structure, consult AGENTS.md or request additional context.

<!-- Generated from AGENTS.md + templates. Do not edit manually. -->
