---
name: grill-me
description: "One-at-a-time questioning to fully profile a goal before acting. Trigger: User says 'grill me', goal is vague, or clarification is needed first."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
---

# Grill Me

Systematically interview the user one question at a time to resolve every decision branch before executing a task. Prevents wasted work from acting on incomplete or ambiguous goals.

## When to Use

- User says "grill me", "ask me what you need", or "clarify before starting"
- Goal is vague, underspecified, or has multiple valid interpretations
- Task has significant branching (auth strategy, architecture, scope) where wrong assumption = wasted work
- User explicitly wants to think through a plan before implementation

Don't use for:

- Clear, specific tasks where intent is unambiguous (use sharp-execution)
- Trivial one-liners with no meaningful decision points
- When the codebase already answers the open questions

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: One Question at a Time

Never batch questions. Ask one, wait for the answer, then ask the next.

```markdown
// ❌ WRONG — batching kills the interview
"What auth strategy do you want? JWT or sessions?
And should I add refresh tokens? Also, REST or GraphQL?"

// ✅ CORRECT — sequential, focused
"What auth strategy do you want — JWT or session-based?
(Recommend: JWT — your app has no server session infrastructure)"
```

### ✅ REQUIRED: Offer a Recommended Answer

Each question must include your best guess based on context. The user confirms or redirects — they don't fill a blank.

```markdown
// ❌ WRONG — blank question forces user to invent the answer
"What database should we use?"

// ✅ CORRECT — recommendation reduces cognitive load
"Which database? (Recommend: PostgreSQL — you're already using it in docker-compose.yml)"
```

### ✅ REQUIRED: Check Context Before Asking

Read the codebase, opened files, and prior messages. Skip any question answerable from context.

```markdown
// ❌ WRONG — asks what the code already shows
"What framework are you using?"

// ✅ CORRECT — observed from package.json, skipped
[No question — Next.js confirmed from package.json. Moving to auth strategy.]
```

### ✅ REQUIRED: Respect Decision Dependencies

Ask questions in dependency order. Don't ask B before A is known — B's answer may depend on A.

```markdown
// ❌ WRONG — asking about refresh tokens before auth strategy is settled
"Do you need refresh tokens?"

// ✅ CORRECT — establish auth type first
"JWT or session-based? (Recommend: JWT)"
// [User confirms JWT] → Now ask about refresh tokens
```

### ❌ NEVER: Start the Task Before All Branches Are Resolved

Once all key decisions are made, summarize findings and then proceed. Never execute mid-interview.

```markdown
// ❌ WRONG — starts implementing while questions remain open
"Got it, JWT it is. I'll start building the auth module now—
oh also, do you need refresh tokens?"

// ✅ CORRECT — full summary before action
"All set. Summary:
- JWT auth, 15-min expiry
- Refresh tokens stored in httpOnly cookie
- Endpoints: POST /auth/login, POST /auth/refresh, POST /auth/logout
Starting implementation."
```

---

## Decision Tree

```
User says "grill me" or goal is vague?
  → Enter grill-me mode

Next open question — can it be answered from context?
  → Yes (codebase, opened files, prior messages) → Read it. Skip the question.
  → No → Ask it. Provide recommended answer. Wait for response.

Is this question dependent on a prior unanswered question?
  → Yes → Answer the dependency first

All branches resolved?
  → No → Continue to next question
  → Yes → Output summary of all decisions → Proceed with task
```

---

## Example

User: "I want to add auth to my app. Grill me."

```markdown
Q1: "API-only auth or does it include a frontend login UI?
(Recommend: API-only — no frontend code found in the repo)"

[User: API-only]

Q2: "JWT or session-based?
(Recommend: JWT — stateless fits your existing Express setup)"

[User: JWT]

Q3: "Short-lived tokens only, or add refresh token rotation?
(Recommend: refresh tokens — better UX for mobile if you add it later)"

[User: refresh tokens, yes]

Summary before starting:
- JWT auth, access token 15 min, refresh token 7 days
- Refresh token stored in httpOnly cookie
- Endpoints: POST /auth/login, POST /auth/refresh, POST /auth/logout
- No frontend — API-only

Proceeding with implementation.
```

---

## Edge Cases

**User gives partial answers:** Acknowledge what was confirmed, re-ask the remaining part of the question — don't silently carry forward an assumption.

**Contradictory answers:** Surface the conflict explicitly. "You said stateless JWT but also want server-side session tracking — these conflict. Which takes priority?"

**Open-ended exploration (no clear goal):** Start with the highest-level scoping question: "What problem are we solving?" before drilling into implementation.

**User cuts the interview short:** Respect it. Summarize what's known, state remaining assumptions explicitly, then proceed.

**Too many questions:** If you have 8+ questions, group them into themes and prioritize. Ask about the highest-impact decisions first — the rest may resolve themselves once those are settled.
