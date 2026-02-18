---
name: react-native
description: "Cross-platform mobile development with React Native. Trigger: When developing mobile apps, implementing platform features, or optimizing performance."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: framework
  skills:
    - react
  dependencies:
    react-native: ">=0.70.0 <1.0.0"
    react: ">=17.0.0 <19.0.0"
---

# React Native Skill

Cross-platform iOS/Android with React Native. Native components, platform code, navigation, and performance.

## When to Use

- Mobile apps for iOS/Android
- Platform-specific features
- Native modules/APIs
- Performance/bundle optimization

Don't use for:
- Web apps (use react skill)
- Expo-managed (use expo skill)

---
| Gestures, animations                 | ✅ Yes        | ✅ Yes           | gestures-animations.md (required)   |
| Platform-specific code (iOS/Android) | ✅ Yes        | ✅ Yes           | platform-specific.md (required)     |
| Performance optimization             | ✅ Yes        | ✅ Yes           | performance-rn.md (required)        |
| Native modules integration           | ✅ Yes        | ✅ Yes           | native-modules.md (required)        |
| Multiple advanced features           | ✅ Yes        | ✅ Yes           | All relevant references             |

### Available References

All reference files located in `skills/react-native/references/`:

- **README.md**: Overview of all React Native references and navigation guide
- **navigation-patterns.md**: React Navigation Stack/Tab/Drawer, deep linking (required for navigation)
- **gestures-animations.md**: Gesture Handler, Animated API, Reanimated (required for animations)
- **platform-specific.md**: Platform.select, iOS/Android differences (required for platform code)
- **performance-rn.md**: FlatList optimization, memory management (required for optimization)
- **native-modules.md**: Linking native code, bridges (required for native integration)

### Conditional Language

- **"MUST read"** → **Obligatory** - Read immediately before proceeding
- **"CHECK"** or "Consider" → **Suggested** - Read if you need deeper understanding
- **"OPTIONAL"** → **Ignorable** - Read only for learning or edge cases

### Example: Navigation

```
1. User: "Stack and Tab navigation"
2. Read: SKILL.md
3. Decision Tree: "Navigation? → navigation-patterns.md"
4. Read: navigation-patterns.md
5. Execute: Stack/Tab navigators
```

---

## When to Use

Use when:

- Cross-platform mobile (iOS + Android)
- Bare React Native (not Expo managed)
- Platform-specific features
- Mobile performance optimization
- Native module integration

Don't use for:

- Expo managed (use expo skill)
- Web-only React (use react skill)
- Native iOS/Android dev

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

Refer to conventions for:

- Code organization

Refer to a11y for:

- Accessibility labels
- Screen reader support

Refer to react for:

- Component patterns
- Hooks usage

### React Native Specific

- Platform-specific code when needed
- FlatList virtualization
- Proper safe area handling
- Image/asset optimization
- Hermes engine for performance

---

## Decision Tree

**Long list?** → Use `FlatList` with `keyExtractor` and `getItemLayout` for optimization. **[CRITICAL] See** `references/performance-rn.md` for FlatList optimization.

**Platform-specific styling?** → Use `Platform.select()` or `Platform.OS === 'ios'`. **[CRITICAL] See** `references/platform-specific.md` for platform patterns.

**Navigation?** → Use React Navigation library. **[CRITICAL] See** `references/navigation-patterns.md` for Stack/Tab/Drawer setup.

**Gestures/Animations?** → Use Gesture Handler + Reanimated. **[CRITICAL] See** `references/gestures-animations.md` for gesture and animation patterns.

**Forms?** → Use controlled components, consider `react-hook-form` for complex forms.

**State management?** → Context for simple, Redux/Zustand for complex.

**Native feature needed?** → Check if React Native API exists, otherwise use native module or library. **[CRITICAL] See** `references/native-modules.md` for native integration.

**Performance issue?** → Enable Hermes, use `React.memo()`, avoid inline functions in renders, profile with Flipper. **[CRITICAL] See** `references/performance-rn.md` for optimization strategies.

**Testing?** → Use Jest + React Native Testing Library, test on real devices.

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

## Advanced Architecture Patterns

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

## References

- https://reactnative.dev/docs/getting-started
- https://reactnative.dev/docs/performance
