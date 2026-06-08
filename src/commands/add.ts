import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import color from 'picocolors';
import {
  DependencyResolver,
  Installer,
  ModelDetector,
  ProjectDetector,
  RepositoryManager,
} from '../core';
import type { PresetInfo } from '../core/repository';
import { FileSystemSkillSource } from '../core/skill-source';
import { DEDICATED_MODELS, UNIVERSAL_MODELS } from '../shared/constants';
import { showDependencyPreview } from '../utils/dependency-preview';
import { runInstallLoop, showInstallOutro } from '../utils/install-helpers';
import { LogLevel, logger } from '../utils/logger';
import { showFirstRunNotice, trackInstall } from '../utils/telemetry';

const DEFAULT_REPO = 'joabgonzalez/ai-agents-skills';

export interface AddOptions {
  local?: boolean;
  skill?: string[];
  preset?: string;
  model?: string[];
  dryRun?: boolean;
}

/**
 * Checks whether --local mode is valid in the current directory.
 * Requires: ./skills/ dir exists AND package.json name === "ai-agents-skills"
 */
function isLocalModeAvailable(cwd: string): boolean {
  const skillsDir = path.join(cwd, 'skills');
  if (!fs.existsSync(skillsDir)) return false;

  const pkgPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.name === 'ai-agents-skills';
  } catch {
    return false;
  }
}

