import path from 'path';
import { SkillParser } from './skill-parser';
import { logger } from '../utils/logger';
import { readFile } from '../utils/fs';
import type { SkillSource } from './skill-source';

/**
 * Dependency node in the graph
 */
export interface DependencyNode {
  name: string;
  version: string;
  dependencies: string[];
  source: 'agents-md' | 'meta-skill' | 'skill-dependency';
}

/**
 * Circular dependency cycle
 */
export interface DependencyCycle {
  path: string[];
  formatted: string;
}

/**
 * Centralized meta-skills configuration
 */
export const META_SKILLS = [
  'conventions',
  'a11y',
  'architecture-patterns',
  'english-writing',
  'critical-partner',
];

/**
 * DependencyResolver - Build and analyze dependency graphs
 */
export class DependencyResolver {
  private skillSource: SkillSource;
  private skillsCache: Map<string, DependencyNode>;

  constructor(skillSource: SkillSource) {
    this.skillSource = skillSource;
    this.skillsCache = new Map();
  }

  /**
   * Build full dependency graph from three sources
   */
  buildGraph(
    agentsSkills: string[],
    metaSkills: string[] = META_SKILLS
  ): Map<string, DependencyNode> {
    const graph = new Map<string, DependencyNode>();

    // Start with all requested skills (from AGENTS.md + meta-skills)
    const allSkills = new Set([...agentsSkills, ...metaSkills]);

    // Build graph recursively
    for (const skillName of allSkills) {
      this.buildNodeRecursive(skillName, graph, 'agents-md');
    }

    return graph;
  }

