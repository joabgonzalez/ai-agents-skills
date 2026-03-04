# Circuit Breaker — Implementation Patterns

## Core Patterns

### Manual State Machine (TypeScript)

A production-ready circuit breaker with all three states and sliding-window failure counting.

```typescript
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;
  windowMs: number;
  recoveryTimeoutMs: number;
  halfOpenProbes: number;
  successThreshold: number;
  isFailure?: (err: unknown) => boolean;
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
}

class CircuitOpenError extends Error {
  constructor(public readonly breaker: string) {
    super(`Circuit breaker OPEN: ${breaker}`);
    this.name = 'CircuitOpenError';
  }
}

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private windowStart = Date.now();
  private openedAt = 0;
  private probeCount = 0;
  private probeSuccesses = 0;

  constructor(private readonly config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.tickWindow();

    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt >= this.config.recoveryTimeoutMs) {
        this.transition('HALF_OPEN');
        this.probeCount = 0;
        this.probeSuccesses = 0;
      } else {
        throw new CircuitOpenError(this.config.name);
      }
    }

    if (this.state === 'HALF_OPEN' && this.probeCount >= this.config.halfOpenProbes) {
      throw new CircuitOpenError(this.config.name);
    }

    if (this.state === 'HALF_OPEN') this.probeCount++;

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      if (this.shouldCount(err)) this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.probeSuccesses++;
      if (this.probeSuccesses >= this.config.successThreshold) {
        this.failures = 0;
        this.transition('CLOSED');
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    if (this.state === 'HALF_OPEN') {
      this.openedAt = Date.now();
      this.transition('OPEN');
      return;
    }
    if (this.failures >= this.config.failureThreshold) {
      this.openedAt = Date.now();
      this.transition('OPEN');
    }
  }

  private tickWindow(): void {
    if (Date.now() - this.windowStart > this.config.windowMs) {
      this.failures = 0;
      this.windowStart = Date.now();
    }
  }

  private transition(next: CircuitState): void {
    const prev = this.state;
    this.state = next;
    this.config.onStateChange?.(prev, next);
  }

  private shouldCount(err: unknown): boolean {
    return this.config.isFailure ? this.config.isFailure(err) : true;
  }

  getState(): CircuitState { return this.state; }
}
```

Key design decisions:

- Sliding window resets `failures` counter when `windowMs` elapses — prevents stale failure counts
- `isFailure` hook lets callers exclude 4xx HTTP errors from counting as circuit failures
- `onStateChange` callback is the extension point for metrics and alerting

---

### Using the `opossum` Library (Node.js)

`opossum` is the standard circuit breaker library for Node.js. Use it instead of a hand-rolled implementation for production services.

```bash
npm install opossum
npm install --save-dev @types/opossum
```

```typescript
import CircuitBreaker from 'opossum';
import axios from 'axios';

// Wrap any async function
async function fetchUserData(userId: string) {
  const { data } = await axios.get(`https://api.example.com/users/${userId}`);
  return data;
}

const breaker = new CircuitBreaker(fetchUserData, {
  timeout: 3000,           // fail the request if it takes > 3s
  errorThresholdPercentage: 50, // open when 50% of requests fail
  resetTimeout: 10000,     // try again after 10s
  volumeThreshold: 5,      // minimum calls before evaluating error rate
  name: 'user-service',
});

// Fallback function — called when circuit is open
breaker.fallback((userId: string) => {
  return { id: userId, name: 'Unknown', cached: true };
});

// Event hooks
breaker.on('open',     () => console.log('Circuit opened — user-service is failing'));
breaker.on('halfOpen', () => console.log('Circuit half-open — probing user-service'));
breaker.on('close',    () => console.log('Circuit closed — user-service recovered'));
breaker.on('fallback', (result) => console.log('Fallback returned:', result));
breaker.on('reject',   () => metrics.increment('circuit.rejected', { service: 'user-service' }));

