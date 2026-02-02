---
name: react-native
description: React Native mobile development patterns and best practices. Platform-specific code, navigation, native modules, performance optimization. Trigger: When developing React Native mobile apps, implementing platform-specific features, or optimizing mobile performance.
skills:
  - conventions
  - a11y
  - react
  - typescript
dependencies:
  react-native: ">=0.70.0 <1.0.0"
  react: ">=17.0.0 <19.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# React Native Skill

## Overview

Mobile development patterns with React Native for iOS and Android applications.

## Objective

Guide developers in building cross-platform mobile apps with React Native using proper patterns and performance optimization.

---

## When to Use

Use this skill when:

- Building cross-platform mobile apps (iOS + Android)
- Using bare React Native (not Expo managed workflow)
- Implementing platform-specific features
- Optimizing mobile performance
- Integrating native modules

Don't use this skill for:

- Expo managed workflow (use expo skill)
- Web-only React apps (use react skill)
- Native iOS/Android development

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

- Use Platform-specific code when necessary
- Implement proper list virtualization with FlatList
- Handle safe areas properly
- Optimize images and assets
- Use Hermes engine for better performance

---

## Decision Tree

**Long list?** → Use `FlatList` with `keyExtractor` and `getItemLayout` for optimization.

**Platform-specific styling?** → Use `Platform.select()` or `Platform.OS === 'ios'`.

**Navigation?** → Use React Navigation library.

**Forms?** → Use controlled components, consider `react-hook-form` for complex forms.

**State management?** → Context for simple, Redux/Zustand for complex.

**Native feature needed?** → Check if React Native API exists, otherwise use native module or library.

**Performance issue?** → Enable Hermes, use `React.memo()`, avoid inline functions in renders, profile with Flipper.

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

## Edge Cases

**Keyboard handling:** Use `KeyboardAvoidingView` or `react-native-keyboard-aware-scroll-view`.

**Android back button:** Handle with `BackHandler` API, especially for modals.

**Permissions:** Request runtime permissions on Android 6+, handle denied state gracefully.

**Deep linking:** Configure URL schemes for both iOS and Android, handle different app states.

**Offline support:** Use `NetInfo` to detect connectivity, queue operations when offline.

**Bundle size:** Use Hermes, enable ProGuard on Android, analyze bundle with Metro.

**Debugging:** Use Flipper for network/Redux inspection, React DevTools, Chrome debugger.

---

## References

- https://reactnative.dev/docs/getting-started
- https://reactnative.dev/docs/performance
