import * as p from '@clack/prompts';
import color from 'picocolors';
import { DEDICATED_MODELS, UNIVERSAL_MODELS } from '../shared/constants';
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
 *
 * dedicatedModels: IDs of dedicated-directory models targeted in this run
 * (claude, antigravity). Universal models are always shown as a static note.
 */
export function showInstallOutro(
  counts: InstallCounts,
  dedicatedModels: string[],
  dryRun: boolean,
  successMessage = 'Installation complete!'
): void {
  const lines: string[] = [];

  lines.push(`${color.dim('Universal:')}   ${UNIVERSAL_MODELS.length} agents ${color.dim('(.agents/skills/)')}`);
  for (let i = 0; i < UNIVERSAL_MODELS.length; i++) {
    const isLast = i === UNIVERSAL_MODELS.length - 1;
    const branch = isLast ? '└' : '├';
    lines.push(`             ${color.dim(branch)} ${color.dim(UNIVERSAL_MODELS[i].label)}`);
  }

  if (dedicatedModels.length > 0) {
    const dedicatedLine = dedicatedModels
      .map((id) => {
        const cfg = DEDICATED_MODELS[id];
        return cfg ? `${cfg.name} ${color.dim(`(${cfg.directory}/skills/)`)}` : id;
      })
      .join('  ');
    lines.push(`${color.dim('Dedicated:')}   ${dedicatedLine}`);
  }

  lines.push(`${color.dim('Installed:')}   ${color.green(counts.installed.toString())} skills`);
  if (counts.skipped > 0) {
    lines.push(
      `${color.dim('Skipped:')}    ${color.yellow(counts.skipped.toString())} ${color.dim('(already up-to-date)')}`
    );
  }

  p.note(lines.join('\n'), 'Summary');

  if (dryRun) {
    p.outro(color.yellow('DRY RUN - No changes were made'));
  } else {
    p.outro(color.green(successMessage));
  }
}
