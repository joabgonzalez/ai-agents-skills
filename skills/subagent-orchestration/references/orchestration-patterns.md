## Core Patterns

Full examples and walkthroughs for subagent orchestration patterns.

---

### Task Handoff Protocol — Full Example

```
Handoff: Task 1 → Task 2

From: subagent-1 (registration complete)
To: subagent-2 (password reset implementation)

Context Provided to Subagent-2:

Files to read (shared context):
- src/entities/User.ts         — User entity schema
- src/services/EmailService.ts — Email service interface
- tests/helpers.ts             — Test utilities

Interfaces to use:
  interface IEmailService {
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
  }

Constraints:
- Follow same error response format as Task 1 (RFC 7807)
- Use same test patterns (AAA, descriptive names)
- Rate limiting: 3 requests/10min for reset endpoint

NOT Provided (fresh context):
- Implementation details from registration endpoint
- Assumptions made in Task 1
- Technical decisions (e.g., bcrypt config)

Rationale: Subagent-2 should make independent decisions for
password reset, not copy Task 1.

Subagent-2 Instructions:
1. Read User entity schema to understand structure
2. Read EmailService interface for email integration
3. Implement POST /auth/reset-password endpoint
4. Generate secure reset token (crypto.randomBytes)
5. Store token with expiration (30 min)
6. Send reset email via EmailService
7. Write tests (happy path + edge cases)
8. Follow RFC 7807 error format
```

**Handoff includes:**

- **Shared interfaces**: What APIs to use
- **Constraints**: What rules to follow
- **NOT included**: How Task 1 was implemented (allows fresh approach)

---

### Two-Stage Review — Full Walkthrough

```
Task 1: User Registration Endpoint

Subagent-1 Output:
- File: src/routes/auth.ts
- Tests: tests/auth-register.test.ts
- Commits: 3 commits

Stage 1: Spec Compliance Review (Architect)

Spec Requirements:
- PASS: Accepts email/password via POST /auth/register
- PASS: Returns 201 with user object (no password)
- PASS: Email validation enforced
- FAIL: Missing rate limiting (spec section 3.2)
- FAIL: Missing email uniqueness check returns 409

Decision: FAIL spec review

Feedback to Subagent-1:
1. Add rate limiting middleware (5 requests/min per IP)
2. Check email uniqueness, return 409 if exists
3. Add tests for both scenarios

Status: Return to subagent-1 for fixes

[After subagent-1 fixes]

Stage 1 (Retry): Spec Compliance
- PASS: All spec requirements met
- PASS: Rate limiting present
- PASS: Email uniqueness check with 409 response

Decision: PASS spec review → Proceed to Stage 2

Stage 2: Code Quality Review

Quality Assessment:
- PASS: TypeScript strict mode enabled
- PASS: Proper error handling
- WARN: Password hashing uses deprecated bcrypt.hashSync (use async)
- WARN: Magic number (rate limit: 5) should be constant
- PASS: Tests cover happy path + edge cases

Decision: PASS with minor improvements noted

Optional improvements (non-blocking):
1. Use async bcrypt.hash
2. Extract rate limit to config

Status: Task 1 complete, proceed to Task 2
```

---

### Parallel Execution — Batch Structure

```
Batch 1: Parallel Execution

Parallel Group 1 (independent tasks)

Subagent-A (parallel):
- Task 1: User registration endpoint
- Dependencies: User entity, bcrypt
- Estimated: 15 min

Subagent-B (parallel):
- Task 2: Product catalog API (completely independent)
- Dependencies: Product entity, database
- Estimated: 20 min

Status: Both running in parallel

[Wait for both to complete]

Subagent-A: DONE (16 min actual)
Subagent-B: DONE (18 min actual)

Two-Stage Review (each agent):

Subagent-A Review:
- Stage 1 (Spec): PASS
- Stage 2 (Quality): PASS

Subagent-B Review:
- Stage 1 (Spec): FAIL (missing pagination)
- [Fix and re-review]
- Stage 1 (Retry): PASS
- Stage 2 (Quality): PASS

Batch 2: Sequential (dependent tasks)

Subagent-C (sequential):
- Task 3: Password reset endpoint
- Dependencies: Task 1 complete (email service from registration)
- Estimated: 15 min
- Status: Waiting for Subagent-A completion

[After Subagent-A completes → Subagent-C starts]
```

---

### Full Example — User Authentication Feature

```
Subagent Orchestration: User Authentication Feature

Overview:
- Total Tasks: 4
- Parallel Groups: 1 (tasks 1-2)
- Sequential Tasks: 2 (tasks 3-4 depend on 1-2)
- Estimated Time: 45 min

Batch 1: Parallel Execution (Tasks 1-2)

Task 1: User Registration
Subagent-A: Fresh agent
Input:
- User registration spec
- User entity schema
- bcrypt for password hashing
Output: Registration endpoint + tests
Status: Running in parallel

Task 2: Email Service Integration
Subagent-B: Fresh agent (parallel with A)
Input:
- Email service spec
- SendGrid API credentials
- Email templates
Output: EmailService implementation + tests
Status: Running in parallel

[Both complete]
Subagent-A: DONE (18 min)
Subagent-B: DONE (22 min)
Actual parallel time: 22 min (vs 40 min sequential)

Review — Subagent-A (Task 1):
- Stage 1 (Spec): PASS — all requirements met, tests passing
- Stage 2 (Quality): PASS — clean code, minor: extract magic numbers

Review — Subagent-B (Task 2):
- Stage 1 (Spec): FAIL
  - Missing retry logic for failed emails
  - No test for SendGrid API failure
- Feedback: Add exponential backoff retry (3 attempts), test failure scenario
- Status: Return to Subagent-B for fixes

[After Subagent-B fixes]
- Stage 1 (Retry): PASS
- Stage 2: PASS

Batch 2: Sequential (Tasks 3-4)

Task 3: Password Reset Endpoint
Subagent-C: Fresh agent (depends on Tasks 1 + 2)
Handoff from Batch 1:
- Context: User entity (from A), EmailService (from B)
- Files: User.ts, EmailService.ts
- Constraints: Same error format as registration
Input: Password reset spec, EmailService (Task 2), User entity (Task 1)
Output: Password reset endpoint + tests
Result: DONE (15 min)

Review — Subagent-C:
- Stage 1: PASS
- Stage 2: PASS

Task 4: Integration Tests
Subagent-D: Fresh agent (depends on all previous)
Input: All endpoints from Tasks 1-3, integration test spec
Output: E2E tests for complete auth flow
Result: DONE (10 min)

Review — Subagent-D:
- Stage 1: PASS
- Stage 2: PASS

Final Summary:
- Status: ALL TASKS COMPLETE
- Agents Used: 4 fresh agents (A, B, C, D)
- Total Time: 47 min actual (22 parallel + 15 + 10)
- vs Sequential: 65 min (18+22+15+10)
- Time saved: 18 min (28% faster)
- Quality: All 4 tasks passed two-stage review; 1 required fix (Task 2)
- Deliverables: Registration, Email service, Password reset, Integration tests
```
