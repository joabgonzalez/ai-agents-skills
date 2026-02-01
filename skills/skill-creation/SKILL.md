---
name: skill-creation
description: Comprehensive guide for creating standards-compliant skills with proper frontmatter, directory structure, naming conventions, and delegation patterns. Provides 6-step creation workflow, compliance checklist, and examples. Ensures unique responsibilities, proper delegation, and token-efficient documentation. After creation, use skill-sync for multi-model synchronization.
allowed-tools:
  - file-operations
  - read-file
  - write-file
  - directory-operations
---

# Skill Creation

## Overview

This skill provides a structured approach to creating new skills that follow project standards. It covers directory setup, frontmatter requirements, content structure, delegation patterns, and validation.

## Objective

Enable agents and users to create skills that are discoverable, reusable, compliant with project conventions, and optimized for token efficiency. Each skill must have a unique responsibility and delegate appropriately to conventions and a11y skills.

---

## Step-by-Step Workflow

### Step 1: Directory and File Structure

- Create a new directory under `skills/` named after your skill (lowercase, hyphens, no spaces).
- Add a `SKILL.md` file inside the directory.
- Example: `skills/my-skill/SKILL.md`

### Step 2: Frontmatter

The frontmatter is enclosed in triple dashes (`---`) and includes:

- **name** (required): Skill identifier (lowercase, hyphens). Keep concise.
- **description** (required): Clear, precise summary. Avoid redundancy. Optimize for tokens while maintaining clarity.
- **input** (optional): Only include if it adds specificity beyond description. Format: `"description | data_type"`.
- **output** (optional): Only include if it adds specificity beyond description. Format: `"description | data_type"`.
- **dependencies** (optional): External libraries with version ranges. **Omit if empty**. Format as YAML object with proper indentation.
- **skills** (optional): Internal skill references. **Omit if empty**. Use YAML list with `- item` syntax (never `[]`).
- **allowed-tools** (optional): Tools the agent can use. **Omit if empty**. Use YAML list with `- item` syntax.

**Critical formatting rules**:

- Use `dependencies` for external libraries/packages with version ranges
- Use `skills` for internal skill references
- Arrays: Always use `- item` syntax, never `[]`
- Objects: Use proper YAML indentation, never `{}`
- **Empty arrays/objects: OMIT completely** (saves tokens)
- Be precise and token-efficient: every word must add value

Example frontmatter:

```yaml
---
name: example-skill
description: Brief, precise description without redundancy.
skills:
  - conventions
  - a11y
dependencies:
  - library-name: ">=1.0.0 <2.0.0"
allowed-tools:
  - documentation-reader
---
```

### Step 3: Content Structure

After the frontmatter, include the following sections:

1. **# Skill Name** (h1): Title matching the skill name.
2. **## Overview**: Brief summary of purpose and scope.
3. **## Objective**: Clear statement of purpose, expected behavior, and boundaries. Critical for AI interpretation.
4. **## Conventions**: Core rules and best practices. If using `conventions` or `a11y` skills, start with "Refer to [skill name] for:" followed by a list, then add skill-specific conventions.
5. **## Example**: Practical examples with code blocks using triple backticks and language specifier.
6. **## Edge Cases**: Special scenarios, limitations, or boundary conditions.
7. **## References**: Links to official documentation (when applicable).

### Step 4: Conventions and Delegation

- **Before adding conventions**, verify if `conventions` or `a11y` already covers the topic.
- If yes, reference that skill in the `skills` field and delegate with "Refer to [skill] for:" in the Conventions section.
- Only add skill-specific rules that are unique to your technology or framework.
- This ensures each skill has a unique responsibility and prevents overlap.

### Step 5: Writing Guidelines

