/**
 * Unit tests for src/core/model-detector.ts
 *
 * No chalk dependency — imports directly from model-detector.ts (safe for Jest CJS).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ModelDetector, SUPPORTED_MODELS, UNIVERSAL_MODEL_IDS } from '../../core/model-detector';

// ─── Setup ─────────────────────────────────────────────────────────────────

let tmpDir: string;
let detector: ModelDetector;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'model-detector-test-'));
  detector = new ModelDetector();
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function createModel(projectRoot: string, modelDir: string): void {
  const skillsPath = path.join(projectRoot, modelDir, 'skills');
  fs.mkdirSync(skillsPath, { recursive: true });
}

// ─── SUPPORTED_MODELS (dedicated only) ────────────────────────────────────

describe('SUPPORTED_MODELS', () => {
  test('contains exactly the 3 dedicated model IDs', () => {
    const ids = Object.keys(SUPPORTED_MODELS);
    expect(ids).toContain('claude');
    expect(ids).toContain('antigravity');
    expect(ids).toContain('openclaw');
    expect(ids).toHaveLength(3);
  });

  test('each dedicated model has name and directory properties', () => {
    for (const [id, config] of Object.entries(SUPPORTED_MODELS)) {
      expect(typeof config.name).toBe('string');
      expect(config.name.length).toBeGreaterThan(0);
      expect(typeof config.directory).toBe('string');
      expect(config.directory).toMatch(/^\./); // all model dirs start with .
      expect(config.directory).toBe(config.directory.toLowerCase());
      void id; // used via Object.entries
    }
  });

  test('claude maps to .claude directory', () => {
    expect(SUPPORTED_MODELS.claude.directory).toBe('.claude');
  });

  test('antigravity maps to .agent directory', () => {
    expect(SUPPORTED_MODELS.antigravity.directory).toBe('.agent');
  });

  test('openclaw maps to . directory (project root)', () => {
    expect(SUPPORTED_MODELS.openclaw.directory).toBe('.');
  });
});

// ─── UNIVERSAL_MODEL_IDS ───────────────────────────────────────────────────

describe('UNIVERSAL_MODEL_IDS', () => {
  test('contains exactly 8 universal model IDs', () => {
    expect(UNIVERSAL_MODEL_IDS).toHaveLength(8);
  });

  test('contains all expected universal model IDs', () => {
    expect(UNIVERSAL_MODEL_IDS).toContain('amp');
    expect(UNIVERSAL_MODEL_IDS).toContain('cline');
    expect(UNIVERSAL_MODEL_IDS).toContain('codex');
    expect(UNIVERSAL_MODEL_IDS).toContain('cursor');
    expect(UNIVERSAL_MODEL_IDS).toContain('gemini');
    expect(UNIVERSAL_MODEL_IDS).toContain('github-copilot');
    expect(UNIVERSAL_MODEL_IDS).toContain('kimi');
    expect(UNIVERSAL_MODEL_IDS).toContain('opencode');
  });

  test('does not contain dedicated model IDs', () => {
    expect(UNIVERSAL_MODEL_IDS).not.toContain('claude');
    expect(UNIVERSAL_MODEL_IDS).not.toContain('antigravity');
    expect(UNIVERSAL_MODEL_IDS).not.toContain('openclaw');
  });
});

// ─── detectInstalledModels ─────────────────────────────────────────────────

describe('detectInstalledModels', () => {
  test('returns empty array when no models are installed', () => {
    const result = detector.detectInstalledModels(tmpDir);
    expect(result).toEqual([]);
  });

  test('detects claude when .claude/skills/ exists', () => {
    createModel(tmpDir, '.claude');
    const result = detector.detectInstalledModels(tmpDir);
    expect(result).toContain('claude');
    expect(result).toHaveLength(1);
  });

  test('detects antigravity when .agent/skills/ exists', () => {
    createModel(tmpDir, '.agent');
    const result = detector.detectInstalledModels(tmpDir);
    expect(result).toContain('antigravity');
    expect(result).toHaveLength(1);
  });

  test('detects openclaw when skills/ exists at project root', () => {
    fs.mkdirSync(path.join(tmpDir, 'skills'), { recursive: true });
    const result = detector.detectInstalledModels(tmpDir);
    expect(result).toContain('openclaw');
    expect(result).toHaveLength(1);
  });

  test('detects all three dedicated models when all directories exist', () => {
    createModel(tmpDir, '.claude');
    createModel(tmpDir, '.agent');
    fs.mkdirSync(path.join(tmpDir, 'skills'), { recursive: true });
    const result = detector.detectInstalledModels(tmpDir);
    expect(result).toContain('claude');
    expect(result).toContain('antigravity');
    expect(result).toContain('openclaw');
    expect(result).toHaveLength(3);
  });

  test('does not detect model when directory exists but skills/ subdir is missing', () => {
    fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
    // No .claude/skills/ directory
    const result = detector.detectInstalledModels(tmpDir);
    expect(result).not.toContain('claude');
  });

  test('does not detect universal models (e.g. cursor, codex)', () => {
    // Universal models use .agents/skills/ — creating their old dirs should not register them
    fs.mkdirSync(path.join(tmpDir, '.cursor', 'skills'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, '.codex', 'skills'), { recursive: true });
    const result = detector.detectInstalledModels(tmpDir);
    expect(result).not.toContain('cursor');
    expect(result).not.toContain('codex');
    expect(result).toHaveLength(0);
  });
});

// ─── getModelInfo ──────────────────────────────────────────────────────────

describe('getModelInfo', () => {
  test('returns model info for claude (not installed)', () => {
    const info = detector.getModelInfo(tmpDir, 'claude');
    expect(info).not.toBeNull();
    expect(info?.id).toBe('claude');
    expect(info?.name).toBe('Claude Code');
    expect(info?.installed).toBe(false);
  });

  test('returns model info for antigravity (not installed)', () => {
    const info = detector.getModelInfo(tmpDir, 'antigravity');
    expect(info).not.toBeNull();
    expect(info?.id).toBe('antigravity');
    expect(info?.name).toBe('Antigravity');
    expect(info?.installed).toBe(false);
  });

  test('returns model info for openclaw (not installed)', () => {
    const info = detector.getModelInfo(tmpDir, 'openclaw');
    expect(info).not.toBeNull();
    expect(info?.id).toBe('openclaw');
    expect(info?.name).toBe('OpenClaw');
    expect(info?.installed).toBe(false);
  });

  test('returns model info with installed=true when openclaw skills/ dir exists', () => {
    fs.mkdirSync(path.join(tmpDir, 'skills'), { recursive: true });
    const info = detector.getModelInfo(tmpDir, 'openclaw');
    expect(info?.installed).toBe(true);
  });

  test('returns correct skillsPath for openclaw', () => {
    const info = detector.getModelInfo(tmpDir, 'openclaw');
    expect(info?.skillsPath).toBe(path.join(tmpDir, 'skills'));
  });

  test('returns model info with installed=true when claude is installed', () => {
    createModel(tmpDir, '.claude');
    const info = detector.getModelInfo(tmpDir, 'claude');
    expect(info?.installed).toBe(true);
  });

  test('returns null for unknown model ID', () => {
    const info = detector.getModelInfo(tmpDir, 'unknown-model');
    expect(info).toBeNull();
  });

  test('returns null for universal model IDs (e.g. cursor, codex)', () => {
    expect(detector.getModelInfo(tmpDir, 'cursor')).toBeNull();
    expect(detector.getModelInfo(tmpDir, 'codex')).toBeNull();
    expect(detector.getModelInfo(tmpDir, 'gemini')).toBeNull();
  });

  test('returns correct directory path for claude', () => {
    const info = detector.getModelInfo(tmpDir, 'claude');
    expect(info?.directory).toBe(path.join(tmpDir, '.claude'));
  });

  test('returns correct directory path for antigravity', () => {
    const info = detector.getModelInfo(tmpDir, 'antigravity');
    expect(info?.directory).toBe(path.join(tmpDir, '.agent'));
  });

  test('returns correct skillsPath for claude', () => {
    const info = detector.getModelInfo(tmpDir, 'claude');
    expect(info?.skillsPath).toBe(path.join(tmpDir, '.claude', 'skills'));
  });
});

// ─── getAllModelsInfo ──────────────────────────────────────────────────────

describe('getAllModelsInfo', () => {
  test('returns info for all 3 dedicated models', () => {
    const result = detector.getAllModelsInfo(tmpDir);
    expect(result).toHaveLength(3);
  });

  test('all returned models have required properties', () => {
    const result = detector.getAllModelsInfo(tmpDir);
    for (const info of result) {
      expect(typeof info.id).toBe('string');
      expect(typeof info.name).toBe('string');
      expect(typeof info.directory).toBe('string');
      expect(typeof info.skillsPath).toBe('string');
      expect(typeof info.installed).toBe('boolean');
    }
  });

  test('installed flag is accurate for each dedicated model', () => {
    createModel(tmpDir, '.claude');
    const result = detector.getAllModelsInfo(tmpDir);
    const claude = result.find((m) => m.id === 'claude');
    const antigravity = result.find((m) => m.id === 'antigravity');
    expect(claude?.installed).toBe(true);
    expect(antigravity?.installed).toBe(false);
  });
});

// ─── getModelDirectory ─────────────────────────────────────────────────────

describe('getModelDirectory', () => {
  test('returns correct directory for claude', () => {
    const dir = detector.getModelDirectory(tmpDir, 'claude');
    expect(dir).toBe(path.join(tmpDir, '.claude'));
  });

  test('returns correct directory for antigravity', () => {
    const dir = detector.getModelDirectory(tmpDir, 'antigravity');
    expect(dir).toBe(path.join(tmpDir, '.agent'));
  });

  test('throws for unknown model', () => {
    expect(() => detector.getModelDirectory(tmpDir, 'unknown')).toThrow();
  });

  test('throws for universal model IDs (cursor, codex, gemini)', () => {
    expect(() => detector.getModelDirectory(tmpDir, 'cursor')).toThrow();
    expect(() => detector.getModelDirectory(tmpDir, 'codex')).toThrow();
    expect(() => detector.getModelDirectory(tmpDir, 'gemini')).toThrow();
  });
});

// ─── getModelSkillsDirectory ───────────────────────────────────────────────

describe('getModelSkillsDirectory', () => {
  test('returns correct skills directory for claude', () => {
    const dir = detector.getModelSkillsDirectory(tmpDir, 'claude');
    expect(dir).toBe(path.join(tmpDir, '.claude', 'skills'));
  });

  test('returns correct skills directory for antigravity', () => {
    const dir = detector.getModelSkillsDirectory(tmpDir, 'antigravity');
    expect(dir).toBe(path.join(tmpDir, '.agent', 'skills'));
  });
});
