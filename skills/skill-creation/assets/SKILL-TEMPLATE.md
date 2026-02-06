---
name: {skill-name}
description: "{Brief description}. Trigger: {When AI should invoke - be specific}."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
  dependencies:
    {package-name}: "{version-range}"
---

# {Skill Name}

{1-2 sentence summary: what problem this skill solves and its scope.}

## When to Use

- {Specific condition 1}
- {Specific condition 2}
- {Specific condition 3}

Don't use for:

- {Exclusion 1}
- {Exclusion 2}

---

## Critical Patterns

{Core patterns - the most important rules AI must follow.}
{Include inline example after EACH pattern (<15 lines).}
{Use [CRITICAL] label only for patterns that break functionality if ignored.}

### ✅ REQUIRED: {Pattern Name}

{Brief explanation (1-2 sentences)}

```{language}
// ✅ CORRECT
{code showing correct approach}

// ❌ WRONG
{code showing incorrect approach}
```

### ✅ REQUIRED [CRITICAL]: {Must-Follow Pattern}

{Why this is critical}

```{language}
// ✅ CORRECT
{focused example under 15 lines}

// ❌ WRONG
{anti-pattern}
```

### ❌ NEVER: {Anti-pattern Name}

{Why this must be avoided}

```{language}
// ❌ WRONG
{anti-pattern example}
```

{5-15 critical patterns total. For complex skills with references/, keep top 10-15 here.}

---

## Decision Tree

```
{Condition}? → {Action A}
{Condition}? → {Action B}
Otherwise    → {Default action}
```

{For complex skills with references/:}

```
{Decision point}?
  → {Sub-condition}? → See [file.md](references/file.md)
  → Standard case → Use patterns above
```

---

## Workflow

1. **{Step 1}** → {What to do}
2. **{Step 2}** → {What to do}
3. **{Step 3}** → {What to do}

---

## Conventions

Delegate to [conventions](../conventions/SKILL.md) and [a11y](../a11y/SKILL.md). Add only skill-specific rules:

- {Unique rule specific to this technology}
- {Best practice unique to this domain}

---

## Example

```{language}
// Example demonstrating {pattern 1}, {pattern 2}
{practical code example under 30 lines}
```

---

## Edge Cases

**{Edge case 1}:** {Description and how to handle.}

**{Edge case 2}:** {Description and solution.}

**{Performance consideration}:** {When it matters and what to do.}

---

## Checklist

### Structure
- [ ] Directory: `skills/{skill-name}/`
- [ ] Frontmatter: `name`, `description` (with Trigger), `metadata.version`
- [ ] `metadata.skills` follows [dependencies-matrix.md](references/dependencies-matrix.md)
- [ ] Empty arrays/objects omitted
- [ ] Complex skills: `references/` created (40+ patterns)

### Content
- [ ] When to Use (with Don't use for)
- [ ] Critical Patterns with ✅/❌ markers and inline examples
- [ ] Decision Tree (condition→action)
- [ ] Example section
- [ ] Edge Cases
- [ ] Delegates to conventions/a11y (not duplicated)

### Quality
- [ ] Token-efficient (no filler, every word adds value)
- [ ] SKILL.md under 300 lines (complex skills)
- [ ] All referenced skills exist
- [ ] Synced to model directories

---

## Resources

{Choose based on complexity:}

### Complex Skills (40+ patterns):

- [{Sub-topic}](references/{file}.md) - {Description}

### Medium Skills (15-40 patterns):

- [{Template}](assets/{template}) - {Description}

### Related Skills:

- [{skill-name}](../{skill-name}/SKILL.md) - {Description}
