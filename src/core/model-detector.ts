import fs from 'node:fs';
import path from 'node:path';
import { DEDICATED_MODELS, UNIVERSAL_MODELS } from '../shared/constants';

export interface ModelInfo {
  id: string;
  name: string;
  directory: string;
  skillsPath: string;
  installed: boolean;
}

// Re-export for consumers that reference SUPPORTED_MODELS directly
export const SUPPORTED_MODELS = DEDICATED_MODELS;

// Universal model IDs (use .agents/skills/ natively — no dedicated directory needed)
export const UNIVERSAL_MODEL_IDS: string[] = UNIVERSAL_MODELS.map((m) => m.value);

export class ModelDetector {
  /**
   * Detect which dedicated models are installed in project.
   * Universal models are always available via .agents/skills/ and are not detected here.
   */
  detectInstalledModels(projectPath: string): string[] {
    const installed: string[] = [];

    for (const [modelId, config] of Object.entries(DEDICATED_MODELS)) {
      const modelPath = path.join(projectPath, config.directory);
      const skillsPath = path.join(modelPath, 'skills');
      if (fs.existsSync(modelPath) && fs.existsSync(skillsPath)) {
        installed.push(modelId);
      }
    }

    return installed;
  }

  /**
   * Get model information for a dedicated model.
   * Returns null for unknown or universal model IDs.
   */
  getModelInfo(projectPath: string, modelId: string): ModelInfo | null {
    const config = DEDICATED_MODELS[modelId];
    if (!config) return null;

    const modelPath = path.join(projectPath, config.directory);
    const skillsPath = path.join(modelPath, 'skills');

    return {
      id: modelId,
      name: config.name,
      directory: modelPath,
      skillsPath,
      installed: fs.existsSync(modelPath) && fs.existsSync(skillsPath),
    };
  }

  /**
   * Get info for all dedicated models.
   */
  getAllModelsInfo(projectPath: string): ModelInfo[] {
    return Object.keys(DEDICATED_MODELS)
      .map((modelId) => this.getModelInfo(projectPath, modelId))
      .filter((info): info is ModelInfo => info !== null);
  }

  /**
   * Get directory path for a dedicated model.
   * Throws for unknown or universal model IDs.
   */
  getModelDirectory(projectPath: string, modelId: string): string {
    const config = DEDICATED_MODELS[modelId];
    if (!config) {
      throw new Error(`Unknown model: ${modelId}`);
    }

    return path.join(projectPath, config.directory);
  }

  /**
   * Get skills directory for a dedicated model.
   */
  getModelSkillsDirectory(projectPath: string, modelId: string): string {
    return path.join(this.getModelDirectory(projectPath, modelId), 'skills');
  }
}
