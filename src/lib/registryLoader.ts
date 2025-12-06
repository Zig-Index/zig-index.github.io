import { getCollection } from "astro:content";
import type { RegistryEntryWithCategory } from "./schemas";
import { convertRegistryEntryToCombined } from "./schemas";

// Load all registry entries at build time
export async function loadRegistryData(): Promise<RegistryEntryWithCategory[]> {
  const repositories = await getCollection("repositories");
  
  const entries: RegistryEntryWithCategory[] = [];
  
  for (const repo of repositories) {
    entries.push(convertRegistryEntryToCombined(repo.data, repo.data.type));
  }
  
  return entries;
}

// Get stats from all registry entries
export function getRegistryStats(entries: RegistryEntryWithCategory[]): {
  totalPackages: number;
  totalApplications: number;
  totalEntries: number;
  allCategories: string[];
  allLicenses: string[];
} {
  const packages = entries.filter(e => e.type === "package" || e.type === "project");
  const applications = entries.filter(e => e.type === "application");
  
  const categoriesSet = new Set<string>();
  const licensesSet = new Set<string>();
  
  for (const entry of entries) {
    if (entry.category) {
      categoriesSet.add(entry.category);
    }
    if (entry.license) {
      licensesSet.add(entry.license);
    }
  }
  
  return {
    totalPackages: packages.length,
    totalApplications: applications.length,
    totalEntries: entries.length,
    allCategories: Array.from(categoriesSet).sort(),
    allLicenses: Array.from(licensesSet).sort(),
  };
}
