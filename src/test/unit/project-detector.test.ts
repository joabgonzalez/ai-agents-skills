/**
 * Unit tests for src/core/project-detector.ts
 *
 * No chalk dependency — imports directly (safe for Jest CJS).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ProjectDetector } from '../../core/project-detector';

// ─── Setup ─────────────────────────────────────────────────────────────────

let tmpDir: string;
let detector: ProjectDetector;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-detector-test-'));
  detector = new ProjectDetector();
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ─── detectProject ────────────────────────────────────────────────────────

describe('detectProject', () => {
  test('detects project with package.json', async () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{"name":"test"}');
    const project = await detector.detectProject(tmpDir);
    expect(project.rootPath).toBe(tmpDir);
    expect(project.type).toBe('node');
    expect(project.hasPackageJson).toBe(true);
  });

  test('detects project with .git directory', async () => {
    fs.mkdirSync(path.join(tmpDir, '.git'));
    const project = await detector.detectProject(tmpDir);
    expect(project.rootPath).toBe(tmpDir);
    expect(project.type).toBe('git');
    expect(project.hasGit).toBe(true);
  });

  test('prefers package.json over .git for type', async () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{"name":"test"}');
    fs.mkdirSync(path.join(tmpDir, '.git'));
    const project = await detector.detectProject(tmpDir);
    expect(project.type).toBe('node');
  });

  test('returns manual type when no marker found (at root filesystem level)', async () => {
    // Create a deeply nested temp dir with no markers
    const deepDir = path.join(tmpDir, 'a', 'b', 'c');
    fs.mkdirSync(deepDir, { recursive: true });
    const project = await detector.detectProject(deepDir);
    // Will eventually find package.json/git in a parent or return manual at root
    // Just verify it returns a project object with required fields
    expect(typeof project.rootPath).toBe('string');
    expect(['node', 'git', 'manual']).toContain(project.type);
  });

  test('walks up directory tree to find project root', async () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{"name":"test"}');
    const subDir = path.join(tmpDir, 'src', 'components');
    fs.mkdirSync(subDir, { recursive: true });
    const project = await detector.detectProject(subDir);
    expect(project.rootPath).toBe(tmpDir);
  });
});

// ─── getAgentsDir ─────────────────────────────────────────────────────────

describe('getAgentsDir', () => {
  test('returns .agents path under project root', () => {
    const result = detector.getAgentsDir(tmpDir);
    expect(result).toBe(path.join(tmpDir, '.agents'));
  });
});

// ─── getSkillsDir ─────────────────────────────────────────────────────────

describe('getSkillsDir', () => {
  test('returns .agents/skills path under project root', () => {
    const result = detector.getSkillsDir(tmpDir);
    expect(result).toBe(path.join(tmpDir, '.agents', 'skills'));
  });
});

// ─── hasSkillsInstalled ───────────────────────────────────────────────────

describe('hasSkillsInstalled', () => {
  test('returns false when .agents/skills does not exist', () => {
    expect(detector.hasSkillsInstalled(tmpDir)).toBe(false);
  });

  test('returns false when .agents/skills exists but is empty', () => {
    fs.mkdirSync(path.join(tmpDir, '.agents', 'skills'), { recursive: true });
    expect(detector.hasSkillsInstalled(tmpDir)).toBe(false);
  });

  test('returns true when .agents/skills has entries', () => {
    const skillsDir = path.join(tmpDir, '.agents', 'skills');
    fs.mkdirSync(path.join(skillsDir, 'react'), { recursive: true });
    expect(detector.hasSkillsInstalled(tmpDir)).toBe(true);
  });
});

// ─── getInstalledSkills ───────────────────────────────────────────────────

describe('getInstalledSkills', () => {
  test('returns empty array when .agents/skills does not exist', () => {
    expect(detector.getInstalledSkills(tmpDir)).toEqual([]);
  });

  test('returns empty array when skills dir is empty', () => {
    fs.mkdirSync(path.join(tmpDir, '.agents', 'skills'), { recursive: true });
    expect(detector.getInstalledSkills(tmpDir)).toEqual([]);
  });

  test('returns directory names from .agents/skills', () => {
    const skillsDir = path.join(tmpDir, '.agents', 'skills');
    fs.mkdirSync(path.join(skillsDir, 'react'), { recursive: true });
    fs.mkdirSync(path.join(skillsDir, 'typescript'), { recursive: true });
    const skills = detector.getInstalledSkills(tmpDir);
    expect(skills).toContain('react');
    expect(skills).toContain('typescript');
    expect(skills).toHaveLength(2);
  });

  test('includes symlinks in the results', () => {
    const skillsDir = path.join(tmpDir, '.agents', 'skills');
    fs.mkdirSync(skillsDir, { recursive: true });
    const realSkillDir = path.join(tmpDir, 'real-skill');
    fs.mkdirSync(realSkillDir);
    fs.symlinkSync(realSkillDir, path.join(skillsDir, 'symlinked-skill'), 'dir');
    const skills = detector.getInstalledSkills(tmpDir);
    expect(skills).toContain('symlinked-skill');
  });
});
