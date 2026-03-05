import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const skills = defineCollection({
  loader: glob({
    pattern: '**/SKILL.md',
    base: '../skills',
  }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    license: z.string().optional(),
    metadata: z.object({
      version: z.string(),
      type: z.enum([
        'behavioral',
        'universal',
        'language',
        'framework',
        'library',
        'tooling',
        'domain',
      ]),
      skills: z.array(z.string()).optional(),
      dependencies: z.record(z.string()).optional(),
      'allowed-tools': z.array(z.string()).optional(),
    }),
  }),
});

const references = defineCollection({
  loader: glob({
    pattern: '**/references/*.md',
    base: '../skills',
  }),
  schema: z.object({}).passthrough(),
});

export const collections = { skills, references };
