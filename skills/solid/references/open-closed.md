# Open/Closed Principle (OCP)

Software entities should be open for extension, but closed for modification. Add new functionality by adding new code, not by modifying existing code.

## Core Patterns

- Use interfaces or abstract classes to define extension points
- New functionality arrives as a new class implementing an existing interface
- The existing service or component that consumes the interface never changes
- React: extend UI via composition (new field components) rather than growing a single switch-case component
- Apply incrementally: first violation duplicate, second violation extract, third violation apply OCP

---

## 2. Open/Closed Principle (OCP)

> Software entities should be open for extension, but closed for modification.

Add new functionality by adding new code, not modifying existing code. Use abstractions (interfaces, abstract classes) to allow extension.

### Backend Example

```typescript
// ❌ WRONG: Must modify class to add new notification type
class NotificationService {
  async send(type: string, user: User, message: string) {
    if (type === "email") {
      await sendEmail(user.email, message);
    } else if (type === "sms") {
      await sendSMS(user.phone, message);
    } else if (type === "push") {
      await sendPush(user.deviceId, message);
    }
    // Adding Slack requires modifying this method
  }
}
```

```typescript
// ✅ CORRECT: Extend with new class, don't modify existing

interface INotificationChannel {
  send(user: User, message: string): Promise<void>;
}

class EmailChannel implements INotificationChannel {
  async send(user: User, message: string): Promise<void> {
    await sendEmail(user.email, message);
  }
}

class SMSChannel implements INotificationChannel {
  async send(user: User, message: string): Promise<void> {
    await sendSMS(user.phone, message);
  }
}

class PushChannel implements INotificationChannel {
  async send(user: User, message: string): Promise<void> {
    await sendPush(user.deviceId, message);
  }
}

// Add new channel WITHOUT modifying existing code
class SlackChannel implements INotificationChannel {
  async send(user: User, message: string): Promise<void> {
    await sendSlack(user.slackId, message);
  }
}

class NotificationService {
  constructor(private channels: INotificationChannel[]) {}

  async sendToAll(user: User, message: string): Promise<void> {
    await Promise.all(
      this.channels.map((channel) => channel.send(user, message)),
    );
  }
}

// Usage
const service = new NotificationService([
  new EmailChannel(),
  new SMSChannel(),
  new SlackChannel(), // Added without modifying NotificationService
]);
```

### Frontend Example (React)

```typescript
// ❌ WRONG: Must modify component to add new field type
const FormField = ({ type, ...props }: FormFieldProps) => {
  if (type === 'text') {
    return <input type="text" {...props} />;
  } else if (type === 'email') {
    return <input type="email" {...props} />;
  } else if (type === 'password') {
    return <input type="password" {...props} />;
  } else if (type === 'date') {
    return <DatePicker {...props} />;
  }
  // Adding 'phone' requires modifying this component
};
```

```typescript
// ✅ CORRECT: Composition allows extension without modification

// Base components (closed for modification)
const TextField = (props: TextFieldProps) => (
  <input type="text" {...props} />
);

const EmailField = (props: TextFieldProps) => (
  <input type="email" {...props} />
);

const DateField = (props: DateFieldProps) => (
  <DatePicker {...props} />
);

// Add new field type without modifying existing components
const PhoneField = (props: TextFieldProps) => (
  <input type="tel" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" {...props} />
);

const UserForm = () => (
  <form>
    <TextField name="name" />
    <EmailField name="email" />
    <PhoneField name="phone" />
    <DateField name="birthday" />
  </form>
);
```

---

## Reference

- [SOLID Principles Overview](solid-principles.md)
- [Back to SKILL.md](../SKILL.md)
