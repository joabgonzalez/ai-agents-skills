/**
 * Unit tests for src/core/model-detector.ts
 *
 * No chalk dependency — imports directly from model-detector.ts (safe for Jest CJS).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ModelDetector, SUPPORTED_MODELS } from '../../core/model-detector';

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

// ─── SUPPORTED_MODELS ──────────────────────────────────────────────────────

describe('SUPPORTED_MODELS', () => {
  test('contains all 5 expected model IDs', () => {
    const ids = Object.keys(SUPPORTED_MODELS);
    expect(ids).toContain('claude');
    expect(ids).toContain('copilot');
    expect(ids).toContain('cursor');
    expect(ids).toContain('gemini');
    expect(ids).toContain('codex');
  });

  test('each model has name and directory properties', () => {
    for (const [id, config] of Object.entries(SUPPORTED_MODELS)) {
      expect(typeof config.name).toBe('string');
      expect(config.name.length).toBeGreaterThan(0);
      expect(typeof config.directory).toBe('string');
      expect(config.directory).toMatch(/^\./); // all model dirs start with .
      expect(config.directory).toBe(config.directory.toLowerCase());
      void id; // used via Object.entries
    }
  });
});

// ─── detectInstalledModels ─────────────────────────────────────────────────

describe('detectInstalledModels', () => {
  test('returns empty array when no models are installed', () => {
    const result = detector.detectInstalledModels(tmpDir);
    expect(result).toEqual([]);
  });

  test('detects a single installed model', () => {
    createModel(tmpDir, '.claude');
    const result = detector.detectInstalledModels(tmpDir);
    expect(result).toContain('claude');
    expect(result).toHaveLength(1);
  });

  test('detects multiple installed models', () => {
    createModel(tmpDir, '.claude');
    createModel(tmpDir, '.cursor');
    const result = detector.detectInstalledModels(tmpDir);
    expect(result).toContain('claude');
    expect(result).toContain('cursor');
    expect(result).toHaveLength(2);
  });

  test('does not detect model when directory exists but skills/ subdir is missing', () => {
    fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
    // No .claude/skills/ directory
    const result = detector.detectInstalledModels(tmpDir);
    expect(result).not.toContain('claude');
  });

  test('does not detect model directories not in SUPPORTED_MODELS', () => {
    fs.mkdirSync(path.join(tmpDir, '.unknown', 'skills'), { recursive: true });
    const result = detector.detectInstalledModels(tmpDir);
    expect(result).not.toContain('unknown');
  });
});

// ─── getModelInfo ──────────────────────────────────────────────────────────

describe('getModelInfo', () => {
  test('returns model info for known model (not installed)', () => {
    const info = detector.getModelInfo(tmpDir, 'claude');
    expect(info).not.toBeNull();
    expect(info?.id).toBe('claude');
    expect(info?.name).toBe('Claude');
    expect(info?.installed).toBe(false);
  });

  test('returns model info with installed=true when model is installed', () => {
    createModel(tmpDir, '.claude');
    const info = detector.getModelInfo(tmpDir, 'claude');
    expect(info?.installed).toBe(true);
  });

  test('returns null for unknown model ID', () => {
    const info = detector.getModelInfo(tmpDir, 'unknown-model');
    expect(info).toBeNull();
  });

  test('returns correct directory path', () => {
    const info = detector.getModelInfo(tmpDir, 'claude');
    expect(info?.directory).toBe(path.join(tmpDir, '.claude'));
  });

  test('returns correct skillsPath', () => {
    const info = detector.getModelInfo(tmpDir, 'copilot');
    expect(info?.skillsPath).toBe(path.join(tmpDir, '.github', 'skills'));
  });
});

// ─── getAllModelsInfo ──────────────────────────────────────────────────────

describe('getAllModelsInfo', () => {
  test('returns info for all 5 supported models', () => {
    const result = detector.getAllModelsInfo(tmpDir);
    expect(result).toHaveLength(5);
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

  test('installed flag is accurate for each model', () => {
    createModel(tmpDir, '.claude');
    const result = detector.getAllModelsInfo(tmpDir);
    const claude = result.find((m) => m.id === 'claude');
    const cursor = result.find((m) => m.id === 'cursor');
    expect(claude?.installed).toBe(true);
    expect(cursor?.installed).toBe(false);
  });
});

// ─── getModelDirectory ─────────────────────────────────────────────────────

describe('getModelDirectory', () => {
  test('returns correct directory for claude', () => {
    const dir = detector.getModelDirectory(tmpDir, 'claude');
    expect(dir).toBe(path.join(tmpDir, '.claude'));
  });

  test('returns correct directory for copilot', () => {
    const dir = detector.getModelDirectory(tmpDir, 'copilot');
    expect(dir).toBe(path.join(tmpDir, '.github'));
  });

  test('returns correct directory for cursor', () => {
    const dir = detector.getModelDirectory(tmpDir, 'cursor');
    expect(dir).toBe(path.join(tmpDir, '.cursor'));
  });

  test('throws for unknown model', () => {
    expect(() => detector.getModelDirectory(tmpDir, 'unknown')).toThrow();
  });
});

// ─── getModelSkillsDirectory ───────────────────────────────────────────────

describe('getModelSkillsDirectory', () => {
  test('returns correct skills directory for claude', () => {
    const dir = detector.getModelSkillsDirectory(tmpDir, 'claude');
    expect(dir).toBe(path.join(tmpDir, '.claude', 'skills'));
  });

  test('returns correct skills directory for gemini', () => {
    const dir = detector.getModelSkillsDirectory(tmpDir, 'gemini');
    expect(dir).toBe(path.join(tmpDir, '.gemini', 'skills'));
  });
});
