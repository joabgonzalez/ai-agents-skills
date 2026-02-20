import path from 'node:path';
import { exists, isFile, readDir } from '../utils/fs';
import type { SkillMetadata } from './skill-parser';
import { parseSkillFile } from './skill-parser';

/**
 * Abstraction for skill source (local filesystem vs remote cached repo)
 */
export interface SkillSource {
  exists(skillName: string): boolean;
  getSkillPath(skillName: string): string;
  listSkills(): string[];
  getSkillMetadata(skillName: string): SkillMetadata;
}

/**
 * Unified skill source — reads skills from <rootDir>/skills/
 * Works for both local (CWD) and remote (cache) roots.
 */
export class FileSystemSkillSource implements SkillSource {
  private skillsDir: string;

  constructor(rootDir: string) {
    this.skillsDir = path.join(rootDir, 'skills');
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
      if (entry.startsWith('.')) continue;
      const skillMdPath = path.join(this.skillsDir, entry, 'SKILL.md');
      if (exists(skillMdPath) && isFile(skillMdPath)) {
        skills.push(entry);
      }
    }

    return skills;
  }

  getSkillMetadata(skillName: string): SkillMetadata {
    const skillPath = this.getSkillPath(skillName);
    return parseSkillFile(skillPath);
  }
}

// Backward-compatible aliases
export const LocalSkillSource = FileSystemSkillSource;
export const RemoteSkillSource = FileSystemSkillSource;
