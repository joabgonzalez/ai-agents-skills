#!/usr/bin/env node

import { Command } from 'commander';
import { installCommand } from './commands/install';
import { localCommand } from './commands/local';
import { uninstallCommand } from './commands/uninstall';
import { validateCommand } from './commands/validate';
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

// Local command (for managing jg-ai-agents repo)
program
  .command('local')
  .description('Manage local installation (for jg-ai-agents repo)')
  .option('-m, --models <models>', 'Models to install (comma-separated, e.g., "copilot,claude,cursor")')
  .option('-s, --skills <skills>', 'Specific skills to install (comma-separated)')
  .option('-d, --dry-run', 'Dry run without making changes', false)
  .option('--no-meta', 'Skip meta-skills installation', false)
  .action(localCommand);

// Install command
program
  .command('install')
  .description('Install skills to a project')
  .option('-t, --type <type>', 'Installation type (local|external)', 'local')
  .option('-p, --path <path>', 'Target project path (for external installations)')
  .option('-m, --models <models>', 'Models to install (comma-separated)', 'github-copilot')
  .option('-s, --skills <skills>', 'Specific skills to install (comma-separated)')
  .option('-d, --dry-run', 'Dry run without making changes', false)
  .option('--no-meta', 'Skip meta-skills installation', false)
  .action(installCommand);

// Uninstall command
program
  .command('uninstall')
  .description('Remove skills from model directories')
  .option('-s, --skills <skills>', 'Specific skills to uninstall (comma-separated)')
  .option('-m, --models <models>', 'Models to target (comma-separated)', 'github-copilot')
  .option('-a, --all', 'Uninstall all skills', false)
  .option('--confirm', 'Skip confirmation prompt', false)
  .action(uninstallCommand);

// Validate command
program
  .command('validate')
  .description('Validate frontmatter and dependencies')
  .option('-s, --skill <skill>', 'Validate specific skill')
  .option('-a, --all', 'Validate all skills', false)
  .option('--installed', 'Validate installed skills', false)
  .action(validateCommand);

// List command
program
  .command('list')
  .alias('ls')
  .description('List installations or skills')
  .option('-i, --installations', 'List all installations', false)
  .option('-s, --skills [id]', 'List skills in installation')
  .action(async (options) => {
    // TODO: Implement list command
    if (options.installations) {
      logger.info('Listing installations...');
      // Implementation
    } else if (options.skills) {
      const installId = typeof options.skills === 'string' ? options.skills : 'main';
      logger.info(`Listing skills in installation: ${installId}`);
      // Implementation
    } else {
      logger.error('Specify --installations or --skills');
      process.exit(1);
    }
  });

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