export async function addCommand(options: AddOptions) {
  p.intro(color.bgCyan(color.black(' ⚡ AGENTS SKILLS ')));
  showFirstRunNotice();

  const cwd = process.cwd();

  // 1. Resolve skill source
  let skillsRootDir: string;
  let installType: 'local' | 'external';

  if (options.local) {
    if (!isLocalModeAvailable(cwd)) {
      p.cancel(
        '--local requires running from the ai-agents-skills repository root (./skills/ dir + package.json name must be "ai-agents-skills")'
      );
      process.exit(1);
    }
    skillsRootDir = cwd;
    installType = 'local';
    p.log.info(color.dim('Mode: local'));
  } else {
    const repoManager = new RepositoryManager();
    const s = p.spinner();
    s.start(`Fetching repository: ${DEFAULT_REPO}`);
    const repo = await repoManager.fetchRepository(DEFAULT_REPO);
    s.stop('Repository ready');
    skillsRootDir = repo.cachePath;
    installType = 'external';
  }

  // 2. Detect project
  const projectDetector = new ProjectDetector();
  const project = await projectDetector.detectProject();
  p.log.info(`Project: ${color.cyan(project.rootPath)} ${color.dim(`(${project.type})`)}`);

  // 3. Early validation: validate flags before interactive prompts
  const skillSource = new FileSystemSkillSource(skillsRootDir);
  const modelDetector = new ModelDetector();

  if (options.preset) {
    const repoManagerCheck = new RepositoryManager();
    const testPreset = await repoManagerCheck.getPreset(skillsRootDir, options.preset);
    if (!testPreset) {
      p.cancel(`Preset not found: ${options.preset}`);
      process.exit(1);
    }
  }

  if (options.skill && options.skill.length > 0) {
    const availableSkills = skillSource.listSkills();
    const alreadyInstalled = projectDetector.getInstalledSkills(project.rootPath);
    const unknown = options.skill.filter((s) => !availableSkills.includes(s));
    const alreadyDone = options.skill.filter(
      (s) => availableSkills.includes(s) && alreadyInstalled.includes(s)
    );
    for (const s of unknown) {
      p.log.warn(`'${s}': skill not found in repository`);
    }
    for (const s of alreadyDone) {
      p.log.warn(`'${s}': already installed — use ${color.cyan(`sync --skill ${s}`)} to update`);
    }
    const validSkills = options.skill.filter(
      (s) => !unknown.includes(s) && !alreadyDone.includes(s)
    );
    if (validSkills.length === 0) {
      p.cancel('Nothing to install');
      process.exit(0);
    }
    if (validSkills.length < options.skill.length) {
      options.skill = validSkills;
    }
  }

  if (options.model && options.model.length > 0) {
    const allModelsCheck = modelDetector.getAllModelsInfo(project.rootPath);
    const knownIds = new Set(allModelsCheck.map((m) => m.id));
    const unknown = options.model.filter((m) => !knownIds.has(m));
    for (const m of unknown) {
      p.log.warn(
        `'${m}': unknown model — supported dedicated models: ${Array.from(knownIds).join(', ')}`
      );
    }
    const validSpecified = options.model.filter((m) => knownIds.has(m));
    if (validSpecified.length === 0) {
      p.cancel('No valid models specified');
      process.exit(1);
    }
    // Merge with already-installed models — same behavior as interactive flow
    const installedModels = modelDetector.detectInstalledModels(project.rootPath);
    const allTargets = [...new Set([...installedModels, ...validSpecified])];
    const targetNames = allTargets
      .map((id) => {
        const name = allModelsCheck.find((m) => m.id === id)?.name ?? id;
        return installedModels.includes(id) ? `${name} ${color.dim('(configured)')}` : name;
      })
      .join(', ');
    p.log.info(`Installing to: ${color.dim(targetNames)}`);
    options.model = allTargets;
  }

  // 4. Model selection
  // Universal models (.agents/skills/) are always covered — never need to be selected.
  // OpenClaw (skills/) is auto-covered in local mode — excluded from prompts there.
  // Only other dedicated-directory models (claude, antigravity) appear in prompts.

  const agentsExist = fs.existsSync(projectDetector.getSkillsDir(project.rootPath));
  const universalIcon = agentsExist ? color.green('✓') : color.green('○');
  const universalHeader = agentsExist
    ? `${color.green('✓')} Universal models ${color.dim('(.agents/skills/) — 8 agents covered')}`
    : `Installing universal models ${color.dim('(.agents/skills/) — covers 8 agents automatically')}`;

  p.log.info(universalHeader);
  for (const m of UNIVERSAL_MODELS) {
    console.log(`${color.dim('│')}  ${universalIcon} ${m.label}`);
  }

  // In local mode OpenClaw is natively supported — skills/ already exists in this repo
  if (installType === 'local') {
    p.log.info(
      `${color.green('✓')} OpenClaw ${color.dim('(skills/) — supported by default in local mode')}`
    );
  }

  let selectedModels: string[];

  // Models eligible for prompts: exclude openclaw in local mode (auto-covered)
  const isOpenClawAuto = installType === 'local';

  if (options.model && options.model.length > 0) {
    selectedModels = options.model.filter((id) => !(isOpenClawAuto && id === 'openclaw'));

    // Show dedicated models from --model flag
    const allModels = modelDetector.getAllModelsInfo(project.rootPath);
    const installedModels = modelDetector.detectInstalledModels(project.rootPath);
    for (const id of selectedModels) {
      const cfg = DEDICATED_MODELS[id];
      const relPath = cfg ? `${cfg.directory}/skills/` : id;
      const icon = installedModels.includes(id) ? color.green('✓') : color.green('○');
      const name = allModels.find((m) => m.id === id)?.name ?? id;
      p.log.info(`${icon} ${name} ${color.dim(`(${relPath})`)}`);
    }
  } else {
    const installedModels = modelDetector
      .detectInstalledModels(project.rootPath)
      .filter((id) => !(isOpenClawAuto && id === 'openclaw'));
    const allModels = modelDetector
      .getAllModelsInfo(project.rootPath)
      .filter((m) => !(isOpenClawAuto && m.id === 'openclaw'));
    const newModels = allModels.filter((m) => !installedModels.includes(m.id));

    if (installedModels.length > 0) {
      // Show already-configured dedicated models as static info
      for (const id of installedModels) {
        const cfg = DEDICATED_MODELS[id];
        const relPath = cfg ? `${cfg.directory}/skills/` : id;
        p.log.info(`${color.green('✓')} ${cfg?.name ?? id} ${color.dim(`(${relPath})`)}`);
      }

      if (newModels.length > 0) {
        // Let user optionally add unconfigured dedicated models
        const additional = await p.multiselect({
          message: 'Also install to additional dedicated models? (optional — press Enter to skip)',
          options: newModels.map((m) => {
            const cfg = DEDICATED_MODELS[m.id];
            return { value: m.id, label: m.name, hint: cfg ? `${cfg.directory}/skills/` : m.id };
          }),
          required: false,
        });

        if (p.isCancel(additional)) {
          p.cancel('Installation cancelled');
          process.exit(0);
        }

        selectedModels = [...installedModels, ...(additional as string[])];
      } else {
        selectedModels = installedModels;
      }
    } else {
      // No dedicated models configured yet — prompt (optional)
      const selected = await p.multiselect({
        message: 'Install to dedicated model directories? (optional — press Enter to skip)',
        options: allModels.map((m) => {
          const cfg = DEDICATED_MODELS[m.id];
          return { value: m.id, label: m.name, hint: cfg ? `${cfg.directory}/skills/` : m.id };
        }),
        required: false,
      });

      if (p.isCancel(selected)) {
        p.cancel('Installation cancelled');
        process.exit(0);
      }

      selectedModels = selected as string[];
    }
  }

  // 5. Skill selection
  const resolver = new DependencyResolver(skillSource);
  let skillsToInstall: string[] = [];
  let presetInfo: PresetInfo | null = null;

  if (options.preset) {
    const repoManager = new RepositoryManager();
    presetInfo = await repoManager.getPreset(skillsRootDir, options.preset);
    if (!presetInfo) {
      p.cancel(`Preset not found: ${options.preset}`);
      process.exit(1);
    }
    skillsToInstall = presetInfo.skills;
    p.log.info(`Preset: ${color.green(presetInfo.name)}`);
    p.log.message(color.dim(presetInfo.description));
  } else if (options.skill && options.skill.length > 0) {
    skillsToInstall = options.skill;
  } else if (options.local) {
    // Local mode: try AGENTS.md first, fallback to interactive
    const agentsMdPath = path.join(cwd, 'AGENTS.md');
    if (fs.existsSync(agentsMdPath)) {
      const fromAgentsMd = DependencyResolver.parseAgentsMd(agentsMdPath);
      p.log.info(`Skills from AGENTS.md: ${color.cyan(fromAgentsMd.length.toString())}`);
      const alreadyInstalled = projectDetector.getInstalledSkills(project.rootPath);
      const notYetInstalled = fromAgentsMd.filter((s) => !alreadyInstalled.includes(s));
      if (notYetInstalled.length === 0) {
        // All AGENTS.md skills already installed — let user pick additional ones
        p.log.info(color.dim('All AGENTS.md skills installed. Select additional skills:'));
        skillsToInstall = await selectSkillsInteractive(
          projectDetector,
          project.rootPath,
          skillSource
        );
      } else {
        skillsToInstall = fromAgentsMd;
      }
    } else {
      skillsToInstall = await selectSkillsInteractive(
        projectDetector,
        project.rootPath,
        skillSource
      );
    }
  } else {
    // Remote interactive
    skillsToInstall = await selectSkillsOrPreset(
      projectDetector,
      project.rootPath,
      skillSource,
      skillsRootDir
    );
  }

  // 5. Resolve dependencies
  const s2 = p.spinner();
  s2.start('Resolving dependencies...');
  const resolved = resolver.buildGraph(skillsToInstall);

  // Validate graph (both modes)
  const validation = resolver.validateGraph(resolved);
  if (!validation.valid) {
    s2.stop('Validation failed');
    if (validation.cycles) {
      for (const cycle of validation.cycles) {
        p.log.error(`Circular dependency: ${cycle.formatted}`);
      }
    }
    for (const dep of validation.missing) {
      p.log.error(`Missing dependency: ${dep}`);
    }
    p.cancel('Installation cancelled due to validation errors');
    process.exit(1);
  }

  // Filter out already-installed skills — add only installs NEW skills; sync updates existing ones
  const alreadyInstalled = projectDetector.getInstalledSkills(project.rootPath);
  const fullInstallOrder = resolver.getInstallationOrder(resolved);
  const installOrder = fullInstallOrder.filter((s) => !alreadyInstalled.includes(s));
  const skippedAlready = fullInstallOrder.filter((s) => alreadyInstalled.includes(s));

  // Adjust the requested list to only show truly new top-level skills in the preview
  const newRequestedSkills = skillsToInstall.filter((s) => !alreadyInstalled.includes(s));

  s2.stop(
    `Found ${installOrder.length} new skill(s) to install${skippedAlready.length > 0 ? ` (${skippedAlready.length} already installed)` : ''}`
  );

  if (installOrder.length === 0) {
    p.note(
      skippedAlready.join(', '),
      'All selected skills are already installed — use `sync` to update'
    );
    p.outro(color.yellow('Nothing to install'));
    return;
  }

  if (skippedAlready.length > 0) {
    p.log.info(`Already installed (skipping): ${color.dim(skippedAlready.join(', '))}`);
  }

  let previewSkills: string[];
  if (newRequestedSkills.length > 0) {
    previewSkills = newRequestedSkills;
  } else {
    // All requested skills are already installed but some deps are missing.
    // Show the installed parents that have the new dep so the user understands the context.
    const parentsWithNewDeps = skillsToInstall.filter((s) => {
      if (!alreadyInstalled.includes(s)) return false;
      const node = resolved.get(s);
      return node?.dependencies.some((dep) => installOrder.includes(dep)) ?? false;
    });
    previewSkills = parentsWithNewDeps.length > 0 ? parentsWithNewDeps : installOrder;
  }
  showDependencyPreview(previewSkills, resolved, alreadyInstalled);

  // 6. Confirm (always shown; dry-run proceeds but makes no changes)
  const modelSuffix =
    selectedModels.length > 0 ? ` + ${selectedModels.length} dedicated model(s)` : '';
  const confirmInstall = await p.confirm({
    message: `Install ${installOrder.length} skill(s) to .agents/skills/${modelSuffix}?${options.dryRun ? color.dim(' [dry-run]') : ''}`,
    initialValue: true,
  });
  if (!confirmInstall || p.isCancel(confirmInstall)) {
    p.cancel('Installation cancelled');
    process.exit(0);
  }

  // 7. Prepare directories (skip in dry-run)
  const agentsSkillsDir = projectDetector.getSkillsDir(project.rootPath);
  if (!options.dryRun) {
    if (!fs.existsSync(agentsSkillsDir)) {
      fs.mkdirSync(agentsSkillsDir, { recursive: true });
    }

    for (const modelId of selectedModels) {
      const modelDir = modelDetector.getModelDirectory(project.rootPath, modelId);
      const skillsDir = path.join(modelDir, 'skills');
      if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
      }
    }
  }

  // 8. Install
  if (options.dryRun) {
    showDryRunPaths(installOrder, project.rootPath, selectedModels, modelDetector, installType);
  }

  p.log.message(color.bold(options.dryRun ? 'Skills (dry run):' : 'Installing skills:'));
  // Build direct new deps first, then compute full transitive chain for display
  const directDeps = new Map<string, string[]>();
  for (const skillName of installOrder) {
    const node = resolved.get(skillName);
    if (node && node.dependencies.length > 0) {
      directDeps.set(
        skillName,
        node.dependencies.filter((d) => !alreadyInstalled.includes(d))
      );
    }
  }
  function getDepChain(name: string, visited = new Set<string>()): string[] {
    if (visited.has(name)) return [];
    visited.add(name);
    const chain: string[] = [];
    for (const dep of directDeps.get(name) ?? []) {
      if (!visited.has(dep)) {
        chain.push(dep);
        chain.push(...getDepChain(dep, visited));
      }
    }
    return chain;
  }
  const skillDeps = new Map<string, string[]>();
  for (const skillName of installOrder) {
    const chain = getDepChain(skillName);
    if (chain.length > 0) skillDeps.set(skillName, chain);
  }

  const installer =
    installType === 'local'
      ? new Installer(skillsRootDir)
      : new Installer(skillsRootDir, project.rootPath);
  const prevLogLevel = logger.getLevel();
  logger.setLevel(LogLevel.SILENT);

  const topLevelSkills = new Set(newRequestedSkills);
  const counts = await runInstallLoop(
    installOrder,
    skillDeps,
    async (skillName) => {
      let installedToAny = false;

      const universalInstalled = await installer.installToAgentsSkills(
        skillName,
        installType,
        options.dryRun ?? false
      );
      if (universalInstalled) installedToAny = true;

      for (const modelId of selectedModels) {
        const modelDir = modelDetector.getModelDirectory(project.rootPath, modelId);
        try {
          const wasInstalled = await installer.installSkill(
            skillName,
            modelDir,
            installType,
            options.dryRun ?? false
          );
          if (wasInstalled) installedToAny = true;
        } catch {
          // Continue with other models
        }
      }

      return installedToAny;
    },
    topLevelSkills
  );

  logger.setLevel(prevLogLevel);

  // 9. Copy AGENTS.md if preset
  if (presetInfo && !options.dryRun) {
    const agentsSrc = path.join(presetInfo.path, 'AGENTS.md');
    const agentsDst = path.join(project.rootPath, 'AGENTS.md');
    if (fs.existsSync(agentsSrc) && !fs.existsSync(agentsDst)) {
      fs.copyFileSync(agentsSrc, agentsDst);
      p.log.success(`Copied AGENTS.md for preset: ${presetInfo.name}`);
    }
  }

  showInstallOutro(counts, selectedModels, options.dryRun ?? false);

  await trackInstall({
    skills: installOrder,
    presetName: presetInfo?.name ?? null,
    modelCount: selectedModels.length,
    dryRun: options.dryRun ?? false,
  });
}

