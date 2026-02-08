import * as p from '@clack/prompts';
import color from 'picocolors';
import path from 'path';
import fs from 'fs';
import { ProjectDetector, ModelDetector, RepositoryManager } from '../core';
import { logger, LogLevel } from '../utils/logger';
import { regenerateInstructionFile } from '../utils/instruction-generator';
import { extractFrontmatter } from '../utils/yaml';

export interface SyncOptions {
  addModels?: string;
  updateSkills?: boolean;
  dryRun?: boolean;
}

interface SkillVersion {
  name: string;
  currentVersion: string;
  remoteVersion: string;
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

    // 3. Get models
    const modelDetector = new ModelDetector();
    const currentModels = modelDetector.detectInstalledModels(project.rootPath);

    // Show currently installed models
    if (currentModels.length > 0) {
      const allModelsInfo = modelDetector.getAllModelsInfo(project.rootPath);
      const installedModelNames = currentModels.map(id => {
        const info = allModelsInfo.find(m => m.id === id);
        return info ? info.name : id;
      });

      p.note(
        `Currently installed: ${color.cyan(installedModelNames.join(', '))}`,
        'Installed Models'
      );
      console.log();
    }

    // 4. Check for available updates (before showing selector)
    let updates: SkillVersion[] = [];
    let repo: any = null;

    if (!options.addModels) {
      // Only check if user didn't specify --add-models flag
      const s = p.spinner();
      s.start('Checking for updates...');

      const repoManager = new RepositoryManager();
      repo = await repoManager.fetchRepository('joabgonzalez/ai-agents-skills');

      const agentsSkillsDir = projectDetector.getSkillsDir(project.rootPath);

      // Compare versions
      for (const skillName of installedSkills) {
        const installedSkillPath = path.join(agentsSkillsDir, skillName, 'SKILL.md');
        const remoteSkillPath = path.join(repo.cachePath, 'skills', skillName, 'SKILL.md');

        if (!fs.existsSync(installedSkillPath) || !fs.existsSync(remoteSkillPath)) {
          continue;
        }

        const installedFm = extractFrontmatter(installedSkillPath);
        const remoteFm = extractFrontmatter(remoteSkillPath);

        if (!installedFm || !remoteFm) continue;

        const currentVersion = installedFm.metadata?.version || '0.0';
        const remoteVersion = remoteFm.metadata?.version || '0.0';

        if (currentVersion !== remoteVersion) {
          updates.push({
            name: skillName,
            currentVersion,
            remoteVersion
          });
        }
      }

      s.stop(`Found ${updates.length} update(s) available`);
      console.log();
    }

    // 5. Determine actions: add models and/or update skills
    let actions: Array<'addModels' | 'updateSkills'> = [];

    if (options.addModels) {
      actions.push('addModels');
    }
    if (options.updateSkills) {
      actions.push('updateSkills');
    }

    if (actions.length === 0) {
      // Interactive selection
      const allModelsInfo = modelDetector.getAllModelsInfo(project.rootPath);
      const availableModels = allModelsInfo.filter(m => !currentModels.includes(m.id));

      const choices: Array<{ value: string; label: string; hint?: string }> = [];

      if (availableModels.length > 0) {
        choices.push({
          value: 'addModels',
          label: 'Add models',
          hint: `${availableModels.length} available`
        });
      }

      // Only show "Update skills" if updates are available
      if (updates.length > 0) {
        choices.push({
          value: 'updateSkills',
          label: 'Update skills',
          hint: `${updates.length} available`
        });
      }

      if (choices.length === 0) {
        p.outro(color.green('All models installed and all skills up to date!'));
        return;
      }

      // Use multiselect to allow selecting both options
      const selected = await p.multiselect({
        message: 'What would you like to do? (Use space to select, enter to confirm)',
        options: choices,
        required: true
      });

      if (p.isCancel(selected)) {
        p.cancel('Sync cancelled');
        process.exit(0);
      }

      actions = selected as Array<'addModels' | 'updateSkills'>;
    }

    // 6. Execute actions in order: update skills first, then add models
    // This ensures new models get the updated skills
    if (actions.includes('updateSkills')) {
      await syncUpdateSkills(options, project, projectDetector, modelDetector, updates, repo);

      // Add spacing between operations if both are selected
      if (actions.includes('addModels')) {
        console.log();
        console.log(color.dim('─'.repeat(50)));
        console.log();
      }
    }

