---
name: {skill-name}
description: {Brief description}. Trigger: {When AI should invoke - be specific about actions/tasks/contexts}.
skills:
  - conventions
  - a11y
dependencies:
  {package-name}: "{version-range}"
allowed-tools:
  - documentation-reader
  - web-search
---

# {Skill Name}

## Overview

{Brief summary of purpose and scope in 2-3 sentences. What problem does this skill solve?}

## Objective

{Clear statement of purpose, expected behavior, and boundaries. What should the AI accomplish?}

---

## When to Use

Use this skill when:

- {Specific condition 1}
- {Specific condition 2}
- {Specific condition 3}

Don't use when:

- {Exclusion 1}
- {Exclusion 2}

---

## Quick Reference

{For COMPLEX skills (40+ patterns) with references/, add this table:}

| Task            | Solution       | Reference                     |
| --------------- | -------------- | ----------------------------- |
| {Common task 1} | {Quick answer} | [file.md](references/file.md) |
| {Common task 2} | {Quick answer} | [file.md](references/file.md) |
| {Common task 3} | {Quick answer} | [file.md](references/file.md) |

{For SIMPLE/MEDIUM skills, omit this table}

---

## Critical Patterns

{The CORE patterns - most important rules AI must follow}
{Include inline example after EACH pattern}
{Keep focused: <15 lines per example}
{Optional: Add [CRITICAL] or [HIGH] for complex skills with 30+ patterns}

### ✅ REQUIRED: {Pattern Name}

{Brief explanation why this is important (1-2 sentences)}

```{language}
// ✅ CORRECT: What good looks like
{code showing correct approach}

// ❌ WRONG: Common mistake
{code showing incorrect approach}
```

{For skills with references/, link to detailed guide:}

See [file.md](references/file.md) for {expanded topic description}.

### ✅ REQUIRED [CRITICAL]: {Must-Follow Pattern}

{Only use [CRITICAL] label for patterns that break functionality if ignored}
{Use [HIGH] for important but not critical patterns}

```{language}
// ✅ CORRECT
{focused example under 15 lines}

// ❌ WRONG
{anti-pattern}
```

### ❌ NEVER: {Anti-pattern Name}

{Why this must be avoided}

```{language}
// ❌ WRONG: What not to do
{anti-pattern example}
```

{Continue with 5-15 critical patterns total for SKILL.md}
{For complex skills, keep top 10-15 here, link to references/ for the rest}

---

## Decision Tree

{Use clear Condition → Action format}
{Add MUST/CHECK/OPTIONAL language for skills with references/}

### Simple Decision Tree (for skills with <15 patterns):

```
{Condition}? → {Action A}
{Condition}? → {Action B}
Otherwise    → {Default action}
```

### Complex Decision Tree (for skills with 40+ patterns):

```
{Major decision point}?
  → {Sub-condition 1}? → {Action 1A}
  → {Sub-condition 2}? → {Action 1B}
  → Otherwise → {Action 1C}

{Another decision point}?
  → {Specific case}? → MUST read [file.md](references/file.md)
  → {Edge case}? → CHECK [file.md](references/file.md) if needed
  → Standard case → Use patterns above

{Performance issue}?
  → {Type A}? → See [performance.md](references/performance.md)
  → {Type B}? → {Quick fix here}
```

---

## Conventions

Refer to [conventions](../conventions/SKILL.md) for general coding standards.
Refer to [a11y](../a11y/SKILL.md) for accessibility requirements.

### {Skill}-Specific Conventions

- {Unique rule specific to this technology/framework}
- {Best practice unique to this domain}
- {Naming convention or pattern specific to skill}

---

## Example

{Comprehensive example demonstrating multiple patterns together}
{Keep practical and minimal - focus on core usage}

```{language}
// Example demonstrating {pattern 1}, {pattern 2}, {pattern 3}
{code example under 30 lines}
```

### Example: {Specific Use Case}

```{language}
// Scenario: {describe specific use case}
{focused code example}
```

