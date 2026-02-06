import * as path from 'path';
import * as p from '@clack/prompts';
import color from 'picocolors';
import { Model } from '../core/installer';
import { DependencyResolver } from '../core/dependency-resolver';
import { LocalSkillSource } from '../core/skill-source';
import { Installer } from '../core/installer';
import { logger } from '../utils/logger';
import { MODEL_DIRECTORIES, AVAILABLE_MODELS } from '../shared/constants';
import { exists, isDirectory } from '../utils/fs';

interface LocalOptions {
  models?: string;  // Optional now - will prompt if not provided
  skills?: string;
  dryRun: boolean;
  noMeta: boolean;
}

/**
 * Local command - Install skills locally in jg-ai-agents repo
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

    // Determine models to install
    let modelNames: string[];

    if (options.models) {
      // User provided --models flag
      modelNames = options.models.split(',').map(m => m.trim());
    } else {
      // Auto-detect existing model directories
      const detectedModels = detectInstalledModels(baseDir);

      // Build message with detection info
      const message = detectedModels.length > 0
        ? `Select models to install (installed: ${detectedModels.map(m => color.cyan(m)).join(', ')})`
        : 'Select models to install';

      // Interactive model selection with auto-detection
      const selectedModels = await p.multiselect({
        message,
        options: AVAILABLE_MODELS.map(m => ({
          value: m.value,
          label: m.label,
          hint: detectedModels.includes(m.value) ? color.green('✓ Installed') : m.hint,
        })),
        initialValues: detectedModels.length > 0 ? detectedModels : ['github-copilot'],
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
    const existingModels = modelNames.filter(m => detectedModels.includes(m));
    const newModels = modelNames.filter(m => !detectedModels.includes(m));

    // Show information about model selection
    if (existingModels.length > 0 && newModels.length > 0) {
      p.note(
        `Existing (will skip re-installing symlinks): ${color.cyan(existingModels.join(', '))}\n` +
        `New (will install): ${color.green(newModels.join(', '))}`,
        'Model Selection'
      );
    } else if (existingModels.length > 0) {
      p.note(
        `All selected models already exist. Skills with symlinks will be skipped (already up-to-date).\n` +
        `Models: ${color.cyan(existingModels.join(', '))}`,
        'Model Selection'
      );
    }

    const models: Model[] = modelNames.map(name => ({
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
      skillsToInstall = options.skills.split(',').map(s => s.trim());
    } else {
      // Auto-discover from AGENTS.md
      const agentsMdPath = path.join(baseDir, 'AGENTS.md');
      skillsToInstall = DependencyResolver.parseAgentsMd(agentsMdPath);
    }

    // Add meta-skills if not disabled
    if (!options.noMeta) {
      const metaSkills = DependencyResolver.getMetaSkills();
      skillsToInstall = [...skillsToInstall, ...metaSkills];
    }

    // Build dependency graph
    s.message('Resolving dependencies...');
    const graph = resolver.buildGraph(skillsToInstall);

    // Validate graph
    const validation = resolver.validateGraph(graph);
    if (!validation.valid) {
      s.stop('Validation failed');

      if (validation.cycles) {
        p.log.error('Circular dependencies detected:');
        validation.cycles.forEach(cycle => {
          p.log.error(`  ${cycle.formatted}`);
        });
      }

      if (validation.missing.length > 0) {
        p.log.error('Missing dependencies:');
        validation.missing.forEach(dep => {
          p.log.error(`  ${dep}`);
        });
      }

      p.cancel('Installation cancelled due to validation errors');
      process.exit(1);
    }

    // Get installation order
    const installOrder = resolver.getInstallationOrder(graph);
    s.stop(`Found ${installOrder.length} skills (${graph.size} total with dependencies)`);

    // Print dependency graph if verbose
    if (process.env.VERBOSE) {
      resolver.printGraph(graph);
    }

    // Show installation details
    p.note(
      `Models: ${color.cyan(modelNames.join(', '))}\n` +
      `Skills: ${color.cyan(installOrder.length.toString())}\n` +
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

    // Setup model directories
    const s2 = p.spinner();
    s2.start('Setting up model directories...');
    for (const model of models) {
      await installer.setupModel(model, baseDir, options.dryRun);
    }
    s2.stop('Model directories ready');

    // Install skills to each model
    const s3 = p.spinner();
    s3.start('Installing skills...');

    // Keep logger for progress bar during installation
    logger.subsection('Installing Skills');

    // Accumulate statistics across all models
    let totalInstalled = 0;
    let totalSkipped = 0;

    for (const model of models) {
      logger.info(`\nProcessing model: ${model.name}`);
      const modelDir = path.join(baseDir, model.directory);
      const stats = await installer.installWithRollback(installOrder, modelDir, 'local', options.dryRun);
      totalInstalled += stats.installed;
      totalSkipped += stats.skipped;
    }

    s3.stop('Installation complete');

    // Show summary
    const summaryLines = [];
    summaryLines.push(`Models: ${color.cyan(modelNames.length.toString())}`);
    summaryLines.push(`Skills installed: ${color.green(totalInstalled.toString())}`);
    if (totalSkipped > 0) {
      summaryLines.push(`Skills skipped: ${color.yellow(totalSkipped.toString())} ${color.dim('(already up-to-date)')}`);
    }

    p.note(summaryLines.join('\n'), 'Summary');

    // Success message
    if (options.dryRun) {
      p.outro(color.yellow('DRY RUN - No changes were made'));
    } else {
      p.outro(color.green('✓ Installation completed successfully!'));
    }
  } catch (error) {
    p.log.error(`Installation failed: ${error instanceof Error ? error.message : String(error)}`);
    p.cancel('Installation failed');
    process.exit(1);
  }
}

/**
 * Detect which models are already installed by checking for existing directories
 * (Vercel Skills style - simple directory detection)
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