    if (actions.includes('addModels')) {
      await syncAddModels(options, project, projectDetector, modelDetector, installedSkills);
    }

  } catch (error) {
    p.log.error(`Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    p.cancel('Sync failed');
    process.exit(1);
  }
}

async function syncAddModels(
  options: SyncOptions,
  project: any,
  projectDetector: ProjectDetector,
  modelDetector: ModelDetector,
  installedSkills: string[]
) {
  const currentModels = modelDetector.detectInstalledModels(project.rootPath);
  let newModels: string[];

  if (options.addModels) {
    newModels = options.addModels.split(',').map(m => m.trim());
  } else {
    const allModelsInfo = modelDetector.getAllModelsInfo(project.rootPath);
    const availableModels = allModelsInfo.filter(m => !currentModels.includes(m.id));

    if (availableModels.length === 0) {
      p.outro(color.yellow('All supported models already have skills installed'));
      return;
    }

    const selected = await p.multiselect({
      message: 'Select models to add:',
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

  // Show sync details
  p.note(
    `Models to add: ${color.cyan(newModels.join(', '))}\n` +
    `Skills to sync: ${color.green(installedSkills.length.toString())}\n` +
    `Directory: ${color.dim(project.rootPath)}`,
    'Sync Details'
  );

  // Confirm sync
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

  // Setup model directories
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

  // Sync skills
  console.log();
  console.log(color.bold('Syncing skills:'));
  console.log();

  const agentsSkillsDir = projectDetector.getSkillsDir(project.rootPath);
  let syncedCount = 0;
  let skippedCount = 0;

  const prevLevel = logger.getLevel();
  logger.setLevel(LogLevel.SILENT);

  for (const skillName of installedSkills) {
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

  // Regenerate instruction files
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

  // Summary
  const summaryLines = [];
  summaryLines.push(`Models added: ${color.cyan(newModels.length.toString())}`);
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

  if (options.dryRun) {
    p.outro(color.yellow('DRY RUN - No changes were made'));
  } else {
    p.outro(color.green('Sync completed successfully!'));
  }
}

async function syncUpdateSkills(
  options: SyncOptions,
  project: any,
  projectDetector: ProjectDetector,
  modelDetector: ModelDetector,
  updates: SkillVersion[],
  repo: any
) {
  const agentsSkillsDir = projectDetector.getSkillsDir(project.rootPath);

  // Updates were already checked in main function
  if (updates.length === 0) {
    p.outro(color.green('All skills are up to date!'));
    return;
  }

  // Show updates preview
  console.log(color.bold('Available Updates:'));
  console.log();

  for (const update of updates) {
    console.log(`  ${color.cyan('●')} ${color.bold(update.name)}`);
    console.log(`     ${color.dim(update.currentVersion)} → ${color.green(update.remoteVersion)}`);
  }

  console.log();

  // Select skills to update
  const selected = await p.multiselect({
    message: 'Select skills to update:',
    options: updates.map(u => ({
      value: u.name,
      label: u.name,
      hint: `${u.currentVersion} → ${u.remoteVersion}`
    })),
    initialValues: updates.map(u => u.name),
    required: false
  });

  if (p.isCancel(selected) || (selected as string[]).length === 0) {
    p.cancel('Update cancelled');
    return;
  }

  const skillsToUpdate = selected as string[];

  // Confirm update
  if (!options.dryRun) {
    const shouldContinue = await p.confirm({
      message: `Update ${skillsToUpdate.length} skill(s)?`,
      initialValue: true
    });

    if (p.isCancel(shouldContinue) || !shouldContinue) {
      p.cancel('Update cancelled');
      return;
    }
  }

  // Update skills
  console.log();
  console.log(color.bold('Updating skills:'));
  console.log();

  let updatedCount = 0;

  const prevLevel = logger.getLevel();
  logger.setLevel(LogLevel.SILENT);

  for (const skillName of skillsToUpdate) {
    logger.setLevel(LogLevel.INFO);
    logger.skillProgress(skillName, 'installing', undefined);
    logger.setLevel(LogLevel.SILENT);

    // Copy skill from remote to .agents/skills/
    const remoteSkillPath = path.join(repo.cachePath, 'skills', skillName);
    const installedSkillPath = path.join(agentsSkillsDir, skillName);

    if (!options.dryRun) {
      // Remove old version
      if (fs.existsSync(installedSkillPath)) {
        fs.rmSync(installedSkillPath, { recursive: true, force: true });
      }

      // Copy new version
      fs.cpSync(remoteSkillPath, installedSkillPath, { recursive: true });
    }

    logger.setLevel(LogLevel.INFO);
    process.stdout.write('\x1b[1A\r\x1b[K');
    logger.skillProgress(skillName, 'completed', undefined);
    logger.setLevel(LogLevel.SILENT);

    updatedCount++;
  }

  logger.setLevel(prevLevel);
  console.log();

  // Regenerate instruction files for all models
  const currentModels = modelDetector.detectInstalledModels(project.rootPath);
  const s2 = p.spinner();
  s2.start('Updating instruction files...');
  let instructionsUpdated = 0;

  for (const modelId of currentModels) {
    const modelDir = modelDetector.getModelDirectory(project.rootPath, modelId);
    const updated = regenerateInstructionFile(modelDir, modelId, options.dryRun);
    if (updated) instructionsUpdated++;
  }

  s2.stop(`Updated ${instructionsUpdated} instruction file(s)`);
  console.log();

  // Summary
  const summaryLines = [];
  summaryLines.push(`Skills updated: ${color.green(updatedCount.toString())}`);
  summaryLines.push(`Affected models: ${color.cyan(currentModels.length.toString())}`);
  if (instructionsUpdated > 0) {
    summaryLines.push(`Instructions: ${color.green(instructionsUpdated.toString())} file(s) updated`);
  }

  p.note(summaryLines.join('\n'), 'Summary');

  if (options.dryRun) {
    p.outro(color.yellow('DRY RUN - No changes were made'));
  } else {
    p.outro(color.green('Update completed successfully!'));
  }
}
