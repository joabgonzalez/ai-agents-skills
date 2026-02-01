# GitHub Copilot Instructions

## Tool Discovery & Skill Execution

- **Explicit Invocation:** To invoke specific repository tools or skills, use the `#tool:<tool-name>` prefix.
- **Skill Discovery:** You have access to custom skills located in `.github/skills/`. Before performing complex tasks, scan this directory to identify the appropriate tool for the context.
- **Precedence:** Instructions within a specific `SKILL.md` file take precedence over general instructions when that tool is active.

## Contextual Guidance

- **Workflow Baseline:** Always refer to the `AGENTS.md` file at the root to understand the global architectural patterns and general workflow.
- **Specific Tasks:** If the user requests a task of **[X type]**, you must prefer using the **#tool:[skill-name]** skill.

## Operational Rules

- Check for existing scripts or templates within the folder of the invoked `#tool` before generating new code.
- Ensure all outputs align with the style guides defined in the active skill's documentation.
