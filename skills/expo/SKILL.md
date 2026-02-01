---
name: expo
description: Skill for building, testing, and deploying cross-platform mobile applications using Expo with React Native, following modern best practices.
dependencies:
  expo: ">=50.0.0 <51.0.0"
  react-native: ">=0.73.0 <1.0.0"
  react: ">=18.0.0 <19.0.0"
allowed-tools:
  - documentation-reader
  - web-search
  - file-reader
---

# Expo Skill

## Overview

This skill provides guidance for developing cross-platform mobile applications using Expo, covering setup, development workflow, native features, and deployment.

## Objective

Enable developers to build, test, and deploy mobile applications efficiently using Expo's managed workflow with proper TypeScript support and React Native best practices.

## Conventions

- Use TypeScript for type safety
- Follow React Native component patterns
- Leverage Expo SDK for native features
- Use Expo Go for development testing
- Implement proper error handling for native features

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

- Handle platform-specific code with Platform API
- Manage permissions properly
- Test on both iOS and Android
- Handle offline scenarios

## References

- https://docs.expo.dev/
- https://reactnative.dev/
