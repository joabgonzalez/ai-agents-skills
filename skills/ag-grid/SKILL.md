---
name: ag-grid
description: "Advanced data tables with AG Grid. Trigger: When implementing AG Grid tables, configuring features, or creating custom cell renderers."
license: "Apache 2.0"
metadata:
  version: "1.1"
  type: library
  skills:
    - react
  dependencies:
    ag-grid-community: ">=29.0.0 <31.0.0"
    ag-grid-react: ">=29.0.0 <31.0.0"
    react: ">=17.0.0 <19.0.0"
    typescript: ">=5.0.0 <6.0.0"
  allowed-tools:
    - file-reader
---

# AG Grid

React data tables with sorting, filtering, pagination, inline editing, and Excel-like features. TypeScript typing, accessibility, and virtualization.

> Examples use `ag-grid-react`. Column config API (`ColDef`, `onGridReady`) is framework-agnostic — adapt cell renderers to your framework's component syntax for Angular/Vue.

## When to Use

- Data tables with sorting/filtering/pagination
- Editable grids with inline editing
- Complex grids with grouping/aggregation
- High-performance with virtualization
- Excel-like functionality

Don't use for:

- Simple tables (use HTML/MUI Table)
- Non-tabular viz (use charts)
- Mobile-first (consider simpler)

---

## Critical Patterns

### ✅ REQUIRED: Use TypeScript Interfaces for Type Safety

```typescript
// ✅ CORRECT: Typed column definitions
import { ColDef } from "ag-grid-community";

interface RowData {
  id: number;
  name: string;
}

const columnDefs: ColDef<RowData>[] = [{ field: "id" }, { field: "name" }];

// ❌ WRONG: Untyped columns
const columnDefs = [{ field: "id" }, { field: "name" }];
```

### ✅ REQUIRED: Use defaultColDef for Common Settings

```typescript
// ✅ CORRECT: DRY column configuration
const defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
};

<AgGridReact defaultColDef={defaultColDef} />

// ❌ WRONG: Repeating config for each column
const columnDefs = [
  { field: 'id', sortable: true, filter: true, resizable: true },
  { field: 'name', sortable: true, filter: true, resizable: true },
];
```

### ✅ REQUIRED: Enable Accessibility Features

```typescript
// ✅ CORRECT: Accessibility enabled
<AgGridReact
  enableAccessibility={true}
  suppressMenuHide={false}
/>
```

---

## Conventions

### AG Grid Specific

- TypeScript interfaces for columns
- Cell renderers for custom content
- Apply accessibility best practices: keyboard navigation, screen reader support, ARIA attributes
- Built-in features over custom
- Handle loading/error states

---

## Decision Tree

```
Custom cells?
  → Use cellRenderer/cellRendererFramework

Editable?
  → editable: true, handle onCellValueChanged

Filtering?
  → filter: true or specify type (agTextColumnFilter, agNumberColumnFilter)

Large dataset?
  → rowModelType: 'infinite' for server pagination

Grouping?
  → rowGroup: true on columns

Export?
  → exportDataAsCsv()/exportDataAsExcel()

Performance?
  → Virtualization (default), immutableData: true for React
```

---

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

---

## Edge Cases

- Empty data → appropriate messaging
- Loading states during fetch
- Error boundaries for failures
- Resize events properly
- Test keyboard navigation

---

## Resources

- https://www.ag-grid.com/react-data-grid/
- https://www.ag-grid.com/react-data-grid/accessibility/
