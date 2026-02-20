import * as p from '@clack/prompts';
import color from 'picocolors';
import { ModelDetector, ProjectDetector } from '../core';

export async function listCommand() {
  p.intro(color.bgCyan(color.black(' ai-agents-skills ')));

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
  const installedModels = modelDetector.detectInstalledModels(project.rootPath);

  const skillLines = installedSkills
    .sort()
    .map((skill) => `${color.green('✓')} ${skill}`)
    .join('\n');
  p.note(skillLines, `📦 Installed Skills (${installedSkills.length} total)`);

  const modelLines = installedModels
    .map((modelId) => {
      const info = modelDetector.getModelInfo(project.rootPath, modelId);
      return info ? `${color.green('✓')} ${info.name}` : `${color.green('✓')} ${modelId}`;
    })
    .join('\n');
  p.note(modelLines, `🤖 Models (${installedModels.length} total)`);

  p.outro(color.dim(`Installed in: ${projectDetector.getSkillsDir(project.rootPath)}`));
}
