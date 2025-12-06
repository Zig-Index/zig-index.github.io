import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Schema for registry entries (packages and applications)
// Simple schema - no addedAt needed, timestamps not required
const registrySchema = z.object({
  name: z.string(),
  owner: z.string(),
  repo: z.string(),
  description: z.string(),
  type: z.enum(["package", "application"]).default("package"),
  homepage: z.string().optional(),
  license: z.string().optional(),
  category: z.string().optional(),
  readme: z.string().optional(),
  dependencies: z.array(z.object({
    name: z.string(),
    url: z.string(),
    hash: z.string().optional(),
  })).optional(),
  topics: z.array(z.string()).default([]),
  stars: z.number().default(0),
  forks: z.number().default(0),
  watchers: z.number().default(0),
  updated_at: z.string().optional(),
  owner_avatar_url: z.string().optional(),
  owner_bio: z.string().nullable().optional(),
  owner_company: z.string().nullable().optional(),
  owner_location: z.string().nullable().optional(),
  owner_blog: z.string().nullable().optional(),
  owner_twitter_username: z.string().nullable().optional(),
  owner_followers: z.number().default(0),
  owner_following: z.number().default(0),
  owner_public_repos: z.number().default(0),
  owner_public_gists: z.number().default(0),
  owner_created_at: z.string().optional(),
  releases: z.array(z.object({
    tag_name: z.string(),
    name: z.string().nullable(),
    body: z.string().nullable(),
    prerelease: z.boolean().default(false),
    published_at: z.string(),
    html_url: z.string(),
    assets: z.array(z.object({
      name: z.string(),
      url: z.string(),
      size: z.number(),
      content_type: z.string(),
    })).default([]),
  })).default([]),
});

// Repositories collection - from src/registry/database
const repositories = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/registry/database' }),
  schema: registrySchema,
});

export const collections = { repositories };
