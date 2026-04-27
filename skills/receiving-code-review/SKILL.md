---
name: receiving-code-review
description: "Process incoming code review feedback with technical rigor. Trigger: When receiving review comments, feedback, or suggestions on your code."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
  skills:
    - verification-protocol
---

# Receiving Code Review

Process review feedback with technical rigor — verify before implementing, push back when wrong, never respond with performative agreement.

## When to Use

- Receiving review comments on a PR or implementation
- A reviewer (human or agent) provides feedback on your code
- Processing a list of suggested changes or issues

Don't use for:

- Giving code review feedback (use code-review)
- Choosing between options before a decision is made (use brainstorming)

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Verify Before Implementing

Read every item, then verify each against the codebase before touching code. Never assume the reviewer is correct.

```markdown
# Reviewer says: "You're not handling the null case on line 42"

# ❌ WRONG — implement without checking
Fixed the null case on line 42.

# ✅ CORRECT — verify first
Checked line 42: input is validated at the API boundary (middleware/validate.ts:18),
null cannot reach this function. Reviewer assumption is incorrect.
```

### ✅ REQUIRED: Push Back With Technical Reasoning

When a suggestion is wrong, YAGNI, or violates project constraints — say so with evidence. Don't implement it to avoid conflict.

```markdown
# ❌ WRONG — performative agreement
"Great point! You're absolutely right, I'll add that abstraction."

# ✅ CORRECT — technical pushback
"This abstraction isn't warranted yet — only one call site exists.
If a second use case emerges, refactoring is straightforward.
YAGNI applies here."
```

### ❌ NEVER: Respond With Performative Agreement

These phrases are forbidden regardless of whether the reviewer is right or wrong:

- "Great point!"
- "You're absolutely right!"
- "Thanks for catching that!"
- "I'll fix that right away!"

Replace with: read → verify → implement or push back.

### ✅ REQUIRED: Clarify Ambiguous Feedback Before Acting

If a comment is unclear, ask one specific question before implementing anything.

```markdown
# ❌ WRONG — guess and implement
Comment: "This could be more efficient"
Action: Rewrote the function with a different algorithm.

# ✅ CORRECT — clarify first
"Are you referring to time complexity (currently O(n²)) or memory usage?
That determines whether to sort first or use a Map."
```

### ✅ REQUIRED: Batch All Clarifications Before Starting

Read all feedback items first. Collect all ambiguities. Ask once — not per item.

```markdown
# ❌ WRONG — ask per item
Implements item 1 → asks about item 2 → implements → asks about item 3...

# ✅ CORRECT — batch questions
"Before I start: items 2 and 5 need clarification:
- Item 2: 'more efficient' — time or memory?
- Item 5: 'extract this' — new file or same module?"
```

---

## Decision Tree

```
Received review feedback?
  → Read ALL items before touching any code

Item is clear and verifiably correct?
  → Verify against codebase → Implement → Run verification-protocol

Item is unclear?
  → Add to clarification batch. Ask once before starting.

Item is incorrect (verifiable in codebase)?
  → Push back with evidence. Reference file + line.

Item is YAGNI or out of scope?
  → Push back with rationale. No implementation needed.

Item is a style preference not tied to project conventions?
  → Flag as subjective. Implement only if it aligns with project standards.

All items addressed?
  → Run full verification before claiming review complete.
```

---

## Conventions

### Verification order

1. Read all feedback
2. Verify each item against codebase
3. Batch clarifications if any
4. Implement verified correct items
5. Push back on incorrect/YAGNI items
6. Run verification-protocol before marking done

### Pushback format

State the claim → provide evidence → conclude:

> "Line 42 is not null-unsafe: input is validated at `middleware/validate.ts:18` before reaching this function. No change needed."

---

## Example

Receiving 3 feedback items on a PR:

```markdown
## Review received

1. "Missing null check on userId" — line 34
2. "Extract this into a helper" — lines 50-60
3. "Add retry logic for the API call"

## Processing

**Item 1** — Checked line 34: userId comes from authenticated session (guaranteed non-null by auth middleware).
Pushback: "userId is set by auth middleware on every request — null is not reachable here."

**Item 2** — Lines 50-60 are used in one place only. Extraction adds indirection with no reuse benefit.
Pushback: "Single call site. YAGNI — will extract when a second use case appears."

**Item 3** — Valid. API call has no retry logic. Network failures would surface as unhandled errors.
Implementing: exponential backoff, max 3 retries, surface final error to caller.

## Verification
Ran: npm test → 24/24 passed ✅
```

---

## Edge Cases

**Reviewer has more context than you:** If pushback is based on incomplete knowledge (reviewer knows a constraint you don't), ask before concluding. "Is there a reason null can appear here that I'm missing?"

**Multiple reviewers with conflicting feedback:** Flag the conflict explicitly. Don't pick a side silently. "Items 3 and 7 conflict — which takes priority?"

**Critical issues (security, data loss):** Implement immediately without waiting for full batch clarification. Flag as critical and address first.

**Reviewer insists after pushback:** Implement if they provide new evidence or context. Hold position if pushback is repeated without new reasoning.
