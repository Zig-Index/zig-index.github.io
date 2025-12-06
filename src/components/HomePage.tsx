"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Hero, Features, QuickCategories } from "./Hero";
import { RegistryCard, RegistryCardSkeleton } from "./RepoCard";
import { EmptyState } from "./SyncStatus";
import { Button } from "./ui/button";
import { ArrowRight, Package } from "lucide-react";
import type { RegistryEntryWithCategory, CombinedRepoData } from "@/lib/schemas";

// Helper to convert RegistryEntryWithCategory to CombinedRepoData
function toCombined(entry: RegistryEntryWithCategory): CombinedRepoData {
  return {
    ...entry,
    status: "exists",
    stats: {
      fullName: entry.fullName,
      description: entry.description,
      stargazers_count: entry.stars || 0,
      forks_count: entry.forks || 0,
      watchers_count: entry.watchers || 0,
      open_issues_count: 0,
      pushed_at: entry.updated_at || null,
      updated_at: entry.updated_at || null,
      language: null,
      topics: entry.topics || [],
      archived: false,
      license: entry.license || null,
      lastFetched: Date.now(),
    }
  };
}

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 1,
    },
  },
});

interface HomePageContentProps {
  registryEntries?: RegistryEntryWithCategory[];
}

function HomePageContent({ 
  registryEntries = [], 
}: HomePageContentProps) {
  // Sort all projects by stars
  const popularProjects = React.useMemo(() => {
    return registryEntries
      .sort((a, b) => (b.stars || 0) - (a.stars || 0));
  }, [registryEntries]);

  // Prepare search items for navbar
  const searchItems = React.useMemo(() => {
    return registryEntries.map(e => ({
      name: e.name,
      owner: e.owner,
      repo: e.repo,
      description: e.description,
      category: e.category,
      type: e.type,
      fullName: e.fullName,
    }));
  }, [registryEntries]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar searchItems={searchItems} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Features */}
        <Features />

        {/* Quick Categories */}
        <QuickCategories />

        {/* Popular Projects */}
        <section className="py-12 sm:py-16 lg:py-20 mesh-gradient relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                  Popular Projects
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Most popular Zig projects
                </p>
              </div>
              <Button variant="outline" asChild className="shrink-0">
                <a href="/projects" title="View all projects">
                  View All Projects
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {popularProjects.length > 0 ? (
                  popularProjects.slice(0, 9).map((entry, index) => (
                    <motion.div
                      key={entry.fullName}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <RegistryCard 
                        entry={toCombined(entry)} 
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState
                      icon={<Package className="w-12 h-12" />}
                      title="No projects yet"
                      description="Add projects to the registry via Pull Request"
                      action={{ label: "How to Add", onClick: () => window.location.href = "/how-to-add" }}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-linear-to-br from-primary via-primary/90 to-purple-600" />
          {/* Animated blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl blob" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl blob blob-delay-1" />
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-primary-foreground">Learn How</h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto text-sm sm:text-base">
                Share your work with the Zig community. Adding your project is simple—just add a GitHub tag to your repository.
              </p>
              <Button size="lg" variant="secondary" asChild className="hover-lift">
                <a href="/how-to-add" title="Learn how to add your project">
                  Add Your Project
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Props interface for HomePage
interface HomePageProps {
  registryEntries?: RegistryEntryWithCategory[];
}

// Wrapper with QueryProvider
export function HomePage({ registryEntries }: HomePageProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <HomePageContent 
        registryEntries={registryEntries}
      />
    </QueryClientProvider>
  );
}

export default HomePage;
