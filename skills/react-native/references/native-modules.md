# Native Modules Guide

> Linking native code, bridges, third-party modules

## When to Read This

- Integrating native iOS/Android code
- Creating custom native modules
- Using third-party native libraries
- Bridging JavaScript and native code

---

## Linking Third-Party Libraries

### ✅ Auto-Linking (React Native 0.60+)

```bash
# Install package
npm install react-native-vector-icons

# iOS: Install pods (auto-linking)
cd ios && pod install

# Android: Auto-linked automatically
```

### ✅ Manual Linking (Legacy)

```bash
react-native link react-native-vector-icons
```

---

## Creating Native Modules

### ✅ iOS Native Module (Swift)

```swift
// CalendarModule.swift
@objc(CalendarModule)
class CalendarModule: NSObject {

  @objc
  func createEvent(_ name: String, location: String) {
    // Native iOS code
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

// CalendarModuleBridge.m
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CalendarModule, NSObject)
RCT_EXTERN_METHOD(createEvent:(NSString *)name location:(NSString *)location)
@end
```

### ✅ Android Native Module (Kotlin)

```kotlin
// CalendarModule.kt
class CalendarModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "CalendarModule"

  @ReactMethod
  fun createEvent(name: String, location: String) {
    // Native Android code
  }
}

// CalendarPackage.kt
class CalendarPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext):
    List<NativeModule> {
    return listOf(CalendarModule(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext) =
    emptyList<ViewManager<*, *>>()
}
```

---

## Using Native Modules

### ✅ Import and Use

```typescript
import { NativeModules } from "react-native";

const { CalendarModule } = NativeModules;

CalendarModule.createEvent("Party", "My House");
```

---

## Native UI Components

### ✅ iOS Native View

```swift
// MapViewManager.swift
@objc(MapViewManager)
class MapViewManager: RCTViewManager {

  override func view() -> UIView! {
    return MKMapView()
  }

  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
```

### ✅ Android Native View

```kotlin
// MapViewManager.kt
class MapViewManager : SimpleViewManager<MapView>() {

  override fun getName() = "MapView"

  override fun createViewInstance(reactContext: ThemedReactContext): MapView {
    return MapView(reactContext)
  }
}
```

### ✅ JavaScript Component

```typescript
import { requireNativeComponent } from "react-native";

const MapView = requireNativeComponent("MapView");

export default MapView;
```

---

## Sending Events to JavaScript

### ✅ iOS Event Emitter

```swift
@objc(EventEmitterModule)
class EventEmitterModule: RCTEventEmitter {

  override func supportedEvents() -> [String]! {
    return ["onDataReceived"]
  }

  @objc
  func sendEvent() {
    sendEvent(withName: "onDataReceived", body: ["data": "value"])
  }
}
```

### ✅ JavaScript Listener

```typescript
import { NativeEventEmitter, NativeModules } from "react-native";

const { EventEmitterModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(EventEmitterModule);

useEffect(() => {
  const subscription = eventEmitter.addListener("onDataReceived", (data) => {
    console.log("Received:", data);
  });

  return () => subscription.remove();
}, []);
```

---

## References

- [Native Modules](https://reactnative.dev/docs/native-modules-intro)
- [Native UI Components](https://reactnative.dev/docs/native-components-ios)
