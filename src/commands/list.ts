import * as p from '@clack/prompts';
import color from 'picocolors';
import { ProjectDetector, ModelDetector } from '../core';

export async function listCommand() {
  p.intro(color.bgCyan(color.black(' ai-agents-skills ')));

  // 1. Detect project
  const projectDetector = new ProjectDetector();
  const project = await projectDetector.detectProject();

  console.log(color.cyan(`Project: ${project.rootPath}`));
  console.log();

  // 2. Get installed skills
  const installedSkills = projectDetector.getInstalledSkills(project.rootPath);

  if (installedSkills.length === 0) {
    console.log(color.yellow('No skills installed'));
    p.outro('Run `ai-agents-skills add <repo>` to install skills');
    return;
  }

  // 3. Detect models
  const modelDetector = new ModelDetector();
  const installedModels = modelDetector.detectInstalledModels(project.rootPath);

  console.log(color.bold(`📦 Installed Skills (${installedSkills.length} total)`));
  console.log();

  for (const skill of installedSkills.sort()) {
    console.log(`  ✓ ${skill}`);
  }

  console.log();
  console.log(color.bold(`🤖 Models (${installedModels.length} total)`));
  console.log();

  for (const modelId of installedModels) {
    const info = modelDetector.getModelInfo(project.rootPath, modelId);
    if (info) {
      console.log(`  ✓ ${info.name}`);
    }
  }

  console.log();
  p.outro(color.dim(`Installed in: ${projectDetector.getSkillsDir(project.rootPath)}`));
}
