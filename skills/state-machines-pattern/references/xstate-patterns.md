# XState v5 Patterns

## Core Patterns

### Machine Definition with Context Typing (XState v5)

XState v5 uses `createMachine` with explicit `types` for full TypeScript inference. Context and events are typed through the `types` property — no generic parameters needed.

```typescript
import { createMachine, assign } from 'xstate';

// Define context and event types separately for reuse
interface OrderContext {
  orderId: string;
  total: number;
  error: string | null;
  trackingNumber: string | null;
}

type OrderEvent =
  | { type: 'CONFIRM' }
  | { type: 'SHIP'; trackingNumber: string }
  | { type: 'DELIVER' }
  | { type: 'CANCEL'; reason: string }
  | { type: 'PAYMENT_FAILED'; error: string };

const orderMachine = createMachine({
  // types block — enables full inference without generic parameters
  types: {} as {
    context: OrderContext;
    events: OrderEvent;
  },

  id: 'order',
  initial: 'pending',

  context: {
    orderId: '',
    total: 0,
    error: null,
    trackingNumber: null,
  },

  states: {
    pending: {
      on: {
        CONFIRM: {
          target: 'confirmed',
          guard: 'hasPaymentConfirmed',
          actions: ['sendConfirmationEmail'],
        },
        CANCEL: {
          target: 'cancelled',
          actions: assign({
            error: ({ event }) => event.reason,
          }),
        },
        PAYMENT_FAILED: {
          target: 'paymentFailed',
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
      },
    },

    confirmed: {
      on: {
        SHIP: {
          target: 'shipped',
          actions: assign({
            trackingNumber: ({ event }) => event.trackingNumber,
          }),
        },
        CANCEL: 'cancelled',
      },
    },

    shipped: {
      on: {
        DELIVER: 'delivered',
      },
    },

    delivered: {
      type: 'final',
    },

    cancelled: {
      type: 'final',
    },

    paymentFailed: {
      on: {
        CONFIRM: 'pending', // retry payment
      },
    },
  },
}, {
  // Guards and actions defined separately — keeps state config readable
  guards: {
    hasPaymentConfirmed: ({ context }) => context.total > 0,
  },
  actions: {
    sendConfirmationEmail: ({ context }) => {
      console.log(`Sending confirmation for order ${context.orderId}`);
    },
  },
});

export { orderMachine };
export type { OrderContext, OrderEvent };
```

---

### Actor Model and `createActor()` (XState v5 API)

XState v5 replaces `interpret()` with `createActor()`. Actors are self-contained units that hold state and respond to events.

```typescript
import { createActor } from 'xstate';
import { orderMachine } from './order-machine';

// Create an actor from the machine
const orderActor = createActor(orderMachine, {
  // Optional: provide initial context values
  input: {
    orderId: 'ORD-001',
    total: 149.99,
    error: null,
    trackingNumber: null,
  },
});

// Subscribe to state changes
orderActor.subscribe((snapshot) => {
  console.log('Current state:', snapshot.value);
  console.log('Context:', snapshot.context);

  if (snapshot.status === 'done') {
    console.log('Machine reached final state');
  }
});

// Start the actor
orderActor.start();

// Send events
orderActor.send({ type: 'CONFIRM' });
orderActor.send({ type: 'SHIP', trackingNumber: 'TRACK-123' });
orderActor.send({ type: 'DELIVER' });

// Read current state at any time
const snapshot = orderActor.getSnapshot();
console.log(snapshot.value);   // 'delivered'
console.log(snapshot.context); // { orderId: 'ORD-001', trackingNumber: 'TRACK-123', ... }

// Stop the actor when done (cleanup subscriptions)
orderActor.stop();
```

Actor-to-actor communication — spawning child actors:

```typescript
import { createMachine, createActor, sendTo, assign } from 'xstate';

// Parent machine spawns child actors for each order
const orderManagerMachine = createMachine({
  types: {} as {
    context: { orderActors: Record<string, unknown> };
    events: { type: 'CREATE_ORDER'; orderId: string; total: number };
  },
  context: { orderActors: {} },
  on: {
    CREATE_ORDER: {
      actions: assign({
        orderActors: ({ context, event, spawn }) => ({
          ...context.orderActors,
          [event.orderId]: spawn(orderMachine, {
            id: event.orderId,
            input: { orderId: event.orderId, total: event.total, error: null, trackingNumber: null },
          }),
        }),
      }),
    },
  },
});
```

---

### Testing with `@xstate/test` — Model-Based Testing

`@xstate/test` generates test paths from a machine definition. Every reachable state gets a test automatically.

```bash
npm install --save-dev @xstate/test
```

```typescript
import { createTestModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { orderMachine } from './order-machine';

// Create test model from the machine
const testModel = createTestModel(orderMachine);

// Define state implementations — what to assert in each state
const stateImplementations = {
  pending: async (context: unknown) => {
    // Assert the UI or data is in the pending state
    expect(getOrder().status).toBe('pending');
  },
  confirmed: async () => {
    expect(getOrder().status).toBe('confirmed');
  },
  shipped: async () => {
    expect(getOrder().status).toBe('shipped');
    expect(getOrder().trackingNumber).toBeTruthy();
  },
  delivered: async () => {
    expect(getOrder().status).toBe('delivered');
  },
  cancelled: async () => {
    expect(getOrder().status).toBe('cancelled');
  },
};

// Define event implementations — how to trigger each event in tests
const eventImplementations = {
  CONFIRM: async () => {
    await orderService.confirm(testOrderId);
  },
  SHIP: async ({ event }: { event: { trackingNumber: string } }) => {
    await orderService.ship(testOrderId, event.trackingNumber ?? 'TEST-TRACK');
  },
  DELIVER: async () => {
    await orderService.deliver(testOrderId);
  },
  CANCEL: async () => {
    await orderService.cancel(testOrderId, 'test cancellation');
  },
};

// Generate and run all test paths
const testPaths = testModel.getPaths();

describe('Order state machine — model-based tests', () => {
  testPaths.forEach((path) => {
    it(path.description, async () => {
      await path.test({
        states: stateImplementations,
        events: eventImplementations,
      });
    });
  });
});
```

