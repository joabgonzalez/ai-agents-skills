# TypeScript Configuration

> tsconfig.json deep dive, strict mode, and compiler options

## When to Read This

- Setting up new TypeScript project
- Configuring module resolution, path mapping, or project references
- Setting up React/Next.js or Node.js projects
- Publishing libraries with declaration files
- Debugging common tsconfig pitfalls

---

## Strict Mode (REQUIRED)

```json
{
  "compilerOptions": {
    "strict": true,
    // Individually: noImplicitAny, strictNullChecks, strictFunctionTypes,
    // strictBindCallApply, strictPropertyInitialization, noImplicitThis, alwaysStrict
  }
}
```

---

## Module Resolution

```json
{ "compilerOptions": { "module": "ESNext", "moduleResolution": "bundler", "target": "ES2020", "lib": ["ES2020", "DOM", "DOM.Iterable"] } }
```

---

## Path Mapping

```json
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["src/*"], "@components/*": ["src/components/*"] } } }
```

---

## Project References (Monorepos)

Root `tsconfig.json`:

```json
{ "files": [], "references": [{ "path": "packages/shared" }, { "path": "packages/api" }, { "path": "packages/web" }] }
```

Each package (`packages/shared/tsconfig.json`):

```json
{ "compilerOptions": { "composite": true, "declaration": true, "declarationMap": true, "outDir": "dist", "rootDir": "src" }, "include": ["src"] }
```

Build all with `tsc --build`. `composite` enforces that files match `include` and `declaration` is on.

---

## React / Next.js Config

React 17+ automatic JSX transform:

```json
{ "compilerOptions": { "jsx": "react-jsx", "jsxImportSource": "react", "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext", "moduleResolution": "bundler", "strict": true, "isolatedModules": true, "noEmit": true } }
```

Next.js additions (Next generates most config automatically):

```json
{ "compilerOptions": { "plugins": [{ "name": "next" }], "allowJs": true, "incremental": true }, "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"] }
```

`jsx` values: `"react-jsx"` (auto runtime), `"react"` (classic), `"preserve"` (bundler handles JSX).

---

## Node.js Backend Config

```json
{ "compilerOptions": { "target": "ES2022", "module": "Node16", "moduleResolution": "Node16", "lib": ["ES2022"], "types": ["node"], "outDir": "dist", "rootDir": "src", "strict": true, "esModuleInterop": true, "resolveJsonModule": true }, "include": ["src"] }
```

Use `module: "Node16"` / `"NodeNext"` for proper ESM/CJS interop. Requires file extensions in relative imports. Set `"type": "module"` in `package.json` for ESM.

---

## Declaration Files (Library Authors)

```json
{ "compilerOptions": { "declaration": true, "declarationMap": true, "emitDeclarationOnly": true, "outDir": "dist" } }
```

- `declaration` -- generates `.d.ts` files for consumers.
- `declarationMap` -- `.d.ts.map` so editors jump to original source.
- `emitDeclarationOnly` -- skips JS; use when a bundler handles JS and tsc only produces types.

Point `"types"` in `package.json` at entry: `"types": "dist/index.d.ts"`.

---

## Incremental Builds

```json
{ "compilerOptions": { "incremental": true, "tsBuildInfoFile": "./.tsbuildinfo" } }
```

Caches build info so only changed files are rechecked. Add `.tsbuildinfo` to `.gitignore`. With project references, `tsc --build` + `composite: true` enables this automatically.

---

## Recommended Config

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Common Pitfalls

### `moduleResolution` -- choosing the right value

| Value | When to use |
|---|---|
| `"bundler"` | Vite, webpack, esbuild. Supports `exports`, no extensions needed. |
| `"Node16"` / `"NodeNext"` | Code running directly in Node.js. Requires extensions. |
| `"node"` (legacy) | Old CJS projects only. No `exports` support. Avoid for new code. |

Always pair `module: "Node16"` with `moduleResolution: "Node16"` -- mismatches cause confusing errors.

### Forgetting `skipLibCheck`

Without it, tsc type-checks every `.d.ts` in `node_modules`, adding significant build time. Enable `skipLibCheck: true` unless you need to validate third-party types.

### `noEmit` for bundler-driven projects

When Vite/webpack/esbuild compiles TS, set `noEmit: true` so tsc only type-checks. Run `tsc --noEmit` in CI. Avoids duplicate/conflicting output.

### `paths` requires bundler/runtime alias config too

TS `paths` only affects compile-time resolution -- it does **not** rewrite imports in emitted JS. Configure aliases separately in your tooling:

- **Vite** -- `resolve.alias` in `vite.config.ts`
- **webpack** -- `resolve.alias` in `webpack.config.js`
- **Jest** -- `moduleNameMapper` in `jest.config.js`
- **Node.js** -- `tsconfig-paths/register` or `tsc-alias` post-build

Without this, tsc compiles fine but the app crashes at runtime with module-not-found errors.

---

## References

- [tsconfig Reference](https://www.typescriptlang.org/tsconfig)
- [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html)
- [Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
