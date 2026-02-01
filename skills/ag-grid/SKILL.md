---
name: ag-grid
description: Provides standards-compliant best practices, conventions, and practical examples for implementing advanced data tables with AG Grid in React and TypeScript projects. Covers configuration, accessibility, and integration guidelines for robust, maintainable, and accessible grids.
allowed-tools:
  - documentation-reader
  - web-search
  - file-reader
dependencies:
  ag-grid-community: ">=29.0.0 <31.0.0"
  ag-grid-react: ">=29.0.0 <31.0.0"
  react: ">=17.0.0 <19.0.0"
  typescript: ">=5.0.0 <6.0.0"
---

# AG Grid Skill

## Overview

This skill provides comprehensive guidance for implementing AG Grid data tables in React and TypeScript applications, covering configuration, accessibility, performance optimization, and integration patterns.

## Objective

Enable developers to implement robust, accessible, and performant data grids using AG Grid with proper TypeScript typing, React integration, and accessibility standards.

## Conventions

Refer to conventions for:

- Code organization
- Documentation standards

Refer to a11y for:

- Keyboard navigation
- Screen reader support
- ARIA attributes

### AG Grid Specific

- Use TypeScript interfaces for column definitions
- Implement proper cell renderers for custom content
- Configure accessibility features (keyboard navigation, screen reader support)
- Use AG Grid's built-in features over custom implementations
- Handle loading and error states appropriately

## Example

```typescript
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

interface RowData {
  id: number;
  name: string;
  value: number;
}

const columnDefs: ColDef<RowData>[] = [
  { field: 'id', headerName: 'ID' },
  { field: 'name', headerName: 'Name', sortable: true },
  { field: 'value', headerName: 'Value', filter: 'agNumberColumnFilter' }
];

<AgGridReact<RowData>
  rowData={data}
  columnDefs={columnDefs}
  defaultColDef={{ flex: 1, minWidth: 100 }}
/>
```

## Edge Cases

- Handle empty data sets with appropriate messaging
- Manage loading states during data fetching
- Implement error boundaries for grid failures
- Handle resize events properly
- Test keyboard navigation thoroughly

## References

- https://www.ag-grid.com/react-data-grid/
- https://www.ag-grid.com/react-data-grid/accessibility/
