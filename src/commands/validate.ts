import * as path from 'path';
import { SkillParser } from '../core/skill-parser';
import { DependencyResolver } from '../core/dependency-resolver';
import { LocalSkillSource } from '../core/skill-source';
import { Scanner } from '../utils/scanner';
import { logger } from '../utils/logger';
import { MODEL_DIRECTORIES } from '../shared/constants';
import { exists, isDirectory } from '../utils/fs';

interface ValidateOptions {
  skill?: string;
  all: boolean;
  installed?: boolean;
}

export async function validateCommand(options: ValidateOptions): Promise<void> {
  try {
    logger.section('Validation');

    const baseDir = process.cwd();

    if (options.skill) {
      // Validate specific skill
      await validateSkill(options.skill, baseDir);
    } else if (options.all) {
      // Validate all skills
      await validateAllSkills(baseDir);
    } else if (options.installed) {
      // Validate installed skills
      await validateInstalledSkills(baseDir);
    } else {
      logger.error('Specify --skill, --all, or --installed');
      process.exit(1);
    }
  } catch (error) {
    logger.error(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

/**
 * Validate a single skill
 */
async function validateSkill(skillName: string, baseDir: string): Promise<void> {
  logger.subsection(`Validating skill: ${skillName}`);

  if (!SkillParser.skillExists(baseDir, skillName)) {
    logger.error(`Skill not found: ${skillName}`);
    process.exit(1);
  }

  const skillPath = SkillParser.buildSkillPath(baseDir, skillName);
  const validation = SkillParser.validateSkillFile(skillPath);

  if (validation.errors.length > 0) {
    logger.error('Errors:');
    validation.errors.forEach(error => logger.listItem(error, 2));
  }

  if (validation.warnings.length > 0) {
    logger.warn('Warnings:');
    validation.warnings.forEach(warning => logger.listItem(warning, 2));
  }

  if (validation.valid) {
    logger.success(`Skill "${skillName}" is valid`);

    // Show metadata
    const metadata = SkillParser.parseSkillFile(skillPath);
    logger.newline();
    logger.keyValue('Name', metadata.name);
    logger.keyValue('Version', metadata.metadata.version);
    logger.keyValue('License', metadata.license || 'N/A');

    if (metadata.metadata.skills && metadata.metadata.skills.length > 0) {
      logger.keyValue('Dependencies', metadata.metadata.skills.join(', '));
    }
  } else {
    logger.error(`Skill "${skillName}" has validation errors`);
    process.exit(1);
  }
}

/**
 * Validate all skills
 */
async function validateAllSkills(baseDir: string): Promise<void> {
  logger.subsection('Validating all skills');

  const skillNames = SkillParser.listSkills(baseDir);
  logger.info(`Found ${skillNames.length} skills`);
  logger.newline();

  const results = {
    valid: 0,
    invalid: 0,
    warnings: 0,
  };

  for (const skillName of skillNames) {
    const skillPath = SkillParser.buildSkillPath(baseDir, skillName);
    const validation = SkillParser.validateSkillFile(skillPath);

    if (validation.valid) {
      results.valid++;
      logger.success(`✓ ${skillName}`);
    } else {
      results.invalid++;
      logger.error(`✗ ${skillName}`);

      validation.errors.forEach(error => {
        logger.listItem(error, 2);
      });
    }

    if (validation.warnings.length > 0) {
      results.warnings += validation.warnings.length;
      validation.warnings.forEach(warning => {
        logger.warn(`  ${warning}`);
      });
    }
  }

  // Check for circular dependencies
  logger.newline();
  logger.subsection('Checking Dependencies');

  const skillSource = new LocalSkillSource(baseDir);
  const resolver = new DependencyResolver(skillSource);
  const allSkills = skillNames;
  const graph = resolver.buildGraph(allSkills);

  const graphValidation = resolver.validateGraph(graph);

  if (graphValidation.cycles) {
    logger.error('Circular dependencies detected:');
    graphValidation.cycles.forEach(cycle => {
      logger.listItem(cycle.formatted, 2);
    });
    results.invalid++;
  } else {
    logger.success('No circular dependencies detected');
  }

  if (graphValidation.missing.length > 0) {
    logger.warn('Missing dependencies:');
    graphValidation.missing.forEach(dep => {
      logger.listItem(dep, 2);
    });
    results.warnings++;
  }

  // Summary
  logger.newline();
  logger.section('Validation Summary');
  logger.keyValue('Total skills', skillNames.length.toString());
  logger.keyValue('Valid', results.valid.toString());
  logger.keyValue('Invalid', results.invalid.toString());
  logger.keyValue('Warnings', results.warnings.toString());

  if (results.invalid > 0) {
    logger.error('Validation failed');
    process.exit(1);
  } else {
    logger.success('All skills are valid!');
  }
}

/**
 * Validate installed skills
 */
async function validateInstalledSkills(baseDir: string): Promise<void> {
  logger.subsection('Validating Installed Skills');

  const modelDirs = Object.values(MODEL_DIRECTORIES);
  const installedSkills = Scanner.scanAllModels(baseDir, modelDirs);

  if (installedSkills.size === 0) {
    logger.warn('No skills installed');
    return;
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [modelDir, skills] of installedSkills.entries()) {
    logger.info(`Model: ${modelDir}`);

    // Check model directory exists
    const fullModelDir = path.join(baseDir, modelDir);
    if (!exists(fullModelDir) || !isDirectory(fullModelDir)) {
      errors.push(`Model directory not found: ${modelDir}`);
      continue;
    }

    // Check each skill
    for (const skill of skills) {
      if (!exists(skill.path)) {
        errors.push(`Skill path not found: ${skill.name} at ${skill.path}`);
        continue;
      }

      // Check if source still exists
      if (!SkillParser.skillExists(baseDir, skill.name)) {
        warnings.push(`Source not found for installed skill: ${skill.name}`);
        continue;
      }

      // For symlinks, no version check needed (always up to date)
      if (skill.isSymlink) {
        logger.success(`  ${skill.name}: valid (symlinked, always up to date)`);
      } else {
        // For copies, check version mismatch
        try {
          const sourcePath = SkillParser.buildSkillPath(baseDir, skill.name);
          const sourceVersion = SkillParser.extractVersion(sourcePath);

          if (sourceVersion !== skill.version) {
            warnings.push(`Version mismatch for ${skill.name}: installed ${skill.version || 'unknown'}, current ${sourceVersion}`);
          } else {
            logger.success(`  ${skill.name}: valid (${skill.version})`);
          }
        } catch (error) {
          errors.push(`Failed to validate ${skill.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
  }

  logger.newline();

  if (errors.length > 0) {
    logger.error('Errors:');
    errors.forEach(error => logger.listItem(error, 2));
  }

  if (warnings.length > 0) {
    logger.warn('Warnings:');
    warnings.forEach(warning => logger.listItem(warning, 2));
  }

  logger.newline();
  logger.section('Validation Summary');
  logger.keyValue('Errors', errors.length.toString());
  logger.keyValue('Warnings', warnings.length.toString());

  if (errors.length === 0) {
    logger.success('Installed skills are valid!');
  } else {
    logger.error('Validation failed');
    process.exit(1);
  }
}
