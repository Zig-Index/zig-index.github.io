"use client";

import { useMemo } from "react";
import Fuse from "fuse.js";
import type { RegistryEntryWithCategory, Sort } from "@/lib/schemas";

// Hook: Filter and sort registry entries
export function useFilteredRegistry(
  entries: RegistryEntryWithCategory[],
  options: {
    search?: string;
    type?: "all" | "package" | "application";
    categoryFilter?: string;
    statusFilter?: "all" | "exists" | "deleted";
    license?: string;
    topics?: string[];
    minStars?: number;
    updatedWithin?: string;
    sort?: Sort;
    page?: number;
    pageSize?: number;
  }
) {
  // Build search index
  const fuse = useMemo(() => {
    if (!entries || entries.length === 0) return null;
    return new Fuse(entries, {
      keys: [
        { name: "name", weight: 2 },
        { name: "fullName", weight: 1.5 },
        { name: "description", weight: 1 },
        { name: "category", weight: 1.5 },
        { name: "owner", weight: 0.8 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
      includeScore: true,
    });
  }, [entries]);

  return useMemo(() => {
    let filtered = [...entries];

    // Filter by type (package/application)
    if (options.type && options.type !== "all") {
      filtered = filtered.filter(e => e.type === options.type);
    }

    // Apply search using Fuse.js
    if (options.search && options.search.trim() && fuse) {
      const searchResults = fuse.search(options.search);
      const matchedNames = new Set(searchResults.map(r => r.item.fullName));
      filtered = filtered.filter(e => matchedNames.has(e.fullName));
    }

    // Filter by category
    if (options.categoryFilter) {
      filtered = filtered.filter(e => e.category === options.categoryFilter);
    }

    // Filter by license
    if (options.license) {
      filtered = filtered.filter(e => e.license === options.license);
    }

    // Filter by topics
    if (options.topics && options.topics.length > 0) {
      filtered = filtered.filter(e => {
        if (!e.topics || e.topics.length === 0) return false;
        // Check if entry has ALL selected topics (AND logic)
        // Or ANY selected topic (OR logic) - usually OR is better for discovery, but AND is better for narrowing
        // Let's use OR logic for now as it's more common in simple filters
        // Actually, for "narrow down", AND is often expected. But if I select "game" and "graphics", I might want things that are both.
        // Let's stick to OR for now as it's easier to get results.
        // Wait, usually filters are additive (AND) across categories, but within a multi-select it can be OR.
        // Let's assume OR for now.
        return options.topics!.some(topic => e.topics.includes(topic));
      });
    }

    // Filter by minimum stars
    if (options.minStars && options.minStars > 0) {
      filtered = filtered.filter(e => (e.stars || 0) >= (options.minStars || 0));
    }

    // Filter by updated within
    if (options.updatedWithin && options.updatedWithin !== "all") {
      const now = Date.now();
      const cutoffMap: Record<string, number> = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000,
      };
      const cutoffMs = cutoffMap[options.updatedWithin];
      if (cutoffMs) {
        filtered = filtered.filter(e => {
          if (!e.updated_at) return false;
          const updatedAt = new Date(e.updated_at).getTime();
          return (now - updatedAt) <= cutoffMs;
        });
      }
    }

    // Sorting
    if (options.sort) {
      const { field, order } = options.sort;
      filtered.sort((a, b) => {
        let valA: any;
        let valB: any;

        // Handle specific fields
        if (field === "stars") {
          valA = a.stars || 0;
          valB = b.stars || 0;
        } else if (field === "updated") {
          valA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          valB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        } else if (field === "name") {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else {
          // Default fallback
          valA = (a as any)[field];
          valB = (b as any)[field];
        }

        if (valA < valB) return order === "asc" ? -1 : 1;
        if (valA > valB) return order === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Paginate
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      total,
      totalPages,
      page,
      pageSize,
    };
  }, [entries, options, fuse]);
}

// Get unique categories from all entries
export function getUniqueCategories(entries: RegistryEntryWithCategory[]): string[] {
  const categoriesSet = new Set<string>();
  for (const entry of entries) {
    if (entry.category) {
      categoriesSet.add(entry.category);
    }
  }
  return Array.from(categoriesSet).sort();
}

// Get unique licenses from entries (returns { key, name } format for Filters)
export function getUniqueLicenses(entries: RegistryEntryWithCategory[]): { key: string; name: string }[] {
  const licensesSet = new Set<string>();
  for (const entry of entries) {
    if (entry.license) {
      licensesSet.add(entry.license);
    }
  }
  return Array.from(licensesSet)
    .sort()
    .map(license => ({ key: license, name: license }));
}

// Get unique topics from all entries
export function getUniqueTopics(entries: RegistryEntryWithCategory[]): string[] {
  const topicsSet = new Set<string>();
  for (const entry of entries) {
    if (entry.topics && Array.isArray(entry.topics)) {
      for (const topic of entry.topics) {
        topicsSet.add(topic);
      }
    }
  }
  return Array.from(topicsSet).sort();
}
