/**
 * Unit tests for src/core/dependency-resolver.ts
 *
 * Mocks logger (chalk ESM) and skill-parser (which imports logger).
 * Uses a mock SkillSource to avoid filesystem access.
 */

// Must be first — Jest hoists these calls
jest.mock('../../utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    success: jest.fn(),
    section: jest.fn(),
    subsection: jest.fn(),
    listItem: jest.fn(),
    keyValue: jest.fn(),
  },
}));

jest.mock('../../core/skill-parser', () => ({
  extractVersion: jest.fn().mockReturnValue('1.0'),
  extractDependencies: jest.fn().mockReturnValue([]),
  parseSkillFile: jest.fn(),
  buildSkillPath: jest.fn(),
  listSkillsInDir: jest.fn(),
  skillExists: jest.fn(),
  getSkillNameFromPath: jest.fn(),
  parseAllSkills: jest.fn(),
  validateSkillMetadata: jest.fn(),
  validateSkillFile: jest.fn(),
}));

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DependencyResolver } from '../../core/dependency-resolver';
import { extractDependencies, extractVersion } from '../../core/skill-parser';
import type { SkillSource } from '../../core/skill-source';

// ─── Mock SkillSource ─────────────────────────────────────────────────────

type SkillDef = { version?: string; deps?: string[] };

class MockSkillSource implements SkillSource {
  private registry: Map<string, SkillDef>;

  constructor(skills: Record<string, SkillDef> = {}) {
    this.registry = new Map(Object.entries(skills));
  }

  exists(skillName: string): boolean {
    return this.registry.has(skillName);
  }

  getSkillPath(skillName: string): string {
    return `/mock/skills/${skillName}/SKILL.md`;
  }

  listSkills(): string[] {
    return Array.from(this.registry.keys());
  }

  getSkillMetadata(): never {
    throw new Error('Not used by DependencyResolver');
  }
}

// ─── Setup ─────────────────────────────────────────────────────────────────

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dep-resolver-test-'));
  jest.clearAllMocks();
  // Default: version 1.0, no deps
  (extractVersion as jest.Mock).mockReturnValue('1.0');
  (extractDependencies as jest.Mock).mockReturnValue([]);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ─── buildGraph ────────────────────────────────────────────────────────────

describe('buildGraph', () => {
  test('builds graph with a single skill and no dependencies', () => {
    const source = new MockSkillSource({ react: {} });
    const resolver = new DependencyResolver(source);

    const graph = resolver.buildGraph(['react']);
    expect(graph.size).toBe(1);
    expect(graph.has('react')).toBe(true);
    expect(graph.get('react')?.dependencies).toEqual([]);
  });

  test('builds graph with transitive dependencies', () => {
    (extractDependencies as jest.Mock).mockImplementation((skillPath: string) => {
      if (skillPath.includes('/react/')) return ['typescript'];
      if (skillPath.includes('/typescript/')) return ['javascript'];
      return [];
    });

    const source = new MockSkillSource({
      react: {},
      typescript: {},
      javascript: {},
    });
    const resolver = new DependencyResolver(source);

    const graph = resolver.buildGraph(['react']);
    expect(graph.size).toBe(3);
    expect(graph.has('react')).toBe(true);
    expect(graph.has('typescript')).toBe(true);
    expect(graph.has('javascript')).toBe(true);
  });

  test('skips missing skills with a warning', () => {
    const source = new MockSkillSource({});
    const resolver = new DependencyResolver(source);
    const { logger } = jest.requireMock('../../utils/logger');

    const graph = resolver.buildGraph(['missing-skill']);
    expect(graph.size).toBe(0);
    expect(logger.warn).toHaveBeenCalled();
  });

  test('does not process the same skill twice (cycle prevention)', () => {
    (extractDependencies as jest.Mock).mockImplementation((skillPath: string) => {
      if (skillPath.includes('/a/')) return ['b'];
      if (skillPath.includes('/b/')) return ['a']; // cycle: a → b → a
      return [];
    });

    const source = new MockSkillSource({ a: {}, b: {} });
    const resolver = new DependencyResolver(source);

    // Should not infinite loop
    const graph = resolver.buildGraph(['a']);
    expect(graph.size).toBe(2);
  });

  test('builds graph from multiple root skills', () => {
    const source = new MockSkillSource({ react: {}, typescript: {}, jest: {} });
    const resolver = new DependencyResolver(source);

    const graph = resolver.buildGraph(['react', 'typescript', 'jest']);
    expect(graph.size).toBe(3);
  });
});

// ─── detectCycles ─────────────────────────────────────────────────────────

