---
name: authentication
description: "Auth patterns: password hashing, JWT, sessions, and OAuth. Trigger: When implementing login, registration, token handling, or OAuth flows."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Authentication

Patterns for implementing authentication correctly: password hashing strategy, token design, session management, OAuth flows, and security hardening. Language-agnostic principles; JWT/OAuth examples use Node.js.

## When to Use

- Implementing login, registration, or logout
- Designing JWT or session-based auth
- Integrating OAuth / OIDC providers (Google, GitHub, etc.)
- Hardening an existing auth layer

Don't use for:

- Authorization / RBAC (permissions after authentication)
- Specific framework setup (use express, nest, nextjs)

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: JWT — Sign, Verify, Never Just Decode

`jwt.decode()` skips signature verification. Always use `jwt.verify()` with the secret.

```ts
// ❌ WRONG — accepts any token, including forged ones
const payload = jwt.decode(token);

// ✅ CORRECT — verifies signature before trusting payload
const payload = jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ['HS256'],
});
```

### ✅ REQUIRED [CRITICAL]: Short Access Token + Refresh Token Pattern

Access tokens expire fast (15 min). Refresh tokens are long-lived, stored httpOnly, rotated on use.

```
Access token:  15 min TTL · stored in memory (not localStorage) · sent as Bearer header
Refresh token: 7–30 day TTL · httpOnly cookie · rotated on every refresh
```

```ts
// ❌ WRONG — long-lived access token in localStorage (XSS risk)
localStorage.setItem('token', accessToken); // 7-day expiry

// ✅ CORRECT — short access token in memory, refresh in httpOnly cookie
res.cookie('refreshToken', token, { httpOnly: true, secure: true, sameSite: 'strict' });
```

### ❌ NEVER: Secrets in JWT Payload

JWTs are base64-encoded, not encrypted. Anyone can decode the payload.

```ts
// ❌ WRONG — sensitive data in payload
const token = jwt.sign({ userId, password, creditCard }, secret);

// ✅ CORRECT — only non-sensitive identifiers
const token = jwt.sign({ sub: userId, role: user.role }, secret, { expiresIn: '15m' });
```

### ✅ REQUIRED [CRITICAL]: Password Hashing — Algorithm and Parameters

Passwords require a **slow, memory-hard hash** with an automatic per-password salt. Never use SHA-256, MD5, or any fast hash — a leaked DB is cracked in hours.

| Algorithm | Verdict | Notes |
|-----------|---------|-------|
| **Argon2id** | ✅ First choice | Memory-hard · no input limit · configurable cost |
| **bcrypt** | ✅ Acceptable | Widely supported · cost ≥ 12 · **72-byte input limit** |
| **scrypt** | ✅ Acceptable | Memory-hard · built into many standard libraries |
| SHA-256 / MD5 | ❌ Never | Designed for speed — wrong tool for passwords |

Core rules:
- Let the library generate the salt — never manually
- Store the full PHC string output, not raw bytes
- Use library `verify`/`compare` — timing-safe; `===` is not
- Hash only the password field — never concatenate other fields
- Always run the hash even when user not found (prevents email enumeration via timing)

> Full detail — algorithm parameters, pepper, NIST password policy, known antipatterns (Okta 2022), migration patterns: see [references/password-hashing.md](references/password-hashing.md)

### ✅ REQUIRED: Timing-Safe Comparison for Secrets

String equality (`===`) leaks timing information. Use `crypto.timingSafeEqual`.

```ts
// ❌ WRONG — timing attack possible
if (providedToken === storedToken) { /* ... */ }

// ✅ CORRECT — constant-time comparison
import { timingSafeEqual, createHash } from 'crypto';
const a = createHash('sha256').update(providedToken).digest();
const b = createHash('sha256').update(storedToken).digest();
if (timingSafeEqual(a, b)) { /* ... */ }
```

### ✅ REQUIRED: OAuth — Validate State Parameter

The `state` param prevents CSRF in OAuth flows. Always generate, store, and verify it.

```ts
// ❌ WRONG — no state, CSRF attack possible
res.redirect(`https://provider.com/oauth?client_id=...&redirect_uri=...`);

// ✅ CORRECT — state generated server-side, verified on callback
const state = crypto.randomBytes(16).toString('hex');
req.session.oauthState = state;
res.redirect(`https://provider.com/oauth?state=${state}&...`);

