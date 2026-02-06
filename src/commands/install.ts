import * as path from 'path';
import inquirer from 'inquirer';
import { Model } from '../core/installer';
import { DependencyResolver } from '../core/dependency-resolver';
import { LocalSkillSource } from '../core/skill-source';
import { Installer } from '../core/installer';
import { logger } from '../utils/logger';
import { MODEL_DIRECTORIES } from '../shared/constants';

interface InstallOptions {
  type: 'local' | 'external';
  path?: string;
  models: string;
  skills?: string;
  dryRun: boolean;
  noMeta: boolean;
}

export async function installCommand(options: InstallOptions): Promise<void> {
  try {
    logger.section('Installation');

    // Determine base directory
    const baseDir = options.type === 'local'
      ? process.cwd()
      : options.path || process.cwd();

    logger.keyValue('Type', options.type);
    logger.keyValue('Base directory', baseDir);
    logger.keyValue('Dry run', options.dryRun ? 'Yes' : 'No');
    logger.newline();

    // Parse models
    const modelNames = options.models.split(',').map(m => m.trim());
    const models: Model[] = modelNames.map(name => ({
      name,
      directory: getModelDirectory(name),
      installed: true,
    }));

    logger.info(`Models: ${modelNames.join(', ')}`);

    // Discover skills
    logger.subsection('Discovering Skills');

    // Create skill source for dependency resolution
    const skillSource = new LocalSkillSource(baseDir);
    const resolver = new DependencyResolver(skillSource);

    let skillsToInstall: string[];
    if (options.skills) {
      // User specified skills
      skillsToInstall = options.skills.split(',').map(s => s.trim());
      logger.info(`User-specified skills: ${skillsToInstall.join(', ')}`);
    } else {
      // Auto-discover from AGENTS.md
      const agentsMdPath = path.join(baseDir, 'AGENTS.md');
      skillsToInstall = DependencyResolver.parseAgentsMd(agentsMdPath);
      logger.info(`Discovered ${skillsToInstall.length} skills from AGENTS.md`);
    }

    // Add meta-skills if not disabled
    if (!options.noMeta) {
      const metaSkills = DependencyResolver.getMetaSkills();
      logger.info(`Adding ${metaSkills.length} meta-skills`);
      skillsToInstall = [...skillsToInstall, ...metaSkills];
    }

    // Build dependency graph
    logger.subsection('Resolving Dependencies');
    const graph = resolver.buildGraph(skillsToInstall);
    logger.info(`Total skills (with dependencies): ${graph.size}`);

    // Validate graph
    const validation = resolver.validateGraph(graph);
    if (!validation.valid) {
      if (validation.cycles) {
        logger.error('Circular dependencies detected:');
        validation.cycles.forEach(cycle => {
          logger.listItem(cycle.formatted, 2);
        });
      }

      if (validation.missing.length > 0) {
        logger.error('Missing dependencies:');
        validation.missing.forEach(dep => {
          logger.listItem(dep, 2);
        });
      }

      throw new Error('Dependency validation failed');
    }

    logger.success('Dependency graph validated');

    // Get installation order
    const installOrder = resolver.getInstallationOrder(graph);
    logger.info(`Installation order: ${installOrder.length} skills`);

    // Print dependency graph if verbose
    if (process.env.VERBOSE) {
      resolver.printGraph(graph);
    }

    // Confirm installation
    if (!options.dryRun) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: `Install ${installOrder.length} skills?`,
          default: true,
        },
      ]);

      if (!answers.proceed) {
        logger.warn('Installation cancelled');
        return;
      }
    }

    // Setup installer
    const installer = new Installer(baseDir);

    // Setup model directories
    logger.subsection('Setting up Models');
    for (const model of models) {
      await installer.setupModel(model, baseDir, options.dryRun);
    }

    // Install skills to each model
    logger.subsection('Installing Skills');
    for (const model of models) {
      const modelDir = path.join(baseDir, model.directory);
      await installer.installWithRollback(installOrder, modelDir, options.type, options.dryRun);
    }

    logger.newline();
    logger.section('Installation Summary');
    logger.keyValue('Type', options.type);
    logger.keyValue('Models', modelNames.join(', '));
    logger.keyValue('Skills installed', installOrder.length.toString());

    if (options.dryRun) {
      logger.warn('DRY RUN - No changes were made');
    } else {
      logger.success('Installation completed successfully!');
    }
  } catch (error) {
    logger.error(`Installation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

/**
 * Map model name to directory
 */
function getModelDirectory(modelName: string): string {
  const normalized = modelName.toLowerCase();
  return MODEL_DIRECTORIES[normalized] || `.${normalized}`;
}
