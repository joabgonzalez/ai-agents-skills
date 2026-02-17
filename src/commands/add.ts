import * as p from '@clack/prompts';
import color from 'picocolors';
import path from 'path';
import fs from 'fs';
import { RepositoryManager, ProjectDetector, ModelDetector, DependencyResolver } from '../core';
import { RemoteSkillSource } from '../core/skill-source';
import type { PresetInfo } from '../core/repository';
import { logger, LogLevel } from '../utils/logger';

export interface AddOptions {
  preset?: string;
  skill?: string;
  models?: string;
  dryRun?: boolean;
}

/**
 * Installs skills from a remote repository. If no source is provided, uses the official repo.
 */
export async function addCommand(source: string, options: AddOptions) {
  p.intro(color.bgCyan(color.black(' ai-agents-skills ')));

  // 1. Fetch repository
  const repoManager = new RepositoryManager();
  const s = p.spinner();

  s.start(`Fetching repository: ${source}`);
  const repo = await repoManager.fetchRepository(source);
  s.stop(`Repository ready`);

  // 2. Detect project
  const projectDetector = new ProjectDetector();
  const project = await projectDetector.detectProject();

  p.log.info(`Project: ${color.cyan(project.rootPath)} ${color.dim(`(${project.type})`)}`);

  // 3. Always show model selection (unless --models flag provided)
  const modelDetector = new ModelDetector();
  const installedModels = modelDetector.detectInstalledModels(project.rootPath);

  let selectedModels: string[];

  if (options.models) {
    selectedModels = options.models.split(',').map((m) => m.trim());
  } else {
    const allModels = modelDetector.getAllModelsInfo(project.rootPath);

    const selected = await p.multiselect({
      message: 'Select AI models to install skills for:',
      options: allModels.map((m) => ({
        value: m.id,
        label: m.name,
        hint: installedModels.includes(m.id) ? color.green('detected') : '',
      })),
      initialValues: installedModels.length > 0 ? installedModels : [],
      required: true,
    });

    if (p.isCancel(selected)) {
      p.cancel('Installation cancelled');
      process.exit(0);
    }

    selectedModels = selected as string[];
  }

  // 4. Determine what to install
  let skillsToInstall: string[] = [];
  let presetInfo: PresetInfo | null = null;

  if (options.preset) {
    // Install preset
    presetInfo = await repoManager.getPreset(repo.cachePath, options.preset);

    if (!presetInfo) {
      p.cancel(`Preset not found: ${options.preset}`);
      process.exit(1);
    }

    skillsToInstall = presetInfo.skills;
    p.log.info(`Preset: ${color.green(presetInfo.name)}`);
    p.log.message(color.dim(presetInfo.description));
  } else if (options.skill) {
    // Install specific skill
    skillsToInstall = [options.skill];
  } else {
    // Interactive mode
    const choice = await p.select({
      message: 'What would you like to install?',
      options: [
        { value: 'skills', label: 'Skills' },
        { value: 'preset', label: 'Project Starter Preset (AGENTS.md + skills bundle)' },
      ],
    });

    if (p.isCancel(choice)) {
      p.cancel('Installation cancelled');
      process.exit(0);
    }

    if (choice === 'preset') {
      const presets = await repoManager.listPresets(repo.cachePath);

      if (presets.length === 0) {
        p.cancel('No presets found in repository');
        process.exit(1);
      }

      const selectedPreset = await p.select({
        message: 'Select agent preset:',
        options: presets.map((preset) => ({
          value: preset.id,
          label: preset.name,
          hint: `${preset.skills.length} skills`,
        })),
      });

      if (p.isCancel(selectedPreset)) {
        p.cancel('Installation cancelled');
        process.exit(0);
      }

      presetInfo = presets.find((preset) => preset.id === selectedPreset) ?? null;
      skillsToInstall = presetInfo!.skills;
    } else {
      const availableSkills = repoManager.listSkills(repo.cachePath);

      if (availableSkills.length === 0) {
        p.cancel('No skills found in repository');
        process.exit(1);
      }

      // Detect already installed skills
      const installedSkills = projectDetector.getInstalledSkills(project.rootPath);

      // Show installed skills in a compact format
      if (installedSkills.length > 0) {
        p.log.info(`Already installed: ${color.dim(installedSkills.join(', '))}`);
        console.log();
      }

      // Filter to show only not installed skills
      const notInstalledSkills = availableSkills.filter(
        (skill) => !installedSkills.includes(skill),
      );

      if (notInstalledSkills.length === 0) {
        p.cancel('All available skills are already installed');
        process.exit(0);
      }

      const selected = await p.multiselect({
        message: `Select skills to install (${notInstalledSkills.length} available):`,
        options: notInstalledSkills.map((skill) => ({
          value: skill,
          label: skill,
        })),
        required: true,
      });

      if (p.isCancel(selected)) {
        p.cancel('Installation cancelled');
        process.exit(0);
      }

      skillsToInstall = selected as string[];
    }
  }

  // 5. Resolve dependencies
  s.start('Resolving dependencies...');

  const skillSource = new RemoteSkillSource(repo.cachePath);
  const resolver = new DependencyResolver(skillSource);
  const resolved = resolver.buildGraph(skillsToInstall);

  s.stop(`Found ${resolved.size} skills (including dependencies)`);
  console.log();

  // Show dependency tree
  const requestedSkills = skillsToInstall;
  const allSkills = Array.from(resolved.keys());
  const dependencies = allSkills.filter((skill) => !requestedSkills.includes(skill));

  console.log(color.bold('Installation Preview:'));
  console.log();

  for (const skill of requestedSkills) {
    const node = resolved.get(skill);
    if (node) {
      console.log(`  ${color.green('●')} ${color.bold(skill)}`);
      if (node.dependencies.length > 0) {
        node.dependencies.forEach((dep, idx) => {
          const isLast = idx === node.dependencies.length - 1;
          const prefix = isLast ? '└─' : '├─';
          console.log(`     ${color.dim(prefix)} ${dep}`);
        });
      }
    }
  }

  if (dependencies.length > 0 && dependencies.length !== allSkills.length) {
    console.log();
    console.log(color.dim(`  Additional dependencies: ${dependencies.join(', ')}`));
  }

  console.log();

  // 6. Confirm installation
  const confirm = await p.confirm({
    message: `Install ${resolved.size} skill(s) to ${selectedModels.length} model(s)?`,
    initialValue: true,
  });

  if (!confirm || p.isCancel(confirm)) {
    p.cancel('Installation cancelled');
    process.exit(0);
  }

  // 7. Setup .agents/skills/ directory
  s.start('Setting up skills directory...');

  const agentsSkillsDir = projectDetector.getSkillsDir(project.rootPath);
  if (!fs.existsSync(agentsSkillsDir)) {
    fs.mkdirSync(agentsSkillsDir, { recursive: true });
  }

  s.stop('Skills directory ready');

  // 8. Setup model directories
  s.start('Setting up model directories...');

  const prevLevel = logger.getLevel();
  logger.setLevel(LogLevel.WARN);

  for (const modelId of selectedModels) {
    const modelDir = modelDetector.getModelDirectory(project.rootPath, modelId);
    const skillsDir = path.join(modelDir, 'skills');

    if (!fs.existsSync(skillsDir)) {
      fs.mkdirSync(skillsDir, { recursive: true });
    }
  }

  s.stop(`${selectedModels.length} model directory(s) ready`);

  // 9. Install skills with detailed progress
  console.log();
  console.log(color.bold('Installing skills:'));
  console.log();

  let installedCount = 0;
  let skippedCount = 0;

  // Get dependency details for each skill from graph
  const skillDeps = new Map<string, string[]>();
  const skillNames = Array.from(resolved.keys());

  for (const skillName of skillNames) {
    const node = resolved.get(skillName);
    if (node && node.dependencies.length > 0) {
      skillDeps.set(skillName, node.dependencies);
    }
  }

  // Suppress logger during installation
  logger.setLevel(LogLevel.SILENT);

  for (const skillName of skillNames) {
    const deps = skillDeps.get(skillName);

    // Show installing status with spinner
    logger.setLevel(LogLevel.INFO);
    logger.skillProgress(skillName, 'installing', deps);
    logger.setLevel(LogLevel.SILENT);

    const srcPath = path.join(repo.cachePath, 'skills', skillName);
    const dstPath = path.join(agentsSkillsDir, skillName);

    let skillInstalled = false;

    // Copy to .agents/skills/ if not exists
    if (!fs.existsSync(dstPath)) {
      if (!options.dryRun) {
        fs.cpSync(srcPath, dstPath, { recursive: true });
      }
      skillInstalled = true;
    }

    // Create symlinks for each model
    for (const modelId of selectedModels) {
      const modelDir = modelDetector.getModelDirectory(project.rootPath, modelId);
      const skillsDir = path.join(modelDir, 'skills');
      const symlinkSrc = path.relative(skillsDir, path.join(agentsSkillsDir, skillName));
      const symlinkDst = path.join(skillsDir, skillName);

      if (!fs.existsSync(symlinkDst) && !options.dryRun) {
        fs.symlinkSync(symlinkSrc, symlinkDst, 'dir');
      }
    }

    // Update with final status
    logger.setLevel(LogLevel.INFO);
    const status = skillInstalled ? 'completed' : 'skipped';
    process.stdout.write('\x1b[1A\r\x1b[K');
    logger.skillProgress(skillName, status, deps);
    logger.setLevel(LogLevel.SILENT);

    if (skillInstalled) {
      installedCount++;
    } else {
      skippedCount++;
    }
  }

  // Restore logger level
  logger.setLevel(prevLevel);
  console.log();

  // 10. Copy AGENTS.md if preset
  if (presetInfo && !options.dryRun) {
    const agentsSrc = path.join(presetInfo.path, 'AGENTS.md');
    const agentsDst = path.join(project.rootPath, 'AGENTS.md');

    if (fs.existsSync(agentsSrc) && !fs.existsSync(agentsDst)) {
      fs.copyFileSync(agentsSrc, agentsDst);
      p.log.success(`Copied AGENTS.md for preset: ${presetInfo.name}`);
    }
  }

  // 11. Summary
  const summaryLines = [];
  summaryLines.push(`Models: ${color.cyan(selectedModels.length.toString())}`);
  summaryLines.push(`Skills installed: ${color.green(installedCount.toString())}`);
  if (skippedCount > 0) {
    summaryLines.push(
      `Skills skipped: ${color.yellow(skippedCount.toString())} ${color.dim('(already up-to-date)')}`
    );
  }
  if (presetInfo) {
    summaryLines.push(`Preset: ${color.cyan(presetInfo.name)}`);
  }

  p.note(summaryLines.join('\n'), 'Summary');

  if (options.dryRun) {
    p.outro(color.yellow('DRY RUN - No changes were made'));
  } else {
    p.outro(color.green('Installation complete!'));
  }
}
