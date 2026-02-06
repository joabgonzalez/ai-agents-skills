import * as path from 'path';
import inquirer from 'inquirer';
import { Installer } from '../core/installer';
import { Scanner } from '../utils/scanner';
import { logger } from '../utils/logger';
import { MODEL_DIRECTORIES } from '../shared/constants';

interface UninstallOptions {
  skills?: string;
  models?: string;
  all: boolean;
  confirm: boolean;
}

/**
 * Uninstall command - Remove skills by scanning directories
 * No registry needed - just scan and delete (Vercel Skills style)
 */
export async function uninstallCommand(options: UninstallOptions): Promise<void> {
  try {
    logger.section('Uninstalling Skills');

    const baseDir = process.cwd();

    // Determine which models to target
    let modelDirs: string[];
    if (options.models) {
      const modelNames = options.models.split(',').map(m => m.trim());
      modelDirs = modelNames.map(name => {
        const normalized = name.toLowerCase();
        return MODEL_DIRECTORIES[normalized] || `.${normalized}`;
      });
    } else {
      // Target all known model directories
      modelDirs = Object.values(MODEL_DIRECTORIES);
    }

    logger.keyValue('Base path', baseDir);
    logger.keyValue('Models', modelDirs.join(', '));
    logger.newline();

    // Determine which skills to uninstall
    let skillsToRemove: string[];
    if (options.all) {
      // Remove all installed skills
      skillsToRemove = Scanner.getInstalledSkillNames(baseDir, modelDirs);
      if (skillsToRemove.length === 0) {
        logger.warn('No skills installed');
        return;
      }
    } else if (options.skills) {
      // Remove specific skills
      skillsToRemove = options.skills.split(',').map(s => s.trim());
    } else {
      logger.error('Specify --skills or --all');
      process.exit(1);
    }

    logger.info(`Skills to remove: ${skillsToRemove.join(', ')}`);
    logger.newline();

    // Confirm uninstallation
    if (!options.confirm) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: `Remove ${skillsToRemove.length} skill(s) from ${modelDirs.length} model(s)?`,
          default: false,
        },
      ]);

      if (!answers.proceed) {
        logger.warn('Uninstallation cancelled');
        return;
      }
    }

    // Uninstall skills
    logger.subsection('Removing Skills');
    const installer = new Installer(baseDir);
    let removed = 0;
    let failed = 0;

    for (const modelDir of modelDirs) {
      const fullModelDir = path.join(baseDir, modelDir);

      for (let i = 0; i < skillsToRemove.length; i++) {
        const skillName = skillsToRemove[i];
        logger.progress(i + 1, skillsToRemove.length, `Removing ${skillName} from ${modelDir}...`);

        try {
          await installer.uninstallSkill(skillName, fullModelDir, false);
          removed++;
        } catch (error) {
          logger.error(`Failed to remove ${skillName}: ${error instanceof Error ? error.message : String(error)}`);
          failed++;
        }
      }
    }

    logger.newline();
    logger.section('Uninstallation Summary');
    logger.keyValue('Removed', removed.toString());
    logger.keyValue('Failed', failed.toString());

    if (failed === 0) {
      logger.success('Uninstallation completed successfully!');
    } else {
      logger.warn(`Uninstallation completed with ${failed} failure(s)`);
    }
  } catch (error) {
    logger.error(`Uninstallation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
