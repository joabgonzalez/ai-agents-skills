---
name: expo
description: "Managed workflow for cross-platform mobile apps with EAS. Trigger: When developing with Expo, configuring EAS services, or building mobile apps."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: framework
  skills:
    - react-native
  dependencies:
    expo: ">=50.0.0 <51.0.0"
    react-native: ">=0.73.0 <1.0.0"
    react: ">=18.0.0 <19.0.0"
  allowed-tools:
    - file-reader
---

# Expo Skill

Cross-platform mobile with Expo managed workflow. Setup, native features (EAS Build/Update), deployment with TypeScript and React Native.

## When to Use

- Cross-platform mobile (iOS + Android)
- Expo managed workflow
- EAS Build/Update config
- Native features via Expo SDK
- OTA updates

Don't use for:

- Bare React Native (use react-native skill)
- Web-only apps
- Unsupported custom native modules

---

## Critical Patterns

### ✅ REQUIRED: Use Expo SDK for Native Features

```typescript
// ✅ CORRECT: Expo SDK modules
import * as Location from "expo-location";
import { Camera } from "expo-camera";

// ❌ WRONG: Direct React Native linking (use Expo modules)
import { NativeModules } from "react-native";
```

### ✅ REQUIRED: Handle Permissions Properly

```typescript
// ✅ CORRECT: Request permissions before using
const { status } = await Location.requestForegroundPermissionsAsync();
if (status === "granted") {
  const location = await Location.getCurrentPositionAsync();
}

// ❌ WRONG: No permission check
const location = await Location.getCurrentPositionAsync(); // May crash
```

### ✅ REQUIRED: Use TypeScript

```typescript
// ✅ CORRECT: Typed props and state
interface Props {
  title: string;
}

const Component: React.FC<Props> = ({ title }) => {
  const [count, setCount] = useState<number>(0);
};
```

---

## Conventions

- TypeScript for type safety
- React Native patterns
- Expo SDK for native features
- Expo Go for dev testing
- Error handling for native features

---

## Decision Tree

**Native feature?** → Check Expo SDK first.

**Custom native code?** → Config plugins or eject.

**Store builds?** → EAS Build (cloud).

**OTA updates?** → EAS Update.

**Platform code?** → `Platform.select()` or `.ios.tsx`/`.android.tsx`.

**Testing?** → Expo Go (dev), devices/simulators (final).

**Navigation?** → Expo Router or React Navigation.

---

## Example

```typescript
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Welcome to Expo</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

## Edge Cases

- Platform code via Platform API
- Proper permission management
- Test iOS and Android
- Handle offline

## References

- https://docs.expo.dev/
- https://reactnative.dev/
