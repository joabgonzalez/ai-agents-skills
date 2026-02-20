#!/usr/bin/env node

import { Command } from 'commander';
import packageJson from '../package.json';
import { addCommand } from './commands/add';
import { listCommand } from './commands/list';
import { removeCommand } from './commands/remove';
import { syncCommand } from './commands/sync';
import { LogLevel, logger } from './utils/logger';

const program = new Command();

program
  .name('ai-agents-skills')
  .description('AI Agent and Skill Distribution System')
  .version(packageJson.version)
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-q, --quiet', 'Suppress non-error output')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.optsWithGlobals();
    if (opts.verbose) {
      logger.setLevel(LogLevel.DEBUG);
    } else if (opts.quiet) {
      logger.setLevel(LogLevel.ERROR);
    }
  });

// add — installs skills from remote repo or local ./skills/ dir
program
  .command('add')
  .description('Install skills from remote repository (or local with --local)')
  .option('-l, --local', 'Use local ./skills/ directory instead of remote repo (dev mode)')
  .option(
    '-s, --skill <name>',
    'Skill to install, can repeat: --skill react --skill typescript',
    (val, prev: string[] | undefined) => [...(prev ?? []), val]
  )
  .option('-p, --preset <preset>', 'Install a project starter preset by ID')
  .option(
    '-m, --model <name>',
    'Target model, can repeat: --model claude --model cursor',
    (val, prev: string[] | undefined) => [...(prev ?? []), val]
  )
  .option('-d, --dry-run', 'Preview changes without making them')
  .action((options) => {
    addCommand({
      local: options.local,
      skill: options.skill ?? [],
      preset: options.preset,
      model: options.model ?? [],
      dryRun: options.dryRun ?? false,
    });
  });

// remove — removes skills from model directories
program
  .command('remove')
  .alias('uninstall')
  .description('Remove installed skills')
  .option(
    '-s, --skill <name>',
    'Skill to remove, can repeat: --skill react --skill typescript',
    (val, prev: string[] | undefined) => [...(prev ?? []), val]
  )
  .option(
    '-m, --model <name>',
    'Limit removal to a specific model, can repeat: --model claude',
    (val, prev: string[] | undefined) => [...(prev ?? []), val]
  )
  .option('-p, --purge', 'Remove all skills and clean up empty directories')
  .option('--confirm', 'Skip confirmation prompt')
  .option('-d, --dry-run', 'Preview changes without making them')
  .action((options) => {
    removeCommand({
      skill: options.skill ?? [],
      model: options.model ?? [],
      purge: options.purge ?? false,
      confirm: options.confirm ?? false,
      dryRun: options.dryRun ?? false,
    });
  });

// sync — updates skills and/or adds models
program
  .command('sync')
  .description('Update installed skills or add support for new AI models')
  .option('-u, --update', 'Update all installed skills to latest versions')
  .option(
    '-s, --skill <name>',
    'Skill to update, can repeat: --skill react --skill typescript',
    (val, prev: string[] | undefined) => [...(prev ?? []), val]
  )
  .option(
    '-m, --model <name>',
    'Add a new AI model, can repeat: --model cursor --model windsurf',
    (val, prev: string[] | undefined) => [...(prev ?? []), val]
  )
  .option('-d, --dry-run', 'Preview changes without making them')
  .action((options) => {
    syncCommand({
      update: options.update ?? false,
      skill: options.skill ?? [],
      model: options.model ?? [],
      dryRun: options.dryRun ?? false,
    });
  });

// list — lists installed skills and models
program
  .command('list')
  .alias('ls')
  .description('List installed skills and models')
  .action(listCommand);

// Parse CLI arguments
program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
