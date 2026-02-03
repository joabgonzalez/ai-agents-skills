# Skill Creation References

> Detailed guides for creating standards-compliant skills with templates, references, and validation

## Overview

This directory contains detailed guides for specific aspects of skill creation. Main [SKILL.md](../SKILL.md) provides critical patterns and decision tree. These references offer deep-dives, advanced techniques, and comprehensive examples.

---

## Quick Navigation

### 📖 Getting Started

| Reference                                        | Purpose                                       | Read When                             |
| ------------------------------------------------ | --------------------------------------------- | ------------------------------------- |
| [references-overview.md](references-overview.md) | When/why to create references                 | Planning complex skill (40+ patterns) |
| [structure.md](structure.md)                     | Directory organization, complexity assessment | Determining skill architecture        |

### 🔧 Core Implementation

| Reference                                  | Purpose                                         | Read When                       |
| ------------------------------------------ | ----------------------------------------------- | ------------------------------- |
| [frontmatter.md](frontmatter.md)           | Required/optional fields, YAML syntax           | Creating/validating frontmatter |
| [content-patterns.md](content-patterns.md) | Critical Patterns structure, visual markers     | Writing patterns section        |
| [examples.md](examples.md)                 | Complete skill examples (Simple/Medium/Complex) | Need reference implementation   |

### ✅ Quality & Validation

| Reference                                  | Purpose                                       | Read When                                   |
| ------------------------------------------ | --------------------------------------------- | ------------------------------------------- |
| [validation.md](validation.md)             | Pre-creation through post-creation validation | Before finalizing skill                     |
| [token-efficiency.md](token-efficiency.md) | Optimization techniques, compression          | Skill exceeds 300 lines or has 40+ patterns |

### 📚 Advanced Topics

| Reference                                                    | Purpose                                 | Read When                          |
| ------------------------------------------------------------ | --------------------------------------- | ---------------------------------- |
| [references-implementation.md](references-implementation.md) | 8-step workflow for creating references | Implementing references/ directory |
| [references-examples.md](references-examples.md)             | Real-world reference architectures      | Need examples of complex skills    |

---

## Reading Strategy

### For Simple Skills (<15 patterns)

1. Read main [SKILL.md](../SKILL.md) only
2. Optional: Check [examples.md](examples.md) for Prettier/Yup examples

### For Medium Skills (15-40 patterns)

1. Read main [SKILL.md](../SKILL.md)
2. Check [structure.md](structure.md) for organization patterns
3. Optional: [content-patterns.md](content-patterns.md) for pattern writing style

### For Complex Skills (40+ patterns)

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [references-overview.md](references-overview.md) - When/why references
3. **MUST read**: [references-implementation.md](references-implementation.md) - 8-step workflow
4. **MUST read**: [token-efficiency.md](token-efficiency.md) - Optimization strategies
5. CHECK: [structure.md](structure.md) - Directory patterns
6. CHECK: [references-examples.md](references-examples.md) - Real examples
7. Optional: [validation.md](validation.md) - Comprehensive checklist

---

## File Descriptions

### [references-overview.md](references-overview.md) (322 lines)

**When/why to create reference files for complex skills**

- Complexity indicators (40+ patterns, 4+ sub-topics)
- Decision matrix (Simple/Medium/Complex)
- Benefits and problems they solve
- Identifying natural sub-topics by domain
- Architecture patterns

**Read when**: Planning to create complex skill or migrating existing skill to references architecture.

---

### [structure.md](structure.md) (408 lines)

**Directory organization and complexity assessment**

- Simple vs Medium vs Complex structures
- Directory patterns (assets/ vs references/)
- Complexity indicators and thresholds
- Content distribution (what goes where)
- Migration strategies

**Read when**: Determining if skill needs references/ directory or organizing existing content.

---

### [frontmatter.md](frontmatter.md) (354 lines)

**Frontmatter requirements and validation**

- Required fields: name, description (with Trigger)
- Optional fields: skills, dependencies, allowed-tools
- YAML syntax and common mistakes
- Token efficiency in frontmatter
- Validation commands

