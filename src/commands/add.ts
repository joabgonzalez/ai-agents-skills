import * as p from '@clack/prompts';
import color from 'picocolors';
import * as path from 'path';
import * as fs from 'fs';
import {
  RepositoryManager,
  ProjectDetector,
  ModelDetector,
  DependencyResolver,
  Installer
} from '../core';
import { logger } from '../utils';
import { RemoteSkillSource } from '../core/skill-source';

export interface AddOptions {
  preset?: string;
  skill?: string;
  models?: string;
  dryRun?: boolean;
}

export async function addCommand(source: string, options: AddOptions) {
  p.intro(color.bgCyan(color.black(' ai-agents-skills ')));

  // 1. Fetch repository
  const repoManager = new RepositoryManager();
  const s = p.spinner();

  s.start(`Fetching repository: ${source}`);
  const repo = await repoManager.fetchRepository(source);
  s.stop(`Repository cached at: ${repo.cachePath}`);

  // 2. Detect project
  const projectDetector = new ProjectDetector();
  const project = await projectDetector.detectProject();

  console.log();
  console.log(color.cyan(`Project detected: ${project.rootPath}`));
  console.log(color.dim(`Type: ${project.type}`));

  // 3. Detect or select models
  const modelDetector = new ModelDetector();
  const installedModels = modelDetector.detectInstalledModels(project.rootPath);

  let selectedModels: string[];

  if (options.models) {
    selectedModels = options.models.split(',').map(m => m.trim());
  } else if (installedModels.length > 0) {
    // Interactive selection with detected models pre-selected
    const allModels = Object.keys(modelDetector.getAllModelsInfo(project.rootPath).reduce((acc, m) => {
      acc[m.id] = m.name;
      return acc;
    }, {} as Record<string, string>));

    const selected = await p.multiselect({
      message: 'Select AI models to install skills for:',
      options: allModels.map(id => ({
        value: id,
        label: modelDetector.getModelInfo(project.rootPath, id)!.name,
        hint: installedModels.includes(id) ? '(detected)' : ''
      })),
      initialValues: installedModels.length > 0 ? installedModels : ['claude'],
      required: true
    });

    if (p.isCancel(selected)) {
      p.cancel('Installation cancelled');
      process.exit(0);
    }

    selectedModels = selected as string[];
  } else {
    selectedModels = ['claude']; // Default
  }

  // 4. Determine what to install
  let skillsToInstall: string[] = [];
  let presetInfo: any = null;

  if (options.preset) {
    // Install preset
    presetInfo = await repoManager.getPreset(repo.cachePath, options.preset);

    if (!presetInfo) {
      p.cancel(`Preset not found: ${options.preset}`);
      process.exit(1);
    }

    skillsToInstall = presetInfo.skills;
    console.log();
    console.log(color.green(`Preset: ${presetInfo.name}`));
    console.log(color.dim(presetInfo.description));
  } else if (options.skill) {
    // Install specific skill
    skillsToInstall = [options.skill];
  } else {
    // Interactive mode
    const choice = await p.select({
      message: 'What would you like to install?',
      options: [
        { value: 'preset', label: 'Agent Preset (with AGENTS.md)' },
        { value: 'skills', label: 'Individual Skills' }
      ]
    });

    if (p.isCancel(choice)) {
      p.cancel('Installation cancelled');
      process.exit(0);
    }

    if (choice === 'preset') {
      // Select preset
      const presets = await repoManager.listPresets(repo.cachePath);

      if (presets.length === 0) {
        p.cancel('No presets found in repository');
        process.exit(1);
      }

      const selectedPreset = await p.select({
        message: 'Select agent preset:',
        options: presets.map(preset => ({
          value: preset.id,
          label: preset.name,
          hint: `${preset.skills.length} skills`
        }))
      });

      if (p.isCancel(selectedPreset)) {
        p.cancel('Installation cancelled');
        process.exit(0);
      }

      presetInfo = presets.find(p => p.id === selectedPreset);
      skillsToInstall = presetInfo!.skills;
    } else {
      // Select skills
      const availableSkills = repoManager.listSkills(repo.cachePath);

      if (availableSkills.length === 0) {
        p.cancel('No skills found in repository');
        process.exit(1);
      }

      const selected = await p.multiselect({
        message: 'Select skills to install:',
        options: availableSkills.map(skill => ({
          value: skill,
          label: skill
        })),
        required: true
      });

      if (p.isCancel(selected)) {
        p.cancel('Installation cancelled');
        process.exit(0);
      }

      skillsToInstall = selected as string[];
    }
  }

  // 5. Resolve dependencies
  console.log();
  s.start('Resolving dependencies...');

  const skillSource = new RemoteSkillSource(repo.cachePath);
  const resolver = new DependencyResolver(skillSource);
  const resolved = resolver.buildGraph(skillsToInstall);

  s.stop(`Found ${resolved.size} skills (including dependencies)`);

  // 6. Confirm installation
  const confirm = await p.confirm({
    message: `Install ${resolved.size} skill(s) to ${selectedModels.length} model(s)?`
  });

  if (!confirm || p.isCancel(confirm)) {
    p.cancel('Installation cancelled');
    process.exit(0);
  }

  // 7. Install to .agents/skills/ (once)
  console.log();
  s.start('Copying skills to .agents/skills/...');

  const agentsSkillsDir = projectDetector.getSkillsDir(project.rootPath);
  if (!fs.existsSync(agentsSkillsDir)) {
    fs.mkdirSync(agentsSkillsDir, { recursive: true });
  }

  let copiedCount = 0;
  let skippedCount = 0;

  for (const skillName of Array.from(resolved.keys())) {
    const srcPath = path.join(repo.cachePath, 'skills', skillName);
    const dstPath = path.join(agentsSkillsDir, skillName);

    if (!fs.existsSync(dstPath)) {
      if (!options.dryRun) {
        fs.cpSync(srcPath, dstPath, { recursive: true });
      }
      copiedCount++;
    } else {
      skippedCount++;
    }
  }

  s.stop(`Copied ${copiedCount} skill(s), skipped ${skippedCount} (already exists)`);

  // 8. Create symlinks in model directories
  console.log();
  s.start('Creating symlinks...');

  const installer = new Installer(project.rootPath);
  let linkCount = 0;

  for (const modelId of selectedModels) {
    const modelDir = modelDetector.getModelDirectory(project.rootPath, modelId);
    const skillsDir = path.join(modelDir, 'skills');

    if (!fs.existsSync(skillsDir)) {
      fs.mkdirSync(skillsDir, { recursive: true });
    }

    for (const skillName of Array.from(resolved.keys())) {
      const symlinkSrc = path.relative(
        skillsDir,
        path.join(agentsSkillsDir, skillName)
      );
      const symlinkDst = path.join(skillsDir, skillName);

      if (!fs.existsSync(symlinkDst) && !options.dryRun) {
        fs.symlinkSync(symlinkSrc, symlinkDst, 'dir');
        linkCount++;
      }
    }
  }

  s.stop(`Created ${linkCount} symlink(s)`);

  // 9. Copy AGENTS.md if preset
  if (presetInfo && !options.dryRun) {
    const agentsSrc = path.join(presetInfo.path, 'AGENTS.md');
    const agentsDst = path.join(project.rootPath, 'AGENTS.md');

    if (!fs.existsSync(agentsDst)) {
      fs.copyFileSync(agentsSrc, agentsDst);
      console.log();
      console.log(color.green(`✓ Copied AGENTS.md for preset: ${presetInfo.name}`));
    }
  }

  // 10. Success
  console.log();
  p.outro(color.green(`✓ Successfully installed ${resolved.size} skill(s) to ${selectedModels.length} model(s)!`));

  if (options.dryRun) {
    console.log();
    console.log(color.yellow('DRY RUN - No changes were made'));
  }
}
