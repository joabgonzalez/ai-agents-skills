# Platform-Specific Patterns

> Platform.select, iOS/Android differences, platform APIs

## When to Read This

- Writing platform-specific code
- Handling iOS vs Android differences
- Using platform-specific APIs
- Conditional styling per platform

---

## Platform Detection

### ✅ Platform.select

```typescript
import { Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});
```

### ✅ Platform.OS

```typescript
if (Platform.OS === "ios") {
  // iOS-specific code
} else if (Platform.OS === "android") {
  // Android-specific code
}
```

### ✅ Platform.Version

```typescript
if (Platform.Version >= 23) {
  // Android API 23 (Marshmallow) or higher
}
```

---

## Platform-Specific Files

### ✅ File Extensions

```
Button.ios.tsx  // iOS-specific
Button.android.tsx  // Android-specific
Button.tsx  // Fallback
```

```typescript
// Import works automatically based on platform
import Button from "./Button";
```

---

## Common Differences

### ✅ Status Bar

```typescript
import { StatusBar } from 'react-native';

<StatusBar
  barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
  backgroundColor={Platform.OS === 'android' ? '#000' : undefined}
/>
```

### ✅ Safe Area

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }}>
  {/* iOS: respects notch, Android: respects status bar */}
</SafeAreaView>
```

### ✅ Shadow Styles

```typescript
// ❌ WRONG: Using iOS shadow on Android
<View style={{ shadowColor: '#000', shadowOpacity: 0.3 }} />

// ✅ CORRECT: Platform-specific shadow
<View
  style={{
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  }}
/>
```

---

## Platform APIs

### ✅ Keyboard Handling

```typescript
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  {/* content */}
</KeyboardAvoidingView>
```

### ✅ ActionSheet (iOS) vs Menu (Android)

```typescript
if (Platform.OS === "ios") {
  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: ["Cancel", "Delete"],
      destructiveButtonIndex: 1,
      cancelButtonIndex: 0,
    },
    (buttonIndex) => {
      // handle
    },
  );
} else {
  // Use Android native menu or custom component
}
```

---

## References

- [Platform-Specific Code](https://reactnative.dev/docs/platform-specific-code)
