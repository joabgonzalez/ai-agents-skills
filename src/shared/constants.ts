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
// visible: false = tracked in the registry but hidden from wizard/list UI
export const UNIVERSAL_MODELS: Array<{ value: string; label: string; visible: boolean }> = [
  { value: 'amp', label: 'Amp', visible: true },
  { value: 'antigravity-cli', label: 'Antigravity CLI', visible: true },
  { value: 'cline', label: 'Cline', visible: true },
  { value: 'codex', label: 'Codex', visible: true },
  { value: 'cursor', label: 'Cursor', visible: true },
  { value: 'deep-agents', label: 'Deep Agents', visible: true },
  { value: 'firebender', label: 'Firebender', visible: true },
  { value: 'gemini', label: 'Gemini CLI', visible: true },
  { value: 'github-copilot', label: 'GitHub Copilot', visible: true },
  { value: 'kimi', label: 'Kimi Code CLI', visible: true },
  { value: 'opencode', label: 'OpenCode', visible: true },
  { value: 'warp', label: 'Warp', visible: true },
  { value: 'zed', label: 'Zed', visible: true },
  { value: 'dexto', label: 'Dexto', visible: false },
  { value: 'loaf', label: 'Loaf', visible: false },
  { value: 'promptscript', label: 'PromptScript', visible: false },
];

export const VISIBLE_UNIVERSAL_MODELS = UNIVERSAL_MODELS.filter((m) => m.visible);
export const HIDDEN_UNIVERSAL_MODELS = UNIVERSAL_MODELS.filter((m) => !m.visible);

// Compact display string for universal models (used in CLI output)
export const UNIVERSAL_MODELS_LABEL = VISIBLE_UNIVERSAL_MODELS.map((m) => m.label).join(' · ');

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
