import * as path from 'path';
import { SkillParser, SkillMetadata } from './skill-parser';
import { exists, isFile, readDir } from '../utils/fs';

/**
 * Abstraction for skill source (local filesystem vs remote cached repo)
 */
export interface SkillSource {
  /**
   * Check if skill exists
   */
  exists(skillName: string): boolean;

  /**
   * Get path to skill's SKILL.md file
   */
  getSkillPath(skillName: string): string;

  /**
   * List all available skills
   */
  listSkills(): string[];

  /**
   * Get skill metadata
   */
  getSkillMetadata(skillName: string): SkillMetadata;
}

/**
 * Local filesystem implementation (current behavior)
 * Reads skills from baseDir/skills/ directory
 */
export class LocalSkillSource implements SkillSource {
  private skillsDir: string;

  constructor(private baseDir: string) {
    this.skillsDir = path.join(baseDir, 'skills');
  }

  exists(skillName: string): boolean {
    const skillPath = this.getSkillPath(skillName);
    return exists(skillPath) && isFile(skillPath);
  }

  getSkillPath(skillName: string): string {
    return path.join(this.skillsDir, skillName, 'SKILL.md');
  }

  listSkills(): string[] {
    if (!exists(this.skillsDir)) {
      return [];
    }

    const entries = readDir(this.skillsDir);
    const skills: string[] = [];

    for (const entry of entries) {
      // Skip hidden files and non-directories
      if (entry.startsWith('.')) continue;

      const skillPath = path.join(this.skillsDir, entry);
      const skillMdPath = path.join(skillPath, 'SKILL.md');

      // Check if SKILL.md exists
      if (exists(skillMdPath) && isFile(skillMdPath)) {
        skills.push(entry);
      }
    }

    return skills;
  }

  getSkillMetadata(skillName: string): SkillMetadata {
    const skillPath = this.getSkillPath(skillName);
    return SkillParser.parseSkillFile(skillPath);
  }
}

/**
 * Remote cached repository implementation (new npx behavior)
 * Reads skills from cached repo directory
 */
export class RemoteSkillSource implements SkillSource {
  private skillsDir: string;

  constructor(private cacheDir: string) {
    this.skillsDir = path.join(cacheDir, 'skills');
  }

  exists(skillName: string): boolean {
    const skillPath = this.getSkillPath(skillName);
    return exists(skillPath) && isFile(skillPath);
  }

  getSkillPath(skillName: string): string {
    return path.join(this.skillsDir, skillName, 'SKILL.md');
  }

  listSkills(): string[] {
    if (!exists(this.skillsDir)) {
      return [];
    }

    const entries = readDir(this.skillsDir);
    const skills: string[] = [];

    for (const entry of entries) {
      // Skip hidden files and non-directories
      if (entry.startsWith('.')) continue;

      const skillPath = path.join(this.skillsDir, entry);
      const skillMdPath = path.join(skillPath, 'SKILL.md');

      // Check if SKILL.md exists
      if (exists(skillMdPath) && isFile(skillMdPath)) {
        skills.push(entry);
      }
    }

    return skills;
  }

  getSkillMetadata(skillName: string): SkillMetadata {
    const skillPath = this.getSkillPath(skillName);
    return SkillParser.parseSkillFile(skillPath);
  }
}