// On callback:
if (req.query.state !== req.session.oauthState) throw new Error('CSRF detected');
```

### ✅ REQUIRED: Rate Limit Auth Endpoints

Login, register, and password reset are brute-force targets. Apply per-IP and per-account limits.

```ts
// ✅ CORRECT — tighter limit on auth routes than general API
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/auth', authLimiter);
```

### ❌ NEVER: Expose Auth Errors in Detail

Don't confirm whether an email exists — it enables user enumeration.

```ts
// ❌ WRONG — confirms email exists
if (!user) return res.status(404).json({ error: 'Email not found' });

// ✅ CORRECT — same message for all failure modes
return res.status(401).json({ error: 'Invalid credentials' });
```

---

## Decision Tree

```
Hashing a password?
  → New project → Argon2id (memoryCost: 65536, timeCost: 3)
  → Existing project with bcrypt → keep bcrypt, cost factor ≥ 12
  → No extra dependency wanted → scrypt via standard library
  → Never MD5 / SHA-1 / SHA-256 / plain SHA-512 for passwords

Password using bcrypt and may be long (passphrases)?
  → Preferred: migrate to Argon2id — no input limit, no workaround needed
  → If staying on bcrypt: pre-hash with SHA-256 and encode as hex (64 chars, safe)
     before passing to bcrypt — never pass raw bytes (null bytes truncate early)

Legacy hashes in DB (MD5 / SHA-1)?
  → Upgrade on next login: re-hash plaintext with Argon2id on successful auth
  → Store hashVersion to track which users have been migrated
  → Do not force mass reset

Setting password length policy?
  → Minimum 8 chars · Maximum ≥ 64 chars · No complexity rules (NIST SP 800-63B)
  → Check against HaveIBeenPwned on registration and password change

Adding defense-in-depth beyond salt?
  → Pepper: server-side secret in env config, applied before hashing, never in DB

Implementing login?
  → Hash comparison: use library verify/compare (timing-safe) — never ===
  → Return same error for wrong email or wrong password (no enumeration)
  → Issue short JWT (15 min) + rotate refresh token into httpOnly cookie
  → OAuth: generate state param · validate on callback · exchange code for token

Storing tokens client-side?
  → Access token: memory only (not localStorage, not sessionStorage)
  → Refresh token: httpOnly secure cookie

JWT expiry?
  → Access token: 15 min max
  → Refresh token: 7–30 days · rotate on use · invalidate on logout

Comparing tokens or secrets?
  → crypto.timingSafeEqual — never ===

Auth endpoint (login/register/reset)?
  → Apply rate limiting (10 req / 15 min per IP)
  → Return generic error message (never confirm email existence)

OAuth integration?
  → Generate state param → store server-side → verify on callback
  → Use PKCE for public clients (SPAs, mobile)

Password reset?
  → Time-limited token (15–60 min) · single-use · invalidate on use
  → Send via email only · never return in API response
```

---

## Example

JWT auth with refresh token rotation.

```ts
// Login: issue access + refresh tokens
async function login(email: string, password: string, res: Response) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new UnauthorizedError('Invalid credentials'); // same message always
  }

  const accessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = crypto.randomBytes(32).toString('hex');
  await db.refreshToken.create({ data: { token: refreshToken, userId: user.id } });

  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
  return { accessToken };
}

// Refresh: rotate token
async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.cookies;
  const stored = await db.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored) throw new UnauthorizedError('Invalid refresh token');

  await db.refreshToken.delete({ where: { token: refreshToken } }); // rotate
  const newRefresh = crypto.randomBytes(32).toString('hex');
  await db.refreshToken.create({ data: { token: newRefresh, userId: stored.userId } });

  const accessToken = jwt.sign({ sub: stored.userId }, JWT_SECRET, { expiresIn: '15m' });
  res.cookie('refreshToken', newRefresh, { httpOnly: true, secure: true, sameSite: 'strict' });
  return { accessToken };
}
```

---

## Edge Cases

**Refresh token theft:** If a stolen refresh token is used after rotation, the original is already deleted — the second use will fail. Optionally: invalidate all sessions for that user on double-use detection.

**Stateless vs stateful JWTs:** Stateless JWTs cannot be revoked mid-lifetime. If you need instant revocation (logout from all devices), store a token version or jti in the DB and check on each request.

**PKCE for SPAs:** SPAs cannot keep a client secret. Use OAuth PKCE flow (`code_verifier` + `code_challenge`) instead of client_secret.

**Multi-device sessions:** Store refresh tokens per device with a device identifier. Logout invalidates only that device's token; "logout everywhere" purges all.


---

## Resources

- [password-hashing.md](references/password-hashing.md) - Algorithm selection, parameters, pepper, NIST policy, antipatterns, migration