function showDryRunPaths(
  skillNames: string[],
  rootPath: string,
  modelIds: string[],
  modelDetector: ModelDetector,
  installType: 'local' | 'external'
): void {
  const agentsSkillsBase = path.join(rootPath, '.agents', 'skills');
  const lines: string[] = [];

  for (const skillName of skillNames) {
    lines.push(`${color.cyan('◆')} ${color.bold(skillName)}`);

    const agentsEntry = path.join(agentsSkillsBase, skillName);
    const agentsRel = path.relative(rootPath, agentsEntry);

    if (installType === 'local') {
      const sourceRel = path.join('skills', skillName);
      lines.push(
        `  ${color.dim(`${sourceRel}/`)} ${color.dim('→')} ${color.dim(`${agentsRel}/`)} ${color.dim('(symlink)')}`
      );
    } else {
      lines.push(`  ${color.dim(`${agentsRel}/`)} ${color.dim('(copy from cache)')}`);
    }

    for (const modelId of modelIds) {
      const modelDir = modelDetector.getModelDirectory(rootPath, modelId);
      const modelEntry = path.join(modelDir, 'skills', skillName);
      const modelRel = path.relative(rootPath, modelEntry);
      const agentsTarget = path.relative(path.dirname(modelEntry), agentsEntry);
      lines.push(
        `  ${color.dim(modelRel)} ${color.dim('→')} ${color.dim(agentsTarget)} ${color.dim('(symlink)')}`
      );
    }

    lines.push('');
  }

  p.note(lines.join('\n').trimEnd(), 'Paths that would be created');
}

