import fs, { type Dirent } from 'node:fs';
import path from 'node:path';
import { exists, isFile } from '../utils/fs';
import { logger } from '../utils/logger';
import type { JsonObject } from '../utils/yaml';
import { extractFrontmatter, validateFrontmatter as validateFrontmatterUtil } from '../utils/yaml';

/**
 * Skill metadata structure (matches frontmatter schema)
 */
export interface SkillMetadata {
  name: string;
  description: string;
  license?: string;
  metadata: {
    version: string;
    skills?: string[];
    dependencies?: Record<string, string>;
    allowed_tools?: string[];
  };
  [key: string]: unknown;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Parse skill file and extract metadata
 */
export function parseSkillFile(filePath: string): SkillMetadata {
  if (!exists(filePath) || !isFile(filePath)) {
    throw new Error(`Skill file not found: ${filePath}`);
  }

  const frontmatter = extractFrontmatter(filePath);

  if (!frontmatter) {
    throw new Error(`No frontmatter found in ${filePath}`);
  }

  return normalizeFrontmatter(frontmatter);
}

/**
 * Extract version from skill file
 */
export function extractVersion(filePath: string): string {
  const metadata = parseSkillFile(filePath);
  return metadata.metadata.version;
}

/**
 * Extract skill dependencies from skill file
 */
export function extractDependencies(filePath: string): string[] {
  const metadata = parseSkillFile(filePath);
  return metadata.metadata.skills || [];
}

/**
 * Extract package dependencies from skill file
 */
export function extractPackageDependencies(filePath: string): Record<string, string> {
  const metadata = parseSkillFile(filePath);
  return metadata.metadata.dependencies || {};
}

/**
 * Validate skill frontmatter
 */
export function validateSkillMetadata(metadata: SkillMetadata): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Use util validation (SkillMetadata is structurally compatible with ValidatableFrontmatter)
  const utilValidation = validateFrontmatterUtil(metadata);
  errors.push(...utilValidation.errors);

  if (metadata.description && metadata.description.length > 150) {
    warnings.push(`Description is ${metadata.description.length} characters (recommended: <150)`);
  }

  if (!metadata.license) {
    warnings.push('Missing "license" field (recommended)');
  }

  if (metadata.metadata.version) {
    if (!/^[0-9]+\.[0-9]+(\.[0-9]+)?$/.test(metadata.metadata.version)) {
      errors.push(`Invalid version format: "${metadata.metadata.version}". Use "1.0" or "1.0.0"`);
    }
  }

  if (metadata.metadata.skills) {
    for (const skill of metadata.metadata.skills) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(skill)) {
        errors.push(`Invalid skill name in dependencies: "${skill}". Use lowercase-with-hyphens`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate skill file
 */
export function validateSkillFile(filePath: string): ValidationResult {
  try {
    const metadata = parseSkillFile(filePath);
    return validateSkillMetadata(metadata);
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)],
      warnings: [],
    };
  }
}

/**
 * Get skill name from file path
 * /path/to/skills/skill-name/SKILL.md -> skill-name
 */
export function getSkillNameFromPath(filePath: string): string {
  const dir = path.dirname(filePath);
  return path.basename(dir);
}

/**
 * Build skill path from base directory and skill name
 * (baseDir, skill-name) -> /baseDir/skills/skill-name/SKILL.md
 */
export function buildSkillPath(baseDir: string, skillName: string): string {
  return path.join(baseDir, 'skills', skillName, 'SKILL.md');
}

/**
 * Check if skill exists
 */
export function skillExists(baseDir: string, skillName: string): boolean {
  const skillPath = buildSkillPath(baseDir, skillName);
  return exists(skillPath) && isFile(skillPath);
}

/**
 * List all skills in directory
 */
export function listSkillsInDir(baseDir: string): string[] {
  const skillsDir = path.join(baseDir, 'skills');

  if (!exists(skillsDir)) {
    return [];
  }

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

  return entries
    .filter((entry: Dirent) => entry.isDirectory())
    .map((entry: Dirent) => entry.name)
    .filter((name: string) => skillExists(baseDir, name));
}

/**
 * Parse all skills in directory
 */
export function parseAllSkills(baseDir: string): Map<string, SkillMetadata> {
  const skills = new Map<string, SkillMetadata>();
  const skillNames = listSkillsInDir(baseDir);

  for (const skillName of skillNames) {
    try {
      const skillPath = buildSkillPath(baseDir, skillName);
      const metadata = parseSkillFile(skillPath);
      skills.set(skillName, metadata);
    } catch (error) {
      logger.error(
        `Failed to parse skill "${skillName}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return skills;
}

/**
 * Normalize frontmatter (handle legacy format)
 * Migrates old format to new format on-the-fly
 */
function normalizeFrontmatter(frontmatter: JsonObject): SkillMetadata {
  const normalized: SkillMetadata = {
    name: frontmatter.name as string,
    description: frontmatter.description as string,
    license: frontmatter.license as string | undefined,
    metadata: (frontmatter.metadata as SkillMetadata['metadata']) || { version: '1.0' },
  };

  if ('version' in frontmatter && typeof frontmatter.version === 'string') {
    logger.warn(`Legacy format detected: top-level "version" field. Migrating to metadata.version`);
    normalized.metadata.version = frontmatter.version;
  }

  if ('skills' in frontmatter && Array.isArray(frontmatter.skills)) {
    logger.warn(`Legacy format detected: top-level "skills" field. Migrating to metadata.skills`);
    normalized.metadata.skills = (frontmatter.skills as string[]).filter(
      (s): s is string => typeof s === 'string'
    );
  }

  if (
    'dependencies' in frontmatter &&
    typeof frontmatter.dependencies === 'object' &&
    frontmatter.dependencies !== null
  ) {
    logger.warn(
      `Legacy format detected: top-level "dependencies" field. Migrating to metadata.dependencies`
    );
    normalized.metadata.dependencies = frontmatter.dependencies as Record<string, string>;
  }

  if ('allowed-tools' in frontmatter && Array.isArray(frontmatter['allowed-tools'])) {
    logger.warn(
      `Legacy format detected: top-level "allowed-tools" field. Migrating to metadata.allowed_tools`
    );
    normalized.metadata.allowed_tools = (frontmatter['allowed-tools'] as string[]).filter(
      (s): s is string => typeof s === 'string'
    );
  }

  if (!normalized.metadata.version) {
    throw new Error('Missing metadata.version field');
  }

  return normalized;
}
