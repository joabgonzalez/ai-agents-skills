---
name: webpack
description: Webpack module bundler configuration and optimization.
skills:
  - conventions
dependencies:
  webpack: ">=5.0.0 <6.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# Webpack Skill

## Overview

Module bundler configuration for compiling and optimizing JavaScript applications.

## Objective

Configure webpack for efficient bundling, code splitting, and optimization of web applications.

## Conventions

Refer to conventions for:

- Project structure

### Webpack Specific

- Configure loaders for different file types
- Implement code splitting
- Optimize bundle size
- Configure development and production modes
- Use plugins for additional functionality

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

## References

- https://webpack.js.org/concepts/
- https://webpack.js.org/configuration/
