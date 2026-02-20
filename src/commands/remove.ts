import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import color from 'picocolors';
import { DependencyResolver, ModelDetector, ProjectDetector } from '../core';
import { FileSystemSkillSource } from '../core/skill-source';
import { LogLevel, logger } from '../utils/logger';

export interface RemoveOptions {
  skill?: string[];
  model?: string[];
  purge: boolean;
  confirm: boolean;
  dryRun: boolean;
}

export async function removeCommand(options: RemoveOptions): Promise<void> {
  try {
    p.intro(color.bgCyan(color.black(' ai-agents-skills ')));

    const projectDetector = new ProjectDetector();
    const modelDetector = new ModelDetector();
    const project = await projectDetector.detectProject();

    if (options.dryRun) {
      p.note(`Project: ${project.rootPath}`, 'Dry Run Mode');
    }

    // --purge: nuclear option
    if (options.purge) {
      await purgeCommand(options, project.rootPath, projectDetector, modelDetector);
      return;
    }

    // Regular remove
    const installedSkills = projectDetector.getInstalledSkills(project.rootPath);

    if (installedSkills.length === 0) {
      p.cancel('No skills installed');
      process.exit(0);
    }

    // Determine skills to remove
    let skillsToRemove: string[];

    if (options.skill && options.skill.length > 0) {
      const notInstalled = options.skill.filter((s) => !installedSkills.includes(s));
      const validSkills = options.skill.filter((s) => installedSkills.includes(s));
      for (const s of notInstalled) {
        p.log.warn(`'${s}': not installed`);
      }
      if (validSkills.length === 0) {
        p.cancel('None of the specified skills are installed');
        process.exit(1);
      }
      skillsToRemove = validSkills;
    } else {
      // Interactive: first ask what kind of removal
      const removalType = await p.select({
        message: 'What would you like to remove?',
        options: [
          {
            value: 'select',
            label: 'Specific skills',
            hint: `${installedSkills.length} installed`,
          },
          { value: 'purge', label: 'All skills', hint: 'also asks about AGENTS.md' },
        ],
      });

      if (p.isCancel(removalType)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }

      if (removalType === 'purge') {
        await purgeCommand(options, project.rootPath, projectDetector, modelDetector);
        return;
      }

      const selected = await p.multiselect({
        message: 'Select skills to remove:',
        options: installedSkills.map((skill) => ({ value: skill, label: skill })),
        required: true,
      });

      if (p.isCancel(selected)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }

      skillsToRemove = selected as string[];
    }

    // Dependency check
    const s = p.spinner();
    s.start('Checking dependencies...');

    const skillSource = new FileSystemSkillSource(project.rootPath);
    const resolver = new DependencyResolver(skillSource);
    const remainingSkills = installedSkills.filter((sk) => !skillsToRemove.includes(sk));

    const prevLevel = logger.getLevel();
    logger.setLevel(LogLevel.ERROR);

    const remainingGraphs = new Map<string, Set<string>>();
    for (const remaining of remainingSkills) {
      try {
        const graph = resolver.buildGraph([remaining]);
        remainingGraphs.set(remaining, new Set(graph.keys()));
      } catch {
        // ignore
      }
    }

    const blockedRemovals: { skill: string; usedBy: string[] }[] = [];
    for (const skillToRemove of skillsToRemove) {
      const dependentSkills: string[] = [];
      for (const [remaining, deps] of remainingGraphs) {
        if (deps.has(skillToRemove)) dependentSkills.push(remaining);
      }
      if (dependentSkills.length > 0) {
        blockedRemovals.push({ skill: skillToRemove, usedBy: dependentSkills });
      }
    }

    // Find orphaned deps that can also be removed
    const allRemovedSkills = new Set<string>(skillsToRemove);
    for (const skillToRemove of skillsToRemove) {
      try {
        const node = resolver.buildGraph([skillToRemove]).get(skillToRemove);
        if (node) {
          for (const dep of node.dependencies) {
            if (!skillsToRemove.includes(dep)) {
              const isUsedByRemaining = remainingSkills.some((remaining) => {
                try {
                  return resolver.buildGraph([remaining]).has(dep);
                } catch {
                  return false;
                }
              });
              if (!isUsedByRemaining) allRemovedSkills.add(dep);
            }
          }
        }
      } catch {
        // ignore
      }
    }

    logger.setLevel(prevLevel);
    s.stop('Dependency check complete');

    if (blockedRemovals.length > 0) {
      const details = blockedRemovals
        .map(
          (b) =>
            `${color.yellow('⚠')} ${color.bold(b.skill)} ${color.dim('← used by')} ${color.yellow(b.usedBy.join(', '))}`
        )
        .join('\n');
      p.log.warn(`These skills are used as dependencies by others:\n${details}`);
      const forceRemove = await p.confirm({
        message: 'Remove anyway? Dependent skills will lose this capability.',
        initialValue: false,
      });
      if (p.isCancel(forceRemove) || !forceRemove) {
        p.cancel('Removal cancelled');
        process.exit(0);
      }
    }

    // Target models
    let targetModels: string[];
    if (options.model && options.model.length > 0) {
      const allModels = modelDetector.getAllModelsInfo(project.rootPath);
      const knownIds = new Set(allModels.map((m) => m.id));
      const unknown = options.model.filter((m) => !knownIds.has(m));
      for (const m of unknown) {
        p.log.warn(`'${m}': unknown model`);
      }
      const validIds = options.model.filter((m) => knownIds.has(m));
      if (validIds.length === 0) {
        p.cancel('No valid models specified');
        process.exit(1);
      }
      // Warn about valid IDs that have no skills installed
      const installedModels = modelDetector.detectInstalledModels(project.rootPath);
      const notConfigured = validIds.filter((m) => !installedModels.includes(m));
      const validModels = validIds.filter((m) => installedModels.includes(m));
      for (const m of notConfigured) {
        p.log.warn(`'${m}': no skills installed for this model`);
      }
      if (validModels.length === 0) {
        p.cancel('None of the specified models have skills installed');
        process.exit(1);
      }
      targetModels = validModels;
    } else {
      const detected = modelDetector.detectInstalledModels(project.rootPath);
      if (detected.length === 0) {
        p.cancel('No model directories found');
        process.exit(1);
      }
      targetModels = detected;
    }

    // Preview
    const skillsToActuallyRemove = Array.from(allRemovedSkills);
    const additionalRemovals = skillsToActuallyRemove.filter((sk) => !skillsToRemove.includes(sk));

    const previewLines = skillsToRemove.map((skill) => `${color.red('✗')} ${color.bold(skill)}`);
    if (additionalRemovals.length > 0) {
      previewLines.push('');
      previewLines.push(color.dim(`Orphaned deps to remove: ${additionalRemovals.join(', ')}`));
    }
    p.note(previewLines.join('\n'), 'Removal Preview');

    p.note(
      `Skills to remove: ${color.red(skillsToActuallyRemove.length.toString())}\n` +
        `Affected models: ${color.cyan(targetModels.join(', '))}`,
      'Removal Summary'
    );

    // Confirm (--confirm skips; dry-run still prompts but makes no changes)
    if (!options.confirm) {
      const shouldContinue = await p.confirm({
        message: `Remove ${skillsToActuallyRemove.length} skill(s)?${options.dryRun ? color.dim(' [dry-run]') : ''}`,
        initialValue: false,
      });
      if (p.isCancel(shouldContinue) || !shouldContinue) {
        p.cancel('Removal cancelled');
        process.exit(0);
      }
    }

    // Dry-run path preview
    if (options.dryRun) {
      showDryRunRemovePaths(
        skillsToActuallyRemove,
        project.rootPath,
        targetModels,
        modelDetector,
        projectDetector
      );
      const wouldClean = predictCleanupDirs(
        project.rootPath,
        targetModels,
        modelDetector,
        projectDetector,
        skillsToActuallyRemove
      );
      if (wouldClean.length > 0) {
        p.note(
          wouldClean.map((d) => `${color.red('◆')} ${color.dim(d)}`).join('\n'),
          'Directories that would also be removed'
        );
      }
    }

    // Execute
    p.log.message(color.bold(options.dryRun ? 'Skills (dry run):' : 'Removing skills:'));

    const agentsSkillsDir = projectDetector.getSkillsDir(project.rootPath);
    const removeLogLevel = logger.getLevel();
    logger.setLevel(LogLevel.SILENT);
    let removedCount = 0;

    for (const skillName of skillsToActuallyRemove) {
      logger.setLevel(LogLevel.INFO);
      logger.skillProgress(skillName, 'removing', undefined);
      logger.setLevel(LogLevel.SILENT);

      for (const modelId of targetModels) {
        const modelDir = modelDetector.getModelDirectory(project.rootPath, modelId);
        const skillPath = path.join(modelDir, 'skills', skillName);
        if (fs.existsSync(skillPath) && !options.dryRun) {
          fs.rmSync(skillPath, { recursive: true, force: true });
        }
      }

      const agentsSkillPath = path.join(agentsSkillsDir, skillName);
      if (fs.existsSync(agentsSkillPath) && !options.dryRun) {
        fs.rmSync(agentsSkillPath, { recursive: true, force: true });
      }

      logger.setLevel(LogLevel.INFO);
      process.stdout.write('\x1b[1A\r\x1b[K');
      logger.skillProgress(skillName, 'completed', undefined);
      logger.setLevel(LogLevel.SILENT);
      removedCount++;
    }

    logger.setLevel(removeLogLevel);

    // Clean up empty container directories after removal
    let cleanedDirs: string[] = [];
    if (!options.dryRun) {
      cleanedDirs = cleanupEmptyDirs(
        project.rootPath,
        targetModels,
        modelDetector,
        projectDetector
      );
    }

    const summaryLines = [
      `Skills removed: ${color.green(removedCount.toString())}`,
      `Affected models: ${color.cyan(targetModels.length.toString())}`,
    ];
    if (cleanedDirs.length > 0) {
      summaryLines.push(color.dim(`Cleaned up: ${cleanedDirs.join(', ')}`));
    }
    p.note(summaryLines.join('\n'), 'Summary');

    if (options.dryRun) {
      p.outro(color.yellow('DRY RUN - No changes were made'));
    } else {
      p.outro(color.green('Removal completed!'));
    }
  } catch (error) {
    p.log.error(`Removal failed: ${error instanceof Error ? error.message : String(error)}`);
    p.cancel('Removal failed');
    process.exit(1);
  }
}

