import fs from 'node:fs';
import * as p from '@clack/prompts';
import color from 'picocolors';
import { ModelDetector, ProjectDetector } from '../core';
import {
  DEDICATED_MODELS,
  HIDDEN_UNIVERSAL_MODELS,
  UNIVERSAL_MODELS,
  VISIBLE_UNIVERSAL_MODELS,
} from '../shared/constants';

export async function listCommand() {
  p.intro(color.bgCyan(color.black(' ⚡ AGENTS SKILLS ')));

  // 1. Detect project
  const projectDetector = new ProjectDetector();
  const project = await projectDetector.detectProject();

  p.log.info(`Project: ${color.cyan(project.rootPath)}`);

  // 2. Get installed skills
  const installedSkills = projectDetector.getInstalledSkills(project.rootPath);

  if (installedSkills.length === 0) {
    p.log.warn('No skills installed');
    p.outro('Run `ai-agents-skills add` to install skills');
    return;
  }

  // 3. Detect models
  const modelDetector = new ModelDetector();
  const installedDedicated = modelDetector.detectInstalledModels(project.rootPath);
  const agentsInstalled = fs.existsSync(projectDetector.getSkillsDir(project.rootPath));

  // Skills note
  const skillLines = installedSkills
    .sort()
    .map((skill) => `${color.green('✓')} ${skill}`)
    .join('\n');
  p.note(skillLines, `📦 Installed Skills (${installedSkills.length} total)`);

  // Models note — universal always first, then dedicated
  const totalUniversal = UNIVERSAL_MODELS.length;
  const universalHeader = agentsInstalled
    ? `${color.green('✓')} Universal models ${color.dim(`(.agents/skills/) — ${totalUniversal} agents covered`)}`
    : `${color.dim('○')} Universal models ${color.dim('(.agents/skills/) — not yet installed')}`;
  const visibleLines = VISIBLE_UNIVERSAL_MODELS.map((m) => `  ${color.green('●')} ${m.label}`);
  if (HIDDEN_UNIVERSAL_MODELS.length > 0) {
    visibleLines.push(`  ${color.dim(`...and ${HIDDEN_UNIVERSAL_MODELS.length} more`)}`);
  }
  const universalLines = [universalHeader, ...visibleLines].join('\n');

  const dedicatedLines = installedDedicated
    .map((id) => {
      const cfg = DEDICATED_MODELS[id];
      return `${color.green('✓')} ${cfg?.name ?? id} ${color.dim(`(${cfg?.directory ?? id}/skills/)`)}`;
    })
    .join('\n');

  const totalAgents = UNIVERSAL_MODELS.length + installedDedicated.length;
  const noteContent = dedicatedLines ? `${universalLines}\n${dedicatedLines}` : universalLines;
  p.note(noteContent, `🤖 Agent Coverage (${totalAgents} active)`);

  p.outro(color.dim(`Installed in: ${projectDetector.getSkillsDir(project.rootPath)}`));
}
