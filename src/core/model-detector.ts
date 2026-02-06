import * as path from 'path';
import * as fs from 'fs';

export interface ModelInfo {
  id: string;
  name: string;
  directory: string;
  skillsPath: string;
  installed: boolean;
}

export const SUPPORTED_MODELS: Record<string, { name: string; directory: string }> = {
  claude: { name: 'Claude', directory: '.claude' },
  copilot: { name: 'GitHub Copilot', directory: '.github/copilot' },
  cursor: { name: 'Cursor', directory: '.cursor' },
  gemini: { name: 'Gemini', directory: '.gemini' },
  codex: { name: 'OpenAI Codex', directory: '.codex' }
};

export class ModelDetector {
  /**
   * Detect which models are installed in project
   */
  detectInstalledModels(projectPath: string): string[] {
    const installed: string[] = [];

    for (const [modelId, config] of Object.entries(SUPPORTED_MODELS)) {
      const modelPath = path.join(projectPath, config.directory);
      if (fs.existsSync(modelPath)) {
        installed.push(modelId);
      }
    }

    return installed;
  }

  /**
   * Get model information
   */
  getModelInfo(projectPath: string, modelId: string): ModelInfo | null {
    const config = SUPPORTED_MODELS[modelId];
    if (!config) return null;

    const modelPath = path.join(projectPath, config.directory);
    const skillsPath = path.join(modelPath, 'skills');

    return {
      id: modelId,
      name: config.name,
      directory: modelPath,
      skillsPath,
      installed: fs.existsSync(modelPath)
    };
  }

  /**
   * Get all models information
   */
  getAllModelsInfo(projectPath: string): ModelInfo[] {
    return Object.keys(SUPPORTED_MODELS).map(modelId =>
      this.getModelInfo(projectPath, modelId)!
    );
  }

  /**
   * Get directory path for model
   */
  getModelDirectory(projectPath: string, modelId: string): string {
    const config = SUPPORTED_MODELS[modelId];
    if (!config) {
      throw new Error(`Unknown model: ${modelId}`);
    }

    return path.join(projectPath, config.directory);
  }

  /**
   * Get skills directory for model
   */
  getModelSkillsDirectory(projectPath: string, modelId: string): string {
    return path.join(this.getModelDirectory(projectPath, modelId), 'skills');
  }
}
