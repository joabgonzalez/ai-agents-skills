import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import * as p from '@clack/prompts';
import color from 'picocolors';
import { PostHog } from 'posthog-node';
import packageJson from '../../package.json';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'ai-agents-skills');
const CONFIG_FILE = path.join(CONFIG_DIR, 'telemetry.json');
const POSTHOG_KEY = process.env.POSTHOG_KEY ?? '';

interface TelemetryConfig {
  enabled: boolean;
  anonymousId: string;
}

function readConfig(): TelemetryConfig | null {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) as TelemetryConfig;
  } catch {
    return null;
  }
}

function writeConfig(config: TelemetryConfig): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function getOrCreateAnonymousId(): string {
  const config = readConfig();
  if (config?.anonymousId) return config.anonymousId;
  const id = randomUUID();
  writeConfig({ enabled: config?.enabled ?? false, anonymousId: id });
  return id;
}

function isCI(): boolean {
  return !!(process.env.CI || process.env.GITHUB_ACTIONS || process.env.CONTINUOUS_INTEGRATION);
}

export function telemetryStatus(): boolean {
  if (isCI()) return false;
  // Opt-out: enabled by default unless explicitly set to false
  return readConfig()?.enabled !== false;
}

export function enableTelemetry(): void {
  const config = readConfig();
  writeConfig({
    enabled: true,
    anonymousId: config?.anonymousId ?? randomUUID(),
  });
}

export function disableTelemetry(): void {
  const config = readConfig();
  writeConfig({
    enabled: false,
    anonymousId: config?.anonymousId ?? randomUUID(),
  });
}

/** Show a one-time notice on first run explaining telemetry (opt-out). */
export function showFirstRunNotice(): void {
  if (fs.existsSync(CONFIG_FILE)) return;
  // Write config immediately so notice only shows once
  writeConfig({ enabled: true, anonymousId: randomUUID() });
  p.log.info(
    `${color.bold('Telemetry notice:')} anonymous usage data is collected to improve this tool.\n` +
    `  ${color.dim('Collected:')} skill names, preset, platform, CLI version — no personal data.\n` +
    `  ${color.dim('Opt out:')} ${color.cyan('ai-agents-skills telemetry disable')}`
  );
}

export interface InstallPayload {
  skills: string[];
  presetName: string | null;
  modelCount: number;
  dryRun: boolean;
}

export async function trackInstall(payload: InstallPayload): Promise<void> {
  if (!telemetryStatus() || !POSTHOG_KEY) return;

  const client = new PostHog(POSTHOG_KEY, {
    host: 'https://app.posthog.com',
    flushAt: 1,
    flushInterval: 0,
  });

  const distinctId = getOrCreateAnonymousId();

  // One event per skill for easy aggregation in PostHog
  for (const skill of payload.skills) {
    client.capture({
      distinctId,
      event: 'skill_installed',
      properties: {
        skill,
        presetUsed: payload.presetName !== null,
        presetName: payload.presetName,
        dryRun: payload.dryRun,
        cliVersion: packageJson.version,
        nodeVersion: process.version,
        platform: process.platform,
      },
    });
  }

  await client.shutdown();
}