function showDryRunRemovePaths(
  skillNames: string[],
  rootPath: string,
  modelIds: string[],
  modelDetector: ModelDetector,
  projectDetector: ProjectDetector
): void {
  const lines: string[] = [];
  for (const skillName of skillNames) {
    lines.push(`${color.red('◆')} ${color.bold(skillName)}`);
    const agentsEntry = path.join(projectDetector.getSkillsDir(rootPath), skillName);
    lines.push(`  ${color.dim(path.relative(rootPath, agentsEntry))}`);
    for (const modelId of modelIds) {
      const modelDir = modelDetector.getModelDirectory(rootPath, modelId);
      const modelEntry = path.join(modelDir, 'skills', skillName);
      lines.push(`  ${color.dim(path.relative(rootPath, modelEntry))} ${color.dim('(symlink)')}`);
    }
    lines.push('');
  }
  p.note(lines.join('\n').trimEnd(), 'Paths that would be deleted');
}

/**
 * Remove empty skills/ and model parent directories after skill deletion.
 * Only removes a directory when it is completely empty (no other files/folders).
 * Returns relative paths of cleaned-up directories.
 */
function cleanupEmptyDirs(
  rootPath: string,
  modelIds: string[],
  modelDetector: ModelDetector,
  projectDetector: ProjectDetector
): string[] {
  const cleaned: string[] = [];

  for (const modelId of modelIds) {
    const modelDir = modelDetector.getModelDirectory(rootPath, modelId);
    const modelSkillsDir = path.join(modelDir, 'skills');
    if (fs.existsSync(modelSkillsDir) && fs.readdirSync(modelSkillsDir).length === 0) {
      fs.rmSync(modelSkillsDir, { recursive: true, force: true });
      cleaned.push(path.relative(rootPath, modelSkillsDir));
      if (fs.existsSync(modelDir) && fs.readdirSync(modelDir).length === 0) {
        fs.rmSync(modelDir, { recursive: true, force: true });
        cleaned.push(path.relative(rootPath, modelDir));
      }
    }
  }

  const agentsSkillsDir = projectDetector.getSkillsDir(rootPath);
  if (fs.existsSync(agentsSkillsDir) && fs.readdirSync(agentsSkillsDir).length === 0) {
    fs.rmSync(agentsSkillsDir, { recursive: true, force: true });
    cleaned.push(path.relative(rootPath, agentsSkillsDir));
    const agentsDir = projectDetector.getAgentsDir(rootPath);
    if (fs.existsSync(agentsDir) && fs.readdirSync(agentsDir).length === 0) {
      fs.rmSync(agentsDir, { recursive: true, force: true });
      cleaned.push(path.relative(rootPath, agentsDir));
    }
  }

  return cleaned;
}

