/**
 * Common types used across the application
 */

// Installation types (from registry)
export type InstallationType = 'local' | 'external';
export type SkillSource = 'symlink' | 'copy';

// Dependency source types
export type DependencySource = 'agents-md' | 'meta-skill' | 'skill-dependency';

// Model types
export type ModelName = 'github-copilot' | 'claude' | 'codex' | 'gemini';

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Version compatibility operators
export type VersionOperator = '^' | '~' | '>=' | '>' | '<=' | '<' | '*' | 'latest';

// File path types (for clarity)
export type SkillPath = string;
export type AbsolutePath = string;
export type RelativePath = string;
