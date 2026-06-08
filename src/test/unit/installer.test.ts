/**
 * Unit tests for src/core/installer.ts
 *
 * Mocks logger (chalk ESM) — same pattern as dependency-resolver.test.ts.
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

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Installer } from '../../core/installer';

let baseDir: string;
let agentsBaseDir: string;

beforeEach(() => {
  baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'installer-base-'));
  agentsBaseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'installer-agents-'));

  const skillDir = path.join(baseDir, 'skills', 'react');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: react\n---\n');
});

afterEach(() => {
  fs.rmSync(baseDir, { recursive: true, force: true });
  fs.rmSync(agentsBaseDir, { recursive: true, force: true });
});

describe('Installer.installToAgentsSkills', () => {
  test('copies skill into .agents/skills/ for external mode without any dedicated model selected', async () => {
    const installer = new Installer(baseDir, agentsBaseDir);

    const result = await installer.installToAgentsSkills('react', 'external');

    const agentsSkillsPath = path.join(agentsBaseDir, '.agents', 'skills', 'react');
    expect(result).toBe(true);
    expect(fs.existsSync(agentsSkillsPath)).toBe(true);
    expect(fs.existsSync(path.join(agentsSkillsPath, 'SKILL.md'))).toBe(true);
  });

  test('creates intermediate symlink into .agents/skills/ for local mode', async () => {
    const installer = new Installer(baseDir, agentsBaseDir);

    const result = await installer.installToAgentsSkills('react', 'local');

    const agentsSkillsPath = path.join(agentsBaseDir, '.agents', 'skills', 'react');
    expect(result).toBe(true);
    expect(fs.lstatSync(agentsSkillsPath).isSymbolicLink()).toBe(true);
  });

  test('returns false and does not duplicate when already present', async () => {
    const installer = new Installer(baseDir, agentsBaseDir);

    const first = await installer.installToAgentsSkills('react', 'external');
    const second = await installer.installToAgentsSkills('react', 'external');

    expect(first).toBe(true);
    expect(second).toBe(false);
  });

  test('dry run reports without writing to disk', async () => {
    const installer = new Installer(baseDir, agentsBaseDir);

    const result = await installer.installToAgentsSkills('react', 'external', true);

    const agentsSkillsPath = path.join(agentsBaseDir, '.agents', 'skills', 'react');
    expect(result).toBe(true);
    expect(fs.existsSync(agentsSkillsPath)).toBe(false);
  });
});
