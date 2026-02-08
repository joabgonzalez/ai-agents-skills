import path from 'path';
import fs from 'fs';
import * as p from '@clack/prompts';
import color from 'picocolors';
import { ProjectDetector, ModelDetector, DependencyResolver } from '../core';
import { LocalSkillSource } from '../core/skill-source';
import { logger, LogLevel } from '../utils/logger';
import { regenerateInstructionFile } from '../utils/instruction-generator';

export interface RemoveOptions {
  skills?: string;
  models?: string;
  all: boolean;
  confirm: boolean;
  dryRun: boolean;
}

/**
 * Remove command - Remove skills with dependency checking
 * Ensures no installed skill depends on the skills being removed
 */
export async function removeCommand(options: RemoveOptions): Promise<void> {
  try {
    p.intro(color.bgCyan(color.black(' ai-agents-skills ')));

    const baseDir = process.cwd();

    if (options.dryRun) {
      p.note(`Base directory: ${baseDir}`, 'Dry Run Mode');
    }

    // 1. Detect project
    const projectDetector = new ProjectDetector();
    const modelDetector = new ModelDetector();
    const project = await projectDetector.detectProject();

    // 2. Get installed skills
    const installedSkills = projectDetector.getInstalledSkills(project.rootPath);

    if (installedSkills.length === 0) {
      p.cancel('No skills installed');
      process.exit(0);
    }

    // 3. Determine which skills to remove
    let skillsToRemove: string[];

    if (options.all) {
      skillsToRemove = installedSkills;
    } else if (options.skills) {
      skillsToRemove = options.skills.split(',').map(s => s.trim());

      // Validate that skills exist
      const notInstalled = skillsToRemove.filter(s => !installedSkills.includes(s));
      if (notInstalled.length > 0) {
        p.cancel(`Skills not installed: ${notInstalled.join(', ')}`);
        process.exit(1);
      }
    } else {
      // Interactive selection
      const selected = await p.multiselect({
        message: 'Select skills to remove:',
        options: installedSkills.map(skill => ({
          value: skill,
          label: skill
        })),
        required: true
      });

      if (p.isCancel(selected)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }

      skillsToRemove = selected as string[];
    }

    // 4. Check dependencies - ensure no other installed skill depends on these
    const s = p.spinner();
    s.start('Checking dependencies...');

    const skillSource = new LocalSkillSource(baseDir);
    const resolver = new DependencyResolver(skillSource);

    // Get skills that will remain after removal
    const remainingSkills = installedSkills.filter(s => !skillsToRemove.includes(s));

    // Suppress warnings during dependency checking (skills not found are expected)
    const depCheckLogLevel = logger.getLevel();
    logger.setLevel(LogLevel.ERROR);

    // Build graph for remaining skills to check their dependencies
    const blockedRemovals: { skill: string; usedBy: string[] }[] = [];

    for (const skillToRemove of skillsToRemove) {
      const dependentSkills = remainingSkills.filter(remaining => {
        try {
          const graph = resolver.buildGraph([remaining]);
          // Check if skillToRemove is in the dependency graph
          return graph.has(skillToRemove);
        } catch {
          return false;
        }
      });

      if (dependentSkills.length > 0) {
        blockedRemovals.push({
          skill: skillToRemove,
          usedBy: dependentSkills
        });
      }
    }

    // Restore log level
    logger.setLevel(depCheckLogLevel);

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

      p.cancel('Remove blocked skills first or remove dependent skills together');
      process.exit(1);
    }

    // 6. Determine which models to target
    let targetModels: string[];

    if (options.models) {
      targetModels = options.models.split(',').map(m => m.trim());
    } else {
      const detectedModels = modelDetector.detectInstalledModels(project.rootPath);

      if (detectedModels.length === 0) {
        p.cancel('No model directories found');
        process.exit(1);
      }

      targetModels = detectedModels;
    }

    // 7. Analyze what will be removed
    const allRemovedSkills = new Set<string>(skillsToRemove);
    const keptDependencies: string[] = [];

    // Suppress warnings during dependency analysis (skills not found are expected)
    const depAnalysisLogLevel = logger.getLevel();
    logger.setLevel(LogLevel.ERROR);

    // Check which dependencies will remain because they're used by other skills
    for (const skillToRemove of skillsToRemove) {
      const node = resolver.buildGraph([skillToRemove]).get(skillToRemove);
      if (node) {
        for (const dep of node.dependencies) {
          if (!skillsToRemove.includes(dep)) {
            // This dependency is not being explicitly removed
            // Check if it's used by remaining skills
            const isUsedByRemaining = remainingSkills.some(remaining => {
              try {
                const graph = resolver.buildGraph([remaining]);
                return graph.has(dep);
              } catch {
                return false;
              }
            });

            if (isUsedByRemaining && !keptDependencies.includes(dep)) {
              keptDependencies.push(dep);
            } else {
              allRemovedSkills.add(dep);
            }
          }
        }
      }
    }

    // Restore log level
    logger.setLevel(depAnalysisLogLevel);

    // 8. Show removal preview
    console.log();
    console.log(color.bold('Removal Preview:'));
    console.log();

    for (const skill of skillsToRemove) {
      console.log(`  ${color.red('✗')} ${color.bold(skill)}`);
    }

    const additionalRemovals = Array.from(allRemovedSkills).filter(s => !skillsToRemove.includes(s));
    if (additionalRemovals.length > 0) {
      console.log();
      console.log(color.dim(`  Dependencies to remove: ${additionalRemovals.join(', ')}`));
    }

    if (keptDependencies.length > 0) {
      console.log();
      console.log(color.dim(`  Dependencies kept (used by other skills): ${keptDependencies.join(', ')}`));
    }

    console.log();
    p.note(
      `Total skills to remove: ${color.red(allRemovedSkills.size.toString())}\n` +
      `Affected models: ${color.cyan(targetModels.join(', '))}\n` +
      `Directory: ${color.dim(baseDir)}`,
      'Removal Summary'
    );

    // 9. Confirm removal
    if (!options.confirm && !options.dryRun) {
      const shouldContinue = await p.confirm({
        message: `Remove ${allRemovedSkills.size} skill(s) from project?`,
        initialValue: false
      });

      if (p.isCancel(shouldContinue) || !shouldContinue) {
        p.cancel('Removal cancelled');
        process.exit(0);
      }
    }

    // 10. Remove skills with detailed progress
    console.log();
    console.log(color.bold('Removing skills:'));
    console.log();

    let removedCount = 0;
    const prevLevel = logger.getLevel();
    logger.setLevel(LogLevel.SILENT);

    const agentsSkillsDir = projectDetector.getSkillsDir(project.rootPath);
    const skillsToActuallyRemove = Array.from(allRemovedSkills);

    for (const skillName of skillsToActuallyRemove) {
      // Show removing status with spinner
      logger.setLevel(LogLevel.INFO);
      logger.skillProgress(skillName, 'installing', undefined); // Reuse 'installing' for spinner
      logger.setLevel(LogLevel.SILENT);

      // Remove from each model directory
      for (const modelId of targetModels) {
        const modelDir = modelDetector.getModelDirectory(project.rootPath, modelId);
        const skillPath = path.join(modelDir, 'skills', skillName);

        if (fs.existsSync(skillPath) && !options.dryRun) {
          fs.rmSync(skillPath, { recursive: true, force: true });
        }
      }

      // Remove from .agents/skills/ (source of truth)
      const agentsSkillPath = path.join(agentsSkillsDir, skillName);
      if (fs.existsSync(agentsSkillPath) && !options.dryRun) {
        fs.rmSync(agentsSkillPath, { recursive: true, force: true });
      }

      // Update with final status
      logger.setLevel(LogLevel.INFO);
      process.stdout.write('\x1b[1A\r\x1b[K');
      logger.skillProgress(skillName, 'completed', undefined);
      logger.setLevel(LogLevel.SILENT);

      removedCount++;
    }

    logger.setLevel(prevLevel);
    console.log();

    // 10. Regenerate instruction files after removal
    const s2 = p.spinner();
    s2.start('Updating instruction files...');
    let instructionsUpdated = 0;

    for (const modelId of targetModels) {
      const modelDir = modelDetector.getModelDirectory(project.rootPath, modelId);
      const updated = regenerateInstructionFile(modelDir, modelId, options.dryRun);
      if (updated) instructionsUpdated++;
    }

    s2.stop(`Updated ${instructionsUpdated} instruction file(s)`);
    console.log();

    // 11. Summary
    const summaryLines = [];
    summaryLines.push(`Skills removed: ${color.green(removedCount.toString())}`);
    summaryLines.push(`Affected models: ${color.cyan(targetModels.length.toString())}`);
    if (instructionsUpdated > 0) {
      summaryLines.push(`Instructions: ${color.green(instructionsUpdated.toString())} file(s) updated`);
    }

    p.note(summaryLines.join('\n'), 'Summary');

    // Success message
    if (options.dryRun) {
      p.outro(color.yellow('DRY RUN - No changes were made'));
    } else {
      p.outro(color.green('Removal completed successfully!'));
    }
  } catch (error) {
    p.log.error(`Removal failed: ${error instanceof Error ? error.message : String(error)}`);
    p.cancel('Removal failed');
    process.exit(1);
  }
}
