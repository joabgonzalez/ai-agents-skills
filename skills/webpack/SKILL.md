---
name: webpack
description: "Module bundler with loaders, plugins, and code splitting. Trigger: When configuring Webpack, setting up loaders, or optimizing bundles."
license: "Apache 2.0"
metadata:
  version: "1.1"
  type: tooling
  dependencies:
    webpack: ">=5.0.0 <6.0.0"
---

# Webpack

Module bundler: loaders, plugins, code splitting, optimization, cache busting.

## When to Use

- Configuring Webpack bundler for complex projects
- Setting up loaders for different file types
- Implementing code splitting and lazy loading
- Optimizing bundle size and performance
- Working with legacy projects using Webpack

Don't use for:

- Modern projects (prefer vite)
- Simple static sites

---

## Critical Patterns

### ✅ REQUIRED: Use contenthash for Cache Busting

```javascript
// ✅ CORRECT: Contenthash for long-term caching
module.exports = {
  output: {
    filename: "[name].[contenthash].js",
  },
};

// ❌ WRONG: No hash (cache issues)
module.exports = {
  output: {
    filename: "bundle.js",
  },
};
```

### ✅ REQUIRED: Code Splitting

```javascript
// ✅ CORRECT: Automatic code splitting
module.exports = {
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
};
```

### ✅ REQUIRED: Separate Dev/Prod Configs

```javascript
// ✅ CORRECT: Mode-specific settings
module.exports = (env, argv) => {
  const isProd = argv.mode === "production";
  return {
    devtool: isProd ? "source-map" : "eval-source-map",
  };
};
```

---

## Conventions

### Webpack Specific

- Configure loaders for different file types
- Implement code splitting
- Optimize bundle size
- Configure development and production modes
- Use plugins for additional functionality

---

## Decision Tree

```
TypeScript files?
  → Use ts-loader or babel-loader with TypeScript preset

CSS/SCSS files?
  → Use style-loader + css-loader (+ sass-loader for SCSS)

Images/fonts?
  → Use asset/resource or asset/inline for file handling

Code splitting?
  → Configure splitChunks in optimization, use dynamic import()

Slow build?
  → Enable cache, use thread-loader for parallel processing

Dev server needed?
  → Use webpack-dev-server with HMR

Bundle analysis?
  → Use webpack-bundle-analyzer plugin
```

---

## Example

webpack.config.js:

```javascript
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
};
```

---

## Edge Cases

**Tree shaking:** ES6 imports/exports + `sideEffects: false` in package.json.

**Circular deps:** Refactor to break circular imports.

**Memory:** Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096`.

**Module federation:** Use `ModuleFederationPlugin` for micro-frontends.

**Source maps:** `source-map` (full) or `hidden-source-map` (hide from browser).

---

## Resources

- https://webpack.js.org/concepts/
- https://webpack.js.org/configuration/
