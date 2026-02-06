import path from 'path';
import fs from 'fs';
import { extractFrontmatter, validateFrontmatter as validateFrontmatterUtil } from '../utils/yaml';
import { exists, isFile } from '../utils/fs';
import { logger } from '../utils/logger';

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
 * SkillParser - Parse and validate SKILL.md files
 */
export class SkillParser {
  /**
   * Parse skill file and extract metadata
   */
  static parseSkillFile(filePath: string): SkillMetadata {
    if (!exists(filePath) || !isFile(filePath)) {
      throw new Error(`Skill file not found: ${filePath}`);
    }

    const frontmatter = extractFrontmatter(filePath);

    if (!frontmatter) {
      throw new Error(`No frontmatter found in ${filePath}`);
    }

    // Handle legacy format (migrate on-the-fly)
    const metadata = this.normalizeFrontmatter(frontmatter);

    return metadata;
  }

  /**
   * Extract version from skill file
   */
  static extractVersion(filePath: string): string {
    const metadata = this.parseSkillFile(filePath);
    return metadata.metadata.version;
  }

  /**
   * Extract skill dependencies from skill file
   */
  static extractDependencies(filePath: string): string[] {
    const metadata = this.parseSkillFile(filePath);
    return metadata.metadata.skills || [];
  }

  /**
   * Extract package dependencies from skill file
   */
  static extractPackageDependencies(filePath: string): Record<string, string> {
    const metadata = this.parseSkillFile(filePath);
    return metadata.metadata.dependencies || {};
  }

  /**
   * Validate skill frontmatter
   */
  static validateFrontmatter(metadata: SkillMetadata): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Use util validation
    const utilValidation = validateFrontmatterUtil(metadata as any);
    errors.push(...utilValidation.errors);

    // Additional validations
    if (metadata.description && metadata.description.length > 150) {
      warnings.push(`Description is ${metadata.description.length} characters (recommended: <150)`);
    }

    if (!metadata.license) {
      warnings.push('Missing "license" field (recommended)');
    }

    // Validate version format (major.minor or major.minor.patch)
    if (metadata.metadata.version) {
      if (!/^[0-9]+\.[0-9]+(\.[0-9]+)?$/.test(metadata.metadata.version)) {
        errors.push(`Invalid version format: "${metadata.metadata.version}". Use "1.0" or "1.0.0"`);
      }
    }

    // Validate skill dependencies
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
  static validateSkillFile(filePath: string): ValidationResult {
    try {
      const metadata = this.parseSkillFile(filePath);
      return this.validateFrontmatter(metadata);
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
  static getSkillNameFromPath(filePath: string): string {
    const dir = path.dirname(filePath);
    return path.basename(dir);
  }

  /**
   * Build skill path from base directory and skill name
   * (baseDir, skill-name) -> /baseDir/skills/skill-name/SKILL.md
   */
  static buildSkillPath(baseDir: string, skillName: string): string {
    return path.join(baseDir, 'skills', skillName, 'SKILL.md');
  }

  /**
   * Check if skill exists
   */
  static skillExists(baseDir: string, skillName: string): boolean {
    const skillPath = this.buildSkillPath(baseDir, skillName);
    return exists(skillPath) && isFile(skillPath);
  }

  /**
   * Normalize frontmatter (handle legacy format)
   * Migrates old format to new format on-the-fly
   */
  private static normalizeFrontmatter(frontmatter: Record<string, any>): SkillMetadata {
    const normalized: any = {
      name: frontmatter.name,
      description: frontmatter.description,
      license: frontmatter.license,
      metadata: frontmatter.metadata || {},
    };

    // Handle legacy format (top-level version, skills, dependencies)
    if ('version' in frontmatter && typeof frontmatter.version === 'string') {
      logger.warn(`Legacy format detected: top-level "version" field. Migrating to metadata.version`);
      normalized.metadata.version = frontmatter.version;
    }

    if ('skills' in frontmatter && Array.isArray(frontmatter.skills)) {
      logger.warn(`Legacy format detected: top-level "skills" field. Migrating to metadata.skills`);
      normalized.metadata.skills = frontmatter.skills;
    }

    if ('dependencies' in frontmatter && typeof frontmatter.dependencies === 'object') {
      logger.warn(`Legacy format detected: top-level "dependencies" field. Migrating to metadata.dependencies`);
      normalized.metadata.dependencies = frontmatter.dependencies;
    }

    if ('allowed-tools' in frontmatter && Array.isArray(frontmatter['allowed-tools'])) {
      logger.warn(`Legacy format detected: top-level "allowed-tools" field. Migrating to metadata.allowed_tools`);
      normalized.metadata.allowed_tools = frontmatter['allowed-tools'];
    }

    // Ensure required fields
    if (!normalized.metadata.version) {
      throw new Error('Missing metadata.version field');
    }

    return normalized as SkillMetadata;
  }

  /**
   * List all skills in directory
   */
  static listSkills(baseDir: string): string[] {
    const skillsDir = path.join(baseDir, 'skills');

    if (!exists(skillsDir)) {
      return [];
    }

    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

    return entries
      .filter((entry: any) => entry.isDirectory())
      .map((entry: any) => entry.name)
      .filter((name: string) => this.skillExists(baseDir, name));
  }

  /**
   * Parse all skills in directory
   */
  static parseAllSkills(baseDir: string): Map<string, SkillMetadata> {
    const skills = new Map<string, SkillMetadata>();
    const skillNames = this.listSkills(baseDir);

    for (const skillName of skillNames) {
      try {
        const skillPath = this.buildSkillPath(baseDir, skillName);
        const metadata = this.parseSkillFile(skillPath);
        skills.set(skillName, metadata);
      } catch (error) {
        logger.error(`Failed to parse skill "${skillName}": ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return skills;
  }
}
