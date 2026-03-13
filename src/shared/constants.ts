/**
 * Application constants
 */

// Dedicated models — require their own {dir}/skills/ symlink directory
export const DEDICATED_MODELS: Record<string, { name: string; directory: string }> = {
  claude: { name: 'Claude Code', directory: '.claude' },
  antigravity: { name: 'Antigravity', directory: '.agent' },
  // OpenClaw installs directly into skills/ at project root (no subdirectory).
  // In local mode this repo's skills/ already serves OpenClaw natively.
  openclaw: { name: 'OpenClaw', directory: '.' },
};

// Universal models — read from .agents/skills/ natively (no extra directory needed)
export const UNIVERSAL_MODELS: Array<{ value: string; label: string }> = [
  { value: 'amp', label: 'Amp' },
  { value: 'cline', label: 'Cline' },
  { value: 'codex', label: 'Codex' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'gemini', label: 'Gemini CLI' },
  { value: 'github-copilot', label: 'GitHub Copilot' },
  { value: 'kimi', label: 'Kimi Code CLI' },
  { value: 'opencode', label: 'OpenCode' },
];

// Compact display string for universal models (used in CLI output)
export const UNIVERSAL_MODELS_LABEL = UNIVERSAL_MODELS.map((m) => m.label).join(' · ');

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
