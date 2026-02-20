# React Native References

> Comprehensive guides for React Native mobile development patterns

## Overview

This directory contains detailed reference documentation for React Native development, covering navigation, gestures, platform-specific code, performance optimization, and native modules integration.

---

## Quick Navigation

| Reference | Purpose | Read When |
| --------- | ------- | --------- |
| [navigation-patterns.md](./navigation-patterns.md) | React Navigation Stack/Tab/Drawer, deep linking, navigation lifecycle | Setting up navigation in any React Native app |
| [gestures-animations.md](./gestures-animations.md) | Gesture Handler, Animated API, Reanimated, animations | Adding gestures or animations to the app |
| [platform-specific.md](./platform-specific.md) | Platform.select, iOS/Android differences, platform APIs | Writing platform-specific code or handling OS differences |
| [performance-rn.md](./performance-rn.md) | FlatList optimization, navigation performance, memory management | Optimizing app performance or fixing scroll/render issues |
| [native-modules.md](./native-modules.md) | Linking native code, bridges, third-party modules | Integrating native iOS/Android code or third-party native modules |

---

## Reading Strategy

### For New React Native Projects

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [navigation-patterns.md](./navigation-patterns.md) for React Navigation setup
3. **MUST read**: [platform-specific.md](./platform-specific.md) for iOS/Android differences
4. CHECK: [gestures-animations.md](./gestures-animations.md) for interactive UIs

### For Performance Issues

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [performance-rn.md](./performance-rn.md) for FlatList, memory, and navigation performance
3. CHECK: [gestures-animations.md](./gestures-animations.md) for animation performance with Reanimated

### For Native Module Integration

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [native-modules.md](./native-modules.md) for bridging native code
3. CHECK: [platform-specific.md](./platform-specific.md) for platform API differences

### For Adding Animations/Gestures

1. **MUST read**: [gestures-animations.md](./gestures-animations.md) for Gesture Handler and Reanimated
2. CHECK: [performance-rn.md](./performance-rn.md) for animation performance considerations

---

## File Descriptions

### [navigation-patterns.md](./navigation-patterns.md)

**React Navigation setup and routing patterns**

- Stack, Tab, and Drawer navigator configuration
- Deep linking setup and handling
- Navigation lifecycle and events
- Passing params between screens
- Authentication flow patterns

### [gestures-animations.md](./gestures-animations.md)

**Gesture and animation implementation**

- React Native Gesture Handler setup and gesture types
- Animated API for basic animations
- Reanimated 2 for high-performance animations
- Combining gestures and animations (swipe, drag, pinch)
- Shared element transitions

### [platform-specific.md](./platform-specific.md)

**iOS and Android platform differences**

- Platform.select and Platform.OS usage
- Platform-specific file extensions (.ios.ts, .android.ts)
- iOS-specific APIs and Android-specific APIs
- Handling status bar, safe areas, and notches
- Permission handling differences

### [performance-rn.md](./performance-rn.md)

**React Native performance optimization**

- FlatList and SectionList optimization (keyExtractor, getItemLayout, windowSize)
- Navigation performance (lazy loading, screen preloading)
- Memory management and leak prevention
- JavaScript thread vs UI thread performance
- Hermes engine and profiling tools

### [native-modules.md](./native-modules.md)

**Native module integration and bridging**

- Linking third-party native modules
- Creating custom native modules (iOS/Android)
- JavaScript bridge communication patterns
- TurboModules and JSI for high-performance bridging
- Debugging native module issues

---

## Cross-Reference Map

- [navigation-patterns.md](./navigation-patterns.md) → Extends SKILL.md navigation patterns; pairs with platform-specific.md for OS-aware routing
- [gestures-animations.md](./gestures-animations.md) → Extends SKILL.md interaction patterns; pairs with performance-rn.md for Reanimated performance
- [platform-specific.md](./platform-specific.md) → Extends SKILL.md platform guidance; pairs with navigation-patterns.md and native-modules.md for OS integration
- [performance-rn.md](./performance-rn.md) → Extends SKILL.md performance patterns; pairs with gestures-animations.md for animation optimization
- [native-modules.md](./native-modules.md) → Extends SKILL.md native integration; pairs with platform-specific.md for platform API access
- Related skills: [react](../../react/SKILL.md), [typescript](../../typescript/SKILL.md), [interface-design](../../interface-design/SKILL.md)

---

## External References

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/)
