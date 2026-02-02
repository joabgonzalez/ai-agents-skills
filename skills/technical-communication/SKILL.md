---
name: technical-communication
description: Clear and effective technical communication for documentation, code comments, and team collaboration. Writing standards, documentation structure, commit messages. Trigger: When writing technical documentation, creating code comments, or communicating technical concepts.
skills:
  - conventions
allowed-tools:
  - documentation-reader
  - web-search
---

# Technical Communication Skill

## Overview

Best practices for clear, concise, and effective technical communication in software development contexts.

## Objective

Enable developers to communicate technical concepts clearly through documentation, code comments, commit messages, and team collaboration.

---

## When to Use

Use this skill when:

- Writing API documentation or README files
- Creating code comments and JSDoc
- Writing commit messages and PR descriptions
- Documenting architecture decisions (ADRs)
- Explaining technical concepts to team members

Don't use this skill for:

- Marketing copy or user-facing content
- Non-technical communication

---

## Critical Patterns

### ✅ REQUIRED: Write Descriptive Commit Messages

```
// ✅ CORRECT: With ticket ID
[JIRA-123] feat: Add JWT refresh token mechanism

Implements automatic token refresh when access token expires.
Includes retry logic and error handling for failed refreshes.

// ✅ CORRECT: Without ticket ID (when no ticket provided)
feat: Add JWT refresh token mechanism

Implements automatic token refresh when access token expires.
Includes retry logic and error handling for failed refreshes.

// ❌ WRONG: Vague or no context
fix stuff

// ❌ WRONG: Including [TICKET-ID] placeholder when no ticket provided
[TICKET-ID] feat: Add feature
```

**Rules:**

- If ticket ID is provided: Start with `[TICKET-ID]` (e.g., `[JIRA-123]`, `[SBD-456]`)
- If NO ticket ID is provided: Omit `[TICKET-ID]` entirely, start directly with type (e.g., `feat:`, `fix:`)
- Never use placeholder `[TICKET-ID]` without actual ticket number

### ✅ REQUIRED: Use Active Voice

```markdown
<!-- ✅ CORRECT: Active voice -->

The API validates the request and returns a 200 status.

<!-- ❌ WRONG: Passive voice -->

The request is validated by the API and a 200 status is returned.
```

### ✅ REQUIRED: Provide Examples

```markdown
<!-- ✅ CORRECT: With example -->

## Authentication

Include your API key in the Authorization header:

\`\`\`
Authorization: Bearer your-api-key
\`\`\`

<!-- ❌ WRONG: No example -->

## Authentication

Use the Authorization header with your API key.
```

---

## Conventions

Refer to conventions for:

- Code organization
- Documentation standards

### Technical Communication Specific

- Write clear, scannable documentation
- Use active voice
- Provide context and examples
- Keep sentences concise
- Use proper markdown formatting
- Write descriptive commit messages
- Document assumptions and decisions

---

## Decision Tree

**API documentation?** → Include endpoint, parameters, request/response examples, error codes.

**Code comment?** → Explain "why" not "what". Avoid obvious comments.

**Commit message?** → Use conventional commits: `type(scope): subject` or `[TICKET-ID] type(scope): subject`. Include body for complex changes. Omit `[TICKET-ID]` if no ticket provided.

**README?** → Include: purpose, installation, usage, examples, contributing guidelines.

**Architecture decision?** → Write ADR with context, decision, consequences.

**Complex concept?** → Use diagrams, examples, analogies. Break into smaller sections.

**Error message?** → State problem, cause, solution. Be specific and actionable.

---

## Example

Good commit message:

```
// With ticket ID
[JIRA-123] feat: Add user authentication with JWT

Implements JWT-based authentication system with refresh tokens.
Includes login, logout, and token refresh endpoints.

// Without ticket ID
feat: Add user authentication with JWT

Implements JWT-based authentication system with refresh tokens.
Includes login, logout, and token refresh endpoints.
```

Good documentation:

```markdown
## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <token>
\`\`\`

Tokens expire after 1 hour. Use the refresh endpoint to obtain a new token.
```

---

## Edge Cases

**Audience knowledge level:** Adjust technical depth based on audience. Avoid jargon for general audience.

**Outdated documentation:** Review and update docs regularly. Use doc tests or CI checks.

**Version-specific docs:** Clearly indicate which version documentation applies to.

**Non-native English speakers:** Use simple, clear language. Avoid idioms and complex sentences.

**Code examples:** Ensure examples are runnable and tested. Include necessary imports and setup.

---

## References

- https://www.writethedocs.org/guide/writing/style-guides/
- https://developers.google.com/style
