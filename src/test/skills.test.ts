/**
 * Skill Validation Suite
 *
 * Auto-discovers all skills in skills/ and validates each against the
 * standards defined in skill-creation and reference-creation.
 *
 * Adding a new skill requires no changes to this file.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractFrontmatter, type JsonObject } from '../utils/yaml';

// Inlined to avoid skill-parser.ts → logger.ts → chalk (ESM-only) chain
function buildSkillPath(baseDir: string, skillName: string): string {
  return path.join(baseDir, 'skills', skillName, 'SKILL.md');
}

function listSkillsInDir(baseDir: string): string[] {
  const skillsDir = path.join(baseDir, 'skills');
  if (!fs.existsSync(skillsDir)) return [];
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => fs.existsSync(path.join(skillsDir, name, 'SKILL.md')));
}

// ── Constants ──────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SKILLS_DIR = path.join(PROJECT_ROOT, 'skills');

const VALID_TYPES = [
  'behavioral',
  'universal',
  'language',
  'framework',
  'library',
  'tooling',
  'domain',
] as const;
type SkillType = (typeof VALID_TYPES)[number];

const ALLOWED_DEPS: Record<SkillType, SkillType[]> = {
  behavioral: ['behavioral'],
  universal: ['behavioral'],
  language: ['language', 'behavioral'],
  framework: ['framework', 'language', 'domain', 'behavioral'],
  library: ['library', 'framework', 'language', 'domain', 'behavioral'],
  tooling: ['tooling', 'framework', 'language', 'domain', 'behavioral'],
  domain: ['domain', 'behavioral'],
};

const BANNED_REF_NAMES = new Set(['advanced.md', 'misc.md', 'extras.md', 'other.md', 'various.md']);

const FILLER_WORDS = ['comprehensive', 'detailed', 'robust', 'various', 'multiple'];

// Whitelists derived from SKILL-TEMPLATE.md and frontmatter schema
const ALLOWED_SKILL_H2 = new Set([
  'When to Use',
  'Critical Patterns',
  'Decision Tree',
  'Workflow',
  'Conventions',
  'Example',
  'Examples',
  'Edge Cases',
  'Checklist',
  'Resources',
]);

const ALLOWED_FM_ROOT_KEYS = new Set(['name', 'description', 'license', 'metadata']);

const ALLOWED_FM_META_KEYS = new Set([
  'version',
  'type',
  'skills',
  'dependencies',
  'allowed-tools',
]);

// ── Auto-discovery ─────────────────────────────────────────────────────────

const skillNames = listSkillsInDir(PROJECT_ROOT);

const skillsWithRefs = skillNames.filter((name) =>
  fs.existsSync(path.join(SKILLS_DIR, name, 'references'))
);

// Build type map once — used by dependency type rule tests
const skillTypeMap = new Map<string, string>();
for (const name of skillNames) {
  const fm = extractFrontmatter(buildSkillPath(PROJECT_ROOT, name));
  if (fm !== null) {
    const meta = fm.metadata;
    if (typeof meta === 'object' && meta !== null && !Array.isArray(meta)) {
      const metaObj = meta as JsonObject;
      if (typeof metaObj.type === 'string') {
        skillTypeMap.set(name, metaObj.type);
      }
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getFrontmatter(skillName: string): JsonObject {
  const fm = extractFrontmatter(buildSkillPath(PROJECT_ROOT, skillName));
  if (fm === null) throw new Error(`No frontmatter found in ${skillName}/SKILL.md`);
  return fm;
}

function readSkillContent(skillName: string): string {
  return fs.readFileSync(buildSkillPath(PROJECT_ROOT, skillName), 'utf-8');
}

// Strip fenced code blocks so ## headings inside examples are not matched
function stripCodeBlocks(content: string): string {
  return content.replace(/^`{3,}[^\n]*\n[\s\S]*?^`{3,}[^\n]*$/gm, '');
}

function getMetadata(fm: JsonObject): JsonObject {
  const meta = fm.metadata;
  if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) return {};
  return meta as JsonObject;
}

// ── 1. Frontmatter ─────────────────────────────────────────────────────────

describe('Frontmatter', () => {
  it.each(skillNames)('%s — name field present and matches directory name', (name) => {
    const fm = getFrontmatter(name);
    expect(typeof fm.name).toBe('string');
    expect(fm.name).toBe(name);
  });

  it.each(skillNames)('%s — name is lowercase-with-hyphens', (name) => {
    const fm = getFrontmatter(name);
    expect(fm.name as string).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(skillNames)('%s — description includes Trigger clause', (name) => {
    const fm = getFrontmatter(name);
    expect(typeof fm.description).toBe('string');
    expect(fm.description as string).toContain('Trigger:');
  });

  it.each(skillNames)('%s — description is under 150 characters', (name) => {
    const fm = getFrontmatter(name);
    expect((fm.description as string).length).toBeLessThanOrEqual(150);
  });

  it.each(skillNames)('%s — metadata.version matches X.Y or X.Y.Z', (name) => {
    const meta = getMetadata(getFrontmatter(name));
    expect(typeof meta.version).toBe('string');
    expect(meta.version as string).toMatch(/^[0-9]+\.[0-9]+(\.[0-9]+)?$/);
  });

  it.each(skillNames)('%s — metadata.type is a valid type', (name) => {
    const meta = getMetadata(getFrontmatter(name));
    expect(VALID_TYPES as readonly string[]).toContain(meta.type);
  });

  it.each(
    skillNames
  )('%s — metadata.skills items are lowercase-with-hyphens and exist as skill directories', (name) => {
    const meta = getMetadata(getFrontmatter(name));
    if (!Array.isArray(meta.skills)) return;
    for (const dep of meta.skills as string[]) {
      expect(typeof dep).toBe('string');
      expect(dep).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      const exists = fs.existsSync(path.join(SKILLS_DIR, dep));
      expect(exists).toBe(true);
    }
  });

  it.each(
    skillNames
  )('%s — metadata.dependencies values are version ranges, not "latest"', (name) => {
    const meta = getMetadata(getFrontmatter(name));
    const deps = meta.dependencies;
    if (typeof deps !== 'object' || deps === null || Array.isArray(deps)) return;
    for (const version of Object.values(deps as JsonObject)) {
      expect(typeof version).toBe('string');
      expect(version).not.toBe('latest');
      // Must contain a digit (e.g. ">=17.0.0")
      expect(version as string).toMatch(/\d/);
    }
  });

  it.each(skillNames)('%s — no empty arrays or objects in metadata', (name) => {
    const meta = getMetadata(getFrontmatter(name));
    for (const [, value] of Object.entries(meta)) {
      if (Array.isArray(value)) {
        expect(value.length).toBeGreaterThan(0);
      } else if (typeof value === 'object' && value !== null) {
        expect(Object.keys(value as object).length).toBeGreaterThan(0);
      }
    }
  });

  it.each(skillNames)('%s — only allowed root-level frontmatter keys', (name) => {
    const fm = getFrontmatter(name);
    for (const key of Object.keys(fm)) {
      expect(ALLOWED_FM_ROOT_KEYS).toContain(key);
    }
  });

  it.each(skillNames)('%s — only allowed metadata keys', (name) => {
    const meta = getMetadata(getFrontmatter(name));
    for (const key of Object.keys(meta)) {
      expect(ALLOWED_FM_META_KEYS).toContain(key);
    }
  });

  it.each(skillNames)('%s — metadata.skills is an array when present', (name) => {
    const meta = getMetadata(getFrontmatter(name));
    if (meta.skills === undefined) return;
    expect(Array.isArray(meta.skills)).toBe(true);
  });

  it.each(skillNames)('%s — metadata.dependencies is an object when present', (name) => {
    const meta = getMetadata(getFrontmatter(name));
    if (meta.dependencies === undefined) return;
    expect(Array.isArray(meta.dependencies)).toBe(false);
    expect(typeof meta.dependencies).toBe('object');
  });

  it.each(skillNames)('%s — does not depend on itself', (name) => {
    const meta = getMetadata(getFrontmatter(name));
    if (!Array.isArray(meta.skills)) return;
    expect(meta.skills as string[]).not.toContain(name);
  });

  it.each(skillNames)('%s — metadata.skills has no duplicate entries', (name) => {
    const meta = getMetadata(getFrontmatter(name));
    if (!Array.isArray(meta.skills)) return;
    const skills = meta.skills as string[];
    expect(new Set(skills).size).toBe(skills.length);
  });

  it.each(skillNames)('%s — description has no filler words', (name) => {
    const fm = getFrontmatter(name);
    const desc = (fm.description as string).toLowerCase();
    for (const word of FILLER_WORDS) {
      expect(desc).not.toContain(word);
    }
  });
});

// ── 2. Dependency Type Rules ───────────────────────────────────────────────

describe('Dependency Type Rules', () => {
  it.each(skillNames)('%s — declared skill dependencies are allowed types for its type', (name) => {
    const meta = getMetadata(getFrontmatter(name));
    const skillType = meta.type as SkillType;

    if (!(VALID_TYPES as readonly string[]).includes(skillType)) return;
    if (!Array.isArray(meta.skills) || (meta.skills as string[]).length === 0) return;

    const allowed = ALLOWED_DEPS[skillType];

    for (const dep of meta.skills as string[]) {
      const depType = skillTypeMap.get(dep);
      if (depType === undefined) continue; // dep existence is checked in Frontmatter tests
      expect(allowed as string[]).toContain(depType);
    }
  });
});

// ── 3. Content Structure ───────────────────────────────────────────────────

describe('Content Structure', () => {
  it.each(skillNames)('%s — has H1 heading', (name) => {
    const content = readSkillContent(name);
    expect(content).toMatch(/^#\s+\S/m);
  });

  it.each(skillNames)('%s — ## When to Use has "Don\'t use" negation', (name) => {
    const content = readSkillContent(name);
    expect(content).toContain('## When to Use');
    expect(content).toMatch(/don.t use/i);
  });

  it.each(skillNames)('%s — ## Critical Patterns has ✅ or ❌ markers', (name) => {
    const content = readSkillContent(name);
    expect(content).toContain('## Critical Patterns');
    expect(content).toMatch(/[✅❌]/u);
  });

  it.each(skillNames)('%s — ## Decision Tree is followed by a fenced code block', (name) => {
    const content = readSkillContent(name);
    expect(content).toContain('## Decision Tree');
    const afterDT = content.split('## Decision Tree')[1];
    expect(afterDT).toMatch(/```/);
  });

  it.each(skillNames)('%s — has ## Example section', (name) => {
    const content = readSkillContent(name);
    expect(content).toContain('## Example');
  });

  it.each(skillNames)('%s — has ## Edge Cases section', (name) => {
    const content = readSkillContent(name);
    expect(content).toContain('## Edge Cases');
  });

  it.each(skillNames)('%s — SKILL.md is 325 lines or fewer', (name) => {
    const content = readSkillContent(name);
    const lineCount = content.split('\n').length;
    expect(lineCount).toBeLessThanOrEqual(325);
  });

  it.each(skillNames)('%s — only allowed ## sections per SKILL-TEMPLATE.md', (name) => {
    const content = stripCodeBlocks(readSkillContent(name));
    const h2s = [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
    for (const h2 of h2s) {
      expect(ALLOWED_SKILL_H2).toContain(h2);
    }
  });

  it.each(skillNames)('%s — no duplicate ## sections', (name) => {
    const content = stripCodeBlocks(readSkillContent(name));
    const h2s = [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
    const seen = new Set<string>();
    for (const h2 of h2s) {
      expect(seen.has(h2)).toBe(false);
      seen.add(h2);
    }
  });
});

// ── 4. References Directory ────────────────────────────────────────────────

describe('References Directory', () => {
  it.each(skillsWithRefs)('%s — references/README.md exists', (name) => {
    expect(fs.existsSync(path.join(SKILLS_DIR, name, 'references', 'README.md'))).toBe(true);
  });

  it.each(skillsWithRefs)('%s — README.md has ## Quick Navigation', (name) => {
    const readme = fs.readFileSync(path.join(SKILLS_DIR, name, 'references', 'README.md'), 'utf-8');
    expect(readme).toContain('## Quick Navigation');
  });

  it.each(skillsWithRefs)('%s — README.md has ## Reading Strategy section', (name) => {
    const readme = fs.readFileSync(path.join(SKILLS_DIR, name, 'references', 'README.md'), 'utf-8');
    // Matches "Reading Strategy" or "Reading Strategies"
    expect(readme).toMatch(/## Reading Strateg/);
  });

  it.each(skillsWithRefs)('%s — README.md has ## File Descriptions', (name) => {
    const readme = fs.readFileSync(path.join(SKILLS_DIR, name, 'references', 'README.md'), 'utf-8');
    expect(readme).toContain('## File Descriptions');
  });

  it.each(skillsWithRefs)('%s — README.md has ## Cross-Reference Map', (name) => {
    const readme = fs.readFileSync(path.join(SKILLS_DIR, name, 'references', 'README.md'), 'utf-8');
    expect(readme).toContain('## Cross-Reference Map');
  });

  it.each(skillsWithRefs)('%s — no vague reference file names', (name) => {
    const refsDir = path.join(SKILLS_DIR, name, 'references');
    const files = fs.readdirSync(refsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
    for (const file of files) {
      expect(BANNED_REF_NAMES).not.toContain(file);
    }
  });

  it.each(skillsWithRefs)('%s — reference file names are lowercase-with-hyphens', (name) => {
    const refsDir = path.join(SKILLS_DIR, name, 'references');
    const files = fs.readdirSync(refsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
    for (const file of files) {
      const base = file.replace(/\.md$/, '');
      expect(base).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it.each(skillsWithRefs)('%s — reference files have ## Core Patterns section', (name) => {
    const refsDir = path.join(SKILLS_DIR, name, 'references');
    const files = fs.readdirSync(refsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
    for (const file of files) {
      const content = fs.readFileSync(path.join(refsDir, file), 'utf-8');
      expect(content).toContain('## Core Patterns');
    }
  });

  it.each(
    skillsWithRefs
  )('%s — reference files have no ## Overview, ## Objective, or ## Purpose sections', (name) => {
    const refsDir = path.join(SKILLS_DIR, name, 'references');
    const files = fs.readdirSync(refsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
    for (const file of files) {
      const content = fs.readFileSync(path.join(refsDir, file), 'utf-8');
      expect(content).not.toMatch(/^## (Overview|Objective|Purpose)\s*$/im);
    }
  });

  it.each(skillsWithRefs)('%s — references count is 10 or fewer', (name) => {
    const refsDir = path.join(SKILLS_DIR, name, 'references');
    const files = fs.readdirSync(refsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
    expect(files.length).toBeLessThanOrEqual(10);
  });

  it.each(skillsWithRefs)('%s — reference files are 1–800 lines', (name) => {
    const refsDir = path.join(SKILLS_DIR, name, 'references');
    const files = fs.readdirSync(refsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
    for (const file of files) {
      const content = fs.readFileSync(path.join(refsDir, file), 'utf-8');
      const lines = content.split('\n').length;
      expect(lines).toBeGreaterThan(0);
      expect(lines).toBeLessThanOrEqual(800);
    }
  });

  it.each(skillsWithRefs)('%s — all reference files are mentioned in README.md', (name) => {
    const refsDir = path.join(SKILLS_DIR, name, 'references');
    if (!fs.existsSync(path.join(refsDir, 'README.md'))) return;
    const readme = fs.readFileSync(path.join(refsDir, 'README.md'), 'utf-8');
    const files = fs.readdirSync(refsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
    for (const file of files) {
      expect(readme).toContain(file);
    }
  });

  it.each(skillsWithRefs)('%s — README.md links only to existing reference files', (name) => {
    const refsDir = path.join(SKILLS_DIR, name, 'references');
    if (!fs.existsSync(path.join(refsDir, 'README.md'))) return;
    const readme = fs.readFileSync(path.join(refsDir, 'README.md'), 'utf-8');
    const links = [...readme.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)]
      .map((m) => m[2])
      .filter(
        (l) =>
          !l.startsWith('http') && !l.startsWith('#') && !l.startsWith('..') && l.endsWith('.md')
      );
    for (const link of links) {
      expect(fs.existsSync(path.join(refsDir, link))).toBe(true);
    }
  });

  it.each(skillsWithRefs)('%s — no duplicate ## sections in reference files', (name) => {
    const refsDir = path.join(SKILLS_DIR, name, 'references');
    const files = fs.readdirSync(refsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
    for (const file of files) {
      const content = fs.readFileSync(path.join(refsDir, file), 'utf-8');
      const h2s = [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
      const seen = new Set<string>();
      for (const h2 of h2s) {
        expect(seen.has(h2)).toBe(false);
        seen.add(h2);
      }
    }
  });
});