describe('detectCycles', () => {
  test('returns null when no cycles exist', () => {
    const source = new MockSkillSource({ a: {}, b: {} });
    const resolver = new DependencyResolver(source);

    (extractDependencies as jest.Mock).mockImplementation((p: string) =>
      p.includes('/a/') ? ['b'] : []
    );

    const graph = resolver.buildGraph(['a']);
    expect(resolver.detectCycles(graph)).toBeNull();
  });

  test('detects a simple A → B → A cycle', () => {
    (extractDependencies as jest.Mock).mockImplementation((skillPath: string) => {
      if (skillPath.includes('/a/')) return ['b'];
      if (skillPath.includes('/b/')) return ['a'];
      return [];
    });

    const source = new MockSkillSource({ a: {}, b: {} });
    const resolver = new DependencyResolver(source);
    const graph = resolver.buildGraph(['a']);
    const cycles = resolver.detectCycles(graph);

    expect(cycles).not.toBeNull();
    expect((cycles ?? []).length).toBeGreaterThan(0);
  });

  test('detects a longer A → B → C → A cycle', () => {
    (extractDependencies as jest.Mock).mockImplementation((skillPath: string) => {
      if (skillPath.includes('/a/')) return ['b'];
      if (skillPath.includes('/b/')) return ['c'];
      if (skillPath.includes('/c/')) return ['a'];
      return [];
    });

    const source = new MockSkillSource({ a: {}, b: {}, c: {} });
    const resolver = new DependencyResolver(source);
    const graph = resolver.buildGraph(['a']);
    const cycles = resolver.detectCycles(graph);

    expect(cycles).not.toBeNull();
  });
});

// ─── getInstallationOrder ─────────────────────────────────────────────────

describe('getInstallationOrder', () => {
  test('returns single skill with no dependencies', () => {
    const source = new MockSkillSource({ react: {} });
    const resolver = new DependencyResolver(source);
    const graph = resolver.buildGraph(['react']);
    const order = resolver.getInstallationOrder(graph);
    expect(order).toEqual(['react']);
  });

  test('installs dependencies before dependents', () => {
    (extractDependencies as jest.Mock).mockImplementation((p: string) =>
      p.includes('/react/') ? ['typescript'] : []
    );

    const source = new MockSkillSource({ react: {}, typescript: {} });
    const resolver = new DependencyResolver(source);
    const graph = resolver.buildGraph(['react']);
    const order = resolver.getInstallationOrder(graph);

    const tsIdx = order.indexOf('typescript');
    const reactIdx = order.indexOf('react');
    expect(tsIdx).toBeLessThan(reactIdx);
  });

  test('handles diamond dependency (A→B, A→C, B→D, C→D) without duplicates', () => {
    (extractDependencies as jest.Mock).mockImplementation((p: string) => {
      if (p.includes('/a/')) return ['b', 'c'];
      if (p.includes('/b/')) return ['d'];
      if (p.includes('/c/')) return ['d'];
      return [];
    });

    const source = new MockSkillSource({ a: {}, b: {}, c: {}, d: {} });
    const resolver = new DependencyResolver(source);
    const graph = resolver.buildGraph(['a']);
    const order = resolver.getInstallationOrder(graph);

    // d should appear before b and c, which appear before a
    expect(order).toHaveLength(4);
    expect(order.indexOf('d')).toBeLessThan(order.indexOf('a'));
  });

  test('throws when cycle is present', () => {
    (extractDependencies as jest.Mock).mockImplementation((p: string) => {
      if (p.includes('/a/')) return ['b'];
      if (p.includes('/b/')) return ['a'];
      return [];
    });

    const source = new MockSkillSource({ a: {}, b: {} });
    const resolver = new DependencyResolver(source);
    const graph = resolver.buildGraph(['a']);

    expect(() => resolver.getInstallationOrder(graph)).toThrow();
  });
});

// ─── versionSatisfies ─────────────────────────────────────────────────────

describe('versionSatisfies', () => {
  let resolver: DependencyResolver;

  beforeEach(() => {
    resolver = new DependencyResolver(new MockSkillSource());
  });

  test('exact match', () => {
    expect(resolver.versionSatisfies('1.0', '1.0')).toBe(true);
    expect(resolver.versionSatisfies('1.0', '2.0')).toBe(false);
  });

  test('caret (^) — same major', () => {
    expect(resolver.versionSatisfies('1.2', '^1.0')).toBe(true);
    expect(resolver.versionSatisfies('1.0', '^1.0')).toBe(true);
    expect(resolver.versionSatisfies('2.0', '^1.0')).toBe(false);
  });

  test('tilde (~) — same major and minor', () => {
    expect(resolver.versionSatisfies('1.2', '~1.2')).toBe(true);
    expect(resolver.versionSatisfies('1.3', '~1.2')).toBe(false);
  });

  test('>= operator', () => {
    expect(resolver.versionSatisfies('2.0', '>=1.0')).toBe(true);
    expect(resolver.versionSatisfies('1.0', '>=1.0')).toBe(true);
    expect(resolver.versionSatisfies('0.9', '>=1.0')).toBe(false);
  });

  test('> operator', () => {
    expect(resolver.versionSatisfies('2.0', '>1.0')).toBe(true);
    expect(resolver.versionSatisfies('1.0', '>1.0')).toBe(false);
  });

  test('<= operator', () => {
    expect(resolver.versionSatisfies('1.0', '<=2.0')).toBe(true);
    expect(resolver.versionSatisfies('2.0', '<=2.0')).toBe(true);
    expect(resolver.versionSatisfies('3.0', '<=2.0')).toBe(false);
  });

  test('< operator', () => {
    expect(resolver.versionSatisfies('1.0', '<2.0')).toBe(true);
    expect(resolver.versionSatisfies('2.0', '<2.0')).toBe(false);
  });

  test('wildcard * always matches', () => {
    expect(resolver.versionSatisfies('1.0', '*')).toBe(true);
    expect(resolver.versionSatisfies('99.99', '*')).toBe(true);
  });

  test('"latest" always matches', () => {
    expect(resolver.versionSatisfies('1.0', 'latest')).toBe(true);
  });
});

