import path from 'path';
import fs from 'fs';
import { extractFrontmatter } from './yaml';

export interface SkillInfo {
  name: string;
  description: string;
  dependencies: string[];
}

/**
 * Instruction file mapping per model
 */
const INSTRUCTION_FILES: Record<string, string> = {
  'claude': 'instructions.md',
  'github-copilot': 'copilot-instructions.md',
  'copilot': 'copilot-instructions.md', // Alias for github-copilot
  'cursor': 'instructions.md',
  'gemini': 'instructions.md',
  'codex': 'instructions.md',
};

/**
 * Read skill metadata from installed skills
 * @param modelDir - Model directory path
 * @param customSkillsPath - Optional custom path to skills directory (for local mode)
 */
export function readInstalledSkills(modelDir: string, customSkillsPath?: string): SkillInfo[] {
  const skillsDir = customSkillsPath || path.join(modelDir, 'skills');

  if (!fs.existsSync(skillsDir)) {
    return [];
  }

  const skillNames = fs.readdirSync(skillsDir).filter(name => {
    const skillPath = path.join(skillsDir, name);
    return fs.statSync(skillPath).isDirectory();
  });

  const skills: SkillInfo[] = [];

  for (const skillName of skillNames) {
    const skillMdPath = path.join(skillsDir, skillName, 'SKILL.md');

    if (!fs.existsSync(skillMdPath)) {
      continue;
    }

    try {
      const frontmatter = extractFrontmatter(skillMdPath);

      if (!frontmatter) {
        console.warn(`Warning: No frontmatter found for ${skillName}`);
        continue;
      }

      skills.push({
        name: frontmatter.name || skillName,
        description: frontmatter.description || '',
        dependencies: frontmatter.metadata?.skills || []
      });
    } catch (error) {
      // Skip skills with invalid frontmatter
      console.warn(`Warning: Could not read frontmatter for ${skillName}`);
    }
  }

  return skills;
}

/**
 * Generate instruction content for a specific model
 */
export function generateInstructionContent(modelId: string, skills: SkillInfo[]): string {
  const normalizedModelId = modelId.toLowerCase();
  const isClaudeCode = normalizedModelId === 'claude';

  let content = '';

  // Header
  if (normalizedModelId === 'github-copilot' || normalizedModelId === 'copilot') {
    content += '# GitHub Copilot Instructions\n\n';
  } else if (normalizedModelId === 'claude') {
    content += '# Claude Code Skills\n\n';
  } else if (normalizedModelId === 'cursor') {
    content += '# Cursor Instructions\n\n';
  } else {
    content += `# ${modelId.charAt(0).toUpperCase() + modelId.slice(1)} Instructions\n\n`;
  }

  // Skills section
  content += `## Installed Skills (${skills.length})\n\n`;

  if (isClaudeCode) {
    content += 'Skills are automatically loaded from `./skills/`. Read the relevant skill before working on related tasks.\n\n';
  } else {
    content += 'Before making changes, read the relevant skill documentation from `./skills/`:\n\n';
  }

  // List each skill
  for (const skill of skills) {
    content += `### ${skill.name}\n\n`;

    if (skill.description) {
      content += `${skill.description}\n\n`;
    }

    if (skill.dependencies.length > 0) {
      content += `**Dependencies:** ${skill.dependencies.join(', ')}\n\n`;
    }

    content += `**Location:** \`./skills/${skill.name}/SKILL.md\`\n\n`;
  }

  // Footer with usage instructions
  content += '---\n\n';
  content += '## How to Use Skills\n\n';

  if (isClaudeCode) {
    content += 'Claude Code automatically reads skills from this directory. When working on a task, the relevant skills will be loaded based on the file type and context.\n\n';
  } else {
    content += 'When working on a specific technology or pattern:\n\n';
    content += '1. Identify the relevant skill(s) from the list above\n';
    content += '2. Read the SKILL.md file for guidance and patterns\n';
    content += '3. Follow the conventions and best practices defined in the skill\n\n';
  }

  content += '## Managing Skills\n\n';
  content += '```bash\n';
  content += '# Add a new skill\n';
  content += `npx ai-agents-skills add --skill <name> --models ${modelId}\n\n`;
  content += '# Remove a skill\n';
  content += `npx ai-agents-skills remove --skills <name> --models ${modelId}\n\n`;
  content += '# List installed skills\n';
  content += 'npx ai-agents-skills list\n';
  content += '```\n\n';

  content += `---\n\n`;
  content += `*Last updated: ${new Date().toISOString().split('T')[0]}*\n`;

  return content;
}

/**
 * Regenerate instruction file for a model directory
 * @param modelDir - Model directory path
 * @param modelId - Model ID (claude, github-copilot, etc.)
 * @param dryRun - If true, don't write the file
 * @param customSkillsPath - Optional custom path to skills (for local mode)
 */
export function regenerateInstructionFile(
  modelDir: string,
  modelId: string,
  dryRun: boolean = false,
  customSkillsPath?: string
): boolean {
  const instructionFile = INSTRUCTION_FILES[modelId.toLowerCase()];

  if (!instructionFile) {
    console.warn(`Warning: No instruction file mapping for model: ${modelId}`);
    return false;
  }

  const skills = readInstalledSkills(modelDir, customSkillsPath);

  if (skills.length === 0) {
    console.warn(`Warning: No skills found in ${modelDir}`);
    return false;
  }

  const content = generateInstructionContent(modelId, skills);
  const instructionPath = path.join(modelDir, instructionFile);

  if (!dryRun) {
    fs.writeFileSync(instructionPath, content, 'utf-8');
  }

  return true;
}
