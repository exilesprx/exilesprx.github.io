import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    author: z.string().default('Andrew Campbell'),
    title: z.string(),
    description: z.string(),
    slug: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()),
    isDraft: z.boolean(),
    image: z
      .object({
        src: z.string(),
        alt: z.string()
      })
      .default({ src: '', alt: '' })
  })
});

export const collections = { blog };
