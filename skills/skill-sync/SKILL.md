---
name: skill-sync
description: "Synchronization across model directories. Trigger: After creating or modifying skills, agents, or prompts to sync across directories."
license: "Apache 2.0"
metadata:
  version: "1.0"
---

# Skill Sync

Maintain synchronization across all model directories after modifications to skills, agents, or prompts. With symlink-based installation (CLI `local` command), most syncing is automatic. This skill covers when manual sync is needed.

## When to Use

- After creating or modifying skills, agents, or prompts
- After bulk changes or git pull with skill updates
- When model directories appear out of sync

Don't use for:

- Initial installation (use `npx ai-agents-skills local`)
- Adding skills from external repos (use `npx ai-agents-skills add`)

---

## Critical Patterns

### ✅ REQUIRED: Understand Sync Architecture

With symlink-based local installation:

```
skills/react/          → Source of truth
.agents/skills/react/  → Symlink to ../../skills/react
.claude/skills/react/  → Symlink to ../../.agents/skills/react
```

**Symlinked skills auto-sync** - modifying source propagates instantly. Manual sync is only needed for:
- New skills not yet installed
- Copied (non-symlinked) installations
- AGENTS.md / model instruction file changes

### ✅ REQUIRED: Know When Sync Is Needed

| Action | Sync Required? | How |
|--------|---------------|-----|
| Modify existing symlinked skill | No (auto) | Symlinks propagate changes |
| Create new skill | Yes | `npx ai-agents-skills local` |
| Delete skill | Yes | Remove from model directories |
| Modify AGENTS.md | Yes | Update CLAUDE.md, GEMINI.md if they exist |
| Modify prompts | No | Prompts are not copied to model dirs |
| Add skill dependency | Yes | Re-run `npx ai-agents-skills local` |

### ✅ REQUIRED: Sync Targets

**Model skill directories** (updated via CLI):

- `.github/skills/` (GitHub Copilot)
- `.claude/skills/` (Claude)
- `.codex/skills/` (Codex)
- `.gemini/skills/` (Gemini)
- `.cursor/skills/` (Cursor)

**Model instruction files** (manual update):

- `AGENTS.md` (root, source of truth)
- `.claude/instructions.md` (Claude-specific)
- `.gemini/instructions.md` (Gemini-specific)
- `.github/copilot-instructions.md` (Copilot-specific)

### ✅ REQUIRED: Sync Commands

```bash
# Re-install all skills (creates symlinks for new skills)
npx ai-agents-skills local

# Validate all skills are properly installed
npx ai-agents-skills validate --all

# List installed skills per model
npx ai-agents-skills list
```

### ❌ NEVER: Edit Model Directory Files Directly

Always edit the source in `skills/` directory. Model directories should contain only symlinks (local) or copies that get overwritten on sync.

---

## Decision Tree

```
What changed?
→ Existing skill content → No sync needed (symlinks auto-propagate)
→ New skill created → Run: npx ai-agents-skills local
→ Skill deleted → Remove symlinks from model dirs
→ AGENTS.md modified → Update model instruction files if they exist
→ Skill dependencies changed → Re-run: npx ai-agents-skills local
→ Multiple changes → Run: npx ai-agents-skills local
```

---

## Workflow

### After Modifying a Skill (Symlinked)

No action needed - symlinks propagate changes automatically.

### After Creating a New Skill

1. Verify skill follows skill-creation standards
2. Run `npx ai-agents-skills local` to install to all model directories
3. Run `npx ai-agents-skills validate --skill {name}` to verify

### After Modifying AGENTS.md

1. Identify changes in frontmatter or content
2. If `.claude/instructions.md` exists → regenerate via CLI
3. If `.gemini/instructions.md` exists → regenerate via CLI
4. Validate consistency across files

### Bulk Synchronization

After git pull or multiple changes:

```bash
npx ai-agents-skills local    # Re-install all skills
npx ai-agents-skills validate --all  # Verify everything
```

---

## Edge Cases

**No model directories installed:** Skip sync. Skills will be installed when user runs `npx ai-agents-skills local` for the first time.

**Partial installation:** Only sync to existing model directories. Suggest `npx ai-agents-skills local` to install missing models.

**Copied (non-symlinked) installations:** Must manually re-copy or re-run CLI to sync. This happens with `external` install type.

**Conflicting content in model dirs:** Always prioritize `skills/` as source of truth. Re-run CLI to overwrite.

---

## Checklist

- [ ] Modified skills exist in all installed model directories
- [ ] Symlinks are intact (not broken)
- [ ] New skills installed via CLI
- [ ] AGENTS.md and model instruction files are consistent
- [ ] All referenced skills exist in `skills/` directory
- [ ] No orphaned skill directories in model dirs

---

## References

- [skill-creation](../skill-creation/SKILL.md) - Standards for creating skills
- [Makefile](../../Makefile) - Available build commands
- [CLI source](../../src/commands/local.ts) - Local installation logic
