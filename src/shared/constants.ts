/**
 * Application constants
 */

// Supported models and their directories
export const MODEL_DIRECTORIES: Record<string, string> = {
  'github-copilot': '.github',
  'copilot': '.github',
  'claude': '.claude',
  'codex': '.codex',
  'gemini': '.gemini',
  'cursor': '.cursor',
};

// Model display names for UI
export const MODEL_NAMES: Record<string, string> = {
  'github-copilot': 'GitHub Copilot',
  'copilot': 'GitHub Copilot',
  'claude': 'Claude',
  'codex': 'Codex (OpenAI)',
  'gemini': 'Gemini',
  'cursor': 'Cursor',
};

// All available models (for interactive selection)
export const AVAILABLE_MODELS = [
  { value: 'github-copilot', label: 'GitHub Copilot', hint: 'Install to .github/' },
  { value: 'claude', label: 'Claude', hint: 'Install to .claude/' },
  { value: 'gemini', label: 'Gemini', hint: 'Install to .gemini/' },
  { value: 'codex', label: 'Codex (OpenAI)', hint: 'Install to .codex/' },
  { value: 'cursor', label: 'Cursor', hint: 'Install to .cursor/' },
] as const;

// Template files directory
export const TEMPLATES_DIR = 'templates';

// Registry format version
export const REGISTRY_VERSION = '2.0';

// Default file names
export const DEFAULT_FILES = {
  SKILL: 'SKILL.md',
  AGENTS: 'AGENTS.md',
  REGISTRY: 'registry.yml',
} as const;
