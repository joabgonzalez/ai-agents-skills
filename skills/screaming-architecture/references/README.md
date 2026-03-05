## Quick Navigation

| File | Purpose |
| ---- | ------- |
| [migration-playbook.md](./migration-playbook.md) | Step-by-step guide for migrating technical-layer folders to domain-first structure |
| [monorepo-adaptation.md](./monorepo-adaptation.md) | Turborepo and Nx workspace patterns for domain-first monorepo architecture |

---

## Reading Strategy

Start with the SKILL.md for the core principles of screaming architecture (domain-first structure, framework at the edge, shared kernel). Then use the reference files based on your immediate situation:

- Migrating an existing codebase: read `migration-playbook.md` — it covers the incremental strangler-fig approach, git branching strategy, and a complete before/after transformation example.
- Working in a monorepo: read `monorepo-adaptation.md` — it covers Turborepo pipeline configuration, Nx boundary enforcement with tags, the shared-library vs domain-package decision, and dependency graph visualization.

The two reference files are independent. You do not need to read one before the other.

---

## File Descriptions

**migration-playbook.md** — Practical migration guide covering: domain audit worksheet, coexistence phase (old and new structures side by side), the strangler-fig file migration pattern with re-export shims, utility classification (domain-specific vs truly shared), cross-cutting concern placement, and git branch strategy with incremental PRs. Includes a complete before/after example transforming a Node.js/Express monolith.

**monorepo-adaptation.md** — Monorepo-specific patterns covering: Turborepo workspace layout with domain packages, `turbo.json` pipeline configuration, Nx project tags and `@nx/enforce-module-boundaries` lint rules, the shared-library vs domain-package decision tree, cross-domain contracts packages, and dependency graph visualization commands for both Turborepo and Nx.

---

## Cross-Reference Map

| Concept | Where it appears |
| ------- | ---------------- |
| Domain audit before migration | migration-playbook.md: Step 1 |
| Strangler fig with re-export shims | migration-playbook.md: Step 3 |
| Utility classification (domain vs shared) | migration-playbook.md: Step 4 |
| Shared infrastructure placement | migration-playbook.md: Step 5, SKILL.md: Shared Kernel |
| Git branch strategy for large moves | migration-playbook.md: Step 6 |
| Before/after monolith transformation | migration-playbook.md: Before/After section |
| Turborepo package structure | monorepo-adaptation.md: Turborepo section |
| Nx tags and boundary lint rules | monorepo-adaptation.md: Nx section |
| Shared library vs domain package decision | monorepo-adaptation.md: Decision section |
| Cross-domain contracts package | monorepo-adaptation.md: Decision section |
| Dependency graph visualization | monorepo-adaptation.md: Dependency Graph section |
| Framework at the edge | SKILL.md: Critical Patterns |
| Shared kernel for cross-cutting concerns | SKILL.md: Critical Patterns |
