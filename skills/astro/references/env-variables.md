# Astro Environment Variables

> Managing secrets, API keys, and configuration across environments

## When to Read This

- Storing API keys and secrets securely
- Different configs for dev/staging/prod
- Accessing environment variables in Astro
- Using `.env` files properly
- Exposing variables to client-side code

---

## Basic Setup

### ✅ Create .env File

```bash
# .env (root directory)
# Private (server-only)
DATABASE_URL=postgresql://localhost/mydb
API_SECRET_KEY=super-secret-key

# Public (available in browser) - MUST have PUBLIC_ prefix
PUBLIC_API_URL=https://api.example.com
PUBLIC_SITE_NAME=My Astro Site
```

### ✅ Access in Astro Files

```astro
---
// Server-side: Access any variable
const dbUrl = import.meta.env.DATABASE_URL;
const apiKey = import.meta.env.API_SECRET_KEY;

// Client-side: Only PUBLIC_ variables
const apiUrl = import.meta.env.PUBLIC_API_URL;
---

<script>
  // ✅ CORRECT: PUBLIC_ variables available
  const apiUrl = import.meta.env.PUBLIC_API_URL;

  // ❌ WRONG: Private variables are undefined in browser
  const secret = import.meta.env.API_SECRET_KEY; // undefined!
</script>
```

---

## Environment-Specific Files

### ✅ Multiple Environment Files

```bash
.env                 # Loaded in all environments
.env.local           # Local overrides (gitignored)
.env.development     # Only in dev mode
.env.production      # Only in production build
```

**Load priority:**

1. `.env.production` or `.env.development` (environment-specific)
2. `.env.local` (local overrides)
3. `.env` (defaults)

### ✅ Example Setup

```bash
# .env (committed, defaults)
PUBLIC_API_URL=https://api-staging.example.com
DATABASE_URL=

# .env.local (gitignored, local dev)
DATABASE_URL=postgresql://localhost/mydb_dev
API_SECRET_KEY=dev-secret

# .env.production (committed, production)
PUBLIC_API_URL=https://api.example.com
```

---

## TypeScript Support

### ✅ Type-Safe Environment Variables

```typescript
// src/env.d.ts
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly API_SECRET_KEY: string;
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_SITE_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**Benefit:** TypeScript autocomplete and type checking for env variables.

---

## Validation

### ✅ Validate Required Variables

```typescript
// src/lib/env.ts
function getEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const config = {
  databaseUrl: getEnv("DATABASE_URL"),
  apiKey: getEnv("API_SECRET_KEY"),
  publicApiUrl: getEnv("PUBLIC_API_URL"),
};
```

### ✅ Use Zod for Validation

```typescript
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_SECRET_KEY: z.string().min(20),
  PUBLIC_API_URL: z.string().url(),
  PUBLIC_SITE_NAME: z.string().default("My Site"),
});

export const env = envSchema.parse(import.meta.env);
```

---

## Security Best Practices

### ⚠️ CRITICAL: Never Expose Secrets

```astro
---
// ❌ WRONG: Exposing secret to client
const apiKey = import.meta.env.API_SECRET_KEY;
---

<script define:vars={{ apiKey }}>
  // Secret is now in browser! Security breach!
  console.log(apiKey);
</script>
```

```astro
---
// ✅ CORRECT: Keep secrets server-side
const apiKey = import.meta.env.API_SECRET_KEY;
const data = await fetchWithAuth(apiKey);
---

<!-- Only send safe data to client -->
<div>{data.publicInfo}</div>
```

### ✅ Use PUBLIC\_ Prefix Intentionally

```bash
# ✅ CORRECT: Safe for browser
PUBLIC_GOOGLE_ANALYTICS_ID=UA-123456
PUBLIC_STRIPE_PUBLIC_KEY=pk_test_123

# ❌ WRONG: Secrets without PUBLIC_ prefix (but could be misused)
STRIPE_SECRET_KEY=sk_live_123  # Keep server-side only!
```

---

## Common Patterns

### ✅ API Endpoints with Secrets

```typescript
// src/pages/api/data.ts
export async function GET() {
  const apiKey = import.meta.env.API_SECRET_KEY;

  const response = await fetch("https://api.example.com/data", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
```

### ✅ Database Connections

```typescript
// src/lib/db.ts
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: import.meta.env.DATABASE_URL,
  ssl: import.meta.env.PROD ? { rejectUnauthorized: false } : false,
});
```

### ✅ Feature Flags

```astro
---
const enableBetaFeatures = import.meta.env.PUBLIC_ENABLE_BETA === 'true';
---

{enableBetaFeatures && (
  <div>Beta feature enabled!</div>
)}
```

---

## Deployment

### ✅ Vercel

```bash
# Vercel automatically loads .env.production
# Or set via Vercel dashboard: Settings → Environment Variables
```

### ✅ Netlify

```bash
# Netlify UI: Site settings → Environment variables
# Or netlify.toml:
[build.environment]
  PUBLIC_API_URL = "https://api.example.com"
```

### ✅ Cloudflare Pages

```bash
# Cloudflare dashboard: Settings → Environment variables
# Or wrangler.toml:
[env.production.vars]
PUBLIC_API_URL = "https://api.example.com"
```

---

## Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use `PUBLIC_` prefix** only for client-safe values
3. **Validate env variables** on startup (Zod, custom validation)
4. **Document required variables** in README.md
5. **Use environment-specific files** (`.env.production`, `.env.development`)
6. **Rotate secrets regularly** and never hardcode them

---

## Edge Cases

**Undefined variables:** `import.meta.env.MISSING_VAR` returns `undefined`, not an error. Validate early!

**Build-time vs Runtime:** Variables are replaced at build time for static pages. SSR pages access them at runtime.

**Empty strings:** `.env` empty values (`VAR=`) result in empty string `""`, not `undefined`.

**Multiline values:** Not supported in `.env`. Use base64 or JSON strings for complex values.

---

## References

- [Astro Environment Variables](https://docs.astro.build/en/guides/environment-variables/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
