# React State Machines

## Core Patterns

### `useReducer` as a Minimal State Machine

`useReducer` with an explicit state union is a state machine — no library required. The reducer IS the transition function.

```typescript
import { useReducer } from 'react';

// State union — only one state active at a time
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

type FetchEvent<T> =
  | { type: 'FETCH' }
  | { type: 'SUCCESS'; data: T }
  | { type: 'FAILURE'; error: string }
  | { type: 'RESET' };

function fetchReducer<T>(state: FetchState<T>, event: FetchEvent<T>): FetchState<T> {
  switch (state.status) {
    case 'idle':
      if (event.type === 'FETCH') return { status: 'loading' };
      break;
    case 'loading':
      if (event.type === 'SUCCESS') return { status: 'success', data: event.data };
      if (event.type === 'FAILURE') return { status: 'error', error: event.error };
      break;
    case 'success':
    case 'error':
      if (event.type === 'RESET') return { status: 'idle' };
      break;
  }
  return state; // invalid event for current state — no-op
}

// Hook wrapping the state machine
function useFetchMachine<T>(fetchFn: () => Promise<T>) {
  const [state, dispatch] = useReducer(fetchReducer<T>, { status: 'idle' });

  const fetch = async () => {
    if (state.status === 'loading') return; // guard: no concurrent fetches
    dispatch({ type: 'FETCH' });
    try {
      const data = await fetchFn();
      dispatch({ type: 'SUCCESS', data });
    } catch (err) {
      dispatch({ type: 'FAILURE', error: (err as Error).message });
    }
  };

  return { state, fetch, reset: () => dispatch({ type: 'RESET' }) };
}

// Usage in a component
function UserProfile({ userId }: { userId: string }) {
  const { state, fetch } = useFetchMachine(() =>
    fetch(`/api/users/${userId}`).then((r) => r.json())
  );

  return (
    <div>
      {state.status === 'idle'    && <button onClick={fetch}>Load User</button>}
      {state.status === 'loading' && <p>Loading...</p>}
      {state.status === 'success' && <p>Name: {state.data.name}</p>}
      {state.status === 'error'   && <p>Error: {state.error}</p>}
    </div>
  );
}
```

The reducer pattern makes impossible states unrepresentable: `state.data` only exists when `status === 'success'`, enforced by TypeScript's discriminated union.

---

### Form Wizard Implementation (Multi-Step Form)

A form wizard has explicit states: which step is active, whether each step is valid, and the submission outcome. Modeling this as a machine eliminates `currentStep === 3 && isLoading && hasError` bugs.

