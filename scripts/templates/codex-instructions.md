# Codex Instructions

## Framework Purpose

This project uses agents and skills to modularize code actions. All global rules are in AGENTS.md.

## Reasoning Policy

- Use Internal Monologue (# Reasoning) ONLY if the task requires multi-step reasoning, complex decision-making, or explicit justification.
- For simple, direct actions, omit the reasoning block and proceed directly.

## Output Format

Always return a JSON object with:

```json
{
  "explanation": "Describe the reasoning and impact.",
  "code_diff": "Show the code changes as a diff."
}
```

## Skills and Agents

- Skills are in ./skills/ for migrations, audits, and refactors.
- Always read skills when migration, refactor, or audit is mentioned.
- Read agents when the task requires orchestration or workflow.

## Example Prompt

```markdown
# Reasoning

Apply refactor-logic.md and return the result in JSON format.
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
