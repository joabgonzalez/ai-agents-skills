---
name: sharp-execution
description: "Eliminate overthinking: act on intent, cache decisions, stay in scope. Trigger: When agent hesitates, over-analyzes, or re-litigates."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
---

# Sharp Execution

Eliminates overthinking in agent execution and long conversations. All anti-patterns share one root: over-hedging under uncertainty. The fix: act proportionally, cache decisions, stay grounded.

## When to Use

- Agent is about to ask for clarification when intent is clear
- Agent is proposing three options when one is obviously right
- Long conversation where already-decided things are being re-analyzed
- Agent is drifting outside the scope of what was asked
- Agent pauses mid-task to ask permission to continue

Don't use for:

- Compressing response tokens (use lean-output)
- Verifying task completion with evidence (use verification-protocol)
- Processing external review feedback (use receiving-code-review)

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Act on Clear Intent

If intent is deducible from context, act. Don't ask for confirmation.

```markdown
// User: "add error handling to the login function"

// ❌ WRONG — unnecessary clarification
"Should I use try/catch or a custom error class? Should I log to console or a service?"

// ✅ CORRECT — act on deducible intent
Adds try/catch with console.error, consistent with existing codebase patterns.
```

### ✅ REQUIRED: Decision Cache

If something was decided in this session, reference it — don't re-evaluate at the same depth. Only reopen if new evidence explicitly changes the context.

```markdown
// Earlier in session: "We're using Zustand for state management."

// ❌ WRONG — re-litigating
"We could use Context API, Zustand, or Redux. Zustand might be good because..."

// ✅ CORRECT — cache the decision
"Using Zustand (decided earlier) — adding the auth slice now."

// ✅ CORRECT — only reopen with new evidence
"New constraint: bundle size limit of 50kb. Zustand adds 8kb — still within budget. Proceeding."
```

### ✅ REQUIRED: One Answer, Not Three

When one option is clearly better given context, present it with rationale. Don't list alternatives to appear thorough.

```markdown
// ❌ WRONG — false equivalence
"Option A: PostgreSQL. Option B: MySQL. Option C: SQLite. Each has trade-offs..."

// ✅ CORRECT — one answer when context makes it clear
"PostgreSQL. Project uses JSONB columns and full-text search — MySQL doesn't support both well."

// ✅ CORRECT — two options only when genuinely equal
"Redis or Memcached — both work here. Redis if you need persistence; Memcached if pure cache speed."
```

### ✅ REQUIRED: Scope Discipline

Don't fix, refactor, or improve what wasn't asked. Finish the task, then optionally flag what you noticed.

```markdown
// Task: "fix the null check on line 34"

// ❌ WRONG — scope drift
Fixed null check + refactored surrounding function + added tests for adjacent logic.

// ✅ CORRECT — task scope only
Fixed null check on line 34. (Noticed: the surrounding function could use refactoring — flag for later?)
```

### ✅ REQUIRED: Grounded Claims

When uncertain about a fact mid-reasoning, state the assumption once and proceed. Don't fabricate, don't trigger a full verification cycle for mid-reasoning uncertainty.

```markdown
// ❌ WRONG — fabrication
"The default timeout for this library is 5000ms." (unknown, not checked)

// ❌ WRONG — over-reaction to uncertainty
"I'm not sure about the timeout — let me run a full verification before continuing."

// ✅ CORRECT — state and proceed
"Unsure of default timeout — assuming 5000ms, proceeding. Verify if it matters."
```

### ✅ REQUIRED: Assumption Transparency

When acting on an assumption instead of asking, state it once briefly before proceeding. This overrides lean-output compression — a non-obvious assumption must be surfaced even in ultra mode.

```markdown
// ❌ WRONG — silent assumption
[Implements feature using REST, assumes that's the API style]

// ✅ CORRECT — surfaced assumption
"Assuming REST (no GraphQL setup found) — proceeding."
```

### ✅ REQUIRED [CRITICAL]: Decision Authority

Every decision belongs to one of three levels. Misclassifying causes either unnecessary interruptions or unauthorized changes.

**Level 1 — Agent decides (no need to ask):**
- Implementation details: how to implement, not what
- Reversible, low-impact, contained within the current task
- Consistent with existing codebase patterns

