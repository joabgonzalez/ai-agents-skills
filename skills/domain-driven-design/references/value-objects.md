# Value Object

## Concept

A Value Object is a domain object defined entirely by its **attributes**. It has no identity — two Value Objects with identical attributes are considered the same and are fully interchangeable. Value Objects are immutable: instead of modifying one, you create a new instance.

Value Objects capture domain concepts that are defined by what they *are*, not *who they are*: Money is defined by its amount and currency; an Email by its address string; an Address by street, city, and postal code.

---

## Key Characteristics

- **No identity** — no ID field, no repository, no lifecycle
- **Immutable** — never modify in place; return a new instance from every operation
- **Value-based equality** — two instances with the same attributes are equal
- **Self-validating** — throw in the constructor if invariants are violated
- **Side-effect-free behavior** — operations return new Value Objects, never mutate
- **Conceptual whole** — groups related attributes that only make sense together (amount + currency, not just a number)

---

## When to Use

Use Value Object when:

- The concept is fully described by its values (Money, Email, Address, PhoneNumber, DateRange)
- Two instances with the same values should be treated as the same thing
- The concept enforces its own invariants (valid email format, non-negative amount)
- The concept has domain operations that produce new values (`money.add(other)`)

Don't use Value Object when:

- The concept has a lifecycle or needs to be tracked independently (use Entity)
- The concept is just a DTO passed between layers with no domain behavior

---

## Core Patterns

### Money — arithmetic and currency safety

```typescript
// domain/value-objects/Money.ts
export class Money {
  constructor(
    readonly amount: number,
    readonly currency: string,
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
    if (!currency)  throw new Error('Currency is required');
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    if (other.amount > this.amount) throw new Error('Insufficient funds');
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) throw new Error('Factor cannot be negative');
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}

// Usage — immutability: operations always return new instances
const price    = new Money(100, 'USD');
const tax      = new Money(8.5, 'USD');
const total    = price.add(tax);            // new Money(108.5, 'USD')
const doubled  = price.multiply(2);         // new Money(200, 'USD')

console.log(price.equals(new Money(100, 'USD'))); // true
console.log(price === new Money(100, 'USD'));      // false — different instances
```

### Email — normalization and validation

```typescript
// domain/value-objects/Email.ts
export class Email {
  private readonly _value: string;

  constructor(email: string) {
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error(`Invalid email: ${email}`);
    }
    this._value = normalized;
  }

  toString(): string { return this._value; }

  equals(other: Email): boolean { return this._value === other._value; }
}

// Usage
const email = new Email('USER@EXAMPLE.COM');
console.log(email.toString()); // 'user@example.com' — normalized
```

### DateRange — composite value with domain operations

```typescript
// domain/value-objects/DateRange.ts
export class DateRange {
  constructor(
    readonly start: Date,
    readonly end: Date,
  ) {
    if (end <= start) throw new Error('End must be after start');
  }

  includes(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  overlaps(other: DateRange): boolean {
    return this.start < other.end && this.end > other.start;
  }

  durationDays(): number {
    return Math.ceil((this.end.getTime() - this.start.getTime()) / 86_400_000);
  }

  equals(other: DateRange): boolean {
    return this.start.getTime() === other.start.getTime()
      && this.end.getTime() === other.end.getTime();
  }
}
```

---

## Common Mistakes

**❌ Using primitives instead of Value Objects:**

```typescript
// WRONG: primitive types allow invalid states and no domain behavior
function applyDiscount(price: number, currency: string, discount: number): number {
  return price * (1 - discount); // currency mismatch possible, no validation
}

// CORRECT: Value Object enforces rules and carries domain operations
const discounted = price.multiply(1 - discount); // currency stays, rules apply
```

**❌ Making Value Objects mutable:**

```typescript
// WRONG: mutating in place breaks immutability contract
class Money {
  amount: number;
  addAmount(n: number): void { this.amount += n; } // mutates!
}

// CORRECT: return new instance
class Money {
  add(other: Money): Money { return new Money(this.amount + other.amount, this.currency); }
}
```

**❌ Incomplete equality:**

```typescript
// WRONG: missing currency comparison
equals(other: Money): boolean { return this.amount === other.amount; }
// 100 USD === 100 EUR → true! Wrong.

// CORRECT: all attributes must be compared
equals(other: Money): boolean {
  return this.amount === other.amount && this.currency === other.currency;
}
```