- Write all content in English with American spelling.
- Use only ASCII apostrophes (') and hyphens (-); avoid typographic dashes except em dashes (—).
- Ensure consistent punctuation, spacing, and capitalization.
- Avoid non-ASCII characters in skill names, metadata, and content.
- Do not use emojis or decorative symbols except in section headings if desired.
- Use horizontal rules (`---`) to separate major sections for readability.
- Avoid repeating rules in both Do and Don't lists; place each guideline once in the most appropriate section.

**Token Efficiency**:

- Be precise and concise: eliminate filler words and redundancy
- Every sentence must provide unique, actionable information
- Omit empty arrays and objects from frontmatter
- Include `input`/`output` only when they add specificity
- Use clear, direct language that serves both AI and human readers
- Optimize for context size without sacrificing precision

### Step 6: Validation

- Review the Compliance Checklist at the end of this skill.
- Validate structure, frontmatter, and conventions.
- Ensure all referenced skills exist and are correctly listed.
- Verify that external dependencies include version ranges.
- **After validation, use skill-sync** to synchronize the new skill to all installed model directories.

---

## Responsibility and Dependency Guidance

Before adding new conventions, rules, or best practices to a skill, always verify if an existing skill (such as conventions, a11y, or others) already covers the topic.  
If so, add that skill as a dependency and reference its guidelines, instead of duplicating or redefining them.  
This ensures each skill has a unique responsibility and prevents overlap or redundancy across the codebase.

---

### ✅ Do:

- Use clear, descriptive names and descriptions.
- Follow the frontmatter and directory conventions.
- Document usage, inputs, outputs, and edge cases.
- Omit horizontal rules between the h1 and the first h2, and at the end of the file.
- Write all content in English.
- Use only ASCII apostrophes (') and hyphens (-).
- Ensure consistent punctuation, spacing, and capitalization.
- Use American English spelling for all content.
- Always verify if allowed-tools are needed and add them when appropriate. Example: documentation-reader, web-search.

### ❌ Don't:

- Use uppercase, spaces, or invalid characters in names.
- Omit required fields or write vague descriptions.
- Overload the main file with excessive details.
- Duplicate conventions already covered in conventions or a11y skills.
- Use empty arrays or objects in frontmatter.
- Include input/output if they don't add specificity.

---

### Example: Standards-Compliant Skill Definition

```markdown
---
name: example-skill
description: Demonstrates standards-compliant skill structure. Token-efficient, precise documentation for demonstrating best practices.
allowed-tools:
  - documentation-reader
  - web-search
---

# Example Skill

## Overview

Template for creating skills following project conventions. Demonstrates proper structure, delegation, and token efficiency.

## Objective

Provide a reference implementation of skill structure and documentation standards.

## Conventions

Refer to conventions for:

- Code organization
- Naming patterns
- Documentation standards

### Skill-Specific Rules

- Use descriptive examples
- Keep scope focused
- Delegate to general skills

## Example

\`\`\`typescript
// Example code demonstrating skill application
const example = "clear and concise";
\`\`\`

## Edge Cases

- Handle missing dependencies gracefully
- Validate input before processing

## References

- [Project conventions](../conventions/SKILL.md)
```

---

## Compliance Checklist

Before finalizing a new skill, verify:

- [ ] Directory created under `skills/` with correct naming (lowercase, hyphens)
- [ ] `SKILL.md` file exists with proper frontmatter
- [ ] Required fields: `name`, `description`
- [ ] Optional fields included only when adding value
- [ ] Empty arrays/objects omitted
- [ ] Arrays use `- item` syntax (never `[]`)
- [ ] External libraries in `dependencies` with version ranges
- [ ] Internal skills in `skills` field
- [ ] All referenced skills exist in `skills/` directory
- [ ] Content sections present: Overview, Objective, Conventions, Example, Edge Cases
- [ ] Delegation to conventions/a11y where appropriate
- [ ] Examples use proper code blocks with language specifiers
- [ ] Content in English with American spelling
- [ ] Only ASCII apostrophes and hyphens used
- [ ] Token-efficient: no redundancy, precise language
- [ ] Ready for skill-sync to propagate to model directories

---

## References

- [conventions skill](../conventions/SKILL.md): General coding conventions
- [a11y skill](../a11y/SKILL.md): Universal accessibility standards
- [skill-sync](../skill-sync/SKILL.md): Multi-model synchronization after creation
