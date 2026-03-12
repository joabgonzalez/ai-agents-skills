---
name: react-native
description: "Cross-platform mobile development with React Native. Trigger: When developing mobile apps, implementing platform features, or optimizing performance."
license: "Apache 2.0"
metadata:
  version: "1.1"
  type: framework
  skills:
    - react
  dependencies:
    react-native: ">=0.70.0 <1.0.0"
    react: ">=17.0.0 <19.0.0"
---

# React Native

Cross-platform iOS/Android with React Native. Native components, platform code, navigation, and performance.

## When to Use

- Cross-platform mobile (iOS + Android)
- Bare React Native (not Expo managed)
- Platform-specific features and native module integration
- Mobile performance optimization

Don't use for:

- Web apps (use react skill)
- Expo-managed (use expo skill)
- Native iOS/Android development only

---

## Critical Patterns

### ✅ REQUIRED: Use FlatList for Lists

```typescript
// ✅ CORRECT: Virtualized list
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <Item data={item} />}
/>

// ❌ WRONG: ScrollView with map (memory issues)
<ScrollView>
  {items.map(item => <Item key={item.id} data={item} />)}
</ScrollView>
```

### ✅ REQUIRED: Use Platform-Specific Code

```typescript
// ✅ CORRECT: Platform.select or Platform.OS
import { Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: Platform.select({ ios: 10, android: 8 }),
  },
});

// Or separate files: Component.ios.tsx, Component.android.tsx
```

### ✅ REQUIRED: Handle Safe Areas

```typescript
// ✅ CORRECT: SafeAreaView
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView>
  <App />
</SafeAreaView>

// ❌ WRONG: No safe area handling (notch issues)
<View>
  <App />
</View>
```

### ✅ REQUIRED: Optimize Images

```typescript
// ✅ CORRECT: Specify dimensions, use FastImage for remote images
<Image
  source={{ uri: url }}
  style={{ width: 200, height: 200 }}
  resizeMode="cover"
/>

// ❌ WRONG: No dimensions (layout thrashing)
<Image source={{ uri: url }} />
```

---

## Conventions

### React Native Specific

- Platform-specific code when needed
- FlatList virtualization
- Proper safe area handling
- Image/asset optimization
- Hermes engine for performance
- Apply accessibility best practices: accessibilityLabel, accessibilityRole, screen reader support

---

## Decision Tree

```
Long list?
  → FlatList with keyExtractor and getItemLayout — see performance-rn.md for FlatList optimization

Platform-specific styling?
  → Platform.select() or Platform.OS === 'ios' — see platform-specific.md for platform patterns

Navigation?
  → React Navigation library — see navigation-patterns.md for Stack/Tab/Drawer setup

Gestures/Animations?
  → Gesture Handler + Reanimated — see gestures-animations.md for gesture and animation patterns

Forms?
  → Controlled components; consider react-hook-form for complex forms

State management?
  → Context for simple, Redux/Zustand for complex

Native feature needed?
  → Check if React Native API exists, otherwise use native module or library — see native-modules.md for native integration

Performance issue?
  → Enable Hermes, use React.memo(), avoid inline functions in renders, profile with Flipper — see performance-rn.md for optimization strategies

Testing?
  → Jest + React Native Testing Library, test on real devices
```

---

## Example

```typescript
import { View, Text, FlatList, Platform } from 'react-native';

const MyList = ({ items }) => (
  <FlatList
    data={items}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={{ padding: Platform.OS === 'ios' ? 10 : 8 }}>
        <Text>{item.name}</Text>
      </View>
    )}
  />
);
```

---

### Advanced Architecture Integration

**⚠️ Context Check**: Same as React. Mobile apps with business logic benefit.

### When to Apply

- AGENTS.md specifies architecture (Clean/SOLID/DDD)
- Enterprise apps (banking, healthcare, fintech, ERP)
- Complex logic (auth, payments, offline sync)
- Large teams (>10 devs)

### When NOT to Apply

- Simple apps (content, basic forms)
- Prototypes/MVPs
- No AGENTS.md mention

### Architecture Integration

**React Native uses same patterns as React**:

- **SOLID Principles** → Service classes, custom hooks, components
- **Clean Architecture** → `domain/`, `application/`, `infrastructure/`, `mobile/` (presentation)
- **Result Pattern** → Async operations, API calls, local storage
- **DIP** → Abstract services (API, storage, permissions) with adapters

**Mobile-specific architecture**:

```typescript
// domain/entities/User.ts (same as web)
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string
  ) {}
}

// infrastructure/services/SecureStorageService.ts (mobile adapter)
export class SecureStorageService implements IStorageService {
  async save(key: string, value: string): Promise<Result<void>> {
    try {
      await SecureStore.setItemAsync(key, value); // Expo SecureStore
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail('Storage error');
    }
  }
}

// mobile/screens/LoginScreen.tsx (presentation)
const LoginScreen = () => {
  const { execute, result } = useLoginUser(); // Clean Architecture use case

  return (
    <View>
      <TextInput onChangeText={setEmail} />
      <Button onPress={() => execute(email, password)} title="Login" />
      {result && !result.isSuccess && <Text>{result.error}</Text>}
    </View>
  );
};
```

### Complete Guide

See [frontend-integration.md](../architecture-patterns/references/frontend-integration.md) - same patterns as React.

See [architecture-patterns SKILL.md](../architecture-patterns/SKILL.md) for selection.

---

## Edge Cases

**Keyboard:** Use `KeyboardAvoidingView` or keyboard-aware scroll.

**Android back:** Handle with `BackHandler`, especially modals.

**Permissions:** Request runtime (Android 6+), handle denial.

**Deep linking:** Configure URL schemes (iOS/Android), handle app states.

**Offline:** Use `NetInfo`, queue operations offline.

**Bundle size:** Hermes, ProGuard (Android), Metro analysis.

**Debugging:** Flipper (network/Redux), React DevTools, Chrome.

---

## Resources

- https://reactnative.dev/docs/getting-started
- https://reactnative.dev/docs/performance
