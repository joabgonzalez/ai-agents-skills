---
name: react-native
description: React Native mobile development patterns and best practices.
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

## References

- https://reactnative.dev/docs/getting-started
- https://reactnative.dev/docs/performance
