# Code Review Output Format

Structure review output so any audience can act on it: another developer, yourself, or an agent with no prior context (e.g. using receiving-code-review). The review must be self-contained.

---

---

## Core Patterns

### Canonical Output Order

1. **Verdict** — did it pass? (always first)
2. **What works well** — never skip; a review with only negatives reads as adversarial
3. **Findings** — sorted by severity descending
4. **Merge checklist** — what to do next, grouped by urgency

Scale to PR size:

- **Small PR / hotfix**: Verdict + Findings + Checklist
- **Medium PR**: full structure above
- **Large PR with spec/plan**: add Acceptance criteria table before Findings

### Verdict Section

One-line outcome + severity counts table. Reader gets the result in under five seconds.

```markdown
Verdict: Approved with changes. One HIGH correctness issue before merge.

Severity | Count | Action
CRITICAL |   0   | Block merge
HIGH     |   1   | Must fix before merge
MEDIUM   |   0   | Fix here or near-term
LOW      |   1   | Optional

No security findings. No correctness regressions beyond HIGH-1.
```

### Severity Definitions

Apply consistently — severity is grounded in impact, not reviewer mood.

| Severity | Definition |
|---|---|
| **CRITICAL** | Security issue, data loss risk, or runtime crash |
| **HIGH** | Correctness bug or broken public-API contract |
| **MEDIUM** | Quality/consistency issue that compounds across future PRs |
| **LOW** | Nit — stylistic, cosmetic, low-impact |

### Self-Contained Finding Format

Each finding is a standalone unit — readable with zero context, actionable by an agent with no conversation history.

Required fields — never omit any:

```
[SEVERITY-N] path/to/file.ts:line — one-line title

What: factual description or code citation

Why it matters: one paragraph — contract impact, correctness, future maintainability

Fix: runnable code snippet or explicit instruction
```

Rules:
- Always cite `file:line` — never "around line X"
- Always include **why it matters** — never assume the reader infers the rationale
- Always include a concrete fix — not "consider improving" but an explicit change
- When two fixes are equally valid, present both as option A / option B with one line on when to pick each
- Finding IDs (`[HIGH-1]`, `[MED-2]`) must be stable — the merge checklist references them

❌ WRONG — vague, no context, no fix:

> "Error handling could be better around the auth middleware"

✅ CORRECT — self-contained, actionable, audience-agnostic:

```
[HIGH-1] src/middleware/auth.ts:34 — JWT decode used instead of verify

What: jwt.decode(token) skips signature verification — any token passes.

Why it matters: An attacker can forge a token with any payload and gain
unauthorized access. decode() is for inspection only; verify() must be used
for authentication.

Fix: const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
```

### Merge Checklist Structure

Four buckets. Author copies into PR description and ticks as items land.

```
Required before merge
  [ ] [HIGH-1] action
  [ ] [HIGH-2] action

Recommended in this PR
  [ ] [MED-1] action

Document in PR description
  [ ] scope clarification or deferred criterion

Hygiene / next PRs
  [ ] [LOW-1] action
```

### Acceptance Criteria Table (large PRs with spec)

Add before Findings when reviewing against a written spec or plan.

Statuses: `PASS` · `FAIL` · `PARTIAL` · `NOT EXERCISED` · `N/A`

```
Acceptance criteria

# | Criterion              | Status  | Notes
1 | criterion from plan    | PASS    | why
2 | criterion from plan    | PARTIAL | what's missing
3 | criterion from plan    | N/A     | why it doesn't apply

Bottom line: one-line summary.
```

---

---

## Complete Example

```markdown
## Verdict
> **Approved with changes.** Spec compliance passes; one HIGH correctness issue before merge.

| Severity | Count | Action |
|---|---|---|
| HIGH | 1 | Must fix before merge |
| LOW | 1 | Optional |

No security findings. No correctness regressions beyond HIGH-1.

---

What works well:
- Async password hashing: bcrypt.hash used correctly — no event loop blocking.
- Duplicate email handling: 409 with clear message, consistent with API contract.

---

Findings:

[HIGH-1] src/services/UserService.ts:23 — hashSync blocks event loop

  What: bcrypt.hashSync(password, 10) used in async context.

  Why it matters: hashSync is synchronous — blocks the Node.js event loop for ~300ms
  per request. Under load, all concurrent requests stall during registration.

  Fix: const hashed = await bcrypt.hash(password, 10);

[LOW-1] src/services/UserService.ts:45 — magic number for min password length

  What: if (password.length < 8) — 8 is not named.

  Fix: extract to const MIN_PASSWORD_LENGTH = 8;

---

Merge checklist:

  Required before merge:
    [ ] [HIGH-1] Replace hashSync with async bcrypt.hash at UserService.ts:23

  Optional:
    [ ] [LOW-1] Extract MIN_PASSWORD_LENGTH constant
```
