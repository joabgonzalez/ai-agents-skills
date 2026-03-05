/**
 * Generates assets/logo-wordmark.svg with text converted to vector paths.
 * Uses the local Exo 2 variable font — no external font dependencies.
 *
 * Usage: node scripts/generate-logo.mjs
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Load Exo 2 variable font
const font = await opentype.load(join(ROOT, 'assets/fonts/Exo2.ttf'));

// Settings — match the hero design
const FONT_SIZE = 72;
const LETTER_SPACING = 5; // extra px between glyphs
const LINE_HEIGHT = 82;
const TEXT_X = 88;      // left offset (after bolt, ~10px gap)
const BASELINE_1 = 66;  // baseline of "AGENTS"
const BASELINE_2 = BASELINE_1 + LINE_HEIGHT; // baseline of "SKILLS"
const WEIGHT = 900;     // Black

function getPath(text, x, y) {
  if (font.variation) {
    font.variation.set({ wght: WEIGHT });
  }
  return font.getPath(text, x, y, FONT_SIZE, {
    kerning: true,
    letterSpacing: LETTER_SPACING / FONT_SIZE, // opentype uses em units
  });
}

const agentsPath = getPath('AGENTS', TEXT_X, BASELINE_1);
const skillsPath = getPath('SKILLS', TEXT_X, BASELINE_2);

// Measure actual text width to size the viewBox correctly
const agentsBB = agentsPath.getBoundingBox();
const skillsBB = skillsPath.getBoundingBox();
const textRight = Math.max(agentsBB.x2, skillsBB.x2);
const VIEW_W = Math.ceil(textRight + 12);
const VIEW_H = Math.ceil(BASELINE_2 + 16); // padding below descenders

// Bolt scaled to full SVG height
const boltScale = VIEW_H / 44;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" width="${VIEW_W}" height="${VIEW_H}">
  <defs>
    <radialGradient id="bolt" cx="45%" cy="32%" r="62%">
      <stop offset="0%" stop-color="#fefce8"/>
      <stop offset="45%" stop-color="#fcd34d"/>
      <stop offset="100%" stop-color="#b45309"/>
    </radialGradient>
  </defs>
  <!-- Lightning bolt -->
  <g transform="translate(4, 0) scale(${boltScale.toFixed(4)})">
    <path d="M4 25 L14 4 L12 19 L20 19 L10 40 L12 25 Z" fill="url(#bolt)" stroke="#92400e" stroke-width="0.4" stroke-linejoin="round" paint-order="stroke"/>
  </g>
  <!-- AGENTS — vectorized -->
  <path d="${agentsPath.toPathData(2)}" fill="#111827"/>
  <!-- SKILLS — vectorized -->
  <path d="${skillsPath.toPathData(2)}" fill="#111827"/>
</svg>
`;

const outPath = join(ROOT, 'assets/logo-wordmark.svg');
const outPathPublic = join(ROOT, 'website/public/logo-wordmark.svg');
writeFileSync(outPath, svg, 'utf8');
writeFileSync(outPathPublic, svg, 'utf8');
console.log(`✓ Written: ${outPath}`);
console.log(`✓ Written: ${outPathPublic}`);
console.log(`  viewBox: 0 0 ${VIEW_W} ${VIEW_H}`);
console.log(`  AGENTS bbox: x=${agentsBB.x1.toFixed(1)}–${agentsBB.x2.toFixed(1)}`);
console.log(`  SKILLS bbox: x=${skillsBB.x1.toFixed(1)}–${skillsBB.x2.toFixed(1)}`);
