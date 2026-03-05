# Conventions References

> Detailed guides for cross-technology coding conventions.

## Quick Navigation

| Reference                                                | Purpose                     | Read When                              |
| -------------------------------------------------------- | --------------------------- | -------------------------------------- |
| [naming-conventions.md](naming-conventions.md)           | Variable, function, file naming | Naming anything in code                |
| [import-organization.md](import-organization.md)         | Import grouping and types   | Organizing imports, type imports       |
| [code-structure.md](code-structure.md)                   | File/folder organization    | Structuring projects, SRP for files    |
| [documentation-standards.md](documentation-standards.md) | JSDoc, comments, READMEs    | Documenting code, APIs, architecture   |

---

## Reading Strategy

### For Quick Reference

- Read main [SKILL.md](../SKILL.md) — has the top patterns inline

### For Specific Topics

- Naming questions → [naming-conventions.md](naming-conventions.md)
- Import issues → [import-organization.md](import-organization.md)
- Project structure → [code-structure.md](code-structure.md)
- Documentation → [documentation-standards.md](documentation-standards.md)

### For New Projects

Read all 4 references to establish conventions before writing code.

---

## File Descriptions

### [naming-conventions.md](naming-conventions.md)

**Variable, function, class, and file naming rules**

- camelCase, PascalCase, SCREAMING_SNAKE_CASE, kebab-case guidance
- Function and method naming patterns
- File and directory naming conventions
- TypeScript-specific naming (interfaces, types, enums)

### [import-organization.md](import-organization.md)

**Import grouping, ordering, and type import patterns**

- Import group ordering (external, internal, relative)
- Type-only imports and when to use them
- Barrel file patterns and trade-offs
- Auto-import configuration

### [code-structure.md](code-structure.md)

**File and folder organization patterns**

- Single Responsibility Principle for files
- Feature-based vs layer-based directory structures
- Module boundaries and co-location strategies
- Refactoring large files

### [documentation-standards.md](documentation-standards.md)

**JSDoc, inline comments, and README conventions**

- When to write JSDoc vs inline comments
- JSDoc tag usage (@param, @returns, @example)
- README structure and required sections
- API documentation patterns

---

## Cross-Reference Map

- [naming-conventions.md](naming-conventions.md) → Extends SKILL.md naming patterns; applies across all language/framework skills
- [import-organization.md](import-organization.md) → Extends SKILL.md import rules; pairs with [typescript](../../typescript/SKILL.md) for type imports
- [code-structure.md](code-structure.md) → Extends SKILL.md structure guidance; pairs with [architecture-patterns](../../architecture-patterns/SKILL.md) for project organization
- [documentation-standards.md](documentation-standards.md) → Extends SKILL.md documentation rules; applies to all skills that produce public APIs
- Related skills: [typescript](../../typescript/SKILL.md), [architecture-patterns](../../architecture-patterns/SKILL.md), [code-quality](../../code-quality/SKILL.md)
