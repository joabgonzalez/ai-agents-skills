import * as p from '@clack/prompts';
import color from 'picocolors';
import { LogLevel, logger } from './logger';

export interface InstallCounts {
  installed: number;
  skipped: number;
}

/**
 * Runs the install/remove progress loop with consistent spinner + cursor-up display.
 * installFn returns true if the skill was newly installed/processed, false if skipped.
 *
 * topLevelSkills: if provided, only these skills print a permanent ✓ line.
 * Dependency skills show a transient ◐ spinner that is erased after install.
 * Falls back to showing all skills if topLevelSkills is empty.
 */
export async function runInstallLoop(
  skillNames: string[],
  skillDeps: Map<string, string[]>,
  installFn: (skillName: string) => Promise<boolean>,
  topLevelSkills?: Set<string>
): Promise<InstallCounts> {
  let installed = 0;
  let skipped = 0;

  const prevLevel = logger.getLevel();
  logger.setLevel(LogLevel.SILENT);

  for (const skillName of skillNames) {
    const deps = skillDeps.get(skillName);
    const isTopLevel =
      !topLevelSkills || topLevelSkills.size === 0 || topLevelSkills.has(skillName);

    logger.setLevel(LogLevel.INFO);
    logger.skillProgress(skillName, 'installing', deps);
    logger.setLevel(LogLevel.SILENT);

    const wasInstalled = await installFn(skillName);

    // Always erase the installing line
    process.stdout.write('\x1b[1A\r\x1b[K');

    if (isTopLevel) {
      // Top-level skills get a permanent ✓ / ○ line
      logger.setLevel(LogLevel.INFO);
      logger.skillProgress(skillName, wasInstalled ? 'completed' : 'skipped', deps);
      logger.setLevel(LogLevel.SILENT);
    }
    // Dependency skills: installing line was erased, nothing printed permanently

    if (wasInstalled) installed++;
    else skipped++;
  }

  logger.setLevel(prevLevel);
  return { installed, skipped };
}

/**
 * Shows the standard installation summary note + outro.
 */
export function showInstallOutro(
  counts: InstallCounts,
  modelCount: number,
  dryRun: boolean,
  successMessage = 'Installation complete!'
): void {
  const lines: string[] = [];
  lines.push(`Models: ${color.cyan(modelCount.toString())}`);
  lines.push(`Skills installed: ${color.green(counts.installed.toString())}`);
  if (counts.skipped > 0) {
    lines.push(
      `Skills skipped: ${color.yellow(counts.skipped.toString())} ${color.dim('(already up-to-date)')}`
    );
  }

  p.note(lines.join('\n'), 'Summary');

  if (dryRun) {
    p.outro(color.yellow('DRY RUN - No changes were made'));
  } else {
    p.outro(color.green(successMessage));
  }
}
