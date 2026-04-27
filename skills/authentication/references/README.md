# Authentication References

## Quick Navigation

| Reference | Lines | Topic |
|-----------|-------|-------|
| [password-hashing.md](password-hashing.md) | ~100 | Algorithm selection, parameters, pepper, NIST policy, antipatterns, migration |

---

## Reading Strategy

**Implementing password storage from scratch:** Read password-hashing.md — Algorithm Selection → Recommended Parameters → Core Rules.

**Hardening an existing system:** Read password-hashing.md — Pepper → Known Antipatterns.

**Migrating from MD5/SHA-1:** Read password-hashing.md — Migrating Legacy Hashes.

**Password length or policy questions:** Read password-hashing.md — NIST SP 800-63B section.

---

## File Descriptions

### password-hashing.md (~100 lines)

Complete reference for password hashing: algorithm selection table with rationale, recommended parameters per algorithm, pepper strategy with rotation, NIST SP 800-63B password policy, six documented antipatterns (including Okta 2022 incident), and upgrade-on-login migration pattern for legacy hashes.

---

## Cross-Reference Map

**Algorithm selection + parameters:** See password-hashing.md Core Patterns
**Pepper implementation:** See password-hashing.md Pepper section
**NIST policy (length, complexity, breach check):** See password-hashing.md Password Length Policy
**Okta 2022 + known incidents:** See password-hashing.md Known Antipatterns
**Migration from legacy hashes:** See password-hashing.md Migrating Legacy Hashes
