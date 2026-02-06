import path from 'path';
import fs from 'fs';

export interface ProjectInfo {
  rootPath: string;
  type: 'node' | 'git' | 'manual';
  hasPackageJson: boolean;
  hasGit: boolean;
}

export class ProjectDetector {
  /**
   * Find project root by walking up directory tree
   */
  async detectProject(startDir?: string): Promise<ProjectInfo> {
    let current = startDir || process.cwd();

    // Walk up until we find a marker or reach root
    while (current !== path.dirname(current)) {
      const hasPackageJson = fs.existsSync(path.join(current, 'package.json'));
      const hasGit = fs.existsSync(path.join(current, '.git'));

      if (hasPackageJson || hasGit) {
        return {
          rootPath: current,
          type: hasPackageJson ? 'node' : 'git',
          hasPackageJson,
          hasGit
        };
      }

      current = path.dirname(current);
    }

    // No marker found, use current directory
    return {
      rootPath: startDir || process.cwd(),
      type: 'manual',
      hasPackageJson: false,
      hasGit: false
    };
  }

  /**
   * Get .agents directory for project
   */
  getAgentsDir(projectPath: string): string {
    return path.join(projectPath, '.agents');
  }

  /**
   * Get skills directory within .agents
   */
  getSkillsDir(projectPath: string): string {
    return path.join(projectPath, '.agents', 'skills');
  }

  /**
   * Check if skills are already installed
   */
  hasSkillsInstalled(projectPath: string): boolean {
    const skillsDir = this.getSkillsDir(projectPath);
    return fs.existsSync(skillsDir) && fs.readdirSync(skillsDir).length > 0;
  }

  /**
   * Get installed skills
   */
  getInstalledSkills(projectPath: string): string[] {
    const skillsDir = this.getSkillsDir(projectPath);

    if (!fs.existsSync(skillsDir)) {
      return [];
    }

    return fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory() || entry.isSymbolicLink())
      .map(entry => entry.name);
  }
}