  /**
   * Build dependency node recursively
   */
  private buildNodeRecursive(
    skillName: string,
    graph: Map<string, DependencyNode>,
    source: 'agents-md' | 'meta-skill' | 'skill-dependency'
  ): void {
    // Skip if already processed
    if (graph.has(skillName)) {
      return;
    }

    // Check if skill exists
    if (!this.skillSource.exists(skillName)) {
      logger.warn(`Skill "${skillName}" not found, skipping`);
      return;
    }

    try {
      const skillPath = this.skillSource.getSkillPath(skillName);
      const version = SkillParser.extractVersion(skillPath);
      const dependencies = SkillParser.extractDependencies(skillPath);

      // Create node
      const node: DependencyNode = {
        name: skillName,
        version,
        dependencies,
        source: META_SKILLS.includes(skillName) ? 'meta-skill' : source,
      };

      graph.set(skillName, node);

      // Recursively process dependencies
      for (const dep of dependencies) {
        this.buildNodeRecursive(dep, graph, 'skill-dependency');
      }
    } catch (error) {
      logger.error(`Failed to process skill "${skillName}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Detect circular dependencies using DFS
   */
  detectCycles(graph: Map<string, DependencyNode>): DependencyCycle[] | null {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycles: DependencyCycle[] = [];

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        this.detectCyclesHelper(node, graph, visited, recStack, [], cycles);
      }
    }

    return cycles.length > 0 ? cycles : null;
  }

  /**
   * DFS helper for cycle detection
   */
  private detectCyclesHelper(
    node: string,
    graph: Map<string, DependencyNode>,
    visited: Set<string>,
    recStack: Set<string>,
    path: string[],
    cycles: DependencyCycle[]
  ): void {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const nodeData = graph.get(node);
    if (!nodeData) {
      recStack.delete(node);
      return;
    }

    for (const dep of nodeData.dependencies) {
      if (!graph.has(dep)) {
        // Dependency not in graph (might be missing)
        continue;
      }

      if (!visited.has(dep)) {
        this.detectCyclesHelper(dep, graph, visited, recStack, [...path], cycles);
      } else if (recStack.has(dep)) {
        // Found cycle
        const cycleStart = path.indexOf(dep);
        const cyclePath = [...path.slice(cycleStart), dep];
        const formatted = cyclePath.join(' -> ');

        // Check if we already have this cycle (avoid duplicates)
        if (!cycles.some(c => c.formatted === formatted)) {
          cycles.push({ path: cyclePath, formatted });
        }
      }
    }

    recStack.delete(node);
  }

  /**
   * Get installation order using topological sort (Kahn's algorithm)
   */
  getInstallationOrder(graph: Map<string, DependencyNode>): string[] {
    // Check for cycles first
    const cycles = this.detectCycles(graph);
    if (cycles) {
      throw new Error(`Circular dependencies detected:\n${cycles.map(c => c.formatted).join('\n')}`);
    }

    // Build in-degree map
    const inDegree = new Map<string, number>();
    for (const node of graph.keys()) {
      inDegree.set(node, 0);
    }

    for (const node of graph.values()) {
      for (const dep of node.dependencies) {
        if (graph.has(dep)) {
          inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
        }
      }
    }

    // Queue for nodes with in-degree 0
    const queue: string[] = [];
    for (const [node, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(node);
      }
    }

    // Topological sort
    const sorted: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      sorted.push(current);

      const currentNode = graph.get(current);
      if (currentNode) {
        for (const dep of currentNode.dependencies) {
          if (graph.has(dep)) {
            const newDegree = (inDegree.get(dep) || 0) - 1;
            inDegree.set(dep, newDegree);

            if (newDegree === 0) {
              queue.push(dep);
            }
          }
        }
      }
    }

    // If sorted length doesn't match graph size, there's a cycle
    if (sorted.length !== graph.size) {
      throw new Error('Circular dependency detected (topological sort failed)');
    }

    // Reverse to get dependencies-first order
    return sorted.reverse();
  }

  /**
   * Check if version satisfies dependency requirement
   */
  versionSatisfies(current: string, required: string): boolean {
    // Parse current version (e.g., "1.0" or "1.0.0")
    const currentParts = current.split('.').map(Number);
    const [major = 0, minor = 0, patch = 0] = currentParts;

    // Handle caret (^) - compatible with major version
    if (required.startsWith('^')) {
      const reqParts = required.slice(1).split('.').map(Number);
      const [reqMajor = 0, reqMinor = 0] = reqParts;

      return major === reqMajor && (minor > reqMinor || (minor === reqMinor && patch >= 0));
    }

    // Handle tilde (~) - compatible with minor version
    if (required.startsWith('~')) {
      const reqParts = required.slice(1).split('.').map(Number);
      const [reqMajor = 0, reqMinor = 0] = reqParts;

      return major === reqMajor && minor === reqMinor && patch >= 0;
    }

    // Handle greater than or equal (>=)
    if (required.startsWith('>=')) {
      const reqParts = required.slice(2).split('.').map(Number);
      const [reqMajor = 0, reqMinor = 0, reqPatch = 0] = reqParts;

      if (major > reqMajor) return true;
      if (major === reqMajor && minor > reqMinor) return true;
      if (major === reqMajor && minor === reqMinor && patch >= reqPatch) return true;
      return false;
    }

    // Handle greater than (>)
    if (required.startsWith('>')) {
      const reqParts = required.slice(1).split('.').map(Number);
      const [reqMajor = 0, reqMinor = 0, reqPatch = 0] = reqParts;

      if (major > reqMajor) return true;
      if (major === reqMajor && minor > reqMinor) return true;
      if (major === reqMajor && minor === reqMinor && patch > reqPatch) return true;
      return false;
    }

    // Handle less than or equal (<=)
    if (required.startsWith('<=')) {
      const reqParts = required.slice(2).split('.').map(Number);
      const [reqMajor = 0, reqMinor = 0, reqPatch = 0] = reqParts;

      if (major < reqMajor) return true;
      if (major === reqMajor && minor < reqMinor) return true;
      if (major === reqMajor && minor === reqMinor && patch <= reqPatch) return true;
      return false;
    }

    // Handle less than (<)
    if (required.startsWith('<')) {
      const reqParts = required.slice(1).split('.').map(Number);
      const [reqMajor = 0, reqMinor = 0, reqPatch = 0] = reqParts;

      if (major < reqMajor) return true;
      if (major === reqMajor && minor < reqMinor) return true;
      if (major === reqMajor && minor === reqMinor && patch < reqPatch) return true;
      return false;
    }

    // Handle wildcard (*)
    if (required === '*' || required === 'latest') {
      return true;
    }

    // Exact match
    return current === required;
  }

  /**
   * Parse AGENTS.md to extract skill names
   */
  static parseAgentsMd(filePath: string): string[] {
    try {
      const content = readFile(filePath);

      // Extract skills from "Available Skills" table
      const skillsMatch = content.match(/## Available Skills[\s\S]*?(?=##|$)/);
      if (!skillsMatch) {
        logger.warn('No "Available Skills" section found in AGENTS.md');
        return [];
      }

      const lines = skillsMatch[0].split('\n');
      const skills: string[] = [];

      for (const line of lines) {
        // Match markdown links like [skill-name](skills/skill-name/SKILL.md)
        const match = line.match(/\[([a-z0-9-]+)\]\(skills\/[^)]+\)/);
        if (match) {
          skills.push(match[1]);
        }
      }

      return skills;
    } catch (error) {
      logger.error(`Failed to parse AGENTS.md: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Get meta skills list
   */
  static getMetaSkills(): string[] {
    return META_SKILLS;
  }

  /**
   * Discover all skills from all sources
   */
  discoverAllSkills(agentsMdPath: string): Map<string, DependencyNode> {
    const agentsMdFile = agentsMdPath;

    // Get skills from AGENTS.md
    const agentsSkills = DependencyResolver.parseAgentsMd(agentsMdFile);
    logger.info(`Found ${agentsSkills.length} skills in AGENTS.md`);

    // Get meta-skills
    const metaSkills = DependencyResolver.getMetaSkills();
    logger.info(`Using ${metaSkills.length} meta-skills`);

    // Build full graph
    const graph = this.buildGraph(agentsSkills, metaSkills);
    logger.info(`Built dependency graph with ${graph.size} total skills`);

    return graph;
  }

  /**
   * Validate graph (check for missing dependencies)
   */
  validateGraph(graph: Map<string, DependencyNode>): {
    valid: boolean;
    missing: string[];
    cycles: DependencyCycle[] | null;
  } {
    const missing: string[] = [];

    // Check for missing dependencies
    for (const node of graph.values()) {
      for (const dep of node.dependencies) {
        if (!graph.has(dep)) {
          missing.push(`${node.name} -> ${dep}`);
        }
      }
    }

    // Check for cycles
    const cycles = this.detectCycles(graph);

    return {
      valid: missing.length === 0 && !cycles,
      missing,
      cycles,
    };
  }

  /**
   * Print dependency graph
   */
  printGraph(graph: Map<string, DependencyNode>): void {
    logger.section('Dependency Graph');

    const bySource = {
      'agents-md': [] as string[],
      'meta-skill': [] as string[],
      'skill-dependency': [] as string[],
    };

    for (const node of graph.values()) {
      bySource[node.source].push(node.name);
    }

    logger.subsection('From AGENTS.md');
    bySource['agents-md'].forEach(name => logger.listItem(`${name} (v${graph.get(name)?.version})`));

    logger.subsection('Meta Skills');
    bySource['meta-skill'].forEach(name => logger.listItem(`${name} (v${graph.get(name)?.version})`));

    logger.subsection('Transitive Dependencies');
    bySource['skill-dependency'].forEach(name => logger.listItem(`${name} (v${graph.get(name)?.version})`));

    logger.newline();
    logger.keyValue('Total skills', graph.size.toString());
  }
}