// ─── parseAgentsMd ────────────────────────────────────────────────────────

describe('parseAgentsMd', () => {
  function writeFile(name: string, content: string): string {
    const filePath = path.join(tmpDir, name);
    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  test('extracts skills from valid AGENTS.md', () => {
    const file = writeFile(
      'AGENTS.md',
      `---
name: test-agent
metadata:
  version: "1.0"
  skills:
    - typescript
    - react
    - critical-partner
---

# Test Agent
`
    );
    const skills = DependencyResolver.parseAgentsMd(file);
    expect(skills).toContain('typescript');
    expect(skills).toContain('react');
    expect(skills).toContain('critical-partner');
    expect(skills).toHaveLength(3);
  });

  test('returns empty array when no frontmatter', () => {
    const file = writeFile('no-fm.md', '# No frontmatter here');
    const skills = DependencyResolver.parseAgentsMd(file);
    expect(skills).toEqual([]);
  });

  test('returns empty array when skills field is missing', () => {
    const file = writeFile(
      'no-skills.md',
      `---
name: test-agent
metadata:
  version: "1.0"
---
# Content
`
    );
    const skills = DependencyResolver.parseAgentsMd(file);
    expect(skills).toEqual([]);
  });

  test('returns empty array when skills is not an array', () => {
    const file = writeFile(
      'not-array.md',
      `---
name: test-agent
metadata:
  version: "1.0"
  skills: "just-a-string"
---
`
    );
    const skills = DependencyResolver.parseAgentsMd(file);
    expect(skills).toEqual([]);
  });

  test('filters out non-string entries from skills array', () => {
    const file = writeFile(
      'mixed.md',
      `---
name: test-agent
metadata:
  version: "1.0"
  skills:
    - typescript
    - 123
    - react
---
`
    );
    const skills = DependencyResolver.parseAgentsMd(file);
    expect(skills).toContain('typescript');
    expect(skills).toContain('react');
    // 123 gets coerced to string by js-yaml, but the filter checks for string type
  });
});

// ─── validateGraph ────────────────────────────────────────────────────────

describe('validateGraph', () => {
  test('valid graph returns valid: true with no missing and no cycles', () => {
    const source = new MockSkillSource({ react: {}, typescript: {} });
    const resolver = new DependencyResolver(source);

    (extractDependencies as jest.Mock).mockImplementation((p: string) =>
      p.includes('/react/') ? ['typescript'] : []
    );

    const graph = resolver.buildGraph(['react']);
    const result = resolver.validateGraph(graph);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
    expect(result.cycles).toBeNull();
  });

  test('reports missing dependencies', () => {
    // react depends on typescript, but typescript is not in source
    const source = new MockSkillSource({ react: {} });
    const resolver = new DependencyResolver(source);

    // Set up deps but typescript won't be added to graph (not in source)
    (extractDependencies as jest.Mock).mockImplementation((p: string) =>
      p.includes('/react/') ? ['typescript'] : []
    );

    const graph = resolver.buildGraph(['react']);
    // Manually add react's dep reference — normally buildGraph skips missing skills
    // But we can build a minimal graph manually to test validateGraph directly
    graph.set('react', {
      name: 'react',
      version: '1.0',
      dependencies: ['typescript'],
      source: 'agents-md',
    });
    // typescript is NOT in graph

    const result = resolver.validateGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.missing.some((m) => m.includes('typescript'))).toBe(true);
  });

  test('reports cycles as invalid', () => {
    (extractDependencies as jest.Mock).mockImplementation((p: string) => {
      if (p.includes('/a/')) return ['b'];
      if (p.includes('/b/')) return ['a'];
      return [];
    });

    const source = new MockSkillSource({ a: {}, b: {} });
    const resolver = new DependencyResolver(source);
    const graph = resolver.buildGraph(['a']);
    const result = resolver.validateGraph(graph);

    expect(result.valid).toBe(false);
    expect(result.cycles).not.toBeNull();
  });
});
