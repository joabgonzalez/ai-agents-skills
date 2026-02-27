---
name: state-machines-pattern
description: "Model logic as explicit states and transitions. Trigger: When managing multi-step workflows, async states, or logic with impossible flag combinations."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# State Machine Pattern

Models application logic as a set of **explicit states** with **deterministic transitions** between them. At any moment, the system is in exactly one state. Transitions happen in response to events and may be guarded by conditions.

State machines eliminate impossible states — the root cause of most state management bugs — by making invalid combinations structurally impossible rather than handled by `if`/`else` chains.

## When to Use

- Async operations with loading/success/error states
- Multi-step user flows (onboarding, checkout, form wizard)
- Business workflows with defined rules (order lifecycle, document approval)
- Any logic where boolean flag combinations produce impossible states

Don't use for:

- Simple toggle state (open/closed, visible/hidden) — `useState` is sufficient
- Pure data transformations with no state transitions
- Server-side CRUD with no meaningful workflow logic

---

## Critical Patterns

### ✅ REQUIRED: Explicit State Union

Replace boolean flag combinations with an exhaustive union type. Every possible state is named and intentional.

```typescript
// ❌ WRONG: boolean flags — 2³ = 8 combinations, most impossible
interface FetchState {
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;  // can isLoading and isError both be true? Unclear.
}

// ✅ CORRECT: exactly one state at a time, all valid states named
type FetchState = 'idle' | 'loading' | 'success' | 'error';
```

With context (extended state):

```typescript
type OrderState =
  | { status: 'pending' }
  | { status: 'confirmed'; confirmedAt: Date }
  | { status: 'shipped';   trackingNumber: string }
  | { status: 'delivered'; deliveredAt: Date }
  | { status: 'cancelled'; reason: string };

// TypeScript narrows the context based on state — impossible states don't type-check
function getTracking(order: OrderState): string {
  if (order.status === 'shipped') return order.trackingNumber; // ✅ safe
  // order.trackingNumber doesn't exist on other states — compile error if misused
}
```

### ✅ REQUIRED: Transition Table

Define which transitions are valid. Anything not in the table is rejected — no silent no-ops or invalid state corruption.

```typescript
type OrderEvent = 'CONFIRM' | 'SHIP' | 'DELIVER' | 'CANCEL';

const transitions: Record<string, Partial<Record<OrderEvent, string>>> = {
  pending:   { CONFIRM: 'confirmed', CANCEL: 'cancelled' },
  confirmed: { SHIP: 'shipped',      CANCEL: 'cancelled' },
  shipped:   { DELIVER: 'delivered' },
  delivered: {},           // terminal — no transitions out
  cancelled: {},           // terminal — no transitions out
};

function transition(current: string, event: OrderEvent): string {
  const next = transitions[current]?.[event];
  if (!next) throw new Error(`Invalid transition: ${current} + ${event}`);
  return next;
}

// transition('pending', 'DELIVER')  → throws — invalid
// transition('pending', 'CONFIRM')  → 'confirmed'
```

### ✅ REQUIRED: Guards

Predicates that allow or prevent a transition based on context. Guards keep conditional logic explicit and testable.

```typescript
interface OrderContext {
  items: OrderItem[];
  paymentConfirmed: boolean;
}

const guards = {
  canConfirm: (ctx: OrderContext) => ctx.items.length > 0 && ctx.paymentConfirmed,
  canCancel:  (ctx: OrderContext) => true,  // always allowed from valid states
};

function confirm(state: OrderState, ctx: OrderContext): OrderState {
  if (state.status !== 'pending') throw new Error('Only pending orders can be confirmed');
  if (!guards.canConfirm(ctx))    throw new Error('Cannot confirm: payment required');
  return { status: 'confirmed', confirmedAt: new Date() };
}
```

### ✅ REQUIRED: Actions (Side Effects on Transition)

Actions are side effects executed when entering a state, exiting a state, or during a transition. They are separate from the state definition — the machine defines *what* happens, actions define *how*.

```typescript
type Action = 'sendConfirmationEmail' | 'reserveInventory' | 'notifyShipping';

const transitionActions: Record<string, Partial<Record<OrderEvent, Action[]>>> = {
  pending: {
    CONFIRM: ['sendConfirmationEmail', 'reserveInventory'],
  },
  confirmed: {
    SHIP: ['notifyShipping'],
  },
};

async function send(event: OrderEvent, state: OrderState, ctx: OrderContext): Promise<OrderState> {
  const actions = transitionActions[state.status]?.[event] ?? [];
  const nextState = transition(state.status, event);

  // Execute actions after state transition
  for (const action of actions) {
    await executeAction(action, ctx);
  }

  return { status: nextState } as OrderState;
}
```

### ✅ REQUIRED: Context (Extended State)

Data that travels alongside the machine's state. Context changes are triggered by transitions, not direct mutation.

