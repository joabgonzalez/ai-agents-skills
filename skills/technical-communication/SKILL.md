---
name: technical-communication
description: Clear and effective technical communication for documentation, code comments, and team collaboration.
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

## Example

Good commit message:

```
feat: Add user authentication with JWT

Implements JWT-based authentication system with refresh tokens.
Includes login, logout, and token refresh endpoints.

Closes #123
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

## References

- https://www.writethedocs.org/guide/writing/style-guides/
- https://developers.google.com/style
