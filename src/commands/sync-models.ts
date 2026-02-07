import * as p from '@clack/prompts';
import color from 'picocolors';
import path from 'path';
import fs from 'fs';
import { ProjectDetector, ModelDetector, RepositoryManager } from '../core';
import { logger, LogLevel } from '../utils/logger';
import { regenerateInstructionFile } from '../utils/instruction-generator';

export interface SyncOptions {
  addModels?: string;
  dryRun?: boolean;
}

/** Map model IDs to their instruction template source and destination file name */
const INSTRUCTION_MAPPING: Record<string, { source: string; destFile: string }> = {
  claude: { source: 'claude-instructions.md', destFile: 'instructions.md' },
  'github-copilot': { source: 'copilot-instructions.md', destFile: 'copilot-instructions.md' },
  cursor: { source: 'cursor-instructions.md', destFile: 'instructions.md' },
  gemini: { source: 'gemini-instructions.md', destFile: 'instructions.md' },
  codex: { source: 'codex-instructions.md', destFile: 'instructions.md' },
};

export async function syncModelsCommand(options: SyncOptions) {
  try {
    p.intro(color.bgCyan(color.black(' ai-agents-skills ')));

    if (options.dryRun) {
      p.note('Preview mode - no changes will be made', 'Dry Run Mode');
    }

    // 1. Detect project
    const projectDetector = new ProjectDetector();
    const project = await projectDetector.detectProject();

    p.log.info(`Project: ${color.cyan(project.rootPath)}`);
    console.log();

    // 2. Get installed skills
    const installedSkills = projectDetector.getInstalledSkills(project.rootPath);

    if (installedSkills.length === 0) {
      p.cancel('No skills installed. Run `ai-agents-skills add` first.');
      process.exit(1);
    }

    // 3. Get models to add
    const modelDetector = new ModelDetector();
    const currentModels = modelDetector.detectInstalledModels(project.rootPath);

    let newModels: string[];

    if (options.addModels) {
      newModels = options.addModels.split(',').map(m => m.trim());
    } else {
      // Interactive selection
      const allModelsInfo = modelDetector.getAllModelsInfo(project.rootPath);
      const availableModels = allModelsInfo.filter(m => !currentModels.includes(m.id));

      if (availableModels.length === 0) {
        p.outro(color.yellow('All supported models already have skills installed'));
        return;
      }

      const selected = await p.multiselect({
        message: 'Select models to sync:',
        options: availableModels.map(m => ({
          value: m.id,
          label: m.name
        })),
        required: true
      });

      if (p.isCancel(selected)) {
        p.cancel('Sync cancelled');
        process.exit(0);
      }

      newModels = selected as string[];
    }

    // 4. Show sync details
    p.note(
      `Models: ${color.cyan(newModels.join(', '))}\n` +
      `Skills: ${color.green(installedSkills.length.toString())}\n` +
      `Directory: ${color.dim(project.rootPath)}`,
      'Sync Details'
    );

    // 5. Confirm sync
    if (!options.dryRun) {
      const shouldContinue = await p.confirm({
        message: `Sync ${installedSkills.length} skill(s) to ${newModels.length} model(s)?`,
        initialValue: true
      });

      if (p.isCancel(shouldContinue) || !shouldContinue) {
        p.cancel('Sync cancelled');
        process.exit(0);
      }
    }

    // 6. Setup model directories (create dirs + instruction files)
    const s = p.spinner();
    s.start('Setting up model directories...');

    const repoManager = new RepositoryManager();
    const repo = await repoManager.fetchRepository('joabgonzalez/ai-agents-skills');
    let instructionCount = 0;

    for (const modelId of newModels) {
      const modelDir = modelDetector.getModelDirectory(project.rootPath, modelId);
      const skillsDir = path.join(modelDir, 'skills');

      if (!fs.existsSync(skillsDir) && !options.dryRun) {
        fs.mkdirSync(skillsDir, { recursive: true });
      }

      // Generate instruction file from template
      const mapping = INSTRUCTION_MAPPING[modelId];
      if (mapping) {
        const templatePath = path.join(repo.cachePath, 'templates', mapping.source);
        const destPath = path.join(modelDir, mapping.destFile);

        if (fs.existsSync(templatePath) && !fs.existsSync(destPath) && !options.dryRun) {
          let content = fs.readFileSync(templatePath, 'utf-8');
          content = content.replace(/\{\{SKILL_COUNT\}\}/g, installedSkills.length.toString());
          fs.writeFileSync(destPath, content, 'utf-8');
          instructionCount++;
        }
      }
    }

    s.stop(`${newModels.length} model directory(s) ready`);

    // 7. Sync skills with detailed progress
    console.log();
    console.log(color.bold('Syncing skills:'));
    console.log();

    const agentsSkillsDir = projectDetector.getSkillsDir(project.rootPath);
    let syncedCount = 0;
    let skippedCount = 0;

    const prevLevel = logger.getLevel();
    logger.setLevel(LogLevel.SILENT);

    for (const skillName of installedSkills) {
      // Show syncing status with spinner
      logger.setLevel(LogLevel.INFO);
      logger.skillProgress(skillName, 'installing', undefined);
      logger.setLevel(LogLevel.SILENT);

      let skillSynced = false;

      for (const modelId of newModels) {
        const modelDir = modelDetector.getModelDirectory(project.rootPath, modelId);
        const skillsDir = path.join(modelDir, 'skills');
        const symlinkSrc = path.relative(
          skillsDir,
          path.join(agentsSkillsDir, skillName)
        );
        const symlinkDst = path.join(skillsDir, skillName);

        if (!fs.existsSync(symlinkDst)) {
          if (!options.dryRun) {
            fs.symlinkSync(symlinkSrc, symlinkDst, 'dir');
          }
          skillSynced = true;
        }
      }

      // Update with final status
      logger.setLevel(LogLevel.INFO);
      const status = skillSynced ? 'completed' : 'skipped';
      process.stdout.write('\x1b[1A\r\x1b[K');
      logger.skillProgress(skillName, status, undefined);
      logger.setLevel(LogLevel.SILENT);

      if (skillSynced) {
        syncedCount++;
      } else {
        skippedCount++;
      }
    }

    logger.setLevel(prevLevel);
    console.log();

    // 8. Regenerate instruction files with synced skills
    const s2 = p.spinner();
    s2.start('Updating instruction files...');
    let instructionsUpdated = 0;

    for (const modelId of newModels) {
      const modelDir = modelDetector.getModelDirectory(project.rootPath, modelId);
      const updated = regenerateInstructionFile(modelDir, modelId, options.dryRun);
      if (updated) instructionsUpdated++;
    }

    s2.stop(`Updated ${instructionsUpdated} instruction file(s)`);
    console.log();

    // 9. Summary
    const summaryLines = [];
    summaryLines.push(`Models: ${color.cyan(newModels.length.toString())}`);
    summaryLines.push(`Skills synced: ${color.green(syncedCount.toString())}`);
    if (skippedCount > 0) {
      summaryLines.push(`Skills skipped: ${color.yellow(skippedCount.toString())} ${color.dim('(already synced)')}`);
    }
    if (instructionCount > 0) {
      summaryLines.push(`Initial instructions: ${color.green(instructionCount.toString())} file(s) generated`);
    }
    if (instructionsUpdated > 0) {
      summaryLines.push(`Instructions updated: ${color.green(instructionsUpdated.toString())} file(s)`);
    }

    p.note(summaryLines.join('\n'), 'Summary');

    // Success message
    if (options.dryRun) {
      p.outro(color.yellow('DRY RUN - No changes were made'));
    } else {
      p.outro(color.green('Sync completed successfully!'));
    }
  } catch (error) {
    p.log.error(`Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    p.cancel('Sync failed');
    process.exit(1);
  }
}
