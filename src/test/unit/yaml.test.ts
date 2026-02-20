/**
 * Unit tests for src/utils/yaml.ts
 *
 * No chalk dependency — imports directly from yaml.ts (safe for Jest CJS).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  extractFrontmatter,
  hasFrontmatter,
  loadYamlFile,
  saveYamlFile,
  validateFrontmatter,
} from '../../utils/yaml';

// ─── Helpers ───────────────────────────────────────────────────────────────

let tmpDir: string;

function writeTmp(name: string, content: string): string {
  const filePath = path.join(tmpDir, name);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yaml-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ─── extractFrontmatter ────────────────────────────────────────────────────

describe('extractFrontmatter', () => {
  test('extracts frontmatter from valid markdown file', () => {
    const file = writeTmp(
      'valid.md',
      `---
name: test-skill
description: "A test skill. Trigger: testing"
metadata:
  version: "1.0"
---

# Content
`
    );
    const fm = extractFrontmatter(file);
    expect(fm).not.toBeNull();
    expect(fm?.name).toBe('test-skill');
    expect(fm?.description).toBe('A test skill. Trigger: testing');
    const meta = fm?.metadata as Record<string, unknown>;
    expect(meta?.version).toBe('1.0');
  });

  test('returns null when no frontmatter present', () => {
    const file = writeTmp('no-fm.md', '# Just a heading\n\nSome content');
    expect(extractFrontmatter(file)).toBeNull();
  });

  test('returns null for file with only content', () => {
    const file = writeTmp('content-only.md', 'No frontmatter here at all');
    expect(extractFrontmatter(file)).toBeNull();
  });

  test('handles empty frontmatter', () => {
    const file = writeTmp('empty-fm.md', '---\n---\n\n# Content');
    // Empty YAML parses to null, so extractFrontmatter returns null
    expect(extractFrontmatter(file)).toBeNull();
  });

  test('handles frontmatter with nested object', () => {
    const file = writeTmp(
      'nested.md',
      `---
name: nested-skill
metadata:
  version: "2.0"
  skills:
    - typescript
    - react
---
`
    );
    const fm = extractFrontmatter(file);
    expect(fm).not.toBeNull();
    const meta = fm?.metadata as Record<string, unknown>;
    expect(meta?.version).toBe('2.0');
    expect(Array.isArray(meta?.skills)).toBe(true);
  });

  test('throws on malformed YAML', () => {
    const file = writeTmp('bad-yaml.md', '---\nname: [unclosed\n---\n# Content');
    expect(() => extractFrontmatter(file)).toThrow();
  });
});

// ─── loadYamlFile ──────────────────────────────────────────────────────────

describe('loadYamlFile', () => {
  test('loads valid YAML file', () => {
    const file = writeTmp('valid.yaml', 'name: test\nversion: "1.0"');
    const result = loadYamlFile(file);
    expect(result.name).toBe('test');
    expect(result.version).toBe('1.0');
  });

  test('throws on invalid YAML', () => {
    const file = writeTmp('invalid.yaml', 'name: [unclosed bracket');
    expect(() => loadYamlFile(file)).toThrow();
  });

  test('throws when YAML parses to a scalar (not an object)', () => {
    // A YAML string scalar: typeof 'string' !== 'object' → throws
    const file = writeTmp('scalar.yaml', 'just-a-string');
    expect(() => loadYamlFile(file)).toThrow();
  });

  test('throws on empty file', () => {
    const file = writeTmp('empty.yaml', '');
    expect(() => loadYamlFile(file)).toThrow();
  });
});

// ─── saveYamlFile ──────────────────────────────────────────────────────────

describe('saveYamlFile', () => {
  test('writes YAML content to file', () => {
    const file = path.join(tmpDir, 'output.yaml');
    saveYamlFile(file, { name: 'test', version: '1.0' });
    const content = fs.readFileSync(file, 'utf-8');
    expect(content).toContain('name: test');
    expect(content).toContain("version: '1.0'");
  });

  test('round-trips an object through save and load', () => {
    const file = path.join(tmpDir, 'roundtrip.yaml');
    const data = { name: 'roundtrip', metadata: { version: '2.0' } };
    saveYamlFile(file, data);
    const loaded = loadYamlFile(file);
    expect(loaded.name).toBe('roundtrip');
    const meta = loaded.metadata as Record<string, unknown>;
    expect(meta.version).toBe('2.0');
  });
});

// ─── validateFrontmatter ───────────────────────────────────────────────────

describe('validateFrontmatter', () => {
  test('valid frontmatter passes', () => {
    const result = validateFrontmatter({
      name: 'my-skill',
      description: 'Does something useful. Trigger: always',
      metadata: { version: '1.0' },
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('missing name field fails', () => {
    const result = validateFrontmatter({
      description: 'A description. Trigger: test',
      metadata: { version: '1.0' },
    } as Parameters<typeof validateFrontmatter>[0]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('name'))).toBe(true);
  });

  test('missing description field fails', () => {
    const result = validateFrontmatter({
      name: 'my-skill',
      metadata: { version: '1.0' },
    } as Parameters<typeof validateFrontmatter>[0]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('description'))).toBe(true);
  });

  test('description without Trigger: clause fails', () => {
    const result = validateFrontmatter({
      name: 'my-skill',
      description: 'A description without trigger clause',
      metadata: { version: '1.0' },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Trigger:'))).toBe(true);
  });

  test('missing metadata.version fails', () => {
    const result = validateFrontmatter({
      name: 'my-skill',
      description: 'A description. Trigger: test',
    } as Parameters<typeof validateFrontmatter>[0]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('version'))).toBe(true);
  });

  test('deprecated top-level fields are reported', () => {
    const result = validateFrontmatter({
      name: 'my-skill',
      description: 'A description. Trigger: test',
      metadata: { version: '1.0' },
      version: '1.0',
    } as Parameters<typeof validateFrontmatter>[0]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('deprecated'))).toBe(true);
  });

  test('invalid name format fails', () => {
    const result = validateFrontmatter({
      name: 'My_Invalid Name',
      description: 'A description. Trigger: test',
      metadata: { version: '1.0' },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('lowercase'))).toBe(true);
  });
});

// ─── hasFrontmatter ────────────────────────────────────────────────────────

describe('hasFrontmatter', () => {
  test('returns true for file with frontmatter', () => {
    const file = writeTmp('has-fm.md', '---\nname: test\n---\n# Content');
    expect(hasFrontmatter(file)).toBe(true);
  });

  test('returns false for file without frontmatter', () => {
    const file = writeTmp('no-fm.md', '# Just a heading');
    expect(hasFrontmatter(file)).toBe(false);
  });

  test('returns false for non-existent file', () => {
    const file = path.join(tmpDir, 'does-not-exist.md');
    expect(hasFrontmatter(file)).toBe(false);
  });

  test('returns false for empty file', () => {
    const file = writeTmp('empty.md', '');
    expect(hasFrontmatter(file)).toBe(false);
  });
});
