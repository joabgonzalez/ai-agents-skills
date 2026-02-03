# React Native Performance Guide

> FlatList optimization, navigation performance, memory management

## When to Read This

- Optimizing FlatList rendering
- Improving navigation performance
- Reducing memory usage
- Debugging performance issues

---

## FlatList Optimization

### ✅ Use getItemLayout

```typescript
// ✅ CORRECT: Provide exact item dimensions
<FlatList
  data={items}
  renderItem={renderItem}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>

// ❌ WRONG: Dynamic heights without getItemLayout (slow scrolling)
<FlatList data={items} renderItem={renderItem} />
```

### ✅ Use keyExtractor

```typescript
// ✅ CORRECT: Unique key extractor
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
/>

// ❌ WRONG: Index as key (causes re-renders on data changes)
<FlatList
  data={items}
  keyExtractor={(item, index) => index.toString()}
  renderItem={renderItem}
/>
```

### ✅ Optimize renderItem

```typescript
// ✅ CORRECT: Memoized component
const MemoizedItem = React.memo(({ item }) => (
  <View>
    <Text>{item.title}</Text>
  </View>
));

<FlatList
  data={items}
  renderItem={({ item }) => <MemoizedItem item={item} />}
/>
```

### ✅ Window Size Configuration

```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  initialNumToRender={10} // Render 10 items initially
  maxToRenderPerBatch={5} // Batch size for rendering
  windowSize={5} // Number of pages to keep in memory
  removeClippedSubviews={true} // Unmount off-screen views (Android)
/>
```

---

## Image Optimization

### ✅ Use resizeMode

```typescript
<Image
  source={{ uri: imageUrl }}
  style={{ width: 200, height: 200 }}
  resizeMode="cover"
/>
```

### ✅ Use Fast Image Library

```typescript
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.normal,
  }}
  resizeMode={FastImage.resizeMode.cover}
  style={{ width: 200, height: 200 }}
/>
```

---

## Navigation Performance

### ✅ Lazy Load Screens

```typescript
import { lazy } from 'react';

const DetailsScreen = lazy(() => import('./DetailsScreen'));

<Stack.Screen name="Details" component={DetailsScreen} />
```

### ✅ Prevent Unnecessary Re-renders

```typescript
// ✅ CORRECT: Memoize navigation options
const screenOptions = useMemo(
  () => ({
    headerTitle: 'Details',
  }),
  []
);

<Stack.Screen name="Details" options={screenOptions} />
```

---

## Memory Management

### ✅ Clean Up Listeners

```typescript
useEffect(() => {
  const subscription = EventEmitter.addListener("event", handleEvent);

  return () => {
    subscription.remove(); // ✅ Clean up
  };
}, []);
```

### ✅ Cancel Network Requests

```typescript
useEffect(() => {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then(handleResponse)
    .catch(handleError);

  return () => {
    controller.abort(); // ✅ Cancel on unmount
  };
}, []);
```

---

## Profiling

### ✅ Use Performance Monitor

```typescript
import { PerformanceObserver } from "react-native";

const observer = new PerformanceObserver((list) => {
  console.log(list.getEntries());
});

observer.observe({ entryTypes: ["measure"] });
```

---

## References

- [Performance Overview](https://reactnative.dev/docs/performance)
- [FlatList](https://reactnative.dev/docs/flatlist)
