#!/usr/bin/env node

import { Command } from 'commander';
import { localCommand } from './commands/local';
import { removeCommand } from './commands/remove';
import { validateCommand } from './commands/validate';
import { addCommand } from './commands/add';
import { listCommand } from './commands/list';
import { syncModelsCommand } from './commands/sync-models';
import { logger, LogLevel } from './utils/logger';

const program = new Command();

program
  .name('ai-agents-skills')
  .description('AI Agent and Skill Distribution System')
  .version('1.0.0')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-q, --quiet', 'Suppress non-error output')
  .hook('preAction', (thisCommand) => {
    // Set log level based on global options
    const opts = thisCommand.optsWithGlobals();
    if (opts.verbose) {
      logger.setLevel(LogLevel.DEBUG);
    } else if (opts.quiet) {
      logger.setLevel(LogLevel.ERROR);
    }
  });

// Local command (for managing this repository)
program
  .command('local')
  .description('Manage local installation (for this repository)')
  .option('-m, --models <models>', 'Models to install (comma-separated, e.g., "copilot,claude,cursor")')
  .option('-s, --skills <skills>', 'Specific skills to install (comma-separated)')
  .option('-d, --dry-run', 'Dry run without making changes', false)
  .action(localCommand);

// Remove command
program
  .command('remove')
  .alias('uninstall') // Keep 'uninstall' as alias for backwards compatibility
  .description('Remove skills from model directories')
  .option('-s, --skills <skills>', 'Specific skills to remove (comma-separated)')
  .option('-m, --models <models>', 'Models to target (comma-separated)')
  .option('-a, --all', 'Remove all skills', false)
  .option('--confirm', 'Skip confirmation prompt', false)
  .option('-d, --dry-run', 'Dry run without making changes', false)
  .action(removeCommand);

// Validate command
program
  .command('validate')
  .description('Validate frontmatter and dependencies')
  .option('-s, --skill <skill>', 'Validate specific skill')
  .option('-a, --all', 'Validate all skills', false)
  .option('--installed', 'Validate installed skills', false)
  .action(validateCommand);

// Add command (NPX mode)
const DEFAULT_REPO = 'joabgonzalez/ai-agents-skills';
program
  .command('add [source]')
  .description('Install skills from remote repository (defaults to official)')
  .option('-p, --preset <preset>', 'Install agent preset by ID')
  .option('-s, --skill <skill>', 'Install specific skill by name')
  .option('-m, --models <models>', 'Models to install (comma-separated)')
  .option('-d, --dry-run', 'Dry run without making changes', false)
  .action((source, options) => {
    addCommand(source || DEFAULT_REPO, options);
  });

// List command
program
  .command('list')
  .alias('ls')
  .description('List installed skills and models')
  .action(listCommand);

// Sync command
program
  .command('sync')
  .description('Sync models with existing skills')
  .option('--add-models <models>', 'Add models to existing installation (comma-separated)')
  .option('-d, --dry-run', 'Dry run without making changes', false)
  .action(syncModelsCommand);

// Info command
program
  .command('info <skill>')
  .description('Show skill information')
  .action(async (skill: string) => {
    // TODO: Implement info command
    logger.info(`Showing info for skill: ${skill}`);
  });

// Parse CLI arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