```typescript
interface FetchMachine {
  state: 'idle' | 'loading' | 'success' | 'error';
  context: {
    data: unknown | null;
    error: string | null;
    retries: number;
  };
}

// ✅ Context changes only through transitions
function fetchReducer(machine: FetchMachine, event: FetchEvent): FetchMachine {
  switch (machine.state) {
    case 'idle':
      if (event.type === 'FETCH') return { state: 'loading', context: { ...machine.context, data: null, error: null } };
      break;
    case 'loading':
      if (event.type === 'SUCCESS') return { state: 'success', context: { ...machine.context, data: event.data } };
      if (event.type === 'FAILURE') return { state: 'error',   context: { ...machine.context, error: event.error } };
      break;
  }
  return machine; // unknown event — no-op
}
```

### ❌ NEVER: Boolean Flag Accumulation

Every boolean flag added to manage state is a symptom of missing state modeling.

```typescript
// ❌ WRONG: 4 booleans = 16 combinations, 12 impossible
const [isIdle, setIsIdle]       = useState(true);
const [isLoading, setIsLoading] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
const [isError, setIsError]     = useState(false);

// What does isLoading=true AND isError=true mean? Nothing valid.

// ✅ CORRECT: one state variable, all combinations explicit
const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
```

### ❌ NEVER: Direct State Mutation

Always send events through the machine. Direct mutation bypasses guards, actions, and the transition table.

```typescript
// ❌ WRONG: bypasses all machine logic
order.status = 'shipped'; // no guards, no actions, no validation

// ✅ CORRECT: machine enforces all rules
order = transition(order, 'SHIP', context); // runs guard + transition + actions
```

---

## Decision Tree

```
Multi-step workflow with clear rules?       → State machine pattern
Async operation (loading/success/error)?    → State machine (3-state minimum)
Boolean flags causing impossible states?    → Refactor to state union type

How complex is it?
  → 2-4 states, no actions     → useState + union type (no library needed)
  → 5+ states or actions       → Consider XState or a reducer pattern
  → Parallel regions            → XState (parallel states)
  → Persisted / rehydrated      → XState (serializable state)

State machine vs Redux/Zustand?
  → State machine: models transitions and guards (WHAT is allowed)
  → Redux/Zustand: stores and retrieves state (WHERE it lives)
  → They compose: state machine drives transitions, store persists the result

State machine vs useReducer?
  → useReducer: switch on event type, no explicit transition table
  → State machine: explicit valid transitions per state — guards included
  → Prefer state machine when invalid transitions are a real risk
```

---

## Example

Order lifecycle as a finite state machine.

```typescript
// States and events
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
type OrderEvent  = 'CONFIRM' | 'SHIP' | 'DELIVER' | 'CANCEL';

// Transition table — source of truth for what's allowed
const ORDER_TRANSITIONS: Record<OrderStatus, Partial<Record<OrderEvent, OrderStatus>>> = {
  pending:   { CONFIRM: 'confirmed', CANCEL: 'cancelled' },
  confirmed: { SHIP: 'shipped',      CANCEL: 'cancelled' },
  shipped:   { DELIVER: 'delivered' },
  delivered: {},
  cancelled: {},
};

class OrderStateMachine {
  constructor(private _status: OrderStatus) {}

  get status(): OrderStatus { return this._status; }

  send(event: OrderEvent): void {
    const next = ORDER_TRANSITIONS[this._status]?.[event];
    if (!next) {
      throw new Error(`Cannot ${event} an order in '${this._status}' state`);
    }
    this._status = next;
  }

  can(event: OrderEvent): boolean {
    return event in (ORDER_TRANSITIONS[this._status] ?? {});
  }
}

// Usage
const order = new OrderStateMachine('pending');
order.can('CONFIRM');  // true
order.can('DELIVER');  // false — not yet shipped

order.send('CONFIRM'); // 'pending' → 'confirmed'
order.send('DELIVER'); // throws: "Cannot DELIVER an order in 'confirmed' state"
```

---

## Edge Cases

**Hierarchical states**: Some states contain sub-states (`loading` can be `loading.uploading` or `loading.processing`). Nest state machines or use XState's hierarchical states. Avoid nesting more than two levels deep.

**Parallel states**: Two independent state machines running simultaneously (e.g., document editor: `saving` state AND `connectionStatus` state). Model as two separate machines; avoid conflating them.

**Persisting state**: When restoring a machine from storage (DB, session), validate that the stored state is a valid state value before loading — never trust raw stored strings without validation.

**Testing state machines**: Test the transition table explicitly: valid transitions succeed, invalid transitions throw, guards prevent transitions when conditions fail. Tests should enumerate every valid and invalid transition.

```typescript
describe('OrderStateMachine', () => {
  it('allows CONFIRM from pending', () => {
    const m = new OrderStateMachine('pending');
    m.send('CONFIRM');
    expect(m.status).toBe('confirmed');
  });

  it('rejects DELIVER from pending', () => {
    const m = new OrderStateMachine('pending');
    expect(() => m.send('DELIVER')).toThrow();
  });
});
```

---

## Resources

- [circuit-breaker-pattern](../circuit-breaker-pattern/SKILL.md) — circuit breaker is itself a 3-state machine (CLOSED/OPEN/HALF_OPEN)
- [result-pattern](../result-pattern/SKILL.md) — composable error handling; complements state machine transitions
- [redux-toolkit](../redux-toolkit/SKILL.md) — state storage that pairs well with state machine transitions