/**
 * Predict which directories would be cleaned up if the given skills were removed.
 * Simulates cleanupEmptyDirs without touching the filesystem.
 */
function predictCleanupDirs(
  rootPath: string,
  modelIds: string[],
  modelDetector: ModelDetector,
  projectDetector: ProjectDetector,
  skillsToRemove: string[]
): string[] {
  const wouldClean: string[] = [];
  const removedSet = new Set(skillsToRemove);

  for (const modelId of modelIds) {
    const modelDir = modelDetector.getModelDirectory(rootPath, modelId);
    const modelSkillsDir = path.join(modelDir, 'skills');
    if (!fs.existsSync(modelSkillsDir)) continue;
    const remaining = fs.readdirSync(modelSkillsDir).filter((e) => !removedSet.has(e));
    if (remaining.length === 0) {
      wouldClean.push(path.relative(rootPath, modelSkillsDir));
      const remainingInModel = fs.readdirSync(modelDir).filter((e) => e !== 'skills');
      if (remainingInModel.length === 0) {
        wouldClean.push(path.relative(rootPath, modelDir));
      }
    }
  }

  const agentsSkillsDir = projectDetector.getSkillsDir(rootPath);
  if (fs.existsSync(agentsSkillsDir)) {
    const remaining = fs.readdirSync(agentsSkillsDir).filter((e) => !removedSet.has(e));
    if (remaining.length === 0) {
      wouldClean.push(path.relative(rootPath, agentsSkillsDir));
      const agentsDir = projectDetector.getAgentsDir(rootPath);
      if (fs.existsSync(agentsDir)) {
        const remainingInAgents = fs.readdirSync(agentsDir).filter((e) => e !== 'skills');
        if (remainingInAgents.length === 0) {
          wouldClean.push(path.relative(rootPath, agentsDir));
        }
      }
    }
  }

  return wouldClean;
}