---

## Edge Cases

{Important scenarios, limitations, workarounds}

- **{Edge case 1}**: {Description and how to handle}
- **{Edge case 2}**: {Description and solution}
- **{Performance consideration}**: {When it matters and what to do}
- **{Browser/environment-specific}**: {Platform differences}

{For complex skills with references/, link to detailed edge case guides}

See [file.md](references/file.md#edge-cases) for complete edge case coverage.

---

## Commands

{Common CLI commands or operations}

```bash
# {Description of what this does}
{command-1}

# {Description}
{command-2}

# {Description}
{command-3}
```

---

## Validation

{How to validate this skill before finalizing}

### Pre-Creation Validation

- [ ] Read conventions and a11y - checked for delegation opportunities
- [ ] Identified unique responsibility (no overlap with existing skills)
- [ ] Confirmed skill complexity level (Simple/Medium/Complex)
- [ ] Determined if references/ needed (40+ patterns or 4+ sub-topics)

### Structure Validation

- [ ] Frontmatter complete and valid (name, description, skills/dependencies)
- [ ] Description under 150 characters with Trigger clause
- [ ] When to Use section with 3-5 clear conditions
- [ ] Critical Patterns (10-20) with inline examples after each
- [ ] Decision Tree uses condition→action format
- [ ] Conventions section delegates to conventions/a11y where appropriate
- [ ] Example section with practical, working code

### Content Validation

- [ ] Every pattern has inline example (<15 lines)
- [ ] No redundancy with conventions or a11y skills
- [ ] Token-efficient (no filler words, precise language)
- [ ] Edge cases documented with solutions
- [ ] Commands section (if applicable) with descriptions

### Quality Validation

- [ ] Run through critical-partner for review
- [ ] Self-validation with Compliance Checklist (if complex skill)
- [ ] Test Decision Tree with 2-3 scenarios

### Post-Creation

- [ ] Add to AGENTS.md Available Skills table
- [ ] Add to AGENTS.md Mandatory Skills table with trigger
- [ ] Run `make sync` to propagate to model directories
- [ ] Document creation with process-documentation skill

**For complete validation:** See [validation.md](references/validation.md) if this is a complex skill.

---

## Resources

{Choose format based on skill complexity}

### For COMPLEX Skills (40+ patterns, references/ directory):

**Detailed Guides:**

- [Sub-topic 1](references/{file-1}.md) - {Brief description of content}
- [Sub-topic 2](references/{file-2}.md) - {Brief description of content}
- [Advanced Patterns](references/{file-3}.md) - {Brief description of content}

**Mark as Required/Optional reading:**

- Required when: {Condition for MUST read}
- Optional for: {When CHECK or exploration}

### For MEDIUM Skills (15-40 patterns, assets/ directory):

**Templates and Schemas:**

- [Template](assets/{template-name}) - {Description}
- [Schema](assets/{schema}.json) - {Validation schema}

### For SIMPLE Skills (<15 patterns):

{No additional resources needed - all content in SKILL.md}

---

## Self-Check Protocol

{For AI agents creating skills: validation checklist}
{Ensures compliance before finalizing}

**Before completing this skill, verify:**

### Planning

- [ ] Purpose is clear and unique (no overlap with existing skills)
- [ ] Complexity level determined (simple/medium/complex)
- [ ] Structure planned (SKILL.md only, +assets/, or +references/)

### Structure

- [ ] Directory created: `skills/{skill-name}/`
- [ ] SKILL.md created with proper frontmatter
- [ ] If medium: `assets/` directory with templates/schemas
- [ ] If complex: `references/` directory with sub-topic files

### Content

- [ ] Critical Patterns section has 5-15 patterns with inline examples
- [ ] Each example is focused (<15 lines) and demonstrates correct/incorrect
- [ ] Decision Tree provides clear guidance
- [ ] Conventions delegated properly (refer to conventions, a11y)
- [ ] Examples are practical and demonstrate multiple patterns

### Frontmatter

- [ ] `name` is lowercase-with-hyphens
- [ ] `description` includes Trigger clause
- [ ] `skills` lists internal skills (conventions, a11y, etc.)
- [ ] `dependencies` lists external packages (if applicable)
- [ ] Token-efficient: no redundant fields, omit empty arrays

### Post-Creation

- [ ] Skill added to AGENTS.md Available Skills table
- [ ] Skill added to AGENTS.md Mandatory Skills table (with trigger)
- [ ] Run `make sync` to propagate to model directories

**Confidence Check:**

1. Can I create a skill following these patterns without re-reading? (YES/NO)
2. Do I understand when to use references/ vs assets/ vs SKILL.md only? (YES/NO)
3. Can I write token-efficient descriptions with Trigger clauses? (YES/NO)

**If any answer is NO**: Re-read relevant sections before proceeding.

---

## Compliance Checklist

{For validation - comprehensive quality check}

### Structure & Files

- [ ] Directory: `skills/{skill-name}/` exists
- [ ] File: `SKILL.md` with proper frontmatter
- [ ] Complexity: Matches actual content (<15 simple, 15-40 medium, 40+ complex)
- [ ] assets/: Created if templates/schemas needed (medium skills)
- [ ] references/: Created if 40+ patterns or 4+ sub-topics (complex skills)

### Frontmatter Compliance

- [ ] `name`: lowercase-with-hyphens, matches directory
- [ ] `description`: <150 chars, includes "Trigger:" clause
- [ ] `skills`: Lists internal skills (conventions, a11y if applicable)
- [ ] `dependencies`: Uses correct format `package: "version-range"`
- [ ] `allowed-tools`: Optional, only if skill needs specific tools
- [ ] No empty arrays: Omit `skills`, `dependencies`, `allowed-tools` if empty

### Content Quality

- [ ] When to Use: Clear conditions (3-5 items)
- [ ] Critical Patterns: 5-15 patterns with inline examples
- [ ] Examples: Focused (<15 lines), show correct + incorrect
- [ ] Decision Tree: Clear Condition → Action format
- [ ] Conventions: Properly delegated to conventions/a11y skills
- [ ] Edge Cases: Documented with solutions
- [ ] Token efficiency: No filler, no redundancy, precise language

### References (for complex skills only)

- [ ] references/ directory created
- [ ] 4-9 reference files (lowercase-with-hyphens.md)
- [ ] Each file <800 lines
- [ ] SKILL.md links to references (Critical Patterns + Resources)
- [ ] References link back to SKILL.md
- [ ] Cross-links between related references

### Quality Standards

- [ ] Visual markers used: ✅ REQUIRED, ❌ NEVER, ⚠️ WARNING, 💡 TIP
- [ ] Code examples use correct language syntax highlighting
- [ ] No broken links (internal or external)
- [ ] Consistent formatting (headers, lists, code blocks)
- [ ] Active voice, imperative mood (not "you should" but "Use X")

---

## External References

- Official documentation: {URL}
- Additional resources: {URL}
- Related skills: [{skill-name}](../{skill-name}/SKILL.md)

---

## Token Efficiency Guidelines

{Inline reminders for creating token-efficient skills}

**Frontmatter:**

- Omit empty fields (`skills: []`, `dependencies: {}`)
- Description <150 chars, every word adds value
- No filler phrases: "This skill provides", "comprehensive guide"

**Content:**

- Use active voice: "Use X" not "You should use X"
- Use imperative mood: "Create file" not "Creating a file"
- Eliminate hedging: "Do X" not "Consider doing X"
- Unify redundant points: Combine similar patterns
- Keep examples focused: <15 lines per code block

**Structure:**

- One pattern per section (don't combine unrelated)
- Use visual markers instead of long explanations (✅/❌)
- Link to references instead of duplicating content
- Remove intro/outro fluff: Get to the point immediately

**Target:** 40-50% reduction from first draft while maintaining clarity.