```typescript
import { useReducer } from 'react';

// Wizard states
type WizardState =
  | { status: 'filling';    step: 1 | 2 | 3; }
  | { status: 'validating'; step: 1 | 2 | 3; }
  | { status: 'submitting'; }
  | { status: 'success';    confirmationId: string }
  | { status: 'error';      error: string; step: 1 | 2 | 3 };

type WizardEvent =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'VALIDATE_START' }
  | { type: 'VALIDATE_SUCCESS' }
  | { type: 'VALIDATE_FAILURE'; error: string }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS'; confirmationId: string }
  | { type: 'SUBMIT_FAILURE'; error: string }
  | { type: 'RETRY' };

function wizardReducer(state: WizardState, event: WizardEvent): WizardState {
  switch (state.status) {
    case 'filling':
      if (event.type === 'NEXT' && state.step < 3) {
        return { status: 'validating', step: state.step };
      }
      if (event.type === 'BACK' && state.step > 1) {
        return { status: 'filling', step: (state.step - 1) as 1 | 2 | 3 };
      }
      if (event.type === 'SUBMIT' && state.step === 3) {
        return { status: 'submitting' };
      }
      break;

    case 'validating':
      if (event.type === 'VALIDATE_SUCCESS') {
        const nextStep = (state.step + 1) as 1 | 2 | 3;
        return state.step < 3
          ? { status: 'filling', step: nextStep }
          : { status: 'submitting' };
      }
      if (event.type === 'VALIDATE_FAILURE') {
        return { status: 'error', error: event.error, step: state.step };
      }
      break;

    case 'error':
      if (event.type === 'RETRY') {
        return { status: 'filling', step: state.step };
      }
      break;

    case 'submitting':
      if (event.type === 'SUBMIT_SUCCESS') {
        return { status: 'success', confirmationId: event.confirmationId };
      }
      if (event.type === 'SUBMIT_FAILURE') {
        return { status: 'error', error: event.error, step: 3 };
      }
      break;
  }
  return state;
}

// Hook
function useFormWizard() {
  const [state, dispatch] = useReducer(wizardReducer, {
    status: 'filling',
    step: 1,
  });

  const next = () => dispatch({ type: 'NEXT' });
  const back = () => dispatch({ type: 'BACK' });

  const validateStep = async (validateFn: () => Promise<void>) => {
    dispatch({ type: 'VALIDATE_START' });
    try {
      await validateFn();
      dispatch({ type: 'VALIDATE_SUCCESS' });
    } catch (err) {
      dispatch({ type: 'VALIDATE_FAILURE', error: (err as Error).message });
    }
  };

  const submit = async (submitFn: () => Promise<string>) => {
    dispatch({ type: 'SUBMIT' });
    try {
      const confirmationId = await submitFn();
      dispatch({ type: 'SUBMIT_SUCCESS', confirmationId });
    } catch (err) {
      dispatch({ type: 'SUBMIT_FAILURE', error: (err as Error).message });
    }
  };

  return { state, next, back, validateStep, submit, retry: () => dispatch({ type: 'RETRY' }) };
}

// Render helper
function FormWizard() {
  const { state, next, back, validateStep, submit } = useFormWizard();

  if (state.status === 'success') {
    return <p>Order confirmed! ID: {state.confirmationId}</p>;
  }

  return (
    <div>
      {(state.status === 'filling' || state.status === 'validating' || state.status === 'error') && (
        <>
          <p>Step {state.step} of 3</p>
          {state.status === 'error' && <p className="error">{state.error}</p>}
          <button onClick={back} disabled={state.step === 1 || state.status !== 'filling'}>
            Back
          </button>
          <button onClick={() => validateStep(async () => { /* validate current step */ })}
            disabled={state.status === 'validating'}>
            {state.status === 'validating' ? 'Validating...' : 'Next'}
          </button>
        </>
      )}
      {state.status === 'submitting' && <p>Submitting...</p>}
    </div>
  );
}
```

---

### Async Data Fetching State Machine (IDLE/LOADING/SUCCESS/ERROR)

A reusable hook that encodes the full async lifecycle as a state machine. Works for any async operation.

```typescript
import { useReducer, useCallback, useRef } from 'react';

type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading'; requestId: string }
  | { status: 'success'; data: T; loadedAt: Date }
  | { status: 'error'; error: string; retryCount: number };

type AsyncEvent<T> =
  | { type: 'LOAD'; requestId: string }
  | { type: 'SUCCESS'; data: T; requestId: string }
  | { type: 'FAILURE'; error: string; requestId: string }
  | { type: 'RESET' }
  | { type: 'RETRY' };

function asyncReducer<T>(state: AsyncState<T>, event: AsyncEvent<T>): AsyncState<T> {
  switch (state.status) {
    case 'idle':
      if (event.type === 'LOAD') return { status: 'loading', requestId: event.requestId };
      break;
    case 'loading':
      // Only accept responses matching the current requestId — prevents stale updates
      if (event.type === 'SUCCESS' && event.requestId === state.requestId) {
        return { status: 'success', data: event.data, loadedAt: new Date() };
      }
      if (event.type === 'FAILURE' && event.requestId === state.requestId) {
        return { status: 'error', error: event.error, retryCount: 0 };
      }
      if (event.type === 'LOAD') return { status: 'loading', requestId: event.requestId };
      break;
    case 'success':
      if (event.type === 'LOAD') return { status: 'loading', requestId: event.requestId };
      if (event.type === 'RESET') return { status: 'idle' };
      break;
    case 'error':
      if (event.type === 'RETRY') {
        return { ...state, retryCount: state.retryCount + 1, status: 'idle' };
      }
      if (event.type === 'RESET') return { status: 'idle' };
      break;
  }
  return state;
}

function useAsyncMachine<T>(asyncFn: () => Promise<T>) {
  const [state, dispatch] = useReducer(asyncReducer<T>, { status: 'idle' });
  const requestCounter = useRef(0);

  const load = useCallback(async () => {
    const requestId = String(++requestCounter.current);
    dispatch({ type: 'LOAD', requestId });

    try {
      const data = await asyncFn();
      dispatch({ type: 'SUCCESS', data, requestId });
    } catch (err) {
      dispatch({ type: 'FAILURE', error: (err as Error).message, requestId });
    }
  }, [asyncFn]);

  return {
    state,
    load,
    retry: () => {
      dispatch({ type: 'RETRY' });
      load();
    },
    reset: () => dispatch({ type: 'RESET' }),
  };
}

// Usage
function UserList() {
  const { state, load, retry } = useAsyncMachine(() =>
    fetch('/api/users').then((r) => r.json())
  );

  return (
    <div>
      {state.status === 'idle' && (
        <button onClick={load}>Load Users</button>
      )}
      {state.status === 'loading' && <p>Loading...</p>}
      {state.status === 'success' && (
        <ul>
          {state.data.map((u: { id: string; name: string }) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      )}
      {state.status === 'error' && (
        <div>
          <p>Error: {state.error} (retry {state.retryCount})</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
    </div>
  );
}
```

