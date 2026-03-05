/**
 * Remark plugin that rewrites relative .md file links to website URLs.
 *
 * The skills/ directory uses relative markdown links that work on GitHub
 * (e.g. hooks-advanced.md, ../SKILL.md, ../../typescript/SKILL.md) but
 * produce 404s on the Astro site where pages use directory-style URLs.
 *
 * Patterns handled:
 *   hooks-advanced.md          → ../hooks-advanced/          (sibling ref, relative)
 *   ./hooks-advanced.md        → ../hooks-advanced/          (sibling ref, relative)
 *   ../SKILL.md                → ../../                      (parent skill, relative)
 *   ../README.md               → ../                         (references index, relative)
 *   ../../typescript/SKILL.md  → {base}skills/typescript/    (cross-skill, absolute)
 *   ../../react/references/hooks.md → {base}skills/react/references/hooks/  (cross-skill ref, absolute)
 */

import path from 'node:path';
import { visit } from 'unist-util-visit';

export default function remarkMdLinks({ base = '/' } = {}) {
  return (tree, file) => {
    const filePath = file.history[0];
    if (!filePath) return;

    // DEBUG: remove after verifying fix
    if (filePath.includes('references')) {
      console.log('[remark-md-links] source:', filePath);
    }

    visit(tree, 'link', (node) => {
      const href = node.url;

      // Skip external links, anchors, and non-.md links
      if (!href || href.startsWith('http') || href.startsWith('#') || !href.endsWith('.md')) {
        return;
      }

      const dir = path.dirname(filePath);
      const targetAbs = path.resolve(dir, href);

      // Find the skills/ boundary in the absolute path
      const skillsMarker = `${path.sep}skills${path.sep}`;
      const idx = targetAbs.indexOf(skillsMarker);
      if (idx === -1) return;

      // Path relative to skills/  e.g. 'react/SKILL.md' or 'react/references/hooks-advanced.md'
      const relToSkills = targetAbs.substring(idx + skillsMarker.length);
      const parts = relToSkills.split(path.sep);
      // parts[0] = skill name, parts[1] = 'SKILL.md' | 'references', parts[2] = ref file

      const targetSkill = parts[0];
      const isSKILL = parts[1] === 'SKILL.md';
      const isREADME = parts[1] === 'references' && parts[2] === 'README.md';
      const isRef = parts[1] === 'references' && parts[2] && !isREADME;

      // Determine the source context: which skill and where the source is SERVED
      const srcMarker = `${path.sep}skills${path.sep}`;
      const srcRelToSkills = dir.substring(dir.indexOf(srcMarker) + srcMarker.length);
      const srcParts = srcRelToSkills.split(path.sep);
      const srcSkill = srcParts[0];
      const srcInRefs = srcParts[1] === 'references';
      const srcFileName = path.basename(filePath).toLowerCase();
      const srcIsReadme = srcFileName === 'readme.md';

      // srcLevel: the URL depth at which the source file is SERVED
      //   'ref'        → references/README.md is served at references/foo/   → ../../ to skill
      //   'references' → references/README.md is served at references/       → ../   to skill
      //   'skill'      → SKILL.md is served at skills/{name}/               → ../   to skill
      const srcLevel = srcInRefs && !srcIsReadme ? 'ref' : srcInRefs ? 'references' : 'skill';

      if (targetSkill === srcSkill) {
        // Same skill — use relative URLs to avoid base path issues
        if (isSKILL) {
          node.url = srcLevel === 'ref' ? '../../' : '../';
        } else if (isREADME) {
          node.url = srcLevel === 'ref' ? '../' : 'references/';
        } else if (isRef) {
          const refSlug = parts[2].replace('.md', '');
          if (srcLevel === 'ref') node.url = `../${refSlug}/`;
          else if (srcLevel === 'references') node.url = `${refSlug}/`;
          else node.url = `references/${refSlug}/`;
        }
      } else {
        // Cross-skill — use absolute URL with base
        if (isSKILL) {
          node.url = `${base}skills/${targetSkill}/`;
        } else if (isREADME) {
          node.url = `${base}skills/${targetSkill}/references/`;
        } else if (isRef) {
          const refSlug = parts[2].replace('.md', '');
          node.url = `${base}skills/${targetSkill}/references/${refSlug}/`;
        }
      }
    });
  };
}
