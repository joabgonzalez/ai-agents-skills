# Gestures & Animations Guide

> Gesture Handler, Animated API, Reanimated patterns

## When to Read This

- Implementing gestures (tap, pan, swipe)
- Creating animations
- Using React Native Reanimated
- Performance-critical animations

---

## Gesture Handler

### ✅ Basic Tap Gesture

```typescript
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const tap = Gesture.Tap()
  .onStart(() => {
    console.log('Tap started');
  })
  .onEnd(() => {
    console.log('Tap ended');
  });

<GestureDetector gesture={tap}>
  <View style={styles.box} />
</GestureDetector>
```

### ✅ Pan Gesture

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onChange((event) => {
      translateX.value += event.changeX;
      translateY.value += event.changeY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
```

---

## Animated API

### ✅ Basic Animation

```typescript
import { Animated } from 'react-native';

function FadeInView({ children }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
}
```

### ✅ Sequence Animations

```typescript
Animated.sequence([
  Animated.timing(opacity, {
    toValue: 1,
    duration: 500,
    useNativeDriver: true,
  }),
  Animated.timing(opacity, {
    toValue: 0,
    duration: 500,
    useNativeDriver: true,
  }),
]).start();
```

### ✅ Parallel Animations

```typescript
Animated.parallel([
  Animated.timing(opacity, {
    toValue: 1,
    duration: 500,
    useNativeDriver: true,
  }),
  Animated.timing(scale, {
    toValue: 1.5,
    duration: 500,
    useNativeDriver: true,
  }),
]).start();
```

---

## Reanimated (v3)

### ✅ Shared Values

```typescript
const width = useSharedValue(100);

const animatedStyle = useAnimatedStyle(() => ({
  width: width.value,
}));

<Animated.View style={animatedStyle} />
```

### ✅ Animations with Timing

```typescript
width.value = withTiming(200, { duration: 300 });
```

### ✅ Animations with Spring

```typescript
scale.value = withSpring(1.5);
```

### ✅ Layout Animations

```typescript
import { Layout, FadeIn, FadeOut } from 'react-native-reanimated';

<Animated.View
  entering={FadeIn}
  exiting={FadeOut}
  layout={Layout.springify()}
>
  {/* content */}
</Animated.View>
```

---

## References

- [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/)