async function selectSkillsInteractive(
  projectDetector: ProjectDetector,
  rootPath: string,
  skillSource: FileSystemSkillSource
): Promise<string[]> {
  const availableSkills = skillSource.listSkills();
  if (availableSkills.length === 0) {
    p.cancel('No skills found in repository');
    process.exit(1);
  }

  const installedSkills = projectDetector.getInstalledSkills(rootPath);
  const notInstalled = availableSkills.filter((s) => !installedSkills.includes(s));

  if (notInstalled.length === 0) {
    p.cancel('All available skills are already installed');
    process.exit(0);
  }

  if (installedSkills.length > 0) {
    p.log.info(`Already installed: ${color.dim(installedSkills.join(', '))}`);
  }

  const selected = await p.multiselect({
    message: `Select skills to install (${notInstalled.length} available):`,
    options: notInstalled.map((skill) => ({ value: skill, label: skill })),
    required: true,
  });

  if (p.isCancel(selected)) {
    p.cancel('Installation cancelled');
    process.exit(0);
  }

  return selected as string[];
}

async function selectSkillsOrPreset(
  projectDetector: ProjectDetector,
  rootPath: string,
  skillSource: FileSystemSkillSource,
  skillsRootDir: string
): Promise<string[]> {
  const choice = await p.select({
    message: 'What would you like to install?',
    options: [
      { value: 'skills', label: 'Skills' },
      { value: 'preset', label: 'Project Starter Preset (AGENTS.md + skills bundle)' },
    ],
  });

  if (p.isCancel(choice)) {
    p.cancel('Installation cancelled');
    process.exit(0);
  }

  if (choice === 'preset') {
    const repoManager = new RepositoryManager();
    const presets = await repoManager.listPresets(skillsRootDir);

    if (presets.length === 0) {
      p.cancel('No presets found in repository');
      process.exit(1);
    }

    const selectedPreset = await p.select({
      message: 'Select agent preset:',
      options: presets.map((preset) => ({
        value: preset.id,
        label: preset.name,
        hint: `${preset.skills.length} skills`,
      })),
    });

    if (p.isCancel(selectedPreset)) {
      p.cancel('Installation cancelled');
      process.exit(0);
    }

    const preset = presets.find((pr) => pr.id === selectedPreset);
    if (!preset) {
      p.cancel('Installation cancelled');
      process.exit(0);
    }
    return preset.skills;
  }

  return selectSkillsInteractive(projectDetector, rootPath, skillSource);
}
