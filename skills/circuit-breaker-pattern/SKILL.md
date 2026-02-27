---
name: circuit-breaker-pattern
description: "Prevent cascading failures by short-circuiting failing services. Trigger: When calling external APIs, databases, or any unreliable dependency."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Circuit Breaker Pattern

Protects a system from cascading failures by monitoring calls to an external dependency. When failures exceed a threshold, the circuit "trips" — subsequent calls fail immediately without attempting the operation, giving the dependency time to recover.

Like an electrical circuit breaker: when current spikes (failures accumulate), the breaker opens to prevent damage. It then probes for recovery before restoring normal flow.

## When to Use

- Calling external APIs, databases, third-party services, or microservices
- Any dependency that can be slow or unavailable — not just HTTP calls
- Systems where one failing service should not bring down the whole application
- High-traffic services where queuing up failed requests causes cascading load

Don't use for:

- Local in-process function calls (no network boundary, no circuit breaker needed)
- Operations that must succeed or retry indefinitely (use retry + timeout instead)
- User-facing validation errors (4xx responses are not failures — they are expected)

---

## Critical Patterns

### ✅ REQUIRED: Three States

The circuit breaker is a state machine with three states.

```
CLOSED ──(failures > threshold)──▶ OPEN ──(after timeout)──▶ HALF_OPEN
  ▲                                                                │
  └────────────────(probe succeeds)───────────────────────────────┘
                   OPEN ◀──(probe fails)──┘
```

```typescript
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

// CLOSED  — normal operation; failures tracked
// OPEN    — fast-fail; no calls attempted; dependency gets recovery time
// HALF_OPEN — probe state; limited calls allowed to test recovery
```

### ✅ REQUIRED: Failure Threshold Configuration

Configure per-dependency, not globally. Use a time-window count or error rate, not raw cumulative count.

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;   // failures within the window to trip
  windowMs: number;           // sliding window duration (e.g. 60_000 = 60s)
  recoveryTimeoutMs: number;  // how long to stay OPEN before trying HALF_OPEN
  halfOpenProbes: number;     // how many probe requests to allow before deciding
  successThreshold: number;   // successes in HALF_OPEN to reset to CLOSED
}

// Each dependency gets its own breaker with tuned values
const paymentBreaker  = new CircuitBreaker({ failureThreshold: 3,  windowMs: 30_000, recoveryTimeoutMs: 15_000 });
const inventoryBreaker = new CircuitBreaker({ failureThreshold: 10, windowMs: 60_000, recoveryTimeoutMs: 5_000  });
```

### ✅ REQUIRED: Fallback Strategy

An open circuit must return something useful — never silently fail.

```typescript
async function getProductPrice(productId: string): Promise<Money> {
  try {
    return await pricingBreaker.execute(() =>
      pricingService.getPrice(productId)
    );
  } catch (error) {
    if (error instanceof CircuitOpenError) {
      // Fallback: use cached price, return default, or degrade gracefully
      return cachedPrices.get(productId) ?? DEFAULT_PRICE;
    }
    throw error;
  }
}

// ❌ WRONG: no fallback — open circuit = invisible failure
async function getProductPrice(productId: string): Promise<Money> {
  return await pricingBreaker.execute(() => pricingService.getPrice(productId));
  // If circuit is open, caller gets an exception with no fallback behavior
}
```

Fallback options by priority:

1. **Cached value** — return last known good response
2. **Default/safe value** — a sensible degraded response (empty list, zero price with warning)
3. **Queue for retry** — enqueue the request for later processing
4. **Fail fast with clear error** — tell the user the feature is temporarily unavailable

### ✅ REQUIRED: Observability

Emit events on state transitions and expose metrics. Silent circuit breakers hide production issues.

```typescript
class CircuitBreaker {
  private onStateChange?: (prev: CircuitState, next: CircuitState) => void;

  private transition(next: CircuitState): void {
    const prev = this._state;
    this._state = next;
    this.onStateChange?.(prev, next);   // emit — wire to metrics/alerting
    console.log(`[CircuitBreaker:${this.name}] ${prev} → ${next}`);
  }
}

// Wire to your metrics system
breaker.onStateChange = (prev, next) => {
  metrics.increment('circuit_breaker.state_change', { from: prev, to: next, service: 'pricing' });
  if (next === 'OPEN') alerting.trigger(`Circuit breaker opened for pricing service`);
};
```

Metrics to expose: current state, failure count in window, last transition time, request count (success/failure/rejected).

### ❌ NEVER: Circuit Breaker Without Fallback

An open circuit that just throws an unhandled error provides no protection — it just changes which error the user sees.

```typescript
// ❌ WRONG: open circuit propagates as an unhandled 500
router.get('/products/:id/price', async (req, res) => {
  const price = await pricingBreaker.execute(() => pricingService.getPrice(req.params.id));
  // If open → CircuitOpenError thrown → unhandled → 500 to user
  res.json({ price });
});

