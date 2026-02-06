# Skill Creation References

> Detailed guides for creating standards-compliant skills

## Quick Navigation

| Reference | Purpose | Read When |
|-----------|---------|-----------|
| [frontmatter.md](frontmatter.md) | Required/optional fields, YAML syntax | Creating/validating frontmatter |
| [structure.md](structure.md) | Directory organization, complexity assessment | Determining skill architecture |
| [content-patterns.md](content-patterns.md) | Critical Patterns structure, visual markers | Writing patterns section |
| [dependencies-matrix.md](dependencies-matrix.md) | Skill dependencies by category | Choosing `metadata.skills` |
| [examples.md](examples.md) | Complete skill examples (Simple/Medium/Complex) | Need reference implementation |
| [token-efficiency.md](token-efficiency.md) | Optimization techniques, compression | Skill exceeds 300 lines |
| [validation.md](validation.md) | Pre-creation through post-creation checks | Before finalizing skill |

---

## Reading Strategy

### For Simple Skills (<15 patterns)

1. Read main [SKILL.md](../SKILL.md)
2. Check [frontmatter.md](frontmatter.md) for field reference
3. Optional: [examples.md](examples.md) for simple skill example

### For Medium Skills (15-40 patterns)

1. Read main [SKILL.md](../SKILL.md)
2. Read [frontmatter.md](frontmatter.md) + [structure.md](structure.md)
3. Check [dependencies-matrix.md](dependencies-matrix.md) for skill category
4. Optional: [content-patterns.md](content-patterns.md) for writing style

### For Complex Skills (40+ patterns)

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [structure.md](structure.md) - Directory organization
3. **MUST read**: [token-efficiency.md](token-efficiency.md) - Optimization
4. **MUST read**: [dependencies-matrix.md](dependencies-matrix.md) - Dependencies
5. Check: [content-patterns.md](content-patterns.md) - Pattern writing
6. Check: [validation.md](validation.md) - Quality checks
7. See also: [reference-creation](../../reference-creation/SKILL.md) skill for creating references/

---

## File Descriptions

### [frontmatter.md](frontmatter.md)

Frontmatter requirements: required fields (name, description with Trigger, metadata.version), optional fields (license, skills, dependencies, allowed-tools), YAML syntax, validation, common mistakes.

### [structure.md](structure.md)

Directory organization: complexity assessment (simple/medium/complex), directory naming, file organization, content distribution, migration paths.

### [content-patterns.md](content-patterns.md)

Writing patterns: Critical Patterns structure, visual markers (✅/❌/⚠️/💡), inline examples, Decision Trees, Conventions delegation, Edge Cases, writing style.

### [dependencies-matrix.md](dependencies-matrix.md)

Skill dependency guide: which skills to include by category (Frontend, Backend, Testing, Build tools), decision rules, common mistakes.

### [examples.md](examples.md)

Complete skill examples: Simple (Prettier, 150 lines), Medium (Formik, 280 lines), Complex (React, 350+ lines with references/).

### [token-efficiency.md](token-efficiency.md)

Optimization: frontmatter compression, content efficiency, code examples under 15 lines, target metrics by complexity level.

### [validation.md](validation.md)

Quality checks: pre-creation (delegation, uniqueness), structure validation, content validation, post-creation (sync, documentation).

---

## Cross-References

- **Main Skill**: [SKILL.md](../SKILL.md) - Overview, decision tree, critical patterns
- **Template**: [SKILL-TEMPLATE.md](../assets/SKILL-TEMPLATE.md) - Skill template
- **Schema**: [frontmatter-schema.json](../assets/frontmatter-schema.json) - Validation schema (reference only)
- **Reference Creation**: [reference-creation](../../reference-creation/SKILL.md) - Creating references/ directories
