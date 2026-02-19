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

    p.note(
      `Skills removed: ${color.green(removedCount.toString())}\n` +
        `Affected models: ${color.cyan(targetModels.length.toString())}`,
      'Summary'
    );

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

  // Build the list of individual entries that will be removed
  const skillEntries: string[] = installedSkills.map((skill) => path.join(agentsSkillsDir, skill));
  for (const modelId of installedModels) {
    const modelDir = modelDetector.getModelDirectory(rootPath, modelId);
    for (const skill of installedSkills) {
      const entry = path.join(modelDir, 'skills', skill);
      if (fs.existsSync(entry)) skillEntries.push(entry);
    }
  }

  p.note(
    [
      `Skills: ${color.red(installedSkills.length.toString())} (${installedSkills.join(', ') || 'none'})`,
      `Models: ${color.cyan(installedModels.join(', ') || 'none')}`,
      `Entries to remove: ${color.dim(skillEntries.length.toString())} skill dirs/symlinks`,
      color.dim('Note: container dirs (.agents/skills/, .claude/skills/, etc.) are preserved'),
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
    // Remove only individual skill entries, leave container directories intact
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
    p.log.success(`Removed ${installedSkills.length} skill(s) from all models`);

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
      `DRY RUN: would remove ${installedSkills.length} skill(s) from .agents/skills/ and ${installedModels.length} model dir(s)` +
        (hasAgentsMd ? ', and ask about AGENTS.md' : '')
    );
  }

  if (options.dryRun) {
    p.outro(color.yellow('DRY RUN - No changes were made'));
  } else {
    p.outro(color.green('Purge completed!'));
  }
}
