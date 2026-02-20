import path from 'node:path';
import { copyDir, createSymlink, ensureDir, exists, isSymlink, removeFile } from '../utils/fs';
import { logger } from '../utils/logger';
/**
 * Model information
 */
export interface Model {
  name: string;
  directory: string;
  installed: boolean;
}

/**
 * Installation type
 */
export type InstallationType = 'local' | 'external';

/**
 * Installation transaction (for rollback)
 */
interface InstallTransaction {
  skillName: string;
  targetPath: string;
  action: 'install' | 'remove';
  completed: boolean;
}

/**
 * Installer - Handle skill installation with rollback support
 * No registry needed - just install/uninstall files
 */
export class Installer {
  private baseDir: string;
  private agentsBaseDir: string;
  private transactions: InstallTransaction[];

  /**
   * @param baseDir     Root dir for skill source files (local: CWD, remote: cache path)
   * @param agentsBaseDir  Root dir for .agents/skills/ (always project root; defaults to baseDir for local mode)
   */
  constructor(baseDir: string, agentsBaseDir?: string) {
    this.baseDir = baseDir;
    this.agentsBaseDir = agentsBaseDir ?? baseDir;
    this.transactions = [];
  }

  /**
   * Install a single skill with cascading symlinks
   *
   * Architecture:
   * - skills/react (source, versionado)
   * - .agents/skills/react -> ../../skills/react (intermediate symlink)
   * - .claude/skills/react -> ../../.agents/skills/react (final symlink)
   */
  async installSkill(
    skillName: string,
    modelDir: string,
    installType: InstallationType,
    dryRun: boolean = false
  ): Promise<boolean> {
    const sourcePath = path.join(this.baseDir, 'skills', skillName);
    const agentsSkillsPath = path.join(this.agentsBaseDir, '.agents', 'skills', skillName);
    const targetPath = path.join(modelDir, 'skills', skillName);

    if (!exists(sourcePath)) {
      throw new Error(`Source skill not found: ${sourcePath}`);
    }

    // Ensure .agents/skills/ directory exists
    ensureDir(path.join(this.agentsBaseDir, '.agents', 'skills'));

    if (dryRun) {
      logger.info(`[DRY RUN] Would install ${skillName}`);
      logger.keyValue('  Source', sourcePath, 2);
      if (installType === 'local') {
        logger.keyValue('  Intermediate', agentsSkillsPath, 2);
      }
      logger.keyValue('  Target', targetPath, 2);
      logger.keyValue('  Type', installType === 'local' ? 'symlink (cascade)' : 'copy', 2);
      return true; // Would install
    }

    try {
      if (installType === 'local') {
        // Step 1: Create intermediate symlink .agents/skills/react -> ../../skills/react
        if (!exists(agentsSkillsPath)) {
          const relativeSource = path.relative(path.dirname(agentsSkillsPath), sourcePath);
          await createSymlink(relativeSource, agentsSkillsPath);
          logger.debug(`Created intermediate symlink: .agents/skills/${skillName}`);
        }

        // Step 2: Check if already installed in model directory (skip if symlink)
        if (exists(targetPath) && isSymlink(targetPath)) {
          logger.debug(`Skipping ${skillName} (already installed as symlink, always up-to-date)`);
          return false; // Skipped
        }

        // Record transaction for rollback
        this.transactions.push({
          skillName,
          targetPath,
          action: 'install',
          completed: false,
        });

        // Step 3: Remove existing if present
        if (exists(targetPath)) {
          logger.warn(`Target already exists, removing: ${targetPath}`);
          await removeFile(targetPath);
        }

        // Step 4: Create final symlink .claude/skills/react -> ../../.agents/skills/react
        const relativeTarget = path.relative(path.dirname(targetPath), agentsSkillsPath);
        await createSymlink(relativeTarget, targetPath);
        logger.success(`Symlinked: ${skillName}`);

        // Mark transaction as completed
        const transaction = this.transactions[this.transactions.length - 1];
        transaction.completed = true;
        return true; // Installed
      } else {
        // Remote mode: copy source → .agents/skills/<name>, then symlink model → .agents/skills/<name>

        // Step 1: Copy to .agents/skills/ if not already there
        if (!exists(agentsSkillsPath)) {
          await copyDir(sourcePath, agentsSkillsPath);
          logger.debug(`Copied to .agents/skills/${skillName}`);
        }

        // Step 2: Skip if already symlinked in model directory
        if (exists(targetPath) && isSymlink(targetPath)) {
          logger.debug(`Skipping ${skillName} (already linked in model directory)`);
          return false;
        }

        // Record transaction for rollback
        this.transactions.push({
          skillName,
          targetPath,
          action: 'install',
          completed: false,
        });

        // Step 3: Remove existing non-symlink if present
        if (exists(targetPath)) {
          logger.warn(`Target already exists, removing: ${targetPath}`);
          await removeFile(targetPath);
        }

        // Step 4: Create symlink model/skills/<name> → .agents/skills/<name>
        const relativeTarget = path.relative(path.dirname(targetPath), agentsSkillsPath);
        await createSymlink(relativeTarget, targetPath);
        logger.success(`Linked: ${skillName}`);

        const transaction = this.transactions[this.transactions.length - 1];
        transaction.completed = true;
        return true;
      }
    } catch (error) {
      logger.error(
        `Failed to install ${skillName}: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Uninstall a single skill
   */
  async uninstallSkill(
    skillName: string,
    modelDir: string,
    dryRun: boolean = false
  ): Promise<void> {
    const targetPath = path.join(modelDir, 'skills', skillName);

    if (!exists(targetPath)) {
      logger.warn(`Skill not installed: ${skillName}`);
      return;
    }

    if (dryRun) {
      logger.info(`[DRY RUN] Would uninstall ${skillName}`);
      logger.keyValue('  Path', targetPath, 2);
      return;
    }

    // Record transaction for rollback
    this.transactions.push({
      skillName,
      targetPath,
      action: 'remove',
      completed: false,
    });

    try {
      await removeFile(targetPath);
      logger.success(`Uninstalled: ${skillName}`);

      // Mark transaction as completed
      const transaction = this.transactions[this.transactions.length - 1];
      transaction.completed = true;
    } catch (error) {
      logger.error(
        `Failed to uninstall ${skillName}: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Install multiple skills with rollback on error
   * Returns count of skills actually installed (excluding skipped)
   */
  async installWithRollback(
    skills: string[],
    modelDir: string,
    installType: InstallationType,
    dryRun: boolean = false
  ): Promise<{ installed: number; skipped: number }> {
    this.transactions = []; // Clear previous transactions
    let installedCount = 0;
    let skippedCount = 0;

    try {
      for (let i = 0; i < skills.length; i++) {
        const skill = skills[i];
        logger.progress(i + 1, skills.length, `Installing ${skill}...`);

        const wasInstalled = await this.installSkill(skill, modelDir, installType, dryRun);
        if (wasInstalled) {
          installedCount++;
        } else {
          skippedCount++;
        }
      }

      if (skippedCount > 0) {
        logger.info(`Installed: ${installedCount}, Skipped: ${skippedCount} (already up-to-date)`);
      } else {
        logger.success(`Successfully installed ${installedCount} skills`);
      }

      return { installed: installedCount, skipped: skippedCount };
    } catch (error) {
      logger.error('Installation failed, rolling back...');
      await this.rollback(dryRun);
      throw error;
    }
  }

  /**
   * Rollback failed installation
   */
  async rollback(dryRun: boolean = false): Promise<void> {
    if (dryRun) {
      logger.info('[DRY RUN] Would rollback changes');
      return;
    }

    logger.warn(`Rolling back ${this.transactions.length} transactions...`);

    // Rollback in reverse order
    for (let i = this.transactions.length - 1; i >= 0; i--) {
      const transaction = this.transactions[i];

      if (!transaction.completed) {
        continue;
      }

      try {
        if (transaction.action === 'install') {
          // Remove installed skill
          if (exists(transaction.targetPath)) {
            await removeFile(transaction.targetPath);
            logger.debug(`Rolled back: ${transaction.skillName}`);
          }
        } else if (transaction.action === 'remove') {
          // Restore removed skill (not possible without backup)
          logger.warn(`Cannot restore removed skill: ${transaction.skillName}`);
        }
      } catch (error) {
        logger.error(
          `Rollback failed for ${transaction.skillName}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    logger.success('Rollback completed');
  }

  /**
   * Setup model directory
   */
  async setupModel(model: Model, basePath: string, dryRun: boolean = false): Promise<void> {
    const modelDir = path.join(basePath, model.directory);

    if (dryRun) {
      logger.info(`[DRY RUN] Would setup model directory: ${modelDir}`);
      logger.keyValue('  Model', model.name, 2);
      return;
    }

    // Create model directory structure
    ensureDir(modelDir);
    ensureDir(path.join(modelDir, 'skills'));

    // Note: Instruction templates are no longer used
    // await this.copyModelInstructions(model.name, modelDir, basePath);

    logger.success(`Setup model directory: ${model.directory}`);
  }

  /**
   * Clear transactions
   */
  clearTransactions(): void {
    this.transactions = [];
  }

  /**
   * Get transactions (for debugging)
   */
  getTransactions(): InstallTransaction[] {
    return this.transactions;
  }
}
