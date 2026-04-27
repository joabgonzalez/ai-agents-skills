---
name: ship-branch
description: "Verify, deliver, and close a completed branch. Trigger: When implementation is done and ready to ship or close out."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
  skills:
    - verification-protocol
---

# Ship Branch

Structured close-out for a completed development branch. Verifies tests, presents exactly four delivery options, executes the chosen one, and cleans up.

## When to Use

- Implementation on a feature/fix branch is complete
- Ready to deliver or close out the work
- After plan execution finishes

Don't use for:

- Mid-implementation work (use writing-plans or subagent-orchestration)
- Ongoing branches not ready for delivery

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Verify Before Any Delivery Action

Tests must pass before presenting delivery options. Never proceed with failing tests.

```markdown
# ❌ WRONG — skip verification
Branch is done. Pushing to origin.

# ✅ CORRECT — verify first
Ran: npm test → 18/18 passed ✅
Ran: npm run build → dist/ created ✅
Ready to present delivery options.
```

### ✅ REQUIRED [CRITICAL]: Present Exactly Four Options

Always present these four options — no more, no fewer. Let the user decide.

```markdown
Branch: feature/user-auth — 18/18 tests passing ✅

Delivery options:
1. Merge locally into main (no remote push)
2. Push branch + open PR
3. Keep branch as-is (do nothing)
4. Discard branch (delete all work)
```

### ✅ REQUIRED: Require Explicit "discard" Confirmation

Option 4 requires the user to type the word "discard" explicitly. Never delete work on a single confirmation click or ambiguous response.

```markdown
# ❌ WRONG
User: "yeah go ahead"
Action: Deletes branch.

# ✅ CORRECT
"Type 'discard' to confirm deletion of all work on this branch."
User: "discard"
Action: Deletes branch.
```

### ✅ REQUIRED: Clean Up Worktree After Delivery

After merge or discard, remove the worktree directory if one was used.

```markdown
# After merge or discard:
git worktree remove .worktrees/feature-user-auth
# Verify:
ls .worktrees/ → feature-user-auth no longer present ✅
```

---

## Decision Tree

```
Implementation complete?
  → Run full verification (tests + build)
  → Verification fails?
      → Stop. Report failures. Do not proceed to delivery.

Verification passes?
  → Present exactly 4 options: merge local / push+PR / keep / discard

User chooses option 1 (merge local)?
  → git checkout main → git merge branch-name → verify merge clean

User chooses option 2 (push + PR)?
  → git push origin branch-name → open PR with summary of changes

User chooses option 3 (keep as-is)?
  → Do nothing. Confirm branch is preserved.

User chooses option 4 (discard)?
  → Require explicit "discard" typed → delete branch → clean up worktree

Worktree was used?
  → Remove worktree after option 1, 2, or 4.
```

---

## Conventions

### Delivery summary for PRs

When opening a PR (option 2), include:
- What was implemented (1-3 bullets)
- Tests added or modified
- Any known limitations or follow-up items

### Branch naming in options

Always show the actual branch name in the options presentation so the user knows exactly what's being acted on.

---

## Example

```markdown
## Ship Branch: feature/password-reset

### Verification
Ran: npm test → 24/24 passed ✅
Ran: npm run lint → 0 errors ✅
Ran: npm run build → dist/ created ✅

### Delivery options
Branch: feature/password-reset

1. Merge locally into main
2. Push branch + open PR
3. Keep branch as-is
4. Discard branch (type "discard" to confirm)

---

[User selects option 2]

Pushed: git push origin feature/password-reset ✅
PR opened: "Add password reset flow" — 3 commits, 24 tests passing
Worktree removed: .worktrees/feature-password-reset ✅
```

---

## Edge Cases

**Merge conflicts on option 1:** Stop. Report conflicting files. Do not auto-resolve. Ask user how to proceed.

**PR already exists:** Notify user. Offer to update the existing PR or open a new one.

**No worktree used:** Skip cleanup step. Only clean up what was created.

**Tests flaky on first run:** Re-run once. If still failing, report as failing — do not retry silently until green.

**User types something other than "discard" for option 4:** Treat as cancel. Return to options menu.
