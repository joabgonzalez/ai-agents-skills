---
name: skill-creation
description: Comprehensive guide for creating standards-compliant skills with templates, proper frontmatter, directory structure, naming conventions, and delegation patterns. Provides 6-step creation workflow with template scaffolding, JSON schema validation, compliance checklist, and examples. Ensures unique responsibilities, proper delegation, and token-efficient documentation. Trigger: When creating a new skill, adding agent instructions, or documenting patterns for AI.
allowed-tools:
  - file-operations
  - read-file
  - write-file
  - directory-operations
---

# Skill Creation

## Overview

This skill provides a structured approach to creating new skills that follow project standards. It covers directory setup, template usage, frontmatter requirements with JSON schema validation, content structure, delegation patterns, and multi-model synchronization.

## Objective

Enable agents and users to create skills that are discoverable, reusable, compliant with project conventions, and optimized for token efficiency. Each skill must have a unique responsibility and delegate appropriately to conventions and a11y skills. Use the provided template for faster, more consistent skill creation.

---

## When to Use

Use this skill when:

- Creating a new skill from scratch
- A pattern is used repeatedly and AI needs guidance
- Project-specific conventions differ from generic best practices
- Complex workflows need step-by-step instructions
- Decision trees help AI choose the right approach

Don't create a skill when:

- Documentation already exists (create a reference instead)
- Pattern is trivial or self-explanatory
- It's a one-off task

---

## Step-by-Step Workflow

### Step 1: Directory and File Structure

- Create a new directory under `skills/` named after your skill (lowercase, hyphens, no spaces).
- Copy the template from `skills/skill-creation/assets/SKILL-TEMPLATE.md` to `skills/{skill-name}/SKILL.md`.
- Create optional subdirectories:
  - `assets/` for templates, schemas, or config examples
  - `references/` for links to local documentation (not external URLs)

Example structure:

```
skills/{skill-name}/
├── SKILL.md              # Required - main skill file
├── assets/               # Optional - templates, schemas, examples
│   ├── template.py
│   └── schema.json
└── references/           # Optional - links to local docs
    └── docs.md           # Points to docs/developer-guide/*.mdx
```

### Step 2: Frontmatter with Trigger Inline

The frontmatter is enclosed in triple dashes (`---`) and includes:

**Required fields:**

- **name** (required): Skill identifier (lowercase, hyphens). Keep concise.
- **description** (required): Clear, precise summary including **Trigger:** clause. Format: `"{Brief description}. Trigger: {When AI should invoke this skill}."` Optimize for tokens while maintaining clarity.

**Optional fields (include only when they add specificity):**

- **input** (optional): Only include if it adds specificity beyond description. Format: `"description | data_type"`.
- **output** (optional): Only include if it adds specificity beyond description. Format: `"description | data_type"`.
- **dependencies** (optional): External libraries/packages with version ranges. **Omit if empty**. Format as YAML object.
- **skills** (optional): Internal skill references. **Omit if empty**. Use YAML list with `- item` syntax.
- **allowed-tools** (optional): Tools the agent can use. **Omit if empty**. Use YAML list with `- item` syntax.

**Critical formatting rules:**

- Use `dependencies` for external libraries/packages with version ranges
- Use `skills` for internal skill references
- **Trigger clause REQUIRED** in description (helps AI auto-invoke)
- Arrays: Always use `- item` syntax, never `[]`
- Objects: Use proper YAML indentation, never `{}`
- **Empty arrays/objects: OMIT completely** (saves tokens)
- Be precise and token-efficient: every word must add value

**Validation:** Use `skills/skill-creation/assets/frontmatter-schema.json` to validate your frontmatter.

Example frontmatter:

```yaml
---
name: example-skill
description: Brief, precise description without redundancy. Trigger: When implementing example patterns or demonstrating skill structure.
skills:
  - conventions
  - a11y
dependencies:
  library-name: ">=1.0.0 <2.0.0"
allowed-tools:
  - documentation-reader
---
```

### Step 3: Content Structure with Decision Tree

After the frontmatter, include the following sections:

1. **# Skill Name** (h1): Title matching the skill name.
2. **## Overview**: Brief summary of purpose and scope (2-3 sentences).
3. **## Objective**: Clear statement of purpose, expected behavior, and boundaries. Critical for AI interpretation.
4. **## When to Use**: Bullet points of when to use/not use this skill.
5. **## Critical Patterns**: The MOST important rules marked as REQUIRED/NEVER with ✅/❌ visual markers.
6. **## Decision Tree** (REQUIRED): Question→Action format for AI decision-making.
7. **## Conventions**: Core rules and best practices. If using `conventions` or `a11y` skills, start with "Refer to [skill name] for:" followed by a list, then add skill-specific conventions.
8. **## Example**: Practical examples with code blocks using triple backticks and language specifier.
9. **## Edge Cases**: Special scenarios, limitations, or boundary conditions.
10. **## Commands** (if applicable): Common shell commands with descriptions.
11. **## Resources**: Links to assets/ and references/ directories.
12. **## References**: Links to official documentation (when applicable).

