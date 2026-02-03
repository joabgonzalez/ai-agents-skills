# MUI Data Display Guide

> Table, DataGrid, List, Card, and data visualization patterns

## When to Read This

- Displaying tables with sorting/pagination
- Using MUI X DataGrid
- Creating lists with complex items
- Building card layouts

---

## Table

### ✅ Basic Table

```typescript
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell align="right">Age</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.id}>
          <TableCell>{row.name}</TableCell>
          <TableCell align="right">{row.age}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

### ✅ With Sorting

```typescript
const [orderBy, setOrderBy] = useState('name');
const [order, setOrder] = useState<'asc' | 'desc'>('asc');

const sortedRows = useMemo(() => {
  return [...rows].sort((a, b) => {
    const isAsc = order === 'asc';
    return (a[orderBy] > b[orderBy] ? 1 : -1) * (isAsc ? 1 : -1);
  });
}, [rows, order, orderBy]);

<TableHead>
  <TableRow>
    <TableCell>
      <TableSortLabel
        active={orderBy === 'name'}
        direction={order}
        onClick={() => handleSort('name')}
      >
        Name
      </TableSortLabel>
    </TableCell>
  </TableRow>
</TableHead>
```

### ✅ With Pagination

```typescript
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);

<TablePagination
  component="div"
  count={rows.length}
  page={page}
  onPageChange={(e, newPage) => setPage(newPage)}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
/>
```

---

## DataGrid (MUI X)

### ✅ Basic DataGrid

```typescript
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'age', headerName: 'Age', type: 'number', width: 110 },
];

<DataGrid
  rows={rows}
  columns={columns}
  initialState={{
    pagination: {
      paginationModel: { page: 0, pageSize: 10 },
    },
  }}
  pageSizeOptions={[5, 10, 20]}
  checkboxSelection
/>
```

---

## List

### ✅ List with Items

```typescript
<List>
  {items.map((item) => (
    <ListItem key={item.id} button onClick={() => handleClick(item)}>
      <ListItemAvatar>
        <Avatar src={item.avatar} />
      </ListItemAvatar>
      <ListItemText
        primary={item.title}
        secondary={item.description}
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="delete">
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  ))}
</List>
```

---

## Card

### ✅ Card Layout

```typescript
<Card>
  <CardMedia
    component="img"
    height="140"
    image="/image.jpg"
    alt="Card image"
  />
  <CardContent>
    <Typography gutterBottom variant="h5">
      Card Title
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Card description
    </Typography>
  </CardContent>
  <CardActions>
    <Button size="small">Share</Button>
    <Button size="small">Learn More</Button>
  </CardActions>
</Card>
```

---

## References

- [MUI Data Display](https://mui.com/material-ui/react-table/)
- [MUI X DataGrid](https://mui.com/x/react-data-grid/)
