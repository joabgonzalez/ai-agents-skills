/**
 * Agent definition validation tests
 *
 * Tests the root AGENTS.md (framework agent) and all preset AGENTS.md files.
 * Based on agent-creation skill spec.
 *
 * Auto-discovers presets — adding new presets in presets/ does not require changes here.
 *
 * NOTE: does not import from skill-parser or logger to avoid the chalk (ESM) import chain.
 */
import fs from 'node:fs';
import path from 'node:path';
import { load as yamlLoad } from 'js-yaml';

const ROOT = path.resolve(__dirname, '..', '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const PRESETS_DIR = path.join(ROOT, 'presets');
const ROOT_AGENTS_MD = path.join(ROOT, 'AGENTS.md');

// ─── Helpers ───────────────────────────────────────────────────────────────

function extractFrontmatterRaw(filePath: string): string | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

function parseAgentsFrontmatter(filePath: string): Record<string, unknown> {
  const raw = extractFrontmatterRaw(filePath);
  if (!raw) return {};
  const parsed = yamlLoad(raw);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {};
}

function readAgentsContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function listPresets(): string[] {
  if (!fs.existsSync(PRESETS_DIR)) return [];
  return fs
    .readdirSync(PRESETS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => fs.existsSync(path.join(PRESETS_DIR, name, 'AGENTS.md')));
}

function skillExists(skillName: string): boolean {
  return fs.existsSync(path.join(SKILLS_DIR, skillName));
}

// ─── Root AGENTS.md ────────────────────────────────────────────────────────

describe('Root AGENTS.md (framework agent)', () => {
  const filePath = ROOT_AGENTS_MD;
  let fm: Record<string, unknown>;
  let content: string;
  let rawFm: string;

  beforeAll(() => {
    expect(fs.existsSync(filePath)).toBe(true);
    fm = parseAgentsFrontmatter(filePath);
    content = readAgentsContent(filePath);
    rawFm = extractFrontmatterRaw(filePath) ?? '';
  });

  // Frontmatter
  test('has YAML frontmatter', () => {
    expect(extractFrontmatterRaw(filePath)).not.toBeNull();
  });

  test('name field is present', () => {
    expect(typeof fm.name).toBe('string');
    expect((fm.name as string).length).toBeGreaterThan(0);
  });

  test('name is lowercase-with-hyphens', () => {
    expect(fm.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  test('description field is present', () => {
    expect(typeof fm.description).toBe('string');
    expect((fm.description as string).length).toBeGreaterThan(0);
  });

  test('metadata.version is present and matches X.Y format', () => {
    const meta = fm.metadata as Record<string, unknown> | undefined;
    expect(meta).toBeDefined();
    expect(typeof meta?.version).toBe('string');
    expect(meta?.version).toMatch(/^\d+\.\d+(\.\d+)?$/);
  });

  test('metadata.skills is an array', () => {
    const meta = fm.metadata as Record<string, unknown> | undefined;
    expect(Array.isArray(meta?.skills)).toBe(true);
  });

  test('critical-partner is in metadata.skills', () => {
    const meta = fm.metadata as Record<string, unknown> | undefined;
    const skills = meta?.skills as string[] | undefined;
    expect(skills).toContain('critical-partner');
  });

  test('frontmatter does not use [] array syntax (must use YAML list syntax)', () => {
    expect(rawFm).not.toMatch(/\[.+\]/);
  });

  // Content structure
  test('has H1 heading', () => {
    expect(content).toMatch(/^# .+/m);
  });

  test('has ## How to Use Skills section', () => {
    expect(content).toMatch(/^## How to Use Skills/m);
  });

  test('has ## Mandatory Skills or ## Skills Reference section', () => {
    const hasMandatory = /^## Mandatory Skills/m.test(content);
    const hasReference = /^## Skills Reference/m.test(content);
    expect(hasMandatory || hasReference).toBe(true);
  });

  test('all skills in metadata.skills exist in skills/ directory', () => {
    const meta = fm.metadata as Record<string, unknown> | undefined;
    const skills = (meta?.skills as string[]) ?? [];
    const missing = skills.filter((s) => !skillExists(s));
    expect(missing).toEqual([]);
  });
});

// ─── Preset AGENTS.md files ────────────────────────────────────────────────

const presets = listPresets();

describe.each(presets)('Preset AGENTS.md: %s', (presetName) => {
  const filePath = path.join(PRESETS_DIR, presetName, 'AGENTS.md');
  let fm: Record<string, unknown>;
  let content: string;
  let rawFm: string;

  beforeAll(() => {
    fm = parseAgentsFrontmatter(filePath);
    content = readAgentsContent(filePath);
    rawFm = extractFrontmatterRaw(filePath) ?? '';
  });

  // Frontmatter
  test('has YAML frontmatter', () => {
    expect(extractFrontmatterRaw(filePath)).not.toBeNull();
  });

  test('name field is present', () => {
    expect(typeof fm.name).toBe('string');
    expect((fm.name as string).length).toBeGreaterThan(0);
  });

  test('name is lowercase-with-hyphens', () => {
    expect(fm.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  test('description field is present', () => {
    expect(typeof fm.description).toBe('string');
    expect((fm.description as string).length).toBeGreaterThan(0);
  });

  test('metadata.version is present and matches X.Y format', () => {
    const meta = fm.metadata as Record<string, unknown> | undefined;
    expect(meta).toBeDefined();
    expect(typeof meta?.version).toBe('string');
    expect(meta?.version).toMatch(/^\d+\.\d+(\.\d+)?$/);
  });

  test('metadata.skills is an array', () => {
    const meta = fm.metadata as Record<string, unknown> | undefined;
    expect(Array.isArray(meta?.skills)).toBe(true);
  });

  test('critical-partner is in metadata.skills', () => {
    const meta = fm.metadata as Record<string, unknown> | undefined;
    const skills = meta?.skills as string[] | undefined;
    expect(skills).toContain('critical-partner');
  });

  test('frontmatter does not use [] array syntax (must use YAML list syntax)', () => {
    expect(rawFm).not.toMatch(/\[.+\]/);
  });

  test('only allowed root-level frontmatter keys', () => {
    const allowed = new Set(['name', 'description', 'license', 'metadata']);
    const found = Object.keys(fm).filter((k) => !allowed.has(k));
    expect(found).toEqual([]);
  });

  // Content structure
  test('has H1 heading', () => {
    expect(content).toMatch(/^# .+/m);
  });

  test('has ## Purpose section', () => {
    expect(content).toMatch(/^## Purpose$/m);
  });

  test('has ## How to Use Skills section', () => {
    expect(content).toMatch(/^## How to Use Skills/m);
  });

  test('has ## Skills Reference section', () => {
    expect(content).toMatch(/^## Skills Reference/m);
  });

  test('has ## Project Structure section', () => {
    expect(content).toMatch(/^## Project Structure/m);
  });

  test('all skills in metadata.skills exist in skills/ directory', () => {
    const meta = fm.metadata as Record<string, unknown> | undefined;
    const skills = (meta?.skills as string[]) ?? [];
    const missing = skills.filter((s) => !skillExists(s));
    expect(missing).toEqual([]);
  });
});

// Edge: at least one preset exists
test('presets/ directory has at least one preset', () => {
  expect(presets.length).toBeGreaterThan(0);
});
