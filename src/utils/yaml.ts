import * as fs from 'fs';
import * as yaml from 'js-yaml';

/**
 * Extract YAML frontmatter from markdown file
 * Supports both --- and ... delimiters
 */
export function extractFrontmatter(filePath: string): Record<string, any> | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Match YAML frontmatter between --- delimiters
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      return null;
    }

    const frontmatterYaml = frontmatterMatch[1];
    const parsed = yaml.load(frontmatterYaml) as Record<string, any>;

    return parsed || null;
  } catch (error) {
    throw new Error(`Failed to extract frontmatter from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load YAML file with error handling
 */
export function loadYamlFile(filePath: string): Record<string, any> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = yaml.load(content) as Record<string, any>;

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid YAML structure');
    }

    return parsed;
  } catch (error) {
    throw new Error(`Failed to load YAML file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Save object as YAML file
 */
export function saveYamlFile(filePath: string, data: Record<string, any>): void {
  try {
    const yamlContent = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });

    fs.writeFileSync(filePath, yamlContent, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save YAML file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate frontmatter structure against required fields
 */
export function validateFrontmatter(frontmatter: Record<string, any>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required root-level fields
  if (!frontmatter.name || typeof frontmatter.name !== 'string') {
    errors.push('Missing or invalid "name" field');
  }

  if (!frontmatter.description || typeof frontmatter.description !== 'string') {
    errors.push('Missing or invalid "description" field');
  }

  // Check for Trigger clause in description
  if (frontmatter.description && !frontmatter.description.includes('Trigger:')) {
    errors.push('Description must include "Trigger:" clause');
  }

  // Check for metadata.version
  if (!frontmatter.metadata || !frontmatter.metadata.version) {
    errors.push('Missing "metadata.version" field');
  }

  // Check for deprecated top-level fields
  const deprecatedFields = ['version', 'skills', 'dependencies', 'allowed-tools'];
  const foundDeprecated = deprecatedFields.filter(field => field in frontmatter);

  if (foundDeprecated.length > 0) {
    errors.push(`Found deprecated top-level fields: ${foundDeprecated.join(', ')}. These should be under "metadata"`);
  }

  // Validate name format (lowercase-with-hyphens)
  if (frontmatter.name && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(frontmatter.name)) {
    errors.push('Name must be lowercase with hyphens only (e.g., "my-skill-name")');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if file has YAML frontmatter
 */
export function hasFrontmatter(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return /^---\n[\s\S]*?\n---/.test(content);
  } catch {
    return false;
  }
}
