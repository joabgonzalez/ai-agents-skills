/**
 * CLI tests
 *
 * Two scopes:
 *   1. Help/version output — non-interactive, verifies flag definitions.
 *   2. Dry-run integration — spawns real commands with --dry-run and/or --confirm
 *      to verify they route correctly, validate flags, and produce expected output
 *      without touching the filesystem.
 *
 * Interactive prompts (clack multiselect/select) are NOT tested here.
 * `add --local` uses the project's own skills/ directory (no network).
 * `remove --confirm` skips the confirmation prompt (flag documented in --help).
 */

import { type ExecSyncOptions, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import packageJson from '../../package.json';

const ROOT = path.resolve(__dirname, '..', '..');
const TS_NODE = path.join(ROOT, 'node_modules', '.bin', 'ts-node');
const ENTRY = path.join(ROOT, 'src', 'index.ts');

const EXEC_OPTS: ExecSyncOptions = {
  cwd: ROOT,
  encoding: 'utf-8',
  timeout: 30000,
  stdio: 'pipe', // pipe stderr so it doesn't leak into Jest's console
  env: {
    ...process.env,
    // Prevent interactive prompts from blocking
    CI: 'true',
    FORCE_COLOR: '0',
  },
};

/**
 * Run the CLI with optional stdin input.
 * `stdin` is used to simulate a single Enter keypress on a `p.confirm` prompt.
 */
function run(args: string, stdin?: string): { output: string; exitCode: number } {
  const opts: ExecSyncOptions = stdin !== undefined ? { ...EXEC_OPTS, input: stdin } : EXEC_OPTS;
  try {
    const output = execSync(`"${TS_NODE}" "${ENTRY}" ${args}`, opts) as string;
    return { output, exitCode: 0 };
  } catch (err: unknown) {
    const error = err as { stdout?: string; stderr?: string; status?: number };
    const output = (error.stdout ?? '') + (error.stderr ?? '');
    return { output, exitCode: error.status ?? 1 };
  }
}

// ─── Global help ──────────────────────────────────────────────────────────

describe('CLI global help', () => {
  test('--help exits 0 and lists all commands', () => {
    const { output, exitCode } = run('--help');
    expect(exitCode).toBe(0);
    expect(output).toMatch(/add/i);
    expect(output).toMatch(/remove/i);
    expect(output).toMatch(/sync/i);
    expect(output).toMatch(/list/i);
  });

  test('--version exits 0 and outputs package version', () => {
    const { output, exitCode } = run('--version');
    expect(exitCode).toBe(0);
    expect(output.trim()).toContain(packageJson.version);
  });

  test('no args outputs help content', () => {
    // Commander may exit non-zero when no command is given — we only check output
    const { output } = run('');
    expect(output).toMatch(/add|remove|sync|list/i);
  });

  test('lists --verbose global option', () => {
    const { output } = run('--help');
    expect(output).toMatch(/--verbose|-v/);
  });

  test('lists --quiet global option', () => {
    const { output } = run('--help');
    expect(output).toMatch(/--quiet|-q/);
  });
});

// ─── add command help ─────────────────────────────────────────────────────

describe('CLI add --help', () => {
  test('exits 0 and describes the command', () => {
    const { output, exitCode } = run('add --help');
    expect(exitCode).toBe(0);
    expect(output).toMatch(/install/i);
  });

  test('lists --local option', () => {
    const { output } = run('add --help');
    expect(output).toMatch(/--local|-l/);
  });

  test('lists --skill option', () => {
    const { output } = run('add --help');
    expect(output).toMatch(/--skill|-s/);
  });

  test('lists --preset option', () => {
    const { output } = run('add --help');
    expect(output).toMatch(/--preset|-p/);
  });

  test('lists --model option', () => {
    const { output } = run('add --help');
    expect(output).toMatch(/--model|-m/);
  });

  test('lists --dry-run option', () => {
    const { output } = run('add --help');
    expect(output).toMatch(/--dry-run|-d/);
  });
});

// ─── remove command help ──────────────────────────────────────────────────

describe('CLI remove --help', () => {
  test('exits 0 and describes the command', () => {
    const { output, exitCode } = run('remove --help');
    expect(exitCode).toBe(0);
    expect(output).toMatch(/remove/i);
  });

  test('lists --skill option', () => {
    const { output } = run('remove --help');
    expect(output).toMatch(/--skill|-s/);
  });

  test('lists --model option', () => {
    const { output } = run('remove --help');
    expect(output).toMatch(/--model|-m/);
  });

  test('lists --purge option', () => {
    const { output } = run('remove --help');
    expect(output).toMatch(/--purge|-p/);
  });

  test('lists --confirm option', () => {
    const { output } = run('remove --help');
    expect(output).toMatch(/--confirm/);
  });

  test('lists --dry-run option', () => {
    const { output } = run('remove --help');
    expect(output).toMatch(/--dry-run|-d/);
  });

  test('alias uninstall --help works', () => {
    const { output, exitCode } = run('uninstall --help');
    expect(exitCode).toBe(0);
    expect(output).toMatch(/--skill|-s/);
  });
});

// ─── sync command help ────────────────────────────────────────────────────

describe('CLI sync --help', () => {
  test('exits 0 and describes the command', () => {
    const { output, exitCode } = run('sync --help');
    expect(exitCode).toBe(0);
    expect(output).toMatch(/update|sync/i);
  });

  test('lists --update option', () => {
    const { output } = run('sync --help');
    expect(output).toMatch(/--update|-u/);
  });

  test('lists --skill option', () => {
    const { output } = run('sync --help');
    expect(output).toMatch(/--skill|-s/);
  });

  test('lists --model option', () => {
    const { output } = run('sync --help');
    expect(output).toMatch(/--model|-m/);
  });

  test('lists --dry-run option', () => {
    const { output } = run('sync --help');
    expect(output).toMatch(/--dry-run|-d/);
  });
});

// ─── list command help ────────────────────────────────────────────────────

describe('CLI list --help', () => {
  test('exits 0', () => {
    const { exitCode } = run('list --help');
    expect(exitCode).toBe(0);
  });

  test('alias ls --help works', () => {
    const { exitCode } = run('ls --help');
    expect(exitCode).toBe(0);
  });

  test('output contains list description', () => {
    const { output } = run('list --help');
    expect(output).toMatch(/list|install/i);
  });
});

// ─── Unknown command ──────────────────────────────────────────────────────

describe('CLI unknown command', () => {
  test('exits non-zero for unknown command', () => {
    const { exitCode } = run('notacommand');
    expect(exitCode).not.toBe(0);
  });
});

// ─── Integration setup ────────────────────────────────────────────────────
//
// A controlled temp project is created once for the integration test suite.
// It mimics the ai-agents-skills repo structure so --local mode is available,
// and has a known install state (typescript installed, jest available but not).
//
// tmpProject layout:
//   package.json              name: "ai-agents-skills"  (enables --local)
//   .git/                     project root marker
//   skills/
//     typescript/SKILL.md     available + PRE-INSTALLED in .agents
//     jest/SKILL.md           available but NOT installed
//   presets/
//     test-preset/AGENTS.md   fake preset (skills: jest)
//   .agents/skills/
//     typescript/             typescript IS installed
//   .claude/                  claude model IS configured

const SKILL_MD = (name: string) => `---
name: ${name}
description: "${name} support. Trigger: ${name}"
metadata:
  version: "1.0"
  type: tooling
---
# ${name}

## When to Use
Use when working with ${name}.

## Critical Patterns
✅ Use it
❌ Don't misuse it

## Decision Tree
\`\`\`
need ${name}? → yes → use it
\`\`\`

## Example
\`\`\`
example
\`\`\`

## Edge Cases
None.
`;

const PRESET_AGENTS_MD = `---
name: test-preset
description: Test preset for CLI integration tests
metadata:
  version: "1.0"
  skills:
    - jest
---

# Test Preset

## Purpose
Integration test preset.

## How to Use Skills
Use the skills.

## Skills Reference
See jest skill.

## Project Structure
Standard layout.
`;

let tmpProject: string;

beforeAll(() => {
  tmpProject = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-integration-'));

  // Project markers
  fs.writeFileSync(
    path.join(tmpProject, 'package.json'),
    JSON.stringify({ name: 'ai-agents-skills', version: '0.0.0' })
  );
  fs.mkdirSync(path.join(tmpProject, '.git'), { recursive: true });

  // Available skills (source for --local)
  fs.mkdirSync(path.join(tmpProject, 'skills', 'typescript'), { recursive: true });
  fs.writeFileSync(
    path.join(tmpProject, 'skills', 'typescript', 'SKILL.md'),
    SKILL_MD('typescript')
  );
  fs.mkdirSync(path.join(tmpProject, 'skills', 'jest'), { recursive: true });
  fs.writeFileSync(path.join(tmpProject, 'skills', 'jest', 'SKILL.md'), SKILL_MD('jest'));

  // Preset (for --preset tests)
  fs.mkdirSync(path.join(tmpProject, 'presets', 'test-preset'), { recursive: true });
  fs.writeFileSync(path.join(tmpProject, 'presets', 'test-preset', 'AGENTS.md'), PRESET_AGENTS_MD);

  // Pre-installed state: typescript is installed, jest is not
  fs.mkdirSync(path.join(tmpProject, '.agents', 'skills', 'typescript'), { recursive: true });

  // Claude model is configured (directory presence = installed)
  fs.mkdirSync(path.join(tmpProject, '.claude', 'skills', 'typescript'), { recursive: true });
});

afterAll(() => {
  if (tmpProject) fs.rmSync(tmpProject, { recursive: true, force: true });
});

/**
 * Run the CLI in a specific working directory.
 */
function runIn(cwd: string, args: string, stdin?: string): { output: string; exitCode: number } {
  const opts: ExecSyncOptions = {
    ...EXEC_OPTS,
    cwd,
    ...(stdin !== undefined && { input: stdin }),
  };
  try {
    const output = execSync(`"${TS_NODE}" "${ENTRY}" ${args}`, opts) as string;
    return { output, exitCode: 0 };
  } catch (err: unknown) {
    const error = err as { stdout?: string; stderr?: string; status?: number };
    const output = (error.stdout ?? '') + (error.stderr ?? '');
    return { output, exitCode: error.status ?? 1 };
  }
}

// ─── list: controlled state ────────────────────────────────────────────────

describe('CLI list: controlled state (tmpProject)', () => {
  test('exits 0 when skills are installed', () => {
    const { exitCode } = runIn(tmpProject, 'list');
    expect(exitCode).toBe(0);
  });

  test('shows the installed skill name (typescript)', () => {
    const { output } = runIn(tmpProject, 'list');
    expect(output).toMatch(/typescript/i);
  });

  test('shows the configured model (claude)', () => {
    const { output } = runIn(tmpProject, 'list');
    expect(output).toMatch(/claude/i);
  });

  test('alias ls works and exits 0', () => {
    const { exitCode } = runIn(tmpProject, 'ls');
    expect(exitCode).toBe(0);
  });

  test('does not show an uninstalled skill (jest)', () => {
    // jest is available in skills/ but NOT installed → must not appear in list output
    const { output } = runIn(tmpProject, 'list');
    expect(output).not.toMatch(/\bjest\b/i);
  });

  test('does not show a model with no directory (cursor)', () => {
    // cursor is a valid model ID but has no directory in tmpProject → must not appear
    const { output } = runIn(tmpProject, 'list');
    expect(output).not.toMatch(/\bcursor\b/i);
  });

  test('exits 0 with guidance when no skills are installed', () => {
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-empty-'));
    fs.writeFileSync(path.join(emptyDir, 'package.json'), JSON.stringify({ name: 'empty' }));
    try {
      const { output, exitCode } = runIn(emptyDir, 'list');
      expect(exitCode).toBe(0);
      expect(output).toMatch(/No skills installed|add/i);
    } finally {
      fs.rmSync(emptyDir, { recursive: true, force: true });
    }
  });
});

// ─── add --local: validation scenarios ────────────────────────────────────
//
// All add tests run from tmpProject:
//   - typescript: available in skills/, PRE-INSTALLED → "already installed" early exit
//   - jest: available in skills/, NOT installed → goes through full flow
//   - claude: installed model (.claude/ exists)
//   - cursor: valid model ID, NOT installed in tmpProject
//   - __badmodel__: invalid model ID → "unknown model" warning
//   - __nonexistent__: invalid skill name → "not found" warning
//   - __nopreset__: invalid preset → "Preset not found" early exit(1)
//   - test-preset: valid preset defined in tmpProject/presets/

describe('CLI add --local: local mode prerequisite', () => {
  test('exits 1 with clear message when run outside the ai-agents-skills repo', () => {
    // A plain temp dir has no skills/ folder and a generic package.json name
    const otherDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-other-repo-'));
    fs.writeFileSync(
      path.join(otherDir, 'package.json'),
      JSON.stringify({ name: 'some-other-project' })
    );
    try {
      const { output, exitCode } = runIn(otherDir, 'add --local --skill jest --model claude');
      expect(exitCode).toBe(1);
      expect(output).toMatch(/--local requires|ai-agents-skills/i);
    } finally {
      fs.rmSync(otherDir, { recursive: true, force: true });
    }
  });

  test('exits 1 when skills/ dir exists but package.json name is wrong', () => {
    const otherDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-bad-pkg-'));
    fs.writeFileSync(
      path.join(otherDir, 'package.json'),
      JSON.stringify({ name: 'not-ai-agents-skills' })
    );
    fs.mkdirSync(path.join(otherDir, 'skills'), { recursive: true });
    try {
      const { output, exitCode } = runIn(otherDir, 'add --local --skill jest --model claude');
      expect(exitCode).toBe(1);
      expect(output).toMatch(/--local requires|ai-agents-skills/i);
    } finally {
      fs.rmSync(otherDir, { recursive: true, force: true });
    }
  });
});

describe('CLI add --local: skill validation', () => {
  test('warns on non-existent skill and exits 0', () => {
    const { output, exitCode } = runIn(
      tmpProject,
      'add --local --skill __nonexistent_skill_xyz__ --model claude --dry-run'
    );
    // Not in skills/ → warns "not found" → validSkills=[] → "Nothing to install" → exit(0)
    expect(exitCode).toBe(0);
    expect(output).toMatch(/not found|Nothing to install/i);
  });

  test('warns when skill is already installed', () => {
    const { output, exitCode } = runIn(
      tmpProject,
      'add --local --skill typescript --model claude --dry-run'
    );
    // typescript is in .agents/skills/ → warns "already installed" → exit(0)
    expect(exitCode).toBe(0);
    expect(output).toMatch(/already installed|Nothing to install/i);
  });
});

describe('CLI add --local: preset validation', () => {
  test('exits 1 for non-existent preset', () => {
    const { output, exitCode } = runIn(
      tmpProject,
      'add --local --preset __nonexistent_preset_xyz__ --model claude --dry-run'
    );
    expect(exitCode).toBe(1);
    expect(output).toMatch(/Preset not found/i);
  });

  test('dry-run with valid preset exits 0', () => {
    // test-preset has jest as its skill; jest is NOT installed → goes to confirm
    const { output, exitCode } = runIn(
      tmpProject,
      'add --local --preset test-preset --model claude --dry-run',
      '\n'
    );
    expect(exitCode).toBe(0);
    // Shows the preset name or the jest skill
    expect(output).toMatch(/test.?preset|jest/i);
  });
});

describe('CLI add --local: model validation', () => {
  test('warns on unknown model name', () => {
    // jest is NOT installed → passes skill check → reaches model check
    const { output, exitCode } = runIn(
      tmpProject,
      'add --local --skill jest --model __badmodel_xyz__ --dry-run'
    );
    // unknown model → warns → validSpecified=[] → "No valid models" → exit(1)
    expect(exitCode).toBe(1);
    expect(output).toMatch(/unknown model/i);
  });

  test('proceeds with installed model (claude) in dry-run', () => {
    const { output, exitCode } = runIn(
      tmpProject,
      'add --local --skill jest --model claude --dry-run',
      '\n'
    );
    expect(exitCode).toBe(0);
    expect(output).toMatch(/jest|claude/i);
  });

  test('includes non-installed but valid model (cursor) alongside installed models', () => {
    // cursor is a valid model ID but NOT installed in tmpProject
    // The command merges it with installed models (claude) and shows both as targets
    const { output, exitCode } = runIn(
      tmpProject,
      'add --local --skill jest --model cursor --dry-run',
      '\n'
    );
    expect(exitCode).toBe(0);
    // Output shows cursor as a target (and claude as already configured)
    expect(output).toMatch(/cursor|jest/i);
  });

  test('dry-run shows paths that would be created', () => {
    const { output, exitCode } = runIn(
      tmpProject,
      'add --local --skill jest --model claude --dry-run',
      '\n'
    );
    expect(exitCode).toBe(0);
    // Dry-run shows path preview (symlinks and cache copy info)
    expect(output).toMatch(/Paths that would be created|jest/i);
  });
});

// ─── remove --confirm: validation and dry-run scenarios ───────────────────
//
// --confirm skips the "Remove X skills?" prompt (line 225 remove.ts).
// tmpProject has typescript installed in .agents/skills/ with no SKILL.md
// (so DependencyResolver finds no dependents → no "Remove anyway?" blocking prompt).

describe('CLI remove --confirm: skill validation', () => {
  test('warns when skill is not installed and exits 1', () => {
    const { output, exitCode } = runIn(
      tmpProject,
      'remove --skill __nonexistent_skill_xyz__ --confirm --dry-run'
    );
    expect(exitCode).toBe(1);
    expect(output).toMatch(/not installed/i);
  });

  test('exits 0 with guidance when no skills are installed at all', () => {
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-remove-empty-'));
    fs.writeFileSync(path.join(emptyDir, 'package.json'), JSON.stringify({ name: 'empty' }));
    try {
      const { output, exitCode } = runIn(emptyDir, 'remove --skill typescript --confirm --dry-run');
      expect(exitCode).toBe(0);
      expect(output).toMatch(/No skills installed/i);
    } finally {
      fs.rmSync(emptyDir, { recursive: true, force: true });
    }
  });

  test('dry-run with installed skill (typescript): exits 0 and shows preview', () => {
    const { output, exitCode } = runIn(
      tmpProject,
      'remove --skill typescript --confirm --dry-run'
    );
    expect(exitCode).toBe(0);
    expect(output).toMatch(/typescript/i);
    expect(output).toMatch(/Paths that would be deleted|Removal Preview/i);
    expect(output).toMatch(/DRY RUN/i);
  });
});

describe('CLI remove --confirm: model validation', () => {
  test('warns on unknown model name and exits 1', () => {
    const { output, exitCode } = runIn(
      tmpProject,
      'remove --skill typescript --model __badmodel_xyz__ --confirm --dry-run'
    );
    // typescript installed, no dependents → reaches model check → unknown model → exit(1)
    expect(exitCode).toBe(1);
    expect(output).toMatch(/unknown model|No valid models/i);
  });

  test('exits 1 when specified model has no skills installed', () => {
    // cursor is a valid model ID but NOT in tmpProject's installed models
    const { output, exitCode } = runIn(
      tmpProject,
      'remove --skill typescript --model cursor --confirm --dry-run'
    );
    // cursor is valid but no skills installed for it → warns "no skills installed for this model"
    expect(exitCode).toBe(1);
    expect(output).toMatch(/no skills installed|No valid models|cursor/i);
  });

  test('alias uninstall --confirm works like remove', () => {
    const { exitCode } = runIn(tmpProject, 'uninstall --skill typescript --confirm --dry-run');
    expect(exitCode).toBe(0);
  });
});

// ─── remove --purge: dry-run scenarios ────────────────────────────────────
//
// --purge triggers purgeCommand(), a separate code path from regular remove.
// --confirm skips the "Remove all X skills?" prompt.
// --dry-run prevents any filesystem writes.
// tmpProject state: typescript installed in .agents/ and .claude/.

describe('CLI remove --purge: dry-run', () => {
  test('exits 0 with --confirm and --dry-run', () => {
    const { exitCode } = runIn(tmpProject, 'remove --purge --confirm --dry-run');
    expect(exitCode).toBe(0);
  });

  test('output shows purge preview with skills and models', () => {
    const { output } = runIn(tmpProject, 'remove --purge --confirm --dry-run');
    expect(output).toMatch(/Purge Preview/i);
    expect(output).toMatch(/typescript/i);
    expect(output).toMatch(/claude/i);
  });

  test('output indicates dry-run — no changes made', () => {
    const { output } = runIn(tmpProject, 'remove --purge --confirm --dry-run');
    expect(output).toMatch(/DRY RUN/i);
  });

  test('does not remove any files from the filesystem', () => {
    const agentsSkillBefore = path.join(tmpProject, '.agents', 'skills', 'typescript');
    runIn(tmpProject, 'remove --purge --confirm --dry-run');
    // typescript must still exist — dry-run must not touch the filesystem
    expect(fs.existsSync(agentsSkillBefore)).toBe(true);
  });
});

// ─── sync: guard rails ────────────────────────────────────────────────────
//
// sync fetches remote data. The guard rail (no skills installed) is testable
// without network. When skills ARE installed, sync runs but may fail on network.

describe('CLI sync: guard rails', () => {
  test('exits 1 with message when no skills are installed', () => {
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-sync-empty-'));
    fs.writeFileSync(path.join(emptyDir, 'package.json'), JSON.stringify({ name: 'empty' }));
    try {
      const { output, exitCode } = runIn(emptyDir, 'sync --dry-run');
      expect(exitCode).not.toBe(0);
      expect(output).toMatch(/No skills installed|add/i);
    } finally {
      fs.rmSync(emptyDir, { recursive: true, force: true });
    }
  });
});

// ─── sync --skill: validation ──────────────────────────────────────────────
//
// These paths are exercised without network because validation exits before
// fetchRepo() is called (skill not in installedSkills → exit(1) immediately).

describe('CLI sync: skill validation', () => {
  test('warns and exits 1 when specified skill is not installed', () => {
    // tmpProject has typescript installed; __nonexistent__ is not → warns + exit(1)
    const { output, exitCode } = runIn(
      tmpProject,
      'sync --skill __nonexistent_skill_xyz__'
    );
    expect(exitCode).toBe(1);
    expect(output).toMatch(/not installed/i);
  });
});

// ─── sync --model: validation ─────────────────────────────────────────────
//
// Model validation also exits before any network call.

describe('CLI sync: model validation', () => {
  test('warns and exits 1 on unknown model name', () => {
    // __invalid_model__ is not in ModelDetector's known list → warns "unknown model" → exit(1)
    const { output, exitCode } = runIn(
      tmpProject,
      'sync --model __invalid_model_xyz__'
    );
    expect(exitCode).toBe(1);
    expect(output).toMatch(/unknown model/i);
  });

  test('warns and exits 0 when all specified models are already configured', () => {
    // claude is already installed in tmpProject (.claude/ exists) → "already configured" → exit(0)
    const { output, exitCode } = runIn(tmpProject, 'sync --model claude');
    expect(exitCode).toBe(0);
    expect(output).toMatch(/already configured/i);
  });
});
