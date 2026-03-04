# Advanced Techniques

Power-user workflows for parallel refactoring, bulk transformations, and progress tracking.

## Core Patterns

### Parallel Refactoring with Git Worktrees

Work on multiple refactoring branches simultaneously without switching or stashing.

```bash
# Main codebase in ~/project
cd ~/project

# Create worktree for refactor A (user-service)
git worktree add ../project-refactor-user-service refactor/user-service

# Create worktree for refactor B (payment-module)
git worktree add ../project-refactor-payment refactor/payment-module

# Now you have 3 independent working directories:
# ~/project (main branch)
# ~/project-refactor-user-service (refactor/user-service branch)
# ~/project-refactor-payment (refactor/payment-module branch)

# Work on both refactors in parallel (different terminal windows/IDE instances)
# No git checkout needed, no stashing, no context switching
```

**Benefits:**

- Run tests for both refactors simultaneously
- Compare implementations side-by-side
- No risk of uncommitted work conflicts
- 2-3x faster for multi-module refactors

### Codemod Scripts for Bulk Refactoring

For repetitive transformations across 50+ files, write jscodeshift codemod scripts instead of manual find-replace.

```javascript
// codemod-replace-moment-with-datefns.js
module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Find: import moment from 'moment'
  // Replace: import { format } from 'date-fns'
  root
    .find(j.ImportDeclaration, {
      source: { value: 'moment' },
    })
    .replaceWith(() =>
      j.importDeclaration(
        [j.importSpecifier(j.identifier('format'))],
        j.literal('date-fns')
      )
    );

  // Find: moment(date).format('YYYY-MM-DD')
  // Replace: format(date, 'yyyy-MM-dd')
  root
    .find(j.CallExpression, {
      callee: { name: 'moment' },
    })
    .replaceWith((path) => {
      const arg = path.value.arguments[0];
      return j.callExpression(j.identifier('format'), [
        arg,
        j.literal('yyyy-MM-dd'),
      ]);
    });

  return root.toSource();
};

// Run across entire codebase
// npx jscodeshift -t codemod-replace-moment-with-datefns.js src/
```

**When to use codemods:**

- 50+ files need identical transformation
- Pattern is mechanical (no logic decisions)
- High risk of manual error (typos, missed files)

**Common codemod use cases:**

- Replace deprecated API with new API
- Update import paths after restructure
- Convert class components to hooks
- Rename props across component tree

### Refactoring Metrics Dashboard

Track refactoring progress with automated metrics over time.

```bash
# scripts/refactor-metrics.sh

echo "=== Refactoring Progress Dashboard ==="
echo ""

echo "Code Complexity:"
npx complexity-report src/ --format minimal

echo ""
echo "Bundle Size:"
npm run build --silent
du -h dist/bundle.js

echo ""
echo "Test Coverage:"
npm test -- --coverage --silent | grep "All files"

echo ""
echo "ESLint Errors:"
npx eslint src/ --format compact | grep "error" | wc -l

echo ""
echo "TypeScript Errors:"
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l

echo ""
echo "TODO Count:"
grep -r "// TODO" src/ | wc -l

# Run daily: npm run refactor:metrics
```

**Target improvements:**

- Complexity: Target <10 per function
- Bundle size: Aim for 10-20% reduction
- Test coverage: Increase from 60% to 80%
- Errors: Decrease ESLint/TS errors to zero
- TODOs: Reduce by 50% after refactor
