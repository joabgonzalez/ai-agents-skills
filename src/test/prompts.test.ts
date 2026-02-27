/**
 * Prompt file validation tests
 *
 * Tests all *.md files in the prompts/ directory.
 * Based on prompt-creation skill spec.
 *
 * Auto-discovers prompts — adding new files in prompts/ does not require changes here.
 *
 * NOTE: does not import from skill-parser or logger to avoid the chalk (ESM) import chain.
 */
import fs from 'node:fs';
import path from 'node:path';
import { load as yamlLoad } from 'js-yaml';

const ROOT = path.resolve(__dirname, '..', '..');
const PROMPTS_DIR = path.join(ROOT, 'prompts');

const ALLOWED_TYPES = ['behavioral', 'technology-stack'] as const;
const ALLOWED_PRIORITIES = ['high', 'medium', 'low'] as const;
const ALLOWED_FRONTMATTER_KEYS = new Set([
  'name',
  'type',
  'description',
  'version',
  'context',
  'priority',
]);

// Keys that must NOT appear in frontmatter (content belongs in markdown body)
const PROHIBITED_FRONTMATTER_KEYS = [
  'persona',
  'general_rules',
  'instruction_types',
  'rules',
  'evaluation_criteria',
  'examples',
  'guidelines',
  'behaviors',
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function extractFrontmatterRaw(filePath: string): string | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

function parsePromptFrontmatter(filePath: string): Record<string, unknown> {
  const raw = extractFrontmatterRaw(filePath);
  if (!raw) return {};
  const parsed = yamlLoad(raw);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {};
}

function readPromptContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function countFrontmatterLines(filePath: string): number {
  const raw = extractFrontmatterRaw(filePath);
  if (!raw) return 0;
  return raw.split('\n').length;
}

function getMarkdownBody(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1].trim() : content.trim();
}

function listPrompts(): string[] {
  if (!fs.existsSync(PROMPTS_DIR)) return [];
  return fs
    .readdirSync(PROMPTS_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => path.basename(e.name, '.md'));
}

function hasNestedObjects(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some((v) => v !== null && typeof v === 'object' && !Array.isArray(v));
}

function hasLargeArrays(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some((v) => Array.isArray(v) && v.length > 3);
}

// ─── Tests ─────────────────────────────────────────────────────────────────

const prompts = listPrompts();

// Edge: prompts directory must have at least one file
test('prompts/ directory has at least one prompt file', () => {
  expect(prompts.length).toBeGreaterThan(0);
});

describe.each(prompts)('Prompt file: %s', (promptName) => {
  const filePath = path.join(PROMPTS_DIR, `${promptName}.md`);
  let fm: Record<string, unknown>;
  let content: string;
  let body: string;

  beforeAll(() => {
    fm = parsePromptFrontmatter(filePath);
    content = readPromptContent(filePath);
    body = getMarkdownBody(filePath);
  });

  // ── Frontmatter ──────────────────────────────────────────────────────────

  test('has YAML frontmatter', () => {
    expect(extractFrontmatterRaw(filePath)).not.toBeNull();
  });

  test('name field is present and matches filename', () => {
    expect(typeof fm.name).toBe('string');
    expect(fm.name).toBe(promptName);
  });

  test('type field is present and valid', () => {
    expect(ALLOWED_TYPES).toContain(fm.type as string);
  });

  test('description field is present and single-line', () => {
    expect(typeof fm.description).toBe('string');
    expect(fm.description as string).not.toMatch(/\n/);
    expect((fm.description as string).length).toBeGreaterThan(0);
  });

  test('frontmatter is 10 lines or fewer', () => {
    const lineCount = countFrontmatterLines(filePath);
    expect(lineCount).toBeLessThanOrEqual(10);
  });

  test('frontmatter has no nested objects (all values are primitives or simple arrays)', () => {
    expect(hasNestedObjects(fm)).toBe(false);
  });

  test('frontmatter has no arrays with more than 3 strings', () => {
    expect(hasLargeArrays(fm)).toBe(false);
  });

  test('frontmatter uses only allowed keys', () => {
    const unknownKeys = Object.keys(fm).filter((k) => !ALLOWED_FRONTMATTER_KEYS.has(k));
    expect(unknownKeys).toEqual([]);
  });

  test('priority (if present) is a valid value', () => {
    if ('priority' in fm) {
      expect(ALLOWED_PRIORITIES).toContain(fm.priority as string);
    }
  });

  test('frontmatter has no prohibited content keys', () => {
    const found = PROHIBITED_FRONTMATTER_KEYS.filter((k) => k in fm);
    expect(found).toEqual([]);
  });

  // ── Content ───────────────────────────────────────────────────────────────

  test('has H1 heading', () => {
    expect(content).toMatch(/^# .+/m);
  });

  test('markdown body is not empty', () => {
    expect(body.length).toBeGreaterThan(0);
  });

  test('has at least one ## section', () => {
    expect(content).toMatch(/^## .+/m);
  });
});