// ✅ CORRECT: degrade gracefully
router.get('/products/:id/price', async (req, res) => {
  try {
    const price = await pricingBreaker.execute(() => pricingService.getPrice(req.params.id));
    res.json({ price });
  } catch (e) {
    if (e instanceof CircuitOpenError) {
      res.json({ price: null, message: 'Pricing temporarily unavailable' });
    } else { res.status(500).json({ error: 'Internal error' }); }
  }
});
```

### ❌ NEVER: Single Global Breaker

One breaker for all services means one slow API trips the breaker and blocks all other services.

```typescript
// ❌ WRONG: one breaker for everything
const globalBreaker = new CircuitBreaker({ failureThreshold: 5 });
const price    = await globalBreaker.execute(() => pricingService.get(id));
const inventory = await globalBreaker.execute(() => inventoryService.check(id)); // same breaker!

// ✅ CORRECT: one breaker per dependency
const priceBreaker     = new CircuitBreaker({ name: 'pricing',   failureThreshold: 3 });
const inventoryBreaker = new CircuitBreaker({ name: 'inventory', failureThreshold: 10 });
```

### HALF_OPEN Probe Logic

Allow a small number of test requests through. Reset to CLOSED on enough successes; trip back to OPEN on any failure.

```typescript
private async executeInHalfOpen<T>(fn: () => Promise<T>): Promise<T> {
  if (this._probeCount >= this.config.halfOpenProbes) {
    throw new CircuitOpenError(this.name); // still waiting for probe results
  }
  this._probeCount++;
  try {
    const result = await fn();
    this._successCount++;
    if (this._successCount >= this.config.successThreshold) {
      this.transition('CLOSED');  // recovery confirmed
      this.reset();
    }
    return result;
  } catch (error) {
    this.transition('OPEN');      // still failing — back to OPEN
    this.scheduleRecovery();
    throw error;
  }
}
```

### Timeout ≠ Failure

Not all errors should trip the circuit. Distinguish between service failures and client errors.

```typescript
private isFailure(error: unknown): boolean {
  if (error instanceof HttpError) {
    // 4xx = client error — the service is healthy, the request is wrong
    // 5xx = server error — the service is failing
    return error.statusCode >= 500;
  }
  // Network timeouts, connection refused, DNS failures = service failure
  return error instanceof NetworkError || error instanceof TimeoutError;
}
```

---

## Decision Tree

```
External dependency call?
  NO  → No circuit breaker needed

Dependency can fail or be slow?
  YES → Add circuit breaker

What should happen when open?
  → Cached value available?  → Return cache
  → Default safe response?   → Return default + log
  → Feature non-essential?   → Return null/empty + inform user
  → Feature essential?       → Fail fast with clear error + alerting

Circuit breaker vs retry vs timeout?
  → Retry: transient errors (network blip); same request might succeed
  → Timeout: set max wait per request; combine with circuit breaker
  → Circuit breaker: protect against sustained failure; stop hammering the dependency
  → Best practice: timeout + retry(2) + circuit breaker together

How to tune thresholds?
  → failureThreshold: start at 5 failures / 60s window; adjust per SLA
  → recoveryTimeoutMs: at least 2× the typical recovery time of the dependency
  → halfOpenProbes: 2-3 is usually enough; more = slower recovery detection
```

---

## Example

Minimal TypeScript circuit breaker implementation.

```typescript
class CircuitOpenError extends Error {
  constructor(name: string) { super(`Circuit breaker OPEN: ${name}`); }
}

class CircuitBreaker {
  private _state: CircuitState = 'CLOSED';
  private _failures = 0;
  private _windowStart = Date.now();
  private _openedAt = 0;

  constructor(
    private name: string,
    private config: CircuitBreakerConfig,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this._state === 'OPEN') {
      if (Date.now() - this._openedAt >= this.config.recoveryTimeoutMs) {
        this._state = 'HALF_OPEN';
      } else {
        throw new CircuitOpenError(this.name);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this._state === 'HALF_OPEN') this._state = 'CLOSED';
    this._failures = 0;
  }

  private onFailure(): void {
    const now = Date.now();
    if (now - this._windowStart > this.config.windowMs) {
      this._failures = 0;
      this._windowStart = now;
    }
    this._failures++;
    if (this._failures >= this.config.failureThreshold) {
      this._state = 'OPEN';
      this._openedAt = now;
    }
  }
}
```

---

## Edge Cases

**Library vs manual implementation**: For production use, prefer `opossum` (Node.js) or `cockatiel` rather than a home-grown implementation — they handle edge cases (concurrent requests in HALF_OPEN, atomic state transitions, metrics hooks).

**Distributed circuit breakers**: In multi-instance deployments, each instance has its own breaker state. Use a shared state store (Redis) only if consistency across instances is required. Usually, per-instance breakers are sufficient.

**Circuit breaker with bulkhead**: Combine circuit breaker (stop calls on failure) with bulkhead (limit concurrent calls) for full resilience: `bulkhead → circuit breaker → timeout → retry → actual call`.

---

## Resources

- [result-pattern](../result-pattern/SKILL.md) — composable error handling; use with circuit breaker fallbacks
- [architecture-patterns](../architecture-patterns/SKILL.md) — resilience patterns overview