### Step 4: Decision Tree Pattern

Every skill MUST include a Decision Tree section to help AI choose the right approach:

```
## Decision Tree

```

{Condition or question}? → {Action A}
{Condition or question}? → {Action B}
Otherwise → {Default action}

```

```

Example:

```
## Decision Tree

```

Tailwind class exists? → className="..."
Dynamic value? → style={{ width: `${x}%` }}
Conditional styles? → cn("base", condition && "variant")
Static only? → className="..." (no cn() needed)

```

```

### Step 5: Conventions and Delegation

- **Before adding conventions**, verify if `conventions` or `a11y` already covers the topic.
- If yes, reference that skill in the `skills` field and delegate with "Refer to [skill] for:" in the Conventions section.
- Only add skill-specific rules that are unique to your technology or framework.
- This ensures each skill has a unique responsibility and prevents overlap.

### Step 6: Writing Guidelines

- Write all content in English with American spelling.
- Use only ASCII apostrophes (') and hyphens (-); avoid typographic dashes except em dashes (—).
- Ensure consistent punctuation, spacing, and capitalization.
- Avoid non-ASCII characters in skill names, metadata, and content.
- Do not use emojis except ✅/❌ for visual contrast in Critical Patterns.
- Use horizontal rules (`---`) to separate major sections for readability.

**Token Efficiency:**

- Be precise and concise: eliminate filler words and redundancy
- Every sentence must provide unique, actionable information
- Omit empty arrays and objects from frontmatter
- Include `input`/`output` only when they add specificity
- Use clear, direct language that serves both AI and human readers
- Optimize for context size without sacrificing precision

### Step 7: Validation

- Review the Compliance Checklist at the end of this skill.
- Validate frontmatter against `assets/frontmatter-schema.json`.
- Validate structure, content sections, and conventions.
- Ensure all referenced skills exist and are correctly listed.
- Verify that external dependencies include version ranges.
- **After validation, use skill-sync** to synchronize the new skill to all installed model directories.

---

## Critical Patterns

### ✅ REQUIRED: Use Template for Consistency

```bash
# Copy template to new skill directory
cp skills/skill-creation/assets/SKILL-TEMPLATE.md skills/{skill-name}/SKILL.md

# Fill in placeholders: {skill-name}, {description}, {Trigger}, etc.
```

### ✅ REQUIRED: Include Trigger in Description

```yaml
# ✅ CORRECT: Includes Trigger clause
description: TypeScript strict patterns and best practices. Trigger: When implementing or refactoring TypeScript in .ts/.tsx files.

# ❌ WRONG: Missing Trigger
description: TypeScript strict patterns and best practices.
```

### ✅ REQUIRED: Add Decision Tree Section

Every skill must help AI make decisions with clear condition→action mappings.

### ❌ NEVER: Duplicate Conventions

```yaml
# ❌ WRONG: Duplicating conventions skill content
## Conventions
- Use camelCase for variables
- Use PascalCase for classes
- ...

# ✅ CORRECT: Delegate to conventions
## Conventions
Refer to conventions for:
- Naming patterns
- Code organization

### Skill-Specific
- TypeScript strict mode required
- ...
```

---

## Decision Tree

```
Creating generic skill?     → Use conventions delegation, omit project-specific rules
Creating project skill?     → Include project context, reference generic skills
Need templates/schemas?     → Add to assets/ directory
Need local doc links?       → Add to references/ directory
Skill modifies framework?   → Mark for skill-sync after creation
```

---

---

## Responsibility and Dependency Guidance

Before adding new conventions, rules, or best practices to a skill, always verify if an existing skill (such as conventions, a11y, or others) already covers the topic.  
If so, add that skill as a dependency and reference its guidelines, instead of duplicating or redefining them.  
This ensures each skill has a unique responsibility and prevents overlap or redundancy across the codebase.

---

## Naming Conventions

| Type             | Pattern                        | Examples                                             |
| ---------------- | ------------------------------ | ---------------------------------------------------- |
| Generic skill    | `{technology}`                 | `typescript`, `react`, `playwright`                  |
| Framework skill  | `{action}-{target}`            | `skill-creation`, `agent-creation`                   |
| Version-specific | `{technology}-{major-version}` | `react-19`, `tailwind-4` (only for breaking changes) |

---

## assets/ vs references/ Decision

```
Need code templates? → assets/
Need JSON schemas? → assets/
Need example configs? → assets/
Link to existing docs? → references/
Link to local project docs? → references/ (with local path)
```

**Key Rule**: `references/` should point to LOCAL files (`docs/...`), not web URLs. Web URLs go in References section.

---

## Example: Standards-Compliant Skill Definition

````markdown
---
name: example-skill
description: Demonstrates standards-compliant skill structure with token-efficient documentation. Trigger: When demonstrating best practices or creating skill examples.
skills:
  - conventions
  - a11y
allowed-tools:
  - documentation-reader
  - web-search
---

# Example Skill

## Overview

Template for creating skills following project conventions. Demonstrates proper structure, delegation, and token efficiency with all required sections.

## Objective

Provide a reference implementation of skill structure and documentation standards that can be copied and adapted for new skills.

---

## When to Use

Use this skill when:

- Creating a new skill as a reference
- Demonstrating proper skill structure
- Teaching skill creation patterns

---

## Critical Patterns

### ✅ REQUIRED: Delegate to General Skills

```yaml
skills:
  - conventions # For general coding standards
  - a11y # For accessibility concerns
```
````

### ❌ NEVER: Duplicate Content

Don't rewrite rules that exist in conventions or a11y.

---

## Decision Tree

```
Need general coding rules? → Delegate to conventions
Need accessibility rules?  → Delegate to a11y
Need tech-specific rules?  → Document in skill
```

---

## Conventions

Refer to conventions for:

- Code organization
- Naming patterns
- Documentation standards

Refer to a11y for:

- Semantic HTML
- ARIA attributes

### Skill-Specific Rules

- Use descriptive examples
- Keep scope focused
- Delegate to general skills

---

## Example

\`\`\`typescript
// Example code demonstrating skill application
const example: string = "clear and concise";
console.log(example);
\`\`\`

---

## Edge Cases

- Handle missing dependencies gracefully
- Validate input before processing
- Provide fallbacks for optional features

---

## Commands

```bash
# Validate frontmatter against schema
cat SKILL.md | yq eval '.frontmatter' - | yq eval-all '.' frontmatter-schema.json -

# Create new skill from template
cp skills/skill-creation/assets/SKILL-TEMPLATE.md skills/new-skill/SKILL.md
```

---

## Resources

- Templates: See [assets/](assets/) for SKILL-TEMPLATE.md and frontmatter-schema.json
- Documentation: See [references/](references/) for local documentation links (if applicable)

## References

- [conventions skill](../conventions/SKILL.md): General coding conventions
- [a11y skill](../a11y/SKILL.md): Universal accessibility standards

```

---

## Compliance Checklist

Before finalizing a new skill, verify:

### Structure
- [ ] Directory created under `skills/` with correct naming (lowercase, hyphens)
- [ ] `SKILL.md` file created from template
- [ ] Optional `assets/` directory for templates/schemas (if needed)
- [ ] Optional `references/` directory for local docs (if needed)

### Frontmatter
- [ ] Required fields: `name`, `description` (with Trigger clause)
- [ ] Description includes "Trigger: {when to invoke}"
- [ ] Optional fields included only when adding value
- [ ] Empty arrays/objects omitted
- [ ] Arrays use `- item` syntax (never `[]`)
- [ ] External libraries in `dependencies` with version ranges
- [ ] Internal skills in `skills` field
- [ ] All referenced skills exist in `skills/` directory
- [ ] Frontmatter validates against `assets/frontmatter-schema.json`

### Content Sections
- [ ] Overview (2-3 sentences)
- [ ] Objective (clear purpose statement)
- [ ] When to Use (bullet points)
- [ ] Critical Patterns (with ✅/❌ markers)
- [ ] Decision Tree (condition→action format)
- [ ] Conventions (with delegation)
- [ ] Example (with code blocks and language specifiers)
- [ ] Edge Cases
- [ ] Commands (if applicable)
- [ ] Resources (links to assets/ and references/)
- [ ] References (external documentation)

### Quality
- [ ] Delegation to conventions/a11y where appropriate
- [ ] No duplicated content from other skills
- [ ] Content in English with American spelling
- [ ] Only ASCII apostrophes and hyphens used
- [ ] Token-efficient: no redundancy, precise language
- [ ] Examples are minimal and focused
- [ ] Decision tree helps AI choose patterns

### Post-Creation
- [ ] Added to AGENTS.md Available Skills table
- [ ] Added to AGENTS.md Auto-invoke table (if applicable)
- [ ] Ready for skill-sync to propagate to model directories
- [ ] Reviewed by critical-partner skill (recommended)

---

## Resources

- Templates: See [assets/](assets/) for SKILL-TEMPLATE.md and frontmatter-schema.json
- Documentation: See [references/](references/) for local documentation links (create if needed)

## References

- [conventions skill](../conventions/SKILL.md): General coding conventions
- [a11y skill](../a11y/SKILL.md): Universal accessibility standards
- [skill-sync](../skill-sync/SKILL.md): Multi-model synchronization after creation
- [Agent Skills Home](https://agentskills.io/home): Official specification
- [SKILL.md Format](https://agents.md/): Agents.md specification
```
