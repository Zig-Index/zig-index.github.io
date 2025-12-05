#!/usr/bin/env npx tsx

/**
 * Zig Registry Auto-Generator
 * 
 * This script automatically fetches Zig packages and applications from GitHub
 * based on topics (zig-package, zig-application) and generates JSON registry files.
 * 
 * Usage:
 *   npm run registry:update
 *   # or
 *   npx tsx scripts/zig-registry.ts
 * 
 * Environment Variables:
 *   GH_TOKEN or GITHUB_TOKEN - GitHub personal access token (required for higher rate limits)
 * 
 * Topics searched:
 *   - zig-package: Libraries and packages for Zig
 *   - zig-application: Applications built with Zig
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Types
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  homepage: string | null;
  topics: string[];
  language: string | null;
  license: {
    spdx_id: string;
    name: string;
  } | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  disabled: boolean;
  fork: boolean;
  visibility: string;
  default_branch: string;
}

interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

interface RegistryEntry {
  name: string;
  owner: string;
  repo: string;
  description: string;
  category?: string;
  license?: string;
  homepage?: string;
}

// Configuration
const CONFIG = {
  // GitHub API base URL
  apiBaseUrl: 'https://api.github.com',
  
  // Topics to search for
  topics: {
    packages: ['zig-package', 'zig-lib', 'zig-library'],
    applications: ['zig-application', 'zig-app', 'zig-tool']
  },
  
  // Output directories
  outputDirs: {
    packages: path.join(__dirname, '..', 'src', 'registry', 'repositories', 'packages'),
    applications: path.join(__dirname, '..', 'src', 'registry', 'repositories', 'applications')
  },
  
  // Search settings
  searchSettings: {
    perPage: 100,
    maxPages: 10, // Max 1000 results per topic
    minStars: 5, // Minimum stars to include
    maxAgeDays: 365, // Only include repos updated within this many days
  },
  
  // Rate limiting
  rateLimitDelay: 1000, // ms between requests
};

// Get GitHub token from environment
function getGitHubToken(): string | undefined {
  return process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
}

// Create headers for GitHub API requests
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Zig-Registry-Generator',
  };
  
  const token = getGitHubToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Sleep helper for rate limiting
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch with error handling
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { headers: getHeaders() });
      
      // Check rate limit
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const resetTime = response.headers.get('X-RateLimit-Reset');
      
      if (remaining && parseInt(remaining) < 10) {
        console.warn(`⚠️  Rate limit low: ${remaining} remaining`);
        if (resetTime) {
          const resetDate = new Date(parseInt(resetTime) * 1000);
          console.warn(`   Resets at: ${resetDate.toLocaleTimeString()}`);
        }
      }
      
      if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
        const resetTime = response.headers.get('X-RateLimit-Reset');
        if (resetTime) {
          const waitTime = (parseInt(resetTime) * 1000) - Date.now() + 1000;
          if (waitTime > 0 && waitTime < 60000) {
            console.log(`⏳ Rate limited. Waiting ${Math.ceil(waitTime / 1000)}s...`);
            await sleep(waitTime);
            continue;
          }
        }
        throw new Error('Rate limited by GitHub API. Please try again later or use a token.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`⚠️  Request failed, retrying (${i + 1}/${retries})...`);
      await sleep(CONFIG.rateLimitDelay * (i + 1));
    }
  }
  throw new Error('Max retries exceeded');
}

// Search GitHub for repositories with a specific topic
async function searchRepositories(topic: string): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CONFIG.searchSettings.maxAgeDays);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
  
  console.log(`\n🔍 Searching for topic: ${topic}`);
  
  for (let page = 1; page <= CONFIG.searchSettings.maxPages; page++) {
    const query = encodeURIComponent(
      `topic:${topic} pushed:>${cutoffDateStr} stars:>=${CONFIG.searchSettings.minStars} fork:false archived:false`
    );
    const url = `${CONFIG.apiBaseUrl}/search/repositories?q=${query}&sort=stars&order=desc&per_page=${CONFIG.searchSettings.perPage}&page=${page}`;
    
    try {
      const response = await fetchWithRetry(url);
      const data: GitHubSearchResponse = await response.json();
      
      if (data.items.length === 0) {
        console.log(`   Page ${page}: No more results`);
        break;
      }
      
      allRepos.push(...data.items);
      console.log(`   Page ${page}: Found ${data.items.length} repos (total: ${allRepos.length}/${data.total_count})`);
      
      if (allRepos.length >= data.total_count) {
        break;
      }
      
      await sleep(CONFIG.rateLimitDelay);
    } catch (error) {
      console.error(`   ❌ Error on page ${page}:`, error);
      break;
    }
  }
  
  return allRepos;
}

// Check if a repository has build.zig or build.zig.zon
async function hasZigBuildFiles(owner: string, repo: string, defaultBranch: string): Promise<boolean> {
  try {
    // Check for build.zig
    const buildZigUrl = `${CONFIG.apiBaseUrl}/repos/${owner}/${repo}/contents/build.zig?ref=${defaultBranch}`;
    const response = await fetch(buildZigUrl, { headers: getHeaders(), method: 'HEAD' });
    if (response.ok) return true;
    
    // Check for build.zig.zon
    const zonUrl = `${CONFIG.apiBaseUrl}/repos/${owner}/${repo}/contents/build.zig.zon?ref=${defaultBranch}`;
    const zonResponse = await fetch(zonUrl, { headers: getHeaders(), method: 'HEAD' });
    return zonResponse.ok;
  } catch {
    return false;
  }
}

// Convert repository name to filename (kebab-case)
function toFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50); // Limit filename length
}

// Determine category from topics
function determineCategory(topics: string[], isApplication: boolean): string | undefined {
  const categoryMap: Record<string, string> = {
    // Package categories
    'json': 'data-formats',
    'parser': 'parsing',
    'http': 'networking',
    'network': 'networking',
    'networking': 'networking',
    'tcp': 'networking',
    'udp': 'networking',
    'websocket': 'networking',
    'crypto': 'cryptography',
    'cryptography': 'cryptography',
    'encryption': 'cryptography',
    'async': 'async',
    'concurrency': 'async',
    'io': 'io',
    'filesystem': 'io',
    'gui': 'gui',
    'graphics': 'graphics',
    'opengl': 'graphics',
    'vulkan': 'graphics',
    'rendering': 'graphics',
    'game': 'game-development',
    'gamedev': 'game-development',
    'game-engine': 'game-development',
    'math': 'math',
    'linear-algebra': 'math',
    'simd': 'math',
    'testing': 'testing',
    'database': 'database',
    'sql': 'database',
    'sqlite': 'database',
    'logging': 'logging',
    'cli': 'cli',
    'command-line': 'cli',
    'terminal': 'cli',
    'compression': 'compression',
    'zlib': 'compression',
    'audio': 'audio',
    'sound': 'audio',
    'image': 'image',
    'png': 'image',
    'jpeg': 'image',
    'allocator': 'memory',
    'memory': 'memory',
    'ffi': 'ffi',
    'c-interop': 'ffi',
    'bindings': 'ffi',
    'wasm': 'wasm',
    'webassembly': 'wasm',
    'embedded': 'embedded',
    'microcontroller': 'embedded',
    'arm': 'embedded',
    'riscv': 'embedded',
    
    // Application categories
    'editor': 'development-tools',
    'ide': 'development-tools',
    'debugger': 'development-tools',
    'compiler': 'compilers',
    'interpreter': 'compilers',
    'language': 'compilers',
    'shell': 'system-tools',
    'system': 'system-tools',
    'utility': 'utilities',
    'tool': 'utilities',
    'server': 'servers',
    'web-server': 'servers',
    'proxy': 'servers',
    'emulator': 'emulators',
    'vm': 'emulators',
    'virtual-machine': 'emulators',
  };
  
  for (const topic of topics) {
    const lowerTopic = topic.toLowerCase();
    if (categoryMap[lowerTopic]) {
      return categoryMap[lowerTopic];
    }
  }
  
  // Default categories
  return isApplication ? 'utilities' : undefined;
}

// Create registry entry from GitHub repo
function createRegistryEntry(repo: GitHubRepo, isApplication: boolean): RegistryEntry {
  const topics = repo.topics || [];
  
  const entry: RegistryEntry = {
    name: repo.name,
    owner: repo.owner.login,
    repo: repo.name,
    description: (repo.description || `A Zig ${isApplication ? 'application' : 'package'}`).substring(0, 200),
  };
  
  // Add category
  const category = determineCategory(topics, isApplication);
  if (category) {
    entry.category = category;
  }
  
  // Add license
  if (repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION') {
    entry.license = repo.license.spdx_id;
  }
  
  // Add homepage
  if (repo.homepage && repo.homepage.trim()) {
    entry.homepage = repo.homepage;
  }
  
  return entry;
}

// Save registry entry to JSON file
function saveRegistryEntry(entry: RegistryEntry, outputDir: string): void {
  const filename = `${toFilename(entry.name)}.json`;
  const filepath = path.join(outputDir, filename);
  
  // Check if file already exists
  if (fs.existsSync(filepath)) {
    console.log(`   ⏭️  Skipping ${filename} (already exists)`);
    return;
  }
  
  const content = JSON.stringify(entry, null, 2) + '\n';
  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`   ✅ Created ${filename}`);
}

// Ensure output directories exist
function ensureDirectories(): void {
  for (const dir of Object.values(CONFIG.outputDirs)) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }
}

// Get existing entries to avoid duplicates
function getExistingEntries(dir: string): Set<string> {
  const entries = new Set<string>();
  
  if (!fs.existsSync(dir)) return entries;
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      const entry = JSON.parse(content) as RegistryEntry;
      entries.add(`${entry.owner}/${entry.repo}`.toLowerCase());
    } catch {
      // Ignore invalid files
    }
  }
  
  return entries;
}

// Main function
async function main(): Promise<void> {
  console.log('🦎 Zig Registry Auto-Generator');
  console.log('================================\n');
  
  // Check for GitHub token
  const token = getGitHubToken();
  if (!token) {
    console.warn('⚠️  No GitHub token found. Using unauthenticated requests.');
    console.warn('   Rate limit: 10 requests/minute');
    console.warn('   Set GH_TOKEN or GITHUB_TOKEN in .env for higher limits.\n');
  } else {
    console.log('✅ GitHub token found. Using authenticated requests.');
    console.log('   Rate limit: 30 requests/minute for search API\n');
  }
  
  // Ensure output directories exist
  ensureDirectories();
  
  // Get existing entries
  const existingPackages = getExistingEntries(CONFIG.outputDirs.packages);
  const existingApplications = getExistingEntries(CONFIG.outputDirs.applications);
  
  console.log(`📦 Existing packages: ${existingPackages.size}`);
  console.log(`🖥️  Existing applications: ${existingApplications.size}`);
  
  // Track statistics
  const stats = {
    packagesFound: 0,
    packagesAdded: 0,
    packagesSkipped: 0,
    applicationsFound: 0,
    applicationsAdded: 0,
    applicationsSkipped: 0,
  };
  
  // Search for packages
  console.log('\n📦 Searching for Zig packages...');
  const packageRepos = new Map<string, GitHubRepo>();
  
  for (const topic of CONFIG.topics.packages) {
    const repos = await searchRepositories(topic);
    for (const repo of repos) {
      const key = `${repo.owner.login}/${repo.name}`.toLowerCase();
      if (!packageRepos.has(key)) {
        packageRepos.set(key, repo);
      }
    }
    await sleep(CONFIG.rateLimitDelay);
  }
  
  stats.packagesFound = packageRepos.size;
  console.log(`\n📦 Total unique packages found: ${packageRepos.size}`);
  
  // Process packages
  console.log('\n📝 Processing packages...');
  for (const [key, repo] of packageRepos) {
    if (existingPackages.has(key)) {
      stats.packagesSkipped++;
      continue;
    }
    
    // Skip if it looks like an application (has zig-application topic)
    if (repo.topics?.some(t => CONFIG.topics.applications.includes(t))) {
      continue;
    }
    
    const entry = createRegistryEntry(repo, false);
    saveRegistryEntry(entry, CONFIG.outputDirs.packages);
    stats.packagesAdded++;
    
    await sleep(100); // Small delay between writes
  }
  
  // Search for applications
  console.log('\n🖥️  Searching for Zig applications...');
  const applicationRepos = new Map<string, GitHubRepo>();
  
  for (const topic of CONFIG.topics.applications) {
    const repos = await searchRepositories(topic);
    for (const repo of repos) {
      const key = `${repo.owner.login}/${repo.name}`.toLowerCase();
      if (!applicationRepos.has(key)) {
        applicationRepos.set(key, repo);
      }
    }
    await sleep(CONFIG.rateLimitDelay);
  }
  
  stats.applicationsFound = applicationRepos.size;
  console.log(`\n🖥️  Total unique applications found: ${applicationRepos.size}`);
  
  // Process applications
  console.log('\n📝 Processing applications...');
  for (const [key, repo] of applicationRepos) {
    if (existingApplications.has(key)) {
      stats.applicationsSkipped++;
      continue;
    }
    
    const entry = createRegistryEntry(repo, true);
    saveRegistryEntry(entry, CONFIG.outputDirs.applications);
    stats.applicationsAdded++;
    
    await sleep(100); // Small delay between writes
  }
  
  // Print summary
  console.log('\n================================');
  console.log('📊 Summary');
  console.log('================================');
  console.log(`📦 Packages:`);
  console.log(`   Found: ${stats.packagesFound}`);
  console.log(`   Added: ${stats.packagesAdded}`);
  console.log(`   Skipped (existing): ${stats.packagesSkipped}`);
  console.log(`🖥️  Applications:`);
  console.log(`   Found: ${stats.applicationsFound}`);
  console.log(`   Added: ${stats.applicationsAdded}`);
  console.log(`   Skipped (existing): ${stats.applicationsSkipped}`);
  console.log('\n✅ Done!');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