The `requestId` guard prevents a classic React bug: a slow first request resolves after a fast second request, replacing newer data with stale data.

---

### `useMachine` Hook from XState for React Integration

`@xstate/react` provides `useMachine` to connect an XState machine to a React component. The hook drives re-renders on state transitions and provides a typed `send` function.

```bash
npm install xstate @xstate/react
```

```typescript
import { useMachine } from '@xstate/react';
import { createMachine, assign } from 'xstate';

// Define the machine (can be in a separate file)
const toggleMachine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: { on: { TOGGLE: 'active' } },
    active:   { on: { TOGGLE: 'inactive' } },
  },
});

// Minimal useMachine usage
function Toggle() {
  const [state, send] = useMachine(toggleMachine);

  return (
    <button onClick={() => send({ type: 'TOGGLE' })}>
      {state.matches('active') ? 'Turn Off' : 'Turn On'}
    </button>
  );
}
```

With context and async actions (checkout example from xstate-patterns.md):

```typescript
import { useMachine } from '@xstate/react';
import { checkoutMachine } from './checkout-machine';

function CheckoutPage({ cart }: { cart: CartItem[] }) {
  const [state, send] = useMachine(checkoutMachine, {
    // Provide initial context via input
    input: { cart, promoCode: null, discount: 0, paymentMethod: null, error: null },
  });

  // state.value — current state name: 'cart' | 'processing' | 'success' | 'failed'
  // state.context — typed context object
  // state.matches('cart') — boolean: is the machine in 'cart' state?
  // state.can({ type: 'SUBMIT' }) — boolean: is SUBMIT a valid event right now?

  return (
    <div>
      {state.matches('cart') && (
        <div>
          <p>Total: ${state.context.cart.reduce((s, i) => s + i.price * i.qty, 0)}</p>
          <button onClick={() => send({ type: 'SELECT_PAYMENT', method: 'card' })}>
            Pay with Card
          </button>
          <button
            onClick={() => send({ type: 'SUBMIT' })}
            disabled={!state.can({ type: 'SUBMIT' })}
          >
            Place Order
          </button>
        </div>
      )}

      {state.matches('processing') && <p>Processing payment...</p>}

      {state.matches('success') && <p>Order placed successfully!</p>}

      {state.matches('failed') && (
        <div>
          <p>Payment failed: {state.context.error}</p>
          <button onClick={() => send({ type: 'RETRY' })}>Try Again</button>
        </div>
      )}
    </div>
  );
}
```

`useSelector` for performance — only re-render when specific state slice changes:

```typescript
import { useSelector } from '@xstate/react';
import { AnyActorRef } from 'xstate';

function OrderStatus({ actor }: { actor: AnyActorRef }) {
  // Only re-renders when state.value changes — not on every context update
  const stateName = useSelector(actor, (snapshot) => snapshot.value);
  const error     = useSelector(actor, (snapshot) => snapshot.context.error);

  return (
    <div>
      <span>Status: {String(stateName)}</span>
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

When to use `useMachine` vs `useReducer`:

| Concern | `useReducer` | `useMachine` |
|---------|-------------|--------------|
| Dependencies | None | `xstate`, `@xstate/react` |
| Async invoke | Manual | Built-in (`invoke`) |
| Parallel states | Manual | Built-in (`type: 'parallel'`) |
| Delayed transitions | Manual | Built-in (`after`) |
| Visualization | None | Stately.ai inspector |
| Complexity threshold | 2-4 states | 5+ states, or need invoke/parallel |
