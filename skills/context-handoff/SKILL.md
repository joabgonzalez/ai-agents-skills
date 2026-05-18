---
name: context-handoff
description: "Paste-ready session summary for context transfer to a new chat. Trigger: User says 'context handoff', 'start fresh', or session needs to continue."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
---

# Context Handoff

Distill a conversation into a paste-ready block that gives a cold agent full context to continue the work without loss. Strips noise, keeps decisions and their rationale, captures open threads.

## When to Use

- User says "context handoff", "summarize the chat", "start a new chat", or "I need to continue this elsewhere"
- Session is long and approaching context limits
- User wants to hand off work to a different agent or model
- User wants a checkpoint before switching focus

Don't use for:

- Summarizing code or a single file (read the file directly)
- Generating release notes or changelogs
- Internal mid-task notes — this is for cross-session handoffs only

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Paste-Ready Output

The entire handoff block must be inside a single fenced code block so the user can copy it in one action. No surrounding prose that breaks the copy.

````markdown
// ✅ CORRECT — single fenced block, copy-ready
```
# Context Handoff
...
```

// ❌ WRONG — split across prose, requires manual assembly
Here's a summary of what we discussed:
**Goal:** ...
And the decisions were:
- ...
````

### ✅ REQUIRED: Decisions With Rationale

Never record a decision without its why. Rationale-free decisions decay — the next agent can't judge edge cases.

```markdown
// ❌ WRONG — decision without rationale
- Using JWT auth

// ✅ CORRECT — decision + rationale
- JWT auth (stateless fits the existing Express setup; no server session infra)
```

### ✅ REQUIRED: Verbatim Technical References

File paths, function names, error messages, CLI commands — copy them exactly. Never paraphrase technical identifiers.

```markdown
// ❌ WRONG — paraphrased, now useless
- Error in the auth file around line 40

// ✅ CORRECT — verbatim
- TypeError: Cannot read properties of undefined (reading 'userId') at src/middleware/auth.ts:42
```

### ✅ REQUIRED: Single Specific Next Step

The next-step field must be one concrete action, not a direction. The cold agent must be able to start immediately.

```markdown
// ❌ WRONG — too vague
**Next step:** Continue working on auth

// ✅ CORRECT — specific and actionable
**Next step:** Implement POST /auth/refresh in src/routes/auth.ts — JWT rotation logic, store refresh token in httpOnly cookie
```

### ❌ NEVER: Include Conversation Meta

Don't reference the conversation itself. The handoff block must read as if it were written independently.

```markdown
// ❌ WRONG — references the conversation
"In this session we decided to use JWT. You asked about refresh tokens and I explained..."

// ✅ CORRECT — states facts directly
- JWT auth, 15-min access token, 7-day refresh token (httpOnly cookie)
```

### ❌ NEVER: Omit Open Threads

Unresolved questions and blocked items are the highest-value content in a handoff. Skipping them forces the next agent to rediscover them.

```markdown
// ❌ WRONG — open thread omitted
**Open threads:** None

// ✅ CORRECT — open threads captured
**Open threads:**
- Rate limiting strategy not decided (per-IP vs per-user)
- Migration for users table blocked: needs DBA approval first
```

---

## Decision Tree

```
User requests a handoff or summary?
  → Scan full conversation for: goal, stack, decisions, current state, open threads, next step
  → Strip: pleasantries, failed attempts, redundant explanations, restated questions

Any decisions found?
  → Yes → Include with rationale
  → No → Omit the Decisions section entirely

Any open threads or blockers?
  → Yes → Include all of them — never omit
  → No → Write "None"

Is the next step clear from context?
  → Yes → Write one specific action
  → No → Write the most logical continuation and mark it as inferred

Output format?
  → Single fenced block, no surrounding prose
```

---

## Conventions

The handoff block always follows this structure:

````markdown
```
# Context Handoff

**Goal:** [what we're trying to achieve — one sentence]

**Stack / Constraints:** [tech stack, versions, key constraints]

**Decisions made:**
- [decision] ([rationale])
- [decision] ([rationale])

**Current state:** [what's done, what's in-progress, last file/line touched]

**Open threads:**
- [unresolved question or blocked item]
- [unresolved question or blocked item]

**Next step:** [single specific action the next agent should do first]
```
````

Omit **Decisions made** if none were made. All other fields are always present.

---

## Example

After a session working on an auth module:

````markdown
```
# Context Handoff

**Goal:** Add JWT authentication to the Express API at /Users/dev/myapp

**Stack / Constraints:** Node.js 20, Express 4, TypeScript, PostgreSQL — no existing auth infrastructure

**Decisions made:**
- JWT auth (stateless, no session infra needed)
- Access token 15 min, refresh token 7 days (balance between security and UX)
- Refresh token stored in httpOnly cookie (XSS protection)
- Passwords hashed with bcrypt, cost factor 12

**Current state:** POST /auth/login implemented and tested (src/routes/auth.ts:1-67). Refresh endpoint not started.

**Open threads:**
- Rate limiting not decided — per-IP or per-user?
- Token blacklist on logout: in-memory Set (dev only) or Redis? Not resolved.

**Next step:** Implement POST /auth/refresh in src/routes/auth.ts — validate refresh token from cookie, issue new access token, rotate refresh token
```
````

---

## Edge Cases

**Very long session with many topics:** Focus on the active work stream. If multiple unrelated threads exist, create one handoff block per thread or ask the user which to carry forward.

**Session with no decisions:** Skip the Decisions section entirely. Don't write "No decisions made" — just omit it.

**Blocked task with no clear next step:** Write the next step as "Resolve blocker: [describe it]" so the next agent knows to start there.

**User wants a handoff mid-task:** Capture in-progress state precisely — include the last file edited, last line touched, and what was being attempted so the next agent doesn't restart from zero.
