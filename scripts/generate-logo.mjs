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

// Settings — match the hero design
const FONT_SIZE = 72;
// tracking-widest = 0.1em
const LETTER_SPACING = FONT_SIZE * 0.1;
// mt-4 gap proportional to text-4xl (16px / 36px ≈ 0.444 of font-size)
const LINE_HEIGHT = FONT_SIZE + Math.round(FONT_SIZE * 16 / 36); // 72 + 32 = 104
const BASELINE_1 = 66;  // baseline of "AGENTS"
const BASELINE_2 = BASELINE_1 + LINE_HEIGHT; // baseline of "SKILLS"
const WEIGHT = 900;     // Black

// Pre-compute geometry (doesn't need font metrics)
const VIEW_H = BASELINE_2 + 16; // padding below descenders
// Bolt scaled to full SVG height
const boltScale = VIEW_H / 44;
// Bolt's rightmost x in SVG units: path goes to x=20 in bolt space, + translate(4)
const boltRight = Math.ceil(20 * boltScale + 4);
// Gap proportional to hero: gap-4 (16px) / bolt-rendered-width ≈ 0.45
const TEXT_X = boltRight + Math.round(16 * boltScale * 0.45);

// Load Exo 2 variable font
const font = await opentype.load(join(ROOT, 'assets/fonts/Exo2.ttf'));

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

function buildSvg(textColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" width="${VIEW_W}" height="${VIEW_H}">
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
  <path d="${agentsPath.toPathData(2)}" fill="${textColor}"/>
  <!-- SKILLS — vectorized -->
  <path d="${skillsPath.toPathData(2)}" fill="${textColor}"/>
</svg>
`;
}

const svgLight = buildSvg('#111827');
const svgDark  = buildSvg('#f9fafb');

for (const [name, content] of [['logo-wordmark.svg', svgLight], ['logo-wordmark-dark.svg', svgDark]]) {
  writeFileSync(join(ROOT, 'assets', name), content, 'utf8');
  console.log(`✓ Written: assets/${name}`);
}
console.log(`  viewBox: 0 0 ${VIEW_W} ${VIEW_H}`);
console.log(`  AGENTS bbox: x=${agentsBB.x1.toFixed(1)}–${agentsBB.x2.toFixed(1)}`);
console.log(`  SKILLS bbox: x=${skillsBB.x1.toFixed(1)}–${skillsBB.x2.toFixed(1)}`);