async function purgeCommand(
  options: RemoveOptions,
  rootPath: string,
  projectDetector: ProjectDetector,
  modelDetector: ModelDetector
): Promise<void> {
  const installedSkills = projectDetector.getInstalledSkills(rootPath);
  const installedModels = modelDetector.detectInstalledModels(rootPath);
  const agentsSkillsDir = projectDetector.getSkillsDir(rootPath);

  const agentsMdPath = path.join(rootPath, 'AGENTS.md');
  const hasAgentsMd = fs.existsSync(agentsMdPath);

  const wouldClean = predictCleanupDirs(
    rootPath,
    installedModels,
    modelDetector,
    projectDetector,
    installedSkills
  );

  p.note(
    [
      `Skills: ${color.red(installedSkills.length.toString())} (${installedSkills.join(', ') || 'none'})`,
      `Models: ${color.cyan(installedModels.join(', ') || 'none')}`,
      wouldClean.length > 0
        ? `Empty dirs to remove: ${color.dim(wouldClean.join(', '))}`
        : '',
      hasAgentsMd ? `AGENTS.md: ${color.yellow('will confirm separately')}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    'Purge Preview'
  );

  if (!options.confirm) {
    const shouldContinue = await p.confirm({
      message: `Remove all ${installedSkills.length} skill(s) from ${installedModels.length} model(s)?${options.dryRun ? color.dim(' [dry-run]') : ''}`,
      initialValue: false,
    });
    if (p.isCancel(shouldContinue) || !shouldContinue) {
      p.cancel('Purge cancelled');
      process.exit(0);
    }
  }

  if (!options.dryRun) {
    for (const skill of installedSkills) {
      const agentsEntry = path.join(agentsSkillsDir, skill);
      if (fs.existsSync(agentsEntry)) {
        fs.rmSync(agentsEntry, { recursive: true, force: true });
      }
      for (const modelId of installedModels) {
        const modelDir = modelDetector.getModelDirectory(rootPath, modelId);
        const modelEntry = path.join(modelDir, 'skills', skill);
        if (fs.existsSync(modelEntry)) {
          fs.rmSync(modelEntry, { recursive: true, force: true });
        }
      }
    }

    const cleanedDirs = cleanupEmptyDirs(rootPath, installedModels, modelDetector, projectDetector);

    p.log.success(
      `Removed ${installedSkills.length} skill(s) from all models` +
        (cleanedDirs.length > 0 ? ` · cleaned up: ${cleanedDirs.join(', ')}` : '')
    );

    if (hasAgentsMd) {
      const removeAgentsMd = await p.confirm({
        message: 'Remove AGENTS.md?',
        initialValue: false,
      });
      if (!p.isCancel(removeAgentsMd) && removeAgentsMd) {
        fs.rmSync(agentsMdPath, { force: true });
        p.log.success('Removed AGENTS.md');
      }
    }
  } else {
    p.log.info(
      `DRY RUN: would remove ${installedSkills.length} skill(s) from ${installedModels.length} model dir(s)` +
        (wouldClean.length > 0 ? ` and clean up ${wouldClean.length} empty dir(s)` : '') +
        (hasAgentsMd ? ', and ask about AGENTS.md' : '')
    );
  }

  if (options.dryRun) {
    p.outro(color.yellow('DRY RUN - No changes were made'));
  } else {
    p.outro(color.green('Purge completed!'));
  }
}
