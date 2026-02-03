# React Navigation Patterns

> Stack, Tab, Drawer navigation, deep linking, lifecycle

## When to Read This

- Setting up React Navigation (Stack, Tab, Drawer)
- Implementing deep linking
- Managing navigation lifecycle
- Passing params between screens
- Type-safe navigation with TypeScript

---

## Stack Navigator

### ✅ Basic Stack Navigation

```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Details: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### ✅ Type-Safe Navigation

```typescript
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

function DetailsScreen({ route, navigation }: Props) {
  const { id } = route.params; // Type-safe params

  return (
    <Button
      title="Go Back"
      onPress={() => navigation.goBack()}
    />
  );
}
```

### ✅ Navigation Options

```typescript
<Stack.Screen
  name="Details"
  component={DetailsScreen}
  options={{
    title: 'Details',
    headerStyle: { backgroundColor: '#f4511e' },
    headerTintColor: '#fff',
    headerRight: () => (
      <Button onPress={() => alert('This is a button!')} title="Info" />
    ),
  }}
/>
```

---

## Tab Navigator

### ✅ Bottom Tab Navigation

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = route.name === 'Home' ? 'home' : 'settings';
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
```

---

## Drawer Navigator

### ✅ Drawer Navigation

```typescript
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}
```

---

## Navigation Actions

### ✅ Navigate with Params

```typescript
navigation.navigate("Details", { id: "123" });
```

### ✅ Push (Always New Screen)

```typescript
navigation.push("Details", { id: "456" });
```

### ✅ Go Back

```typescript
navigation.goBack();
```

### ✅ Reset Navigation State

```typescript
navigation.reset({
  index: 0,
  routes: [{ name: "Home" }],
});
```

---

## Deep Linking

### ✅ Configure Deep Links

```typescript
const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: '',
      Details: 'details/:id',
    },
  },
};

<NavigationContainer linking={linking}>
  {/* ... */}
</NavigationContainer>
```

---

## Navigation Lifecycle

### ✅ Focus/Blur Events

```typescript
import { useFocusEffect } from "@react-navigation/native";

useFocusEffect(
  React.useCallback(() => {
    // Screen focused - do something
    fetchData();

    return () => {
      // Screen unfocused - cleanup
    };
  }, []),
);
```

---

## References

- [React Navigation](https://reactnavigation.org/)
- [Type Checking](https://reactnavigation.org/docs/typescript/)
