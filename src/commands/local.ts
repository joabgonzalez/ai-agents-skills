import path from 'path';
import fs from 'fs';
import * as p from '@clack/prompts';
import color from 'picocolors';
import { DependencyResolver } from '../core/dependency-resolver';
import { LocalSkillSource } from '../core/skill-source';
import { Installer } from '../core/installer';
import { ProjectDetector, ModelDetector } from '../core';
import { logger, LogLevel } from '../utils/logger';
import { MODEL_DIRECTORIES, AVAILABLE_MODELS } from '../shared/constants';
import { exists, isDirectory } from '../utils/fs';
import type { Model } from '../core/installer';

interface LocalOptions {
  models?: string; // Optional now - will prompt if not provided
  skills?: string;
  interactive?: boolean; // Interactive mode for add/remove
  dryRun: boolean;
}

/**
 * Local command - Install skills locally in this repository
 * Uses LocalSkillSource to read from ./skills/ directory
 */
export async function localCommand(options: LocalOptions): Promise<void> {
  try {
    // Intro
    p.intro(color.bgCyan(color.black(' ai-agents-skills ')));

    // Local installation always uses current directory
    const baseDir = process.cwd();

    if (options.dryRun) {
      p.note(`Base directory: ${baseDir}`, 'Dry Run Mode');
    }

    // Detect if there's an existing installation
    const projectDetector = new ProjectDetector();
    const agentsSkillsDir = projectDetector.getSkillsDir(baseDir);
    const hasExistingInstallation = fs.existsSync(agentsSkillsDir);
    const installedSkills = hasExistingInstallation
      ? projectDetector.getInstalledSkills(baseDir)
      : [];

    // If there's an existing installation and no specific flags, show interactive menu
    if (hasExistingInstallation && !options.skills && !options.interactive) {
      p.log.info(
        `Existing installation detected: ${color.cyan(installedSkills.length.toString())} skills installed`
      );
      console.log();

      const action = await p.select({
        message: 'What would you like to do?',
        options: [
          { value: 'add-skills', label: 'Add more skills' },
          { value: 'remove-skills', label: 'Remove skills' },
          { value: 'add-models', label: 'Add models to existing installation' },
          { value: 'reinstall', label: 'Reinstall full preset (from AGENTS.md)' },
        ],
      });

      if (p.isCancel(action)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }

      if (action === 'add-skills') {
        await interactiveAddSkills(baseDir, options.dryRun);
        return;
      } else if (action === 'remove-skills') {
        await interactiveRemoveSkills(baseDir, options.dryRun);
        return;
      } else if (action === 'add-models') {
        await interactiveAddModels(baseDir, options.dryRun);
        return;
      }
      // If 'reinstall', continue with normal flow
    }

    // Interactive mode - show action menu (explicit --interactive flag)
    if (options.interactive) {
      const menuOptions = [
        { value: 'add', label: 'Add skills to installed models' },
        { value: 'remove', label: 'Remove skills from installed models' },
      ];

      if (hasExistingInstallation) {
        menuOptions.push({ value: 'add-models', label: 'Add models to existing installation' });
      }

      menuOptions.push({ value: 'install', label: 'Install full preset (from AGENTS.md)' });

      const action = await p.select({
        message: 'What would you like to do?',
        options: menuOptions,
      });

      if (p.isCancel(action)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }

      if (action === 'add') {
        await interactiveAddSkills(baseDir, options.dryRun);
        return;
      } else if (action === 'remove') {
        await interactiveRemoveSkills(baseDir, options.dryRun);
        return;
      } else if (action === 'add-models') {
        await interactiveAddModels(baseDir, options.dryRun);
        return;
      }
      // If 'install', continue with normal flow
    }

    // Determine models to install
    let modelNames: string[];

    if (options.models) {
      // User provided --models flag
      modelNames = options.models.split(',').map((m) => m.trim());
    } else {
      // Auto-detect existing model directories
      const detectedModels = detectInstalledModels(baseDir);

      // Build message with detection info
      const message =
        detectedModels.length > 0
          ? `Select models to install (installed: ${detectedModels.map((m) => color.cyan(m)).join(', ')})`
          : 'Select models to install';

      // Interactive model selection with auto-detection
      const selectedModels = await p.multiselect({
        message,
        options: AVAILABLE_MODELS.map((m) => ({
          value: m.value,
          label: m.label,
          hint: detectedModels.includes(m.value) ? color.green('✓ Installed') : m.hint,
        })),
        initialValues: detectedModels.length > 0 ? detectedModels : [],
        required: true,
      });

      if (p.isCancel(selectedModels)) {
        p.cancel('Installation cancelled');
        process.exit(0);
      }

      modelNames = selectedModels as string[];
    }

    // Separate detected (existing) vs new models
    const detectedModels = detectInstalledModels(baseDir);
    const existingModels = modelNames.filter((m) => detectedModels.includes(m));
    const newModels = modelNames.filter((m) => !detectedModels.includes(m));

    // Show information about model selection
    if (existingModels.length > 0 && newModels.length > 0) {
      p.note(
        `Existing (will update skills): ${color.cyan(existingModels.join(', '))}\n` +
          `New (will install): ${color.green(newModels.join(', '))}`,
        'Model Selection'
      );
    } else if (existingModels.length > 0 && newModels.length === 0) {
      p.note(
        `Models: ${color.cyan(existingModels.join(', '))} ${color.dim('(updating skills)')}`,
        'Model Selection'
      );
    }

    const models: Model[] = modelNames.map((name) => ({
      name,
      directory: getModelDirectory(name),
      installed: detectedModels.includes(name),
    }));

    // Discover skills
    const s = p.spinner();
    s.start('Discovering skills...');

    // Create LocalSkillSource for dependency resolution
    const skillSource = new LocalSkillSource(baseDir);
    const resolver = new DependencyResolver(skillSource);

    let skillsToInstall: string[];
    if (options.skills) {
      // User specified skills
      skillsToInstall = options.skills.split(',').map((sk) => sk.trim());
    } else {
      // Auto-discover from AGENTS.md
      const agentsMdPath = path.join(baseDir, 'AGENTS.md');
      skillsToInstall = DependencyResolver.parseAgentsMd(agentsMdPath);
    }

    // Build dependency graph (all dependencies resolved automatically)
    s.message('Resolving dependencies...');
    const graph = resolver.buildGraph(skillsToInstall);

    // Validate graph
    const validation = resolver.validateGraph(graph);
    if (!validation.valid) {
      s.stop('Validation failed');

      if (validation.cycles) {
        p.log.error('Circular dependencies detected:');
        validation.cycles.forEach((cycle) => {
          p.log.error(`  ${cycle.formatted}`);
        });
      }

      if (validation.missing.length > 0) {
        p.log.error('Missing dependencies:');
        validation.missing.forEach((dep) => {
          p.log.error(`  ${dep}`);
        });
      }

      p.cancel('Installation cancelled due to validation errors');
      process.exit(1);
    }

    // Get installation order
    const installOrder = resolver.getInstallationOrder(graph);
    s.stop(`Found ${graph.size} skills (including dependencies)`);

    // Print dependency graph if verbose
    if (process.env.VERBOSE) {
      resolver.printGraph(graph);
    }

    console.log();

    // Show dependency tree preview
    const requestedSkills = skillsToInstall;
    const allSkills = Array.from(graph.keys());
    const dependencies = allSkills.filter((skill) => !requestedSkills.includes(skill));

    console.log(color.bold('Installation Preview:'));
    console.log();

    for (const skill of requestedSkills) {
      const node = graph.get(skill);
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

    // Show installation details
    p.note(
      `Models: ${color.cyan(modelNames.join(', '))}\n` +
        `Skills: ${color.cyan(graph.size.toString())}\n` +
        `Directory: ${color.dim(baseDir)}`,
      'Installation Details'
    );

    // Confirm installation
    if (!options.dryRun) {
      const shouldContinue = await p.confirm({
        message: `Install ${installOrder.length} skills to ${modelNames.length} model(s)?`,
        initialValue: true,
      });

      if (p.isCancel(shouldContinue) || !shouldContinue) {
        p.cancel('Installation cancelled');
        process.exit(0);
      }
    }

    // Setup installer
    const installer = new Installer(baseDir);

    // Setup model directories (creates dirs + instruction files)
    const s2 = p.spinner();
    s2.start('Setting up model directories...');

    // Suppress verbose logger during setup
    const prevLevel = logger.getLevel();
    logger.setLevel(LogLevel.WARN);

    for (const model of models) {
      s2.message(`Setting up ${model.name}...`);
      await installer.setupModel(model, baseDir, options.dryRun);
    }
    s2.stop(`${models.length} model directory(s) ready`);

    // Install skills with detailed progress
    console.log();
    console.log(color.bold('Installing skills:'));
    console.log();

    let installedCount = 0;
    let skippedCount = 0;

    // Get dependency details for each skill from graph
    const skillDeps = new Map<string, string[]>();
    for (const skillName of installOrder) {
      const node = graph.get(skillName);
      if (node && node.dependencies.length > 0) {
        skillDeps.set(skillName, node.dependencies);
      }
    }

    // Suppress installer logs completely
    logger.setLevel(LogLevel.SILENT);

    for (let i = 0; i < installOrder.length; i++) {
      const skill = installOrder[i];
      const deps = skillDeps.get(skill);

      // Show installing status with spinner
      logger.setLevel(LogLevel.INFO);
      logger.skillProgress(skill, 'installing', deps);
      logger.setLevel(LogLevel.SILENT);

      let skillInstalledToAny = false;
      for (const model of models) {
        const modelDir = path.join(baseDir, model.directory);
        try {
          const wasInstalled = await installer.installSkill(
            skill,
            modelDir,
            'local',
            options.dryRun
          );
          if (wasInstalled) skillInstalledToAny = true;
        } catch (error) {
          logger.setLevel(prevLevel);
          console.log();
          p.log.error('Installation failed');
          throw error;
        }
      }

      // Update with final status (move cursor up, overwrite with checkmark/skip)
      logger.setLevel(LogLevel.INFO);
      const status = skillInstalledToAny ? 'completed' : 'skipped';
      // Move cursor up one line, clear it, print final status
      process.stdout.write('\x1b[1A\r\x1b[K');
      logger.skillProgress(skill, status, deps);
      logger.setLevel(LogLevel.SILENT);

      if (skillInstalledToAny) {
        installedCount++;
      } else {
        skippedCount++;
      }
    }

    // Restore logger level
    logger.setLevel(prevLevel);
    console.log();

    // Show summary
    const summaryLines = [];
    summaryLines.push(`Models: ${color.cyan(modelNames.length.toString())}`);
    summaryLines.push(`Skills installed: ${color.green(installedCount.toString())}`);
    if (skippedCount > 0) {
      summaryLines.push(
        `Skills skipped: ${color.yellow(skippedCount.toString())} ${color.dim('(already up-to-date)')}`
      );
    }

    p.note(summaryLines.join('\n'), 'Summary');

    // Success message
    if (options.dryRun) {
      p.outro(color.yellow('DRY RUN - No changes were made'));
    } else {
      p.outro(color.green('Installation completed successfully!'));
    }
  } catch (error) {
    p.log.error(`Installation failed: ${error instanceof Error ? error.message : String(error)}`);
    p.cancel('Installation failed');
    process.exit(1);
  }
}

/**
 * Interactive mode: Add skills to installed models
 */
async function interactiveAddSkills(baseDir: string, dryRun: boolean): Promise<void> {
  const projectDetector = new ProjectDetector();
  const modelDetector = new ModelDetector();

  // 1. Detect installed models
  const detectedModels = detectInstalledModels(baseDir);

  if (detectedModels.length === 0) {
    p.cancel('No model directories found. Run "local" first to install models.');
    process.exit(1);
  }

  p.log.info(`Target models: ${color.cyan(detectedModels.join(', '))}`);
  console.log();

  // 2. List available skills from .agents/skills/
  const agentsSkillsDir = projectDetector.getSkillsDir(baseDir);
  if (!fs.existsSync(agentsSkillsDir)) {
    p.cancel('No skills found in .agents/skills/. Run initial installation first.');
    process.exit(1);
  }

  const availableSkills = fs
    .readdirSync(agentsSkillsDir)
    .filter((item) => {
      const itemPath = path.join(agentsSkillsDir, item);
      return fs.statSync(itemPath).isDirectory();
    })
    .sort();

  if (availableSkills.length === 0) {
    p.cancel('No skills found in ./skills/');
    process.exit(1);
  }

  // 3. Detect already installed skills
  const installedSkills = projectDetector.getInstalledSkills(baseDir);

  // Show installed skills in a compact format
  if (installedSkills.length > 0) {
    p.log.info(`Already installed: ${color.dim(installedSkills.join(', '))}`);
    console.log();
  }

  // Filter to show only not installed skills
  const notInstalledSkills = availableSkills.filter((skill) => !installedSkills.includes(skill));

  if (notInstalledSkills.length === 0) {
    p.cancel('All available skills are already installed');
    process.exit(0);
  }

  // 4. Interactive skill selection
  const selected = await p.multiselect({
    message: `Select skills to install (${notInstalledSkills.length} available):`,
    options: notInstalledSkills.map((skill) => ({
      value: skill,
      label: skill,
    })),
    required: true,
  });

  if (p.isCancel(selected)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  const skillsToInstall = selected as string[];

  // 5. Resolve dependencies
  const s = p.spinner();
  s.start('Resolving dependencies...');

  const skillSource = new LocalSkillSource(baseDir);
  const resolver = new DependencyResolver(skillSource);
  const graph = resolver.buildGraph(skillsToInstall);

  s.stop(`Found ${graph.size} skills (including dependencies)`);
  console.log();

  // Show dependency preview
  const requestedSkills = skillsToInstall;
  const allSkills = Array.from(graph.keys());
  const dependencies = allSkills.filter((skill) => !requestedSkills.includes(skill));

  console.log(color.bold('Installation Preview:'));
  console.log();

  for (const skill of requestedSkills) {
    const node = graph.get(skill);
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
    message: `Install ${graph.size} skill(s) to ${detectedModels.length} model(s)?`,
    initialValue: true,
  });

  if (!confirm || p.isCancel(confirm)) {
    p.cancel('Installation cancelled');
    process.exit(0);
  }

  // 7. Install skills
  const installer = new Installer(baseDir);
  const installOrder = resolver.getInstallationOrder(graph);

  console.log();
  console.log(color.bold('Installing skills:'));
  console.log();

  let installedCount = 0;
  let skippedCount = 0;

  const prevLevel = logger.getLevel();
  logger.setLevel(LogLevel.SILENT);

  for (const skillName of installOrder) {
    const node = graph.get(skillName);
    const deps = node && node.dependencies.length > 0 ? node.dependencies : undefined;

    logger.setLevel(LogLevel.INFO);
    logger.skillProgress(skillName, 'installing', deps);
    logger.setLevel(LogLevel.SILENT);

    let skillInstalledToAny = false;
    for (const modelId of detectedModels) {
      const modelDir = path.join(baseDir, getModelDirectory(modelId));
      const wasInstalled = await installer.installSkill(skillName, modelDir, 'local', dryRun);
      if (wasInstalled) skillInstalledToAny = true;
    }

    logger.setLevel(LogLevel.INFO);
    const status = skillInstalledToAny ? 'completed' : 'skipped';
    process.stdout.write('\x1b[1A\r\x1b[K');
    logger.skillProgress(skillName, status, deps);
    logger.setLevel(LogLevel.SILENT);

    if (skillInstalledToAny) {
      installedCount++;
    } else {
      skippedCount++;
    }
  }

  logger.setLevel(prevLevel);
  console.log();

  // Summary
  const summaryLines = [];
  summaryLines.push(`Models: ${color.cyan(detectedModels.length.toString())}`);
  summaryLines.push(`Skills installed: ${color.green(installedCount.toString())}`);
  if (skippedCount > 0) {
    summaryLines.push(
      `Skills skipped: ${color.yellow(skippedCount.toString())} ${color.dim('(already up-to-date)')}`
    );
  }

  p.note(summaryLines.join('\n'), 'Summary');

  if (dryRun) {
    p.outro(color.yellow('DRY RUN - No changes were made'));
  } else {
    p.outro(color.green('Skills added successfully!'));
  }
}

/**
 * Interactive mode: Remove skills from installed models
 */
async function interactiveRemoveSkills(baseDir: string, dryRun: boolean): Promise<void> {
  const projectDetector = new ProjectDetector();
  const modelDetector = new ModelDetector();

  // 1. Detect installed models
  const detectedModels = detectInstalledModels(baseDir);

  if (detectedModels.length === 0) {
    p.cancel('No model directories found');
    process.exit(1);
  }

  p.log.info(`Target models: ${color.cyan(detectedModels.join(', '))}`);
  console.log();

  // 2. Get installed skills
  const installedSkills = projectDetector.getInstalledSkills(baseDir);

  if (installedSkills.length === 0) {
    p.cancel('No skills installed');
    process.exit(0);
  }

  // 3. Interactive skill selection
  const selected = await p.multiselect({
    message: 'Select skills to remove:',
    options: installedSkills.map((skill) => ({
      value: skill,
      label: skill,
    })),
    required: true,
  });

  if (p.isCancel(selected)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  const skillsToRemove = selected as string[];

  // 4. Check dependencies
  const s = p.spinner();
  s.start('Checking dependencies...');

  const skillSource = new LocalSkillSource(baseDir);
  const resolver = new DependencyResolver(skillSource);
  const remainingSkills = installedSkills.filter((s) => !skillsToRemove.includes(s));

  const blockedRemovals: { skill: string; usedBy: string[] }[] = [];
  const prevLevel = logger.getLevel();
  logger.setLevel(LogLevel.ERROR);

  for (const skillToRemove of skillsToRemove) {
    const dependentSkills = remainingSkills.filter((remaining) => {
      try {
        const graph = resolver.buildGraph([remaining]);
        return graph.has(skillToRemove);
      } catch {
        return false;
      }
    });

    if (dependentSkills.length > 0) {
      blockedRemovals.push({
        skill: skillToRemove,
        usedBy: dependentSkills,
      });
    }
  }

  logger.setLevel(prevLevel);
  s.stop('Dependency check complete');

  // 5. Show dependency conflicts if any
  if (blockedRemovals.length > 0) {
    console.log();
    p.log.error('Cannot remove the following skills due to dependencies:');
    console.log();

    for (const blocked of blockedRemovals) {
      console.log(`  ${color.red('✗')} ${color.bold(blocked.skill)}`);
      console.log(`    ${color.dim('Required by:')} ${color.yellow(blocked.usedBy.join(', '))}`);
      console.log();
    }

    p.cancel('Remove dependent skills first or remove them together');
    process.exit(1);
  }

  // 6. Show removal preview
  console.log();
  console.log(color.bold('Removal Preview:'));
  console.log();

  for (const skill of skillsToRemove) {
    console.log(`  ${color.red('✗')} ${color.bold(skill)}`);
  }

  console.log();

  // 7. Confirm removal
  const confirm = await p.confirm({
    message: `Remove ${skillsToRemove.length} skill(s) from ${detectedModels.length} model(s)?`,
    initialValue: false,
  });

  if (!confirm || p.isCancel(confirm)) {
    p.cancel('Removal cancelled');
    process.exit(0);
  }

  // 8. Remove skills
  console.log();
  console.log(color.bold('Removing skills:'));
  console.log();

  let removedCount = 0;
  logger.setLevel(LogLevel.SILENT);

  const agentsSkillsDir = projectDetector.getSkillsDir(baseDir);

  for (const skillName of skillsToRemove) {
    logger.setLevel(LogLevel.INFO);
    logger.skillProgress(skillName, 'installing', undefined);
    logger.setLevel(LogLevel.SILENT);

    // Remove from each model directory
    for (const modelId of detectedModels) {
      const modelDir = modelDetector.getModelDirectory(baseDir, modelId);
      const skillPath = path.join(modelDir, 'skills', skillName);

      if (fs.existsSync(skillPath) && !dryRun) {
        fs.rmSync(skillPath, { recursive: true, force: true });
      }
    }

    // Remove from .agents/skills/ (source)
    const agentsSkillPath = path.join(agentsSkillsDir, skillName);
    if (fs.existsSync(agentsSkillPath) && !dryRun) {
      fs.rmSync(agentsSkillPath, { recursive: true, force: true });
    }

    logger.setLevel(LogLevel.INFO);
    process.stdout.write('\x1b[1A\r\x1b[K');
    logger.skillProgress(skillName, 'completed', undefined);
    logger.setLevel(LogLevel.SILENT);

    removedCount++;
  }

  logger.setLevel(prevLevel);
  console.log();

  // Summary
  const summaryLines = [];
  summaryLines.push(`Skills removed: ${color.green(removedCount.toString())}`);
  summaryLines.push(`Affected models: ${color.cyan(detectedModels.length.toString())}`);

  p.note(summaryLines.join('\n'), 'Summary');

  if (dryRun) {
    p.outro(color.yellow('DRY RUN - No changes were made'));
  } else {
    p.outro(color.green('Skills removed successfully!'));
  }
}

/**
 * Interactive mode: Add models to existing installation
 */
async function interactiveAddModels(baseDir: string, dryRun: boolean): Promise<void> {
  const projectDetector = new ProjectDetector();
  const modelDetector = new ModelDetector();

  // 1. Detect currently installed models
  const installedModels = detectInstalledModels(baseDir);

  if (installedModels.length === 0) {
    p.cancel('No models currently installed. Run initial installation first.');
    process.exit(1);
  }

  p.log.info(`Currently installed models: ${color.cyan(installedModels.join(', '))}`);
  console.log();

  // 2. Show available models (excluding already installed)
  const availableModels = AVAILABLE_MODELS.filter((m) => !installedModels.includes(m.value));

  if (availableModels.length === 0) {
    p.cancel('All available models are already installed');
    process.exit(0);
  }

  // 3. Interactive model selection
  const selected = await p.multiselect({
    message: `Select models to add (${availableModels.length} available):`,
    options: availableModels.map((m) => ({
      value: m.value,
      label: m.label,
      hint: m.hint,
    })),
    required: true,
  });

  if (p.isCancel(selected)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  const modelsToAdd = selected as string[];

  // 4. Get installed skills
  const installedSkills = projectDetector.getInstalledSkills(baseDir);

  if (installedSkills.length === 0) {
    p.cancel('No skills installed. Nothing to sync to new models.');
    process.exit(1);
  }

  // 5. Confirm operation
  console.log();
  console.log(color.bold('Operation Preview:'));
  console.log();
  console.log(`  Models to add: ${color.green(modelsToAdd.join(', '))}`);
  console.log(`  Skills to install: ${color.cyan(installedSkills.length.toString())}`);
  console.log();

  const confirm = await p.confirm({
    message: `Add ${modelsToAdd.length} model(s) with ${installedSkills.length} skill(s)?`,
    initialValue: true,
  });

  if (!confirm || p.isCancel(confirm)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  // 6. Setup model directories
  const s = p.spinner();
  s.start('Setting up model directories...');

  const installer = new Installer(baseDir);
  const prevLevel = logger.getLevel();
  logger.setLevel(LogLevel.WARN);

  const models: Model[] = modelsToAdd.map((name) => ({
    name,
    directory: getModelDirectory(name),
    installed: false,
  }));

  for (const model of models) {
    s.message(`Setting up ${model.name}...`);
    await installer.setupModel(model, baseDir, dryRun);
  }

  s.stop(`${models.length} model directory(s) ready`);
  logger.setLevel(prevLevel);

  // 7. Install skills to new models
  console.log();
  console.log(color.bold('Installing skills to new models:'));
  console.log();

  let installedCount = 0;
  let skippedCount = 0;

  logger.setLevel(LogLevel.SILENT);

  for (const skillName of installedSkills) {
    logger.setLevel(LogLevel.INFO);
    logger.skillProgress(skillName, 'installing', undefined);
    logger.setLevel(LogLevel.SILENT);

    let skillInstalledToAny = false;
    for (const modelId of modelsToAdd) {
      const modelDir = path.join(baseDir, getModelDirectory(modelId));
      const wasInstalled = await installer.installSkill(skillName, modelDir, 'local', dryRun);
      if (wasInstalled) skillInstalledToAny = true;
    }

    logger.setLevel(LogLevel.INFO);
    const status = skillInstalledToAny ? 'completed' : 'skipped';
    process.stdout.write('\x1b[1A\r\x1b[K');
    logger.skillProgress(skillName, status, undefined);
    logger.setLevel(LogLevel.SILENT);

    if (skillInstalledToAny) {
      installedCount++;
    } else {
      skippedCount++;
    }
  }

  logger.setLevel(prevLevel);
  console.log();

  // Summary
  const summaryLines = [];
  summaryLines.push(`Models added: ${color.green(modelsToAdd.length.toString())}`);
  summaryLines.push(`Skills installed: ${color.green(installedCount.toString())}`);
  if (skippedCount > 0) {
    summaryLines.push(
      `Skills skipped: ${color.yellow(skippedCount.toString())} ${color.dim('(already up-to-date)')}`
    );
  }

  p.note(summaryLines.join('\n'), 'Summary');

  if (dryRun) {
    p.outro(color.yellow('DRY RUN - No changes were made'));
  } else {
    p.outro(color.green('Models added successfully!'));
  }
}

/**
 * Detect which models are already installed by checking for existing directories
 */
function detectInstalledModels(baseDir: string): string[] {
  const detected: string[] = [];

  for (const [modelName, modelDir] of Object.entries(MODEL_DIRECTORIES)) {
    // Skip alias entries (copilot -> github-copilot)
    if (modelName === 'copilot') continue;

    const fullPath = path.join(baseDir, modelDir);
    const skillsPath = path.join(fullPath, 'skills');

    // Check if model directory with skills exists
    if (exists(fullPath) && isDirectory(fullPath) && exists(skillsPath)) {
      detected.push(modelName);
    }
  }

  return detected;
}

/**
 * Map model name to directory
 */
function getModelDirectory(modelName: string): string {
  const normalized = modelName.toLowerCase();
  return MODEL_DIRECTORIES[normalized] || `.${normalized}`;
}
