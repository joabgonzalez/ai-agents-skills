# Password Hashing

Deep reference for password hashing strategy, hardening, migration, and known incidents.

---

## Core Patterns

### Algorithm Selection

Passwords require a **slow, memory-hard hash** with a per-password salt. Never use general-purpose hash functions — designed for speed, wrong for passwords.

| Algorithm | Verdict | Why |
|-----------|---------|-----|
| **Argon2id** | ✅ First choice | PHC winner · memory-hard (GPU-resistant) · configurable CPU + memory cost · no input limit |
| **bcrypt** | ✅ Acceptable | Proven 25-year track record · widely supported · **72-byte input limit** |
| **scrypt** | ✅ Acceptable | Memory-hard like Argon2 · built into many standard libraries |
| PBKDF2 | ⚠️ Legacy only | Not memory-hard — GPU-parallelizable · use only for FIPS compliance |
| SHA-256 / SHA-512 | ❌ Never | Designed for speed — billions of hashes/sec on GPU |
| MD5 / SHA-1 | ❌ Never | Broken, fast, rainbow tables publicly available |

**Why slow hashes:** bcrypt at cost 12 takes ~300ms per attempt. A leaked DB with SHA-256 passwords is cracked in hours; the same DB with bcrypt takes centuries on the same GPU.

### Recommended Parameters

| Algorithm | Parameter | Minimum | Notes |
|-----------|-----------|---------|-------|
| Argon2id | `memoryCost` | 64 MB | Increase on memory-rich servers |
| Argon2id | `timeCost` | 3 iterations | |
| bcrypt | cost factor | 12 | 10 is too low for 2024+ hardware |
| All | hash time | ~300ms | Calibrate on your server |

### Core Rules

- Let the library generate the salt — never generate it manually or reuse it
- Store the full PHC string output (includes algorithm, params, salt, hash) — not raw bytes
- Use the library's `verify`/`compare` — built-in timing safety; `===` is not
- Hash only the password field, in isolation — never concatenate with other values
- Always run the hash even when the user is not found — skipping leaks timing (email enumeration)

---

## Pepper

A pepper is a server-side secret mixed into the hash before hashing. Unlike the salt (stored in DB), the pepper lives in server config. If the DB leaks without the server, hashes are useless without the pepper.

- Store pepper in environment config, never in the DB
- Apply consistently: `hash(pepper + password)` or as Argon2 `secret` param
- Rotate by storing a `pepperVersion` column — re-hash on next successful login with new pepper
- Defense-in-depth only — not a substitute for a strong algorithm and cost factor

---

## Password Length Policy (NIST SP 800-63B)

- Minimum: 8 characters (user-chosen)
- Maximum: accept at least 64 characters — never impose limits below 64
- Do not impose complexity rules (uppercase + number + symbol) — they produce predictable patterns (`Password1!`) and reduce entropy
- Check new passwords against known-breached lists (HaveIBeenPwned API) on registration and password change
- Arbitrary short maximums (16–20 chars) signal the system stores passwords in plaintext or uses a weak fixed-size hash

---

## Known Antipatterns

❌ **Concatenating user fields before hashing (Okta 2022):** Okta concatenated `userId + username + password` before passing to bcrypt. bcrypt silently truncates at 72 bytes. When the prefix exceeded 72 bytes, the password was entirely truncated — bcrypt hashed only identifiers. Any password passed verification. Rule: hash the password string alone.

❌ **bcrypt input > 72 bytes (passphrases):** bcrypt truncates silently. Mitigation: migrate to Argon2id (no limit). If staying on bcrypt: pre-hash with SHA-256 and encode as **hex** (64 chars, safe) before passing — never pass raw bytes (null bytes truncate early in some implementations).

❌ **bcrypt for non-password data:** bcrypt is a credential verifier, not a general-purpose hash. Using it for session tokens or cache keys introduces truncation risk. Use HMAC-SHA256 for tokens.

❌ **Reusing a password hash as a session token:** A hash is a one-way verifier, not a secret. Issue a separate cryptographically random token for sessions.

❌ **Fixed or global salt:** Shared salt means two users with the same password produce the same hash — one lookup cracks both. All recommended libraries handle per-password salts automatically.

❌ **Artificially short password maximums:** A 20-char max suggests plaintext storage or a fixed-size weak hash. NIST requires accepting at least 64 characters.

---

## Migrating Legacy Hashes

Do not force a mass password reset — most users will not complete it. Use upgrade-on-login:

1. Add a `hashVersion` column to the users table
2. On successful login: if `hashVersion` is legacy, re-hash the plaintext password with Argon2id and update the stored hash + version
3. Optional offline upgrade: `newHash(oldHash(password))` — wraps the old hash without needing plaintext. Users migrated without login, but the double-hash approach has trade-offs (verify step must unwrap first)

Never delete accounts with un-migrated hashes until you have a forced-reset fallback for inactive users.
