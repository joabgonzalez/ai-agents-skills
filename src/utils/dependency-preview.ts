import * as p from '@clack/prompts';
import color from 'picocolors';
import type { DependencyNode } from '../core/dependency-resolver';

/**
 * Recursively render a dep and its subtree into the lines array.
 * Expands only when the dep has hidden new sub-deps (not installed, not top-level).
 */
function renderDep(
  dep: string,
  resolved: Map<string, DependencyNode>,
  requestedSkills: string[],
  alreadyInstalled: string[],
  isLast: boolean,
  baseIndent: string,
  lines: string[]
): void {
  const isDepInstalled = alreadyInstalled.includes(dep);
  const isDepTopLevel = !isDepInstalled && requestedSkills.includes(dep);
  const bullet = isDepInstalled
    ? color.dim('○')
    : isDepTopLevel
      ? color.green('○')
      : color.green('●');
  const depLabel = isDepInstalled ? `${color.dim(dep)} ${color.dim('(installed)')}` : dep;
  const prefix = isLast ? '└─' : '├─';

  lines.push(`${color.dim(baseIndent + prefix)} ${bullet} ${depLabel}`);

  // Expand only if: new dep (not installed, not top-level) AND has hidden new sub-deps
  if (!isDepInstalled && !isDepTopLevel) {
    const node = resolved.get(dep);
    if (node?.dependencies.length) {
      const hasHiddenNewDeps = node.dependencies.some(
        (d) => !alreadyInstalled.includes(d) && !requestedSkills.includes(d)
      );
      if (hasHiddenNewDeps) {
        const childIndent = baseIndent + (isLast ? '   ' : '│  ');
        node.dependencies.forEach((subDep, idx) => {
          renderDep(
            subDep,
            resolved,
            requestedSkills,
            alreadyInstalled,
            idx === node.dependencies.length - 1,
            childIndent,
            lines
          );
        });
      }
    }
  }
}

/**
 * Compute which deps will be visible in the tree (mirrors renderDep expansion logic).
 * Used to determine what remains for "Additional dependencies".
 */
function collectShownDeps(
  dep: string,
  resolved: Map<string, DependencyNode>,
  requestedSkills: string[],
  alreadyInstalled: string[],
  shown: Set<string>
): void {
  if (shown.has(dep)) return;
  shown.add(dep);

  if (!alreadyInstalled.includes(dep) && !requestedSkills.includes(dep)) {
    const node = resolved.get(dep);
    if (node?.dependencies.length) {
      const hasHiddenNewDeps = node.dependencies.some(
        (d) => !alreadyInstalled.includes(d) && !requestedSkills.includes(d)
      );
      if (hasHiddenNewDeps) {
        for (const d of node.dependencies) {
          collectShownDeps(d, resolved, requestedSkills, alreadyInstalled, shown);
        }
      }
    }
  }
}

/**
 * Display dependency preview for skills to be installed.
 * Shows requested skills with their dependencies in a tree structure.
 * Deps with hidden new sub-deps are expanded recursively.
 */
export function showDependencyPreview(
  requestedSkills: string[],
  resolved: Map<string, DependencyNode>,
  alreadyInstalled: string[] = []
): void {
  // Determine what will be visible in the tree to compute remaining "Additional dependencies"
  const shownInTree = new Set<string>();
  for (const skill of requestedSkills) {
    const node = resolved.get(skill);
    if (node) {
      for (const dep of node.dependencies) {
        collectShownDeps(dep, resolved, requestedSkills, alreadyInstalled, shownInTree);
      }
    }
  }

  const allSkills = Array.from(resolved.keys());
  const newTransitiveDeps = allSkills.filter(
    (skill) =>
      !requestedSkills.includes(skill) &&
      !alreadyInstalled.includes(skill) &&
      !shownInTree.has(skill)
  );

  const lines: string[] = [];

  for (const skill of requestedSkills) {
    const node = resolved.get(skill);
    if (node) {
      const isInstalled = alreadyInstalled.includes(skill);
      if (isInstalled) {
        lines.push(`${color.dim('○')} ${color.bold(color.dim(skill))} ${color.dim('(installed)')}`);
      } else {
        lines.push(`${color.green('●')} ${color.bold(skill)}`);
      }
      if (node.dependencies.length > 0) {
        node.dependencies.forEach((dep, idx) => {
          renderDep(
            dep,
            resolved,
            requestedSkills,
            alreadyInstalled,
            idx === node.dependencies.length - 1,
            '  ',
            lines
          );
        });
      }
    }
  }

  if (newTransitiveDeps.length > 0) {
    lines.push('');
    lines.push(color.dim(`Additional dependencies: ${newTransitiveDeps.join(', ')}`));
  }

  p.note(lines.join('\n'), 'Installation Preview');
}
