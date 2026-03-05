# MUI X Charts Reference

MUI X Charts components for data visualization in React applications. Use **ONLY when context requires charts**.

## Core Patterns

### Check Context Before Using Charts

Verify charts are actually needed before importing `@mui/x-charts`:

```typescript
// 1. Check AGENTS.md for viz requirements
// 2. Check package.json for @mui/x-charts
// 3. Check task for "chart"/"graph"/"viz"

// ✅ CORRECT
// "Display revenue chart" → Use Charts
// "Dashboard with KPIs" + has @mui/x-charts → Use Charts

// ❌ WRONG
// "Settings page" → NO charts
// "User profile" → NO charts
```

**Dependencies** (only if charts needed):

```json
{
  "@mui/x-charts": ">=6.0.0 <8.0.0"
}
```

### Accessible Charts with Labels and Legends

Always provide axis labels and series labels for accessibility:

```typescript
import { LineChart } from '@mui/x-charts/LineChart';

// ✅ CORRECT: Accessible chart
<LineChart
  xAxis={[{ label: 'Month', data: months }]}
  yAxis={[{ label: 'Revenue ($)' }]}
  series={[{ data: revenue, label: 'Q1 2024' }]}
/>

// ❌ WRONG: No labels (inaccessible)
<LineChart
  xAxis={[{ data: months }]}
  series={[{ data: revenue }]}
/>
```

### Responsive Container Sizing

Use container-based sizing, never fixed pixel dimensions:

```typescript
// ✅ CORRECT: Container-based sizing
<Box sx={{ width: '100%', height: 400 }}>
  <LineChart /* ... */ />
</Box>

// ❌ WRONG: Fixed sizes (not responsive)
<LineChart width={800} height={400} />
```

---

## Chart Type Decision Tree

```
Time series data?          → LineChart
Categorical comparison?    → BarChart
Part-to-whole relationship? → PieChart
Correlation between vars?  → ScatterChart
Multiple metrics?          → Multiple series in same chart
```

---

## Example

```typescript
import { LineChart } from '@mui/x-charts/LineChart';

function RevenueChart() {
  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <LineChart
        xAxis={[{ data: [1, 2, 3, 4, 5], label: 'Month' }]}
        yAxis={[{ label: 'Revenue ($)' }]}
        series={[
          { data: [2000, 5000, 3000, 7000, 4000], label: 'Q1 2024' }
        ]}
      />
    </Box>
  );
}
```

---

## Edge Cases

**Empty data:** Show placeholder, not empty chart.

**Large datasets:** Aggregate or sample data for performance.

**Accessibility:** Provide a data table as fallback for screen readers.
