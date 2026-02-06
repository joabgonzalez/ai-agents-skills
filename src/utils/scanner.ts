import path from 'path';
import { exists, isDirectory, isSymlink, readDir } from './fs';
import { SkillParser } from '../core/skill-parser';

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
 * Scanner - Discover installed skills by scanning directories (Vercel Skills style)
 * No registry needed - just scan the filesystem
 */
export class Scanner {
  /**
   * Scan a model directory for installed skills
   */
  static scanModelDirectory(modelDir: string): InstalledSkill[] {
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

      // Check if it's a directory or symlink
      if (!exists(skillPath)) continue;

      installed.push({
        name: entry,
        path: skillPath,
        isSymlink: isSymlink(skillPath),
        version: this.tryGetVersion(skillPath),
      });
    }

    return installed;
  }

  /**
   * Scan all model directories in base path
   */
  static scanAllModels(basePath: string, modelDirs: string[]): Map<string, InstalledSkill[]> {
    const results = new Map<string, InstalledSkill[]>();

    for (const modelDir of modelDirs) {
      const fullPath = path.join(basePath, modelDir);
      if (exists(fullPath) && isDirectory(fullPath)) {
        const skills = this.scanModelDirectory(fullPath);
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
  static isSkillInstalled(basePath: string, skillName: string, modelDirs: string[]): boolean {
    for (const modelDir of modelDirs) {
      const skillPath = path.join(basePath, modelDir, 'skills', skillName);
      if (exists(skillPath)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get all unique installed skill names across all models
   */
  static getInstalledSkillNames(basePath: string, modelDirs: string[]): string[] {
    const allSkills = this.scanAllModels(basePath, modelDirs);
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
  private static tryGetVersion(skillPath: string): string | undefined {
    try {
      // If it's a symlink, resolve it first
      const skillMdPath = path.join(skillPath, 'SKILL.md');
      if (!exists(skillMdPath)) {
        return undefined;
      }

      const version = SkillParser.extractVersion(skillMdPath);
      return version;
    } catch {
      return undefined;
    }
  }
}
