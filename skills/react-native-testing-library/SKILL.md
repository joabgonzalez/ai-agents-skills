---
name: react-native-testing-library
description: "User-centric React Native component testing. Trigger: When testing React Native components with RNTL."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: tooling
  skills:
    - react-native
    - jest
  dependencies:
    "@testing-library/react-native": ">=12.0.0 <14.0.0"
    "@testing-library/jest-native": ">=5.0.0"
---

# React Native Testing Library

Component testing for React Native apps, focusing on behavior over implementation details.

## When to Use

- Testing React Native components and screens
- Simulating user interactions (press, type, scroll)
- Writing maintainable UI tests that resist refactoring
- Testing accessibility features and labels
- Verifying component behavior from user perspective

Don't use for:

- End-to-end tests across app (use Detox or Maestro)
- Testing native modules directly (use native test frameworks)
- Performance benchmarking (use React Native performance tools)

---

## Critical Patterns

### ✅ REQUIRED: Query by accessibility, not implementation

Use queries that reflect how users and assistive tech interact with the app.

```typescript
import { render, screen } from '@testing-library/react-native';

// ❌ WRONG: Query by implementation details
const button = container.findByType('TouchableOpacity');
const text = container.findByProps({ testID: 'submit-button-text' });

// ✅ CORRECT: Query by accessibility
const button = screen.getByRole('button', { name: /submit/i });
const text = screen.getByText(/submit/i);
const input = screen.getByLabelText(/email/i);
```

### ✅ REQUIRED: Use fireEvent for interactions

Simulate user interactions with fireEvent.

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';

// ✅ CORRECT: Simulate user interactions
test('increments counter on button press', () => {
  render(<Counter />);

  const button = screen.getByRole('button', { name: /increment/i });
  const count = screen.getByText(/count: 0/i);

  fireEvent.press(button);

  expect(screen.getByText(/count: 1/i)).toBeOnTheScreen();
});
```

### ✅ REQUIRED: Test async updates with findBy

Use findBy queries for async UI updates.

```typescript
import { render, screen, waitFor } from '@testing-library/react-native';

// ✅ CORRECT: Wait for async updates
test('loads and displays user data', async () => {
  render(<UserProfile userId="123" />);

  // findBy queries automatically wait (default: 1000ms timeout)
  const userName = await screen.findByText(/john doe/i);
  expect(userName).toBeOnTheScreen();

  // Alternative: Use waitFor for complex conditions
  await waitFor(() => {
    expect(screen.getByText(/john doe/i)).toBeOnTheScreen();
  });
});
```

### ✅ REQUIRED: Mock native modules

Mock React Native native modules for stable tests.

```typescript
// __mocks__/@react-native-async-storage/async-storage.js
export default {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// test file
jest.mock('@react-native-async-storage/async-storage');

import AsyncStorage from '@react-native-async-storage/async-storage';

test('saves data to storage', async () => {
  render(<SaveButton data={{ name: 'John' }} />);

  const button = screen.getByRole('button', { name: /save/i });
  fireEvent.press(button);

  await waitFor(() => {
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'userData',
      JSON.stringify({ name: 'John' })
    );
  });
});
```

---

## Decision Tree

```
Selecting elements?
  → Use accessibility queries first (getByRole, getByLabelText)
  → Fallback to getByText for content
  → Last resort: getByTestId for elements without accessible labels

Simulating interactions?
  → Use fireEvent.press for touch
  → Use fireEvent.changeText for TextInput
  → Use fireEvent.scroll for ScrollView

Waiting for async updates?
  → Use findBy queries for simple waits
  → Use waitFor for complex conditions
  → Use waitForElementToBeRemoved for disappearing elements

Testing platform-specific UI?
  → Mock Platform.OS in test setup
  → Test both iOS and Android variants
  → Use Platform.select() in components for conditional rendering

Mocking native modules?
  → Create manual mock in __mocks__/ directory
  → Use jest.mock() to activate mock
  → Reset mocks between tests with jest.clearAllMocks()

Testing navigation?
  → Mock @react-navigation/native
  → Test navigation.navigate() calls
  → Use createNavigationContainerRef for integration tests

Testing with context (Redux, theme)?
  → Create custom render function with providers
  → Wrap component in necessary providers
  → Share wrapper across test suite
```

---

## Edge Cases

- **Native module mocks**: Some modules require specific mock implementations. Check library docs for recommended mocks (e.g., react-native-reanimated requires babel plugin).

- **Async UI updates**: React Native's async rendering can cause race conditions. Always use findBy or waitFor, never setTimeout.

- **Platform-specific UI**: Mock Platform.OS to test both iOS and Android variants. Reset mock after each test.

- **Navigation testing**: Mocking navigation can be complex. Consider integration tests with createNavigationContainerRef for complex flows.

- **Accessibility labels**: If label not set, queries fail. Always set accessibilityLabel or accessible={true} on interactive elements.

---

## Checklist

- [ ] Queries use accessibility-first approach (getByRole, getByLabelText)
- [ ] Interactions use fireEvent (press, changeText, scroll)
- [ ] Async updates use findBy or waitFor
- [ ] Native modules mocked appropriately
- [ ] Platform-specific UI tested for both iOS and Android
- [ ] Tests pass without console warnings
- [ ] jest-native matchers used (toBeOnTheScreen, toHaveTextContent)
- [ ] Custom render function created if using providers (Redux, theme)
- [ ] Mocks reset between tests (jest.clearAllMocks in beforeEach)
- [ ] Accessibility labels verified on interactive elements

---

## Example

```typescript
// Button.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { AsyncButton } from './AsyncButton';

// Custom render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={defaultTheme}>
      {ui}
    </ThemeProvider>
  );
};

describe('AsyncButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading state during async operation', async () => {
    const onPress = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderWithProviders(<AsyncButton onPress={onPress}>Submit</AsyncButton>);

    const button = screen.getByRole('button', { name: /submit/i });

    // Initial state
    expect(button).toBeEnabled();
    expect(screen.queryByText(/loading/i)).not.toBeOnTheScreen();

    // Press button
    fireEvent.press(button);

    // Loading state
    expect(button).toBeDisabled();
    expect(await screen.findByText(/loading/i)).toBeOnTheScreen();

    // Completed state
    await waitFor(() => {
      expect(button).toBeEnabled();
      expect(screen.queryByText(/loading/i)).not.toBeOnTheScreen();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('handles error state', async () => {
    const onPress = jest.fn(() => Promise.reject(new Error('Failed')));

    renderWithProviders(<AsyncButton onPress={onPress}>Submit</AsyncButton>);

    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.press(button);

    const errorMessage = await screen.findByText(/failed/i);
    expect(errorMessage).toBeOnTheScreen();
  });
});
```

---

## Resources

- https://callstack.github.io/react-native-testing-library/ - Official RNTL documentation
- https://github.com/testing-library/jest-native - Jest matchers for React Native
- https://reactnative.dev/docs/testing-overview - React Native testing guide
- [react-native](../react-native/SKILL.md) - React Native patterns
- [jest](../jest/SKILL.md) - Jest configuration and patterns
- [unit-testing](../unit-testing/SKILL.md) - General testing principles