**Read when**: Creating frontmatter section or validating existing frontmatter.

---

### [content-patterns.md](content-patterns.md) (516 lines)

**Critical Patterns section structure and writing style**

- Pattern naming conventions
- Visual markers (✅ ❌ 💡 ⚠️)
- Inline example requirements (<15 lines)
- Priority labels ([CRITICAL], [HIGH], [MEDIUM])
- Code block formatting
- Pattern organization

**Read when**: Writing Critical Patterns section or need guidance on pattern structure.

---

### [examples.md](examples.md) (620 lines)

**Complete skill examples across complexity levels**

- **Simple**: Prettier (10 patterns, 150 lines)
- **Medium**: Formik (25 patterns, 280 lines, assets/)
- **Complex**: React (50+ patterns, 350 lines, references/)
- Full implementations with all sections
- Demonstrates best practices

**Read when**: Need reference implementation or studying structure by example.

---

### [validation.md](validation.md) (528 lines)

**Pre-creation through post-creation validation**

- Pre-creation checklist (delegation, uniqueness)
- Structure validation (frontmatter, sections)
- Content validation (examples, token efficiency)
- Quality validation (critical-partner review)
- Post-creation (sync, documentation)
- Compliance Checklist (5 categories)

**Read when**: Before finalizing skill or running quality checks.

---

### [token-efficiency.md](token-efficiency.md) (524 lines)

**Optimization techniques and compression strategies**

- Omit empty arrays/objects
- Precise descriptions (<150 chars)
- Remove filler words
- Code examples under 15 lines
- Target metrics (Simple: 150 lines, Medium: 250-350, Complex: 300 + references)
- When to split into references

**Read when**: Skill exceeds target length or creating complex skill with 40+ patterns. **REQUIRED** for skills with 40+ patterns.

---

### [references-implementation.md](references-implementation.md) (525 lines)

**8-step workflow for creating reference files**

- Step-by-step implementation process
- Naming conventions for reference files
- Content distribution strategies
- Cross-linking between SKILL.md and references
- Migration from monolithic to references
- Maintenance guidelines

**Read when**: Implementing references/ directory for first time or migrating existing skill. **REQUIRED** for complex skills.

---

### [references-examples.md](references-examples.md) (447 lines)

**Real-world examples of skills with references**

- React skill (hooks, components, performance, server)
- TypeScript skill (types, generics, modules)
- skill-creation itself (meta-example)
- Shows actual directory structures
- Demonstrates cross-linking patterns
- Content distribution examples

**Read when**: Need concrete examples of how to organize complex skills. Helpful when implementing references architecture.

---

## Cross-References

- **Main Skill**: [../SKILL.md](../SKILL.md) - Overview, decision tree, critical patterns
- **Templates**: [../assets/SKILL-TEMPLATE.md](../assets/SKILL-TEMPLATE.md) - Skill template with Plan B structure
- **Schema**: [../assets/frontmatter-schema.json](../assets/frontmatter-schema.json) - Frontmatter validation schema
- **Agent Guidelines**: [../../agent-creation/SKILL.md](../../agent-creation/SKILL.md) - Creating agents that use skills
- **Root Documentation**: [../../../AGENTS.md](../../../AGENTS.md) - Extended Mandatory Read Protocol

---

## Maintenance

**Last Updated**: February 3, 2026

**Change History**:

- **2026-02-03**: Initial creation with 9 references after Plan B implementation
- **2024-01-20**: Plan B architecture implemented (775→460 lines SKILL.md)

**To Update**:

1. Modify specific reference file
2. Update this README if adding/removing references
3. Update cross-links in main SKILL.md
4. Run `make sync` to propagate changes

---

## Contributing

When adding new reference files:

1. Follow naming convention: `{topic-description}.md` (lowercase, hyphens)
2. Keep focused on ONE sub-topic (200-600 lines ideal)
3. Add entry to Quick Navigation table above
4. Add detailed description in File Descriptions section
5. Update main SKILL.md with link in Resources section
6. Cross-link from relevant Critical Patterns

**Questions?** See [references-implementation.md](references-implementation.md) for complete workflow.
