import * as fs from 'fs';
import * as path from 'path';

/**
 * Check if path exists
 */
export function exists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Check if path is a directory
 */
export function isDirectory(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if path is a file
 */
export function isFile(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * Read directory contents
 */
export function readDir(dirPath: string): string[] {
  try {
    return fs.readdirSync(dirPath);
  } catch {
    return [];
  }
}

/**
 * Ensure directory exists, create if not
 */
export function ensureDir(dirPath: string): void {
  if (!exists(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Copy file from source to destination
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  try {
    const destDir = path.dirname(dest);
    ensureDir(destDir);

    await fs.promises.copyFile(src, dest);
  } catch (error) {
    throw new Error(`Failed to copy ${src} to ${dest}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Copy directory recursively
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  try {
    ensureDir(dest);

    const entries = await fs.promises.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    throw new Error(`Failed to copy directory ${src} to ${dest}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create symlink
 */
export async function createSymlink(target: string, linkPath: string): Promise<void> {
  try {
    const linkDir = path.dirname(linkPath);
    ensureDir(linkDir);

    // Remove existing symlink or file if it exists
    if (exists(linkPath)) {
      await removeFile(linkPath);
    }

    await fs.promises.symlink(target, linkPath, 'dir');
  } catch (error) {
    throw new Error(`Failed to create symlink from ${target} to ${linkPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Remove file or symlink
 */
export async function removeFile(filePath: string): Promise<void> {
  try {
    if (exists(filePath)) {
      const stats = fs.lstatSync(filePath);

      if (stats.isSymbolicLink() || stats.isFile()) {
        await fs.promises.unlink(filePath);
      } else if (stats.isDirectory()) {
        await removeDir(filePath);
      }
    }
  } catch (error) {
    throw new Error(`Failed to remove ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Remove directory recursively
 */
export async function removeDir(dirPath: string): Promise<void> {
  try {
    if (exists(dirPath)) {
      await fs.promises.rm(dirPath, { recursive: true, force: true });
    }
  } catch (error) {
    throw new Error(`Failed to remove directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * List all files in directory recursively
 */
export function listFiles(dirPath: string, extension?: string): string[] {
  const files: string[] = [];

  function traverse(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile()) {
        if (!extension || fullPath.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    }
  }

  if (exists(dirPath) && isDirectory(dirPath)) {
    traverse(dirPath);
  }

  return files;
}

/**
 * Read file content
 */
export function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Write file content
 */
export function writeFile(filePath: string, content: string): void {
  try {
    const dir = path.dirname(filePath);
    ensureDir(dir);
    fs.writeFileSync(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if path is a symlink
 */
export function isSymlink(filePath: string): boolean {
  try {
    return fs.lstatSync(filePath).isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Resolve symlink target
 */
export function resolveSymlink(linkPath: string): string | null {
  try {
    if (isSymlink(linkPath)) {
      return fs.readlinkSync(linkPath);
    }
    return null;
  } catch {
    return null;
  }
}
