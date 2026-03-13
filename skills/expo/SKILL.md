---
name: expo
description: "Managed workflow for cross-platform mobile apps with EAS. Trigger: When developing with Expo, configuring EAS services, or building mobile apps."
license: "Apache 2.0"
metadata:
  version: "1.1"
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

# Expo

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

### ✅ REQUIRED: EAS Build Configuration

Configure build profiles before submitting to app stores.

```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": {}
  }
}
```

```bash
# Build for all platforms (production)
eas build --platform all --profile production
# Run development build on device
eas build --platform ios --profile development
```

### ✅ REQUIRED: Over-the-Air Updates (EAS Update)

Configure OTA updates in `app.json`. Match `runtimeVersion` to native changes.

```json
{
  "expo": {
    "updates": { "url": "https://u.expo.dev/<project-id>" },
    "runtimeVersion": { "policy": "appVersion" }
  }
}
```

```bash
# Publish JS-only update (no native change needed)
eas update --branch production --message "Fix login crash"
```

### ❌ NEVER: Eject Without a Clear Reason

```typescript
// ❌ WRONG: Ejecting to bare workflow for minor native customization
// Loses: Expo Go dev testing, managed OTA updates, EAS Build simplicity

// ✅ CORRECT: Config plugins handle most native customizations
const { withInfoPlist } = require('@expo/config-plugins');
module.exports = withInfoPlist(config, (config) => {
  config.modResults.NSCameraUsageDescription = "For QR scanning";
  return config;
});
// Only eject when config plugins cannot satisfy the requirement
```

---

## Decision Tree

```
Native feature?
  → Check Expo SDK first

Custom native code?
  → Config plugins or eject

Store builds?
  → EAS Build (cloud)

OTA updates?
  → EAS Update

Platform code?
  → Platform.select() or .ios.tsx/.android.tsx

Testing?
  → Expo Go (dev), devices/simulators (final)

Navigation?
  → Expo Router or React Navigation
```

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

---

## Edge Cases

- **Platform-specific code**: Use `Platform.select()` for inline differences; platform-specific file extensions (`.ios.tsx`, `.android.tsx`) for large divergences between platforms.

- **Permission denial**: Always handle the denied state — show an explanation UI and guide the user to device settings. Never assume permission is granted on subsequent launches.

- **OTA update conflicts**: JS-only changes publish via `eas update`. Any native code change (new SDK module, config plugin change) requires a new app store build with a matching `runtimeVersion` bump.

- **Offline mode**: Use `@react-native-community/netinfo` to detect connectivity. Cache data with `AsyncStorage` or MMKV. Show a visible offline indicator and gracefully block network-dependent actions.

- **Custom native modules**: Use Expo config plugins first. Use a development client (`expo-dev-client`) for modules not available in Expo Go. Only eject to bare workflow when config plugins cannot satisfy the requirement.

---

## Checklist

- [ ] `eas init` run — project linked to EAS
- [ ] `eas.json` configured with development, preview, production profiles
- [ ] Permissions declared in `app.json` (`android.permissions`, `ios.infoPlist`)
- [ ] OTA updates configured (`updates.url`, `runtimeVersion.policy`)
- [ ] Platform-specific code uses `Platform.select()` or platform file extensions
- [ ] Offline state handled (network detection + cached data fallback)
- [ ] TypeScript strict mode enabled
- [ ] All native features use Expo SDK modules (not direct React Native linking)
- [ ] Expo Go used for dev, physical device/simulator for final testing

---

## Resources

- https://docs.expo.dev/
- https://reactnative.dev/
