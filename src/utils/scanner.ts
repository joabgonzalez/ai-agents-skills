import path from 'node:path';
import { extractVersion } from '../core/skill-parser';
import { exists, isDirectory, isSymlink, readDir } from './fs';

/**
 * Installed skill information
 */
export interface InstalledSkill {
  name: string;
  path: string;
  isSymlink: boolean;
  version?: string;
}

/**
 * Scan a model directory for installed skills
 */
export function scanModelDirectory(modelDir: string): InstalledSkill[] {
  const skillsDir = path.join(modelDir, 'skills');

  if (!exists(skillsDir) || !isDirectory(skillsDir)) {
    return [];
  }

  const entries = readDir(skillsDir);
  const installed: InstalledSkill[] = [];

  for (const entry of entries) {
    // Skip hidden files
    if (entry.startsWith('.')) continue;

    const skillPath = path.join(skillsDir, entry);

    // Check if it's a directory or symlink with a valid SKILL.md
    if (!exists(skillPath)) continue;
    if (!exists(path.join(skillPath, 'SKILL.md'))) continue;

    installed.push({
      name: entry,
      path: skillPath,
      isSymlink: isSymlink(skillPath),
      version: tryGetVersion(skillPath),
    });
  }

  return installed;
}

/**
 * Scan all model directories in base path
 */
export function scanAllModels(
  basePath: string,
  modelDirs: string[]
): Map<string, InstalledSkill[]> {
  const results = new Map<string, InstalledSkill[]>();

  for (const modelDir of modelDirs) {
    const fullPath = path.join(basePath, modelDir);
    if (exists(fullPath) && isDirectory(fullPath)) {
      const skills = scanModelDirectory(fullPath);
      if (skills.length > 0) {
        results.set(modelDir, skills);
      }
    }
  }

  return results;
}

/**
 * Check if a skill is installed in any model directory
 */
export function isSkillInstalled(
  basePath: string,
  skillName: string,
  modelDirs: string[]
): boolean {
  for (const modelDir of modelDirs) {
    const skillPath = path.join(basePath, modelDir, 'skills', skillName);
    if (exists(skillPath) && exists(path.join(skillPath, 'SKILL.md'))) {
      return true;
    }
  }
  return false;
}

/**
 * Get all unique installed skill names across all models
 */
export function getInstalledSkillNames(basePath: string, modelDirs: string[]): string[] {
  const allSkills = scanAllModels(basePath, modelDirs);
  const uniqueNames = new Set<string>();

  for (const skills of allSkills.values()) {
    for (const skill of skills) {
      uniqueNames.add(skill.name);
    }
  }

  return Array.from(uniqueNames).sort();
}

/**
 * Try to get skill version (returns undefined if not found)
 */
function tryGetVersion(skillPath: string): string | undefined {
  try {
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    if (!exists(skillMdPath)) {
      return undefined;
    }
    return extractVersion(skillMdPath);
  } catch {
    return undefined;
  }
}
