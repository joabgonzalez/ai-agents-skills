---
name: mui-x-charts
description: MUI X Charts for data visualization in React applications.
skills:
  - mui
  - react
  - typescript
dependencies:
  "@mui/x-charts": ">=6.0.0 <8.0.0"
  react: ">=17.0.0 <19.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# MUI X Charts Skill

## Overview

Guidance for implementing data visualizations using MUI X Charts in React applications.

## Objective

Enable developers to create accessible, responsive charts and graphs using MUI X Charts library.

## Conventions

Refer to mui for:

- Theme integration
- Component patterns

Refer to react for:

- Component structure
- Hooks usage

### MUI X Charts Specific

- Choose appropriate chart type for data
- Implement responsive sizing
- Provide proper axis labels and legends
- Handle loading and error states
- Ensure color contrast for accessibility

## Example

```typescript
import { LineChart } from '@mui/x-charts/LineChart';

<LineChart
  xAxis={[{ data: [1, 2, 3, 4, 5] }]}
  series={[
    { data: [2, 5, 3, 7, 4], label: 'Series A' }
  ]}
  width={500}
  height={300}
/>
```

## References

- https://mui.com/x/react-charts/