Model-based testing ensures every reachable state in the machine is exercised, including paths that are easy to miss when writing tests manually.

---

### Parallel States for Concurrent Workflows

Use `type: 'parallel'` when two independent sub-machines must run simultaneously within the same actor.

```typescript
import { createMachine, assign } from 'xstate';

// Document editor: saving status and connection status are independent
const documentEditorMachine = createMachine({
  id: 'documentEditor',
  type: 'parallel', // all child states are active simultaneously

  states: {
    // Sub-machine 1: document save state
    saving: {
      initial: 'idle',
      states: {
        idle: {
          on: { SAVE: 'saving' },
        },
        saving: {
          invoke: {
            src: 'saveDocument',
            onDone: 'saved',
            onError: 'error',
          },
        },
        saved: {
          after: { 2000: 'idle' }, // auto-transition back after 2s
        },
        error: {
          on: { RETRY: 'saving', DISCARD: 'idle' },
        },
      },
    },

    // Sub-machine 2: connection state (independent of save state)
    connection: {
      initial: 'connected',
      states: {
        connected: {
          on: { DISCONNECT: 'disconnected' },
        },
        disconnected: {
          on: { RECONNECT: 'reconnecting' },
        },
        reconnecting: {
          invoke: {
            src: 'reconnect',
            onDone: 'connected',
            onError: 'disconnected',
          },
        },
      },
    },

    // Sub-machine 3: collaborator presence (also independent)
    collaboration: {
      initial: 'solo',
      states: {
        solo: {
          on: { COLLABORATOR_JOINED: 'shared' },
        },
        shared: {
          on: { COLLABORATOR_LEFT: 'solo' },
        },
      },
    },
  },
});

// Snapshot shows all active states simultaneously:
// {
//   saving: 'idle',
//   connection: 'connected',
//   collaboration: 'solo'
// }
```

When to use parallel states:

- Two concerns are truly independent — one should not block the other
- Both need event handling simultaneously
- Avoid: using parallel states to model sequential dependencies (use guards or invoked actors instead)

---

### Guards and Actions Typing in TypeScript

XState v5 provides full type inference for guards and actions when the `types` block is properly defined.

```typescript
import { createMachine, assign, raise } from 'xstate';

interface CheckoutContext {
  cart: Array<{ id: string; price: number; qty: number }>;
  promoCode: string | null;
  discount: number;
  paymentMethod: 'card' | 'paypal' | null;
  error: string | null;
}

type CheckoutEvent =
  | { type: 'APPLY_PROMO'; code: string }
  | { type: 'SELECT_PAYMENT'; method: 'card' | 'paypal' }
  | { type: 'SUBMIT' }
  | { type: 'PAYMENT_SUCCESS'; transactionId: string }
  | { type: 'PAYMENT_ERROR'; message: string }
  | { type: 'RETRY' };

const checkoutMachine = createMachine(
  {
    types: {} as {
      context: CheckoutContext;
      events: CheckoutEvent;
    },

    id: 'checkout',
    initial: 'cart',

    context: {
      cart: [],
      promoCode: null,
      discount: 0,
      paymentMethod: null,
      error: null,
    },

    states: {
      cart: {
        on: {
          APPLY_PROMO: {
            actions: 'applyPromoCode',
          },
          SELECT_PAYMENT: {
            actions: assign({
              paymentMethod: ({ event }) => event.method,
            }),
          },
          SUBMIT: {
            // Guard is typed — TypeScript checks the guard name exists
            guard: 'hasValidCart',
            target: 'processing',
          },
        },
      },

      processing: {
        invoke: {
          src: 'processPayment',
          onDone: {
            target: 'success',
          },
          onError: {
            target: 'failed',
            actions: assign({
              error: ({ event }) => (event.error as Error).message,
            }),
          },
        },
      },

      success: { type: 'final' },

      failed: {
        on: {
          RETRY: {
            target: 'cart',
            actions: assign({ error: null }),
          },
        },
      },
    },
  },
  {
    // Guards — typed parameter: { context, event }
    guards: {
      hasValidCart: ({ context }): boolean =>
        context.cart.length > 0 && context.paymentMethod !== null,
    },

    // Actions — typed parameter: { context, event }
    actions: {
      applyPromoCode: assign(({ context, event }) => {
        // TypeScript narrows event to APPLY_PROMO here
        if (event.type !== 'APPLY_PROMO') return {};
        const discount = event.code === 'SAVE20' ? 0.2 : 0;
        return { promoCode: event.code, discount };
      }),
    },

    // Actors — async services invoked by the machine
    actors: {
      processPayment: async ({ context }: { context: CheckoutContext }) => {
        const total = context.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const discountedTotal = total * (1 - context.discount);
        // Call payment API...
        return { transactionId: 'TXN-' + Date.now(), total: discountedTotal };
      },
    },
  },
);

export { checkoutMachine };
export type { CheckoutContext, CheckoutEvent };
```

Type safety guarantees in XState v5:

- Guards receive typed `{ context, event }` — TypeScript catches guard logic errors at compile time
- `assign()` with a function receives typed context and event — no `any` needed
- Event narrowing in actions: TypeScript knows which event type triggered the action based on the transition
