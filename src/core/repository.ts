import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import type { SimpleGit } from 'simple-git';

export interface RepositoryInfo {
  url: string;
  shorthand?: string;
  cachePath: string;
  lastUpdated: Date;
}

export interface PresetInfo {
  id: string;
  name: string;
  description: string;
  path: string;
  skills: string[];
}

export class RepositoryManager {
  private cacheDir: string;
  private git: SimpleGit;

  constructor(cacheDir?: string) {
    this.cacheDir = cacheDir || path.join(os.homedir(), '.cache', 'ai-agents-skills', 'repos');
    this.git = simpleGit();
    this.ensureCacheDir();
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private hashSource(source: string): string {
    return crypto.createHash('md5').update(source).digest('hex').substring(0, 12);
  }

  private parseSource(source: string): { url: string; shorthand?: string } {
    // GitHub shorthand: user/repo
    if (/^[\w-]+\/[\w-]+$/.test(source)) {
      return {
        url: `https://github.com/${source}.git`,
        shorthand: source
      };
    }

    // Full URL
    if (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('git@')) {
      return { url: source };
    }

    // Local path
    if (fs.existsSync(source)) {
      return { url: path.resolve(source) };
    }

    throw new Error(`Invalid repository source: ${source}`);
  }

  /**
   * Fetch repository and cache locally
   */
  async fetchRepository(source: string): Promise<RepositoryInfo> {
    const { url, shorthand } = this.parseSource(source);
    const hash = this.hashSource(url);
    const cachePath = path.join(this.cacheDir, hash);

    // If already cached, update it
    if (fs.existsSync(cachePath)) {
      console.log(`Updating cached repository: ${shorthand || url}`);
      const git = simpleGit(cachePath);
      await git.pull();

      return {
        url,
        shorthand,
        cachePath,
        lastUpdated: new Date()
      };
    }

    // Clone fresh
    console.log(`Cloning repository: ${shorthand || url}`);
    await this.git.clone(url, cachePath);

    return {
      url,
      shorthand,
      cachePath,
      lastUpdated: new Date()
    };
  }

  /**
   * Get cached repository path
   */
  getCachedRepo(source: string): string | null {
    const { url } = this.parseSource(source);
    const hash = this.hashSource(url);
    const cachePath = path.join(this.cacheDir, hash);

    return fs.existsSync(cachePath) ? cachePath : null;
  }

  /**
   * List available presets in repository
   */
  async listPresets(repoPath: string): Promise<PresetInfo[]> {
    const presetsDir = path.join(repoPath, 'presets');

    if (!fs.existsSync(presetsDir)) {
      return [];
    }

    const presets: PresetInfo[] = [];
    const entries = fs.readdirSync(presetsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const agentFile = path.join(presetsDir, entry.name, 'AGENTS.md');
      if (!fs.existsSync(agentFile)) continue;

      const content = fs.readFileSync(agentFile, 'utf-8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (frontmatterMatch) {
        const yaml = frontmatterMatch[1];
        const nameMatch = yaml.match(/^name:\s*(.+)$/m);
        const descMatch = yaml.match(/^description:\s*(.+)$/m);
        const skillsMatch = yaml.match(/^skills:\s*\n((?:  - .+\n?)+)/m);

        const skills: string[] = [];
        if (skillsMatch) {
          const skillLines = skillsMatch[1].trim().split('\n');
          skills.push(...skillLines.map(l => l.trim().replace(/^- /, '')));
        }

        presets.push({
          id: entry.name,
          name: nameMatch ? nameMatch[1].trim() : entry.name,
          description: descMatch ? descMatch[1].trim() : '',
          path: path.join(presetsDir, entry.name),
          skills
        });
      }
    }

    return presets;
  }

  /**
   * Get preset by ID
   */
  async getPreset(repoPath: string, presetId: string): Promise<PresetInfo | null> {
    const presets = await this.listPresets(repoPath);
    return presets.find(p => p.id === presetId) || null;
  }

  /**
   * List available skills in repository
   */
  listSkills(repoPath: string): string[] {
    const skillsDir = path.join(repoPath, 'skills');

    if (!fs.existsSync(skillsDir)) {
      return [];
    }

    return fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(name => fs.existsSync(path.join(skillsDir, name, 'SKILL.md')));
  }
}
