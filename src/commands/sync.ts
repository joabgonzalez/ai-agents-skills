import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import color from 'picocolors';
import { ModelDetector, ProjectDetector, RepositoryManager } from '../core';
import { extractVersion } from '../core/skill-parser';
import { LogLevel, logger } from '../utils/logger';

const DEFAULT_REPO = 'joabgonzalez/ai-agents-skills';

export interface SyncOptions {
  update?: boolean;
  skill?: string[];
  model?: string[];
  dryRun?: boolean;
}

interface SkillVersion {
  name: string;
  currentVersion: string;
  remoteVersion: string;
}

export async function syncCommand(options: SyncOptions) {
  try {
    p.intro(color.bgCyan(color.black(' ai-agents-skills ')));

    if (options.dryRun) {
      p.note('Preview mode - no changes will be made', 'Dry Run Mode');
    }

    const projectDetector = new ProjectDetector();
    const modelDetector = new ModelDetector();
    const project = await projectDetector.detectProject();

    p.log.info(`Project: ${color.cyan(project.rootPath)}`);

    const installedSkills = projectDetector.getInstalledSkills(project.rootPath);
    if (installedSkills.length === 0) {
      p.cancel('No skills installed. Run `add` first.');
      process.exit(1);
    }

    const currentModels = modelDetector.detectInstalledModels(project.rootPath);
    if (currentModels.length > 0) {
      const allModelsInfo = modelDetector.getAllModelsInfo(project.rootPath);
      const names = currentModels
        .map((id) => allModelsInfo.find((m) => m.id === id)?.name ?? id)
        .join(', ');
      p.note(`Currently installed: ${color.cyan(names)}`, 'Models');
    }

    // Flags direct execution
    if (options.update) {
      const repo = await fetchRepo();
      await updateAllSkills(
        installedSkills,
        project.rootPath,
        projectDetector,
        new ModelDetector(),
        repo,
        options.dryRun ?? false
      );
      return;
    }

    if (options.skill && options.skill.length > 0) {
      const notInstalled = options.skill.filter((s) => !installedSkills.includes(s));
      const validSkills = options.skill.filter((s) => installedSkills.includes(s));
      for (const s of notInstalled) {
        p.log.warn(`'${s}': not installed — use ${color.cyan(`add --skill ${s}`)} first`);
      }
      if (validSkills.length === 0) {
        p.cancel('None of the specified skills are installed');
        process.exit(1);
      }
      const repo = await fetchRepo();
      await updateSkillsDirect(
        validSkills,
        project.rootPath,
        projectDetector,
        repo,
        options.dryRun ?? false
      );
      return;
    }

    if (options.model && options.model.length > 0) {
      const allModels = modelDetector.getAllModelsInfo(project.rootPath);
      const knownIds = new Set(allModels.map((m) => m.id));
      const unknown = options.model.filter((m) => !knownIds.has(m));
      for (const m of unknown) {
        p.log.warn(`'${m}': unknown model — supported: ${Array.from(knownIds).join(', ')}`);
      }
      const validModels = options.model.filter((m) => knownIds.has(m));
      if (validModels.length === 0) {
        p.cancel('No valid models specified');
        process.exit(1);
      }
      // Early check: skip models already configured, only proceed with new ones
      const alreadyConfigured = validModels.filter((m) => currentModels.includes(m));
      const newModels = validModels.filter((m) => !currentModels.includes(m));
      alreadyConfigured.forEach((m) => {
        const name = allModels.find((mod) => mod.id === m)?.name ?? m;
        p.log.warn(`'${m}' (${name}): already configured — skipping`);
      });
      if (newModels.length === 0) {
        p.cancel('All specified models are already configured');
        process.exit(0);
      }
      await addModelsDirect(
        newModels,
        project.rootPath,
        projectDetector,
        modelDetector,
        installedSkills,
        options.dryRun ?? false
      );
      return;
    }

    // Interactive: check for updates first
    const s = p.spinner();
    s.start('Checking for updates...');
    const repo = await fetchRepo();
    const updates = await findUpdates(installedSkills, project.rootPath, projectDetector, repo);
    s.stop(`Found ${updates.length} update(s) available`);

    // Build action choices
    const allModelsInfo = modelDetector.getAllModelsInfo(project.rootPath);
    const availableModels = allModelsInfo.filter((m) => !currentModels.includes(m.id));

    const choices: Array<{ value: string; label: string; hint?: string }> = [];
    if (availableModels.length > 0) {
      choices.push({
        value: 'addModels',
        label: 'Add models',
        hint: `${availableModels.length} available`,
      });
    }
    if (updates.length > 0) {
      choices.push({
        value: 'updateSkills',
        label: 'Update skills',
        hint: `${updates.length} available`,
      });
    }

    if (choices.length === 0) {
      p.outro(color.green('✓ All models installed and all skills up to date!'));
      return;
    }

    let actions: string[];
    if (choices.length === 1) {
      p.log.info(
        `Auto-selecting: ${color.cyan(choices[0].label)} ${color.dim(`(${choices[0].hint})`)}`
      );
      actions = [choices[0].value];
    } else {
      const selected = await p.multiselect({
        message: 'What would you like to do?',
        options: choices,
        required: true,
      });

      if (p.isCancel(selected)) {
        p.cancel('Sync cancelled');
        process.exit(0);
      }

      actions = selected as string[];
    }

    // Execute: update skills first, then add models (so new models get updated skills)
    if (actions.includes('updateSkills')) {
      await syncUpdateSkills(
        updates,
        project.rootPath,
        projectDetector,
        modelDetector,
        repo,
        options.dryRun ?? false
      );
      if (actions.includes('addModels')) {
        p.log.message(color.dim('─'.repeat(50)));
      }
    }

    if (actions.includes('addModels')) {
      await syncAddModels(
        null,
        project.rootPath,
        projectDetector,
        modelDetector,
        installedSkills,
        options.dryRun ?? false
      );
    }
  } catch (error) {
    p.log.error(`Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    p.cancel('Sync failed');
    process.exit(1);
  }
}

async function fetchRepo() {
  const repoManager = new RepositoryManager();
  return repoManager.fetchRepository(DEFAULT_REPO);
}

async function findUpdates(
  installedSkills: string[],
  rootPath: string,
  projectDetector: ProjectDetector,
  repo: { cachePath: string }
): Promise<SkillVersion[]> {
  const agentsSkillsDir = projectDetector.getSkillsDir(rootPath);
  const updates: SkillVersion[] = [];

  for (const skillName of installedSkills) {
    const installedSkillPath = path.join(agentsSkillsDir, skillName, 'SKILL.md');
    const remoteSkillPath = path.join(repo.cachePath, 'skills', skillName, 'SKILL.md');

    if (!fs.existsSync(installedSkillPath) || !fs.existsSync(remoteSkillPath)) continue;

    try {
      const currentVersion = extractVersion(installedSkillPath);
      const remoteVersion = extractVersion(remoteSkillPath);
      if (currentVersion !== remoteVersion) {
        updates.push({ name: skillName, currentVersion, remoteVersion });
      }
    } catch {
      // Skip skills that can't be parsed
    }
  }

  return updates;
}

async function updateAllSkills(
  installedSkills: string[],
  rootPath: string,
  projectDetector: ProjectDetector,
  modelDetector: ModelDetector,
  repo: { cachePath: string },
  dryRun: boolean
): Promise<void> {
  const s = p.spinner();
  s.start('Checking for updates...');
  const updates = await findUpdates(installedSkills, rootPath, projectDetector, repo);
  s.stop(`Found ${updates.length} update(s) available`);

  if (updates.length === 0) {
    p.outro(color.green('All skills are up to date!'));
    return;
  }

  // Show what will be updated (no interactive selection — update all)
  const updateAllLines = updates
    .map(
      (u) =>
        `${color.cyan('●')} ${color.bold(u.name)}\n  ${color.dim(u.currentVersion)} → ${color.green(u.remoteVersion)}`
    )
    .join('\n');
  p.note(updateAllLines, 'Updates available');

  const shouldContinueAll = await p.confirm({
    message: `Update ${updates.length} skill(s)?${dryRun ? color.dim(' [dry-run]') : ''}`,
    initialValue: true,
  });
  if (p.isCancel(shouldContinueAll) || !shouldContinueAll) {
    p.cancel('Update cancelled');
    return;
  }

  await syncUpdateSkills(updates, rootPath, projectDetector, modelDetector, repo, dryRun);
}

async function updateSkillsDirect(
  skills: string[],
  rootPath: string,
  projectDetector: ProjectDetector,
  repo: { cachePath: string },
  dryRun: boolean
): Promise<void> {
  const agentsSkillsDir = projectDetector.getSkillsDir(rootPath);
  const updates: SkillVersion[] = [];

  for (const skillName of skills) {
    const installedSkillDir = path.join(agentsSkillsDir, skillName);
    const installedPath = path.join(installedSkillDir, 'SKILL.md');
    const remotePath = path.join(repo.cachePath, 'skills', skillName, 'SKILL.md');

    if (!fs.existsSync(installedSkillDir)) {
      p.log.warn(
        `${color.bold(skillName)}: not installed — use ${color.cyan(`add --skill ${skillName}`)} first`
      );
      continue;
    }

    if (!fs.existsSync(remotePath)) {
      p.log.warn(`${color.bold(skillName)}: not found in remote repository`);
      continue;
    }

    let currentVersion = '0.0';
    let remoteVersion = '0.0';
    try {
      if (fs.existsSync(installedPath)) {
        currentVersion = extractVersion(installedPath);
      }
      remoteVersion = extractVersion(remotePath);
    } catch {
      // If parsing fails, treat as version mismatch so it gets updated
    }

    if (currentVersion === remoteVersion) {
      p.log.info(
        `${color.bold(skillName)}: already up to date ${color.dim(`(${currentVersion})`)}`
      );
      continue;
    }

    updates.push({ name: skillName, currentVersion, remoteVersion });
  }

  if (updates.length === 0) {
    p.outro(color.yellow('No updates to apply'));
    return;
  }

  await syncUpdateSkills(updates, rootPath, projectDetector, new ModelDetector(), repo, dryRun);
}

async function addModelsDirect(
  models: string[],
  rootPath: string,
  projectDetector: ProjectDetector,
  modelDetector: ModelDetector,
  installedSkills: string[],
  dryRun: boolean
): Promise<void> {
  await syncAddModels(models, rootPath, projectDetector, modelDetector, installedSkills, dryRun);
}

async function syncUpdateSkills(
  updates: SkillVersion[],
  rootPath: string,
  projectDetector: ProjectDetector,
  modelDetector: ModelDetector,
  repo: { cachePath: string },
  dryRun: boolean
): Promise<void> {
  const agentsSkillsDir = projectDetector.getSkillsDir(rootPath);

  if (updates.length === 0) {
    p.outro(color.green('All skills are up to date!'));
    return;
  }

  const updateLines = updates
    .map(
      (u) =>
        `${color.cyan('●')} ${color.bold(u.name)}\n  ${color.dim(u.currentVersion)} → ${color.green(u.remoteVersion)}`
    )
    .join('\n');
  p.note(updateLines, 'Available Updates');

  let skillsToUpdate: string[];

  if (updates.length === 1) {
    const u = updates[0];
    const confirmSingle = await p.confirm({
      message: `Update ${color.bold(u.name)} ${color.dim(`(${u.currentVersion} → ${u.remoteVersion})`)}?${dryRun ? color.dim(' [dry-run]') : ''}`,
      initialValue: true,
    });
    if (p.isCancel(confirmSingle) || !confirmSingle) {
      p.cancel('Update cancelled');
      return;
    }
    skillsToUpdate = [u.name];
  } else {
    const selected = await p.multiselect({
      message: 'Select skills to update:',
      options: updates.map((u) => ({
        value: u.name,
        label: u.name,
        hint: `${u.currentVersion} → ${u.remoteVersion}`,
      })),
      initialValues: updates.map((u) => u.name),
      required: false,
    });

    if (p.isCancel(selected) || (selected as string[]).length === 0) {
      p.cancel('Update cancelled');
      return;
    }

    skillsToUpdate = selected as string[];

    const shouldContinueUpdate = await p.confirm({
      message: `Update ${skillsToUpdate.length} skill(s)?${dryRun ? color.dim(' [dry-run]') : ''}`,
      initialValue: true,
    });
    if (p.isCancel(shouldContinueUpdate) || !shouldContinueUpdate) {
      p.cancel('Update cancelled');
      return;
    }
  }

  p.log.message(color.bold(dryRun ? 'Skills (dry run):' : 'Updating skills:'));

  let updatedCount = 0;
  const prevLevel = logger.getLevel();
  logger.setLevel(LogLevel.SILENT);

  for (const skillName of skillsToUpdate) {
    logger.setLevel(LogLevel.INFO);
    logger.skillProgress(skillName, 'installing', undefined);
    logger.setLevel(LogLevel.SILENT);

    const remoteSkillPath = path.join(repo.cachePath, 'skills', skillName);
    const installedSkillPath = path.join(agentsSkillsDir, skillName);

    if (!dryRun) {
      if (fs.existsSync(installedSkillPath)) {
        fs.rmSync(installedSkillPath, { recursive: true, force: true });
      }
      fs.cpSync(remoteSkillPath, installedSkillPath, { recursive: true });
    }

    logger.setLevel(LogLevel.INFO);
    process.stdout.write('\x1b[1A\r\x1b[K');
    logger.skillProgress(skillName, 'completed', undefined);
    logger.setLevel(LogLevel.SILENT);

    updatedCount++;
  }

  logger.setLevel(prevLevel);

  const currentModels = modelDetector.detectInstalledModels(rootPath);
  p.note(
    `Skills updated: ${color.green(updatedCount.toString())}\n` +
      `Affected models: ${color.cyan(currentModels.length.toString())}`,
    'Summary'
  );

  if (dryRun) {
    p.outro(color.yellow('DRY RUN - No changes were made'));
  } else {
    p.outro(color.green('Update completed!'));
  }
}

async function syncAddModels(
  explicitModels: string[] | null,
  rootPath: string,
  projectDetector: ProjectDetector,
  modelDetector: ModelDetector,
  installedSkills: string[],
  dryRun: boolean
): Promise<void> {
  const currentModels = modelDetector.detectInstalledModels(rootPath);
  let newModels: string[];

  if (explicitModels) {
    const alreadyInstalled = explicitModels.filter((m) => currentModels.includes(m));
    if (alreadyInstalled.length > 0) {
      p.log.warn(`Already installed (skipping): ${color.dim(alreadyInstalled.join(', '))}`);
    }
    newModels = explicitModels.filter((m) => !currentModels.includes(m));
    if (newModels.length === 0) {
      p.outro(color.yellow('All specified models are already installed. Nothing to do.'));
      return;
    }
  } else {
    const allModelsInfo = modelDetector.getAllModelsInfo(rootPath);
    const availableModels = allModelsInfo.filter((m) => !currentModels.includes(m.id));

    if (availableModels.length === 0) {
      p.outro(color.yellow('All supported models already have skills installed'));
      return;
    }

    if (availableModels.length === 1) {
      const m = availableModels[0];
      const confirmSingle = await p.confirm({
        message: `Add model ${color.bold(m.name)}?`,
        initialValue: true,
      });
      if (p.isCancel(confirmSingle) || !confirmSingle) {
        p.cancel('Sync cancelled');
        process.exit(0);
      }
      newModels = [m.id];
    } else {
      const selected = await p.multiselect({
        message: 'Select models to add:',
        options: availableModels.map((m) => ({ value: m.id, label: m.name })),
        required: true,
      });

      if (p.isCancel(selected)) {
        p.cancel('Sync cancelled');
        process.exit(0);
      }

      newModels = selected as string[];
    }
  }

  p.note(
    `Models to add: ${color.cyan(newModels.join(', '))}\n` +
      `Skills to sync: ${color.green(installedSkills.length.toString())}`,
    'Sync Details'
  );

  const shouldContinueSync = await p.confirm({
    message: `Sync ${installedSkills.length} skill(s) to ${newModels.length} model(s)?${dryRun ? color.dim(' [dry-run]') : ''}`,
    initialValue: true,
  });
  if (p.isCancel(shouldContinueSync) || !shouldContinueSync) {
    p.cancel('Sync cancelled');
    process.exit(0);
  }

  const agentsSkillsDir = projectDetector.getSkillsDir(rootPath);

  for (const modelId of newModels) {
    const modelDir = modelDetector.getModelDirectory(rootPath, modelId);
    const skillsDir = path.join(modelDir, 'skills');
    if (!fs.existsSync(skillsDir) && !dryRun) {
      fs.mkdirSync(skillsDir, { recursive: true });
    }
  }

  if (dryRun) {
    const dryRunLines: string[] = [];
    for (const skillName of installedSkills) {
      dryRunLines.push(`${color.green('◆')} ${color.bold(skillName)}`);
      for (const modelId of newModels) {
        const modelDir = modelDetector.getModelDirectory(rootPath, modelId);
        const symlinkDst = path.join(modelDir, 'skills', skillName);
        dryRunLines.push(
          `  ${color.dim(path.relative(rootPath, symlinkDst))} ${color.dim('(symlink)')}`
        );
      }
      dryRunLines.push('');
    }
    p.note(dryRunLines.join('\n').trimEnd(), 'Paths that would be created');
  }

  p.log.message(color.bold('Syncing skills:'));

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
      const modelDir = modelDetector.getModelDirectory(rootPath, modelId);
      const skillsDir = path.join(modelDir, 'skills');
      const symlinkSrc = path.relative(skillsDir, path.join(agentsSkillsDir, skillName));
      const symlinkDst = path.join(skillsDir, skillName);

      if (!fs.existsSync(symlinkDst)) {
        if (!dryRun) fs.symlinkSync(symlinkSrc, symlinkDst, 'dir');
        skillSynced = true;
      }
    }

    logger.setLevel(LogLevel.INFO);
    process.stdout.write('\x1b[1A\r\x1b[K');
    logger.skillProgress(skillName, skillSynced ? 'completed' : 'skipped', undefined);
    logger.setLevel(LogLevel.SILENT);

    if (skillSynced) syncedCount++;
    else skippedCount++;
  }

  logger.setLevel(prevLevel);

  const summaryLines = [
    `Models added: ${color.cyan(newModels.length.toString())}`,
    `Skills synced: ${color.green(syncedCount.toString())}`,
  ];
  if (skippedCount > 0) {
    summaryLines.push(
      `Skills skipped: ${color.yellow(skippedCount.toString())} ${color.dim('(already synced)')}`
    );
  }

  p.note(summaryLines.join('\n'), 'Summary');

  if (dryRun) {
    p.outro(color.yellow('DRY RUN - No changes were made'));
  } else {
    p.outro(color.green('Sync completed!'));
  }
}