// Use the breaker
async function getUser(userId: string) {
  return breaker.fire(userId);
}
```

opossum configuration reference:

| Option | Default | Notes |
|--------|---------|-------|
| `timeout` | 10000 | ms before a call is considered failed |
| `errorThresholdPercentage` | 50 | % errors to open circuit |
| `resetTimeout` | 30000 | ms to wait before HALF_OPEN |
| `volumeThreshold` | 0 | min calls before evaluating (avoid cold-start trips) |
| `rollingCountTimeout` | 10000 | sliding window duration in ms |

---

### NestJS Interceptor Pattern

Wrap circuit breaker logic in a NestJS interceptor so it applies declaratively via a decorator.

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import CircuitBreaker from 'opossum';

// Registry — one breaker instance per named service
const registry = new Map<string, CircuitBreaker>();

function getBreaker(name: string): CircuitBreaker {
  if (!registry.has(name)) {
    // Wrap a no-op; actual execution is done manually below
    const breaker = new CircuitBreaker(async (fn: () => Promise<unknown>) => fn(), {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 15000,
      name,
    });
    registry.set(name, breaker);
  }
  return registry.get(name)!;
}

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  constructor(private readonly serviceName: string) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const breaker = getBreaker(this.serviceName);

    return new Observable((observer) => {
      breaker
        .fire(() => next.handle().toPromise())
        .then((result) => {
          observer.next(result);
          observer.complete();
        })
        .catch((err) => {
          if (err.message?.includes('Circuit breaker is open')) {
            observer.error(
              new HttpException('Service temporarily unavailable', HttpStatus.SERVICE_UNAVAILABLE),
            );
          } else {
            observer.error(err);
          }
        });
    });
  }
}

// Usage on a controller
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';

@Controller('users')
@UseInterceptors(new CircuitBreakerInterceptor('user-service'))
export class UserController {
  @Get(':id')
  async getUser(@Param('id') id: string) {
    // If the user-service circuit is open, the interceptor
    // returns 503 before this handler executes
    return this.userService.findById(id);
  }
}
```

---

### Retry Composition with Circuit Breaker

Combine retries (for transient errors) with circuit breaker (for sustained failures). The correct order is:

```
caller → circuit breaker → retry → timeout → actual call
```

Circuit breaker wraps retry — if retries are failing, the breaker accumulates those failures and eventually opens.

```typescript
import CircuitBreaker from 'opossum';

// Retry helper — exponential backoff with jitter
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  baseDelayMs: number,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 100;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// Compose: circuit breaker wraps the retry-wrapped call
async function fetchWithResilience(url: string): Promise<unknown> {
  const { data } = await axios.get(url, { timeout: 3000 });
  return data;
}

const retryingFetch = (url: string) =>
  withRetry(() => fetchWithResilience(url), 2, 200);

const breaker = new CircuitBreaker(retryingFetch, {
  timeout: 10000,          // total budget for all retries
  errorThresholdPercentage: 50,
  resetTimeout: 20000,
  name: 'external-api',
});

breaker.fallback((url: string) => ({ url, data: null, fallback: true }));

// Each call: breaker checks state → retry up to 2x → actual fetch
export async function get(url: string) {
  return breaker.fire(url);
}
```

Tuning guidance:

- Set `timeout` on the breaker to cover the maximum total retry time, not just a single attempt
- Use `isFailure` (opossum: `errorFilter`) to exclude 4xx from counting as circuit failures
- Retries: 2-3 max; exponential backoff + jitter prevents thundering herd

---

### Health Check Endpoint Integration

Expose circuit breaker state at a `/health` endpoint so load balancers and Kubernetes probes can react.

```typescript
import express from 'express';
import CircuitBreaker from 'opossum';

// Collect all breakers in a registry
const breakerRegistry: Record<string, CircuitBreaker> = {};

function register(breaker: CircuitBreaker): void {
  breakerRegistry[breaker.name] = breaker;
}

// Health endpoint — returns status of all registered breakers
const app = express();

app.get('/health/circuit-breakers', (_req, res) => {
  const statuses = Object.entries(breakerRegistry).map(([name, breaker]) => ({
    name,
    state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
    stats: breaker.stats,
  }));

  const anyOpen = statuses.some((s) => s.state === 'OPEN');

  res.status(anyOpen ? 503 : 200).json({
    status: anyOpen ? 'degraded' : 'healthy',
    breakers: statuses,
  });
});

// Example response when user-service circuit is open:
// HTTP 503
// {
//   "status": "degraded",
//   "breakers": [
//     { "name": "user-service", "state": "OPEN", "stats": { ... } },
//     { "name": "inventory",    "state": "CLOSED", "stats": { ... } }
//   ]
// }
```

Wire to Kubernetes:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 15

readinessProbe:
  httpGet:
    path: /health/circuit-breakers
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

Kubernetes will stop routing traffic to the pod when the readiness probe returns 503, which prevents a pod with open circuits from receiving new requests while dependencies recover.