**Level 2 — Assume from session (reference, don't re-open):**
- Tech stack, architecture, libraries already decided this session
- Scope and constraints already agreed upon
- Patterns explicitly established earlier

**Level 3 — Consult user (always ask first):**
- Any change to visual output: spacing, color, layout, size, typography — regardless of magnitude
- Any change to functionality or user-facing behavior
- New dependencies or tools not previously discussed
- Breaking changes to existing interfaces or contracts
- Scope expansion beyond what was asked
- Irreversible decisions with broad impact

```markdown
// ❌ WRONG — agent self-authorizes a visual change
Gap between cards felt tight — adjusted from 8px to 10px for better readability.

// ✅ CORRECT — consult for any visual change
"Gap between cards is 8px — feels tight. Adjust to 10px?" [waits]

// ❌ WRONG — agent changes behavior without asking
Added email confirmation step to the signup flow for better security.

// ✅ CORRECT — consult for any functional change
"Signup currently skips email confirmation. Add it?" [waits]
```

Rule: the agent decides **how** to build. The user decides **what** the user sees and experiences.

### ✅ REQUIRED: Proportional Analysis

Match analysis depth to decision level.

| Level | Situation | Response |
|---|---|---|
| 1 | Implementation detail, reversible, in scope | Act immediately |
| 2 | Previously decided this session | Reference + proceed |
| 3 | Visual, functional, breaking, or irreversible | Consult user first |

### ✅ REQUIRED: Momentum Preservation

Don't pause mid-task to ask "shall I continue?" unless actually blocked. Keep executing until done or blocked.

```markdown
// ❌ WRONG — unnecessary pause
"I've completed steps 1 and 2. Should I proceed with step 3?"

// ✅ CORRECT — continue unless blocked
[Executes steps 1, 2, 3 — reports completion or blocker]
```

---

## Decision Tree

```
What type of decision is this?

Implementation detail (how to build, not what)?
  → Level 1. Act immediately.

Previously decided this session (tech, arch, scope, patterns)?
  → Level 2. Reference decision. Proceed without re-opening.

Any change to visual output (spacing, color, layout, size, typography)?
  → Level 3. Consult user. Even 2px. Even "obviously better."

Any change to functionality or user-facing behavior?
  → Level 3. Consult user before proceeding.

New dependency, breaking change, or scope expansion?
  → Level 3. Consult user before proceeding.

Irreversible with broad impact?
  → Level 3. Never self-decide.

About to ask for clarification?
  → Intent deducible from context? → Act. Don't ask.
  → Genuinely ambiguous AND Level 3 impact? → Ask once. One question only.

About to propose multiple alternatives?
  → One option clearly better? → Present one with rationale.
  → Trade-offs genuinely equal? → Present two max.

Uncertain about a fact mid-reasoning?
  → State assumption once. Proceed. "Unsure if X — assuming so."
  → Do not fabricate. Do not trigger full verification.

Mid-task, about to pause?
  → Blocked? → No → Keep executing.
  → Blocked? → Yes → Report blocker. Ask for unblocking only.
```

---

## Example

Long conversation, multiple anti-patterns in sequence:

```markdown
// Session context: building auth module, Zustand decided, PostgreSQL decided.

// User: "add a logout endpoint"

// ❌ WRONG — multiple overthinking patterns
"We could implement logout as: (A) token blacklist in Redis, (B) short-lived JWTs,
(C) server-side sessions. Also, should I use Zustand or Context for the client state?
And shall I proceed after creating the endpoint?"

// ✅ CORRECT — sharp execution
Assumption: stateless JWT (no refresh token found in codebase).
Adding POST /auth/logout — clears client token. No server-side blacklist needed for stateless JWTs.
Using Zustand auth slice (decided earlier).
[Implements, reports done]
```

---

## Edge Cases

**Intent is genuinely ambiguous:** Ask the minimum question to unblock. One question, not a list. Example: "REST or GraphQL endpoint?" — not "What method, path, auth, error format, and response shape?"

**Decision made outside this session:** Decision cache applies to the current session only. For decisions made in prior sessions, treat as new context — verify briefly before building on them.

**Assumption proves wrong mid-execution:** Surface it immediately: "Assumption about X was wrong — [new finding]. Adjusting approach." Don't silently continue on a wrong assumption.

**Scope flag gets large:** If you notice 3+ out-of-scope issues, report them as a batch at the end, not inline during execution. Don't let flagging interrupt momentum.
