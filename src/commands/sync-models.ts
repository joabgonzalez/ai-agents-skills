import * as p from '@clack/prompts';
import color from 'picocolors';
import * as path from 'path';
import * as fs from 'fs';
import { ProjectDetector, ModelDetector } from '../core';

export interface SyncOptions {
  addModels?: string;
}

export async function syncModelsCommand(options: SyncOptions) {
  p.intro(color.bgCyan(color.black(' ai-agents-skills ')));

  // 1. Detect project
  const projectDetector = new ProjectDetector();
  const project = await projectDetector.detectProject();

  console.log(color.cyan(`Project: ${project.rootPath}`));
  console.log();

  // 2. Get installed skills
  const installedSkills = projectDetector.getInstalledSkills(project.rootPath);

  if (installedSkills.length === 0) {
    p.cancel('No skills installed. Run `ai-agents-skills add <repo>` first.');
    process.exit(1);
  }

  // 3. Get models to add
  const modelDetector = new ModelDetector();
  const currentModels = modelDetector.detectInstalledModels(project.rootPath);

  let newModels: string[];

  if (options.addModels) {
    newModels = options.addModels.split(',').map(m => m.trim());
  } else {
    // Interactive selection
    const allModels = Object.keys(modelDetector.getAllModelsInfo(project.rootPath).reduce((acc, m) => {
      acc[m.id] = m.name;
      return acc;
    }, {} as Record<string, string>));

    const availableModels = allModels.filter(id => !currentModels.includes(id));

    if (availableModels.length === 0) {
      p.outro(color.yellow('All supported models already have skills installed'));
      return;
    }

    const selected = await p.multiselect({
      message: 'Select models to add:',
      options: availableModels.map(id => ({
        value: id,
        label: modelDetector.getModelInfo(project.rootPath, id)!.name
      })),
      required: true
    });

    if (p.isCancel(selected)) {
      p.cancel('Sync cancelled');
      process.exit(0);
    }

    newModels = selected as string[];
  }

  // 4. Create symlinks for new models
  console.log();
  const s = p.spinner();
  s.start(`Adding ${installedSkills.length} skills to ${newModels.length} model(s)...`);

  const agentsSkillsDir = projectDetector.getSkillsDir(project.rootPath);
  let linkCount = 0;

  for (const modelId of newModels) {
    const modelDir = modelDetector.getModelDirectory(project.rootPath, modelId);
    const skillsDir = path.join(modelDir, 'skills');

    if (!fs.existsSync(skillsDir)) {
      fs.mkdirSync(skillsDir, { recursive: true });
    }

    for (const skillName of installedSkills) {
      const symlinkSrc = path.relative(
        skillsDir,
        path.join(agentsSkillsDir, skillName)
      );
      const symlinkDst = path.join(skillsDir, skillName);

      if (!fs.existsSync(symlinkDst)) {
        fs.symlinkSync(symlinkSrc, symlinkDst, 'dir');
        linkCount++;
      }
    }
  }

  s.stop(`Created ${linkCount} symlink(s)`);

  console.log();
  p.outro(color.green(`✓ Successfully added ${installedSkills.length} skill(s) to ${newModels.length} model(s)!`));
}
