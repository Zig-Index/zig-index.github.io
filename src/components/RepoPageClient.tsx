"use client";

import * as React from "react";
import { RepoDetailPage as RepoDetailContent } from "./RepoDetailPage";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { EmptyState } from "./SyncStatus";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Separator } from "./ui/separator";
import { FileText } from "lucide-react";
import type { RegistryEntryWithCategory } from "@/lib/schemas";

// Skeleton for initial page load (before URL params are parsed)
function RepoPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mesh-gradient relative overflow-hidden">
        {/* Header skeleton */}
        <div className="border-b hero-gradient relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 py-8 relative z-10">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-4 w-12" />
              <span className="text-muted-foreground">/</span>
              <Skeleton className="h-4 w-16" />
              <span className="text-muted-foreground">/</span>
              <Skeleton className="h-4 w-24" />
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <Skeleton className="h-8 sm:h-9 w-40 sm:w-48 mb-2" />
                <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 mb-4" />
                <Skeleton className="h-5 sm:h-6 w-full max-w-lg mb-4" />
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
                  <Skeleton className="h-5 sm:h-6 w-20 sm:w-24 rounded-full" />
                  <Skeleton className="h-5 sm:h-6 w-12 sm:w-16 rounded-full" />
                </div>
                {/* Installation commands skeleton */}
                <div className="mb-4">
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 mb-2" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 sm:p-3 border">
                      <Skeleton className="h-3 w-8 hidden sm:block" />
                      <Skeleton className="h-3 sm:h-4 flex-1" />
                      <Skeleton className="h-6 sm:h-7 w-6 sm:w-7 rounded" />
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 sm:p-3 border">
                      <Skeleton className="h-3 w-8 hidden sm:block" />
                      <Skeleton className="h-3 sm:h-4 flex-1" />
                      <Skeleton className="h-6 sm:h-7 w-6 sm:w-7 rounded" />
                    </div>
                  </div>
                </div>
                {/* Badges skeleton */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
                  <Skeleton className="h-5 sm:h-6 w-12 sm:w-16 rounded-full" />
                  <Skeleton className="h-5 sm:h-6 w-18 sm:w-22 rounded-full" />
                </div>
              </div>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <Skeleton className="h-9 sm:h-10 w-32 sm:w-36" />
                <Skeleton className="h-9 sm:h-10 w-24 sm:w-28" />
                <Skeleton className="h-9 sm:h-10 w-28 sm:w-32" />
              </div>
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* README skeleton */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <Skeleton className="h-5 sm:h-6 w-2/3 sm:w-3/4" />
                  <Skeleton className="h-3 sm:h-4 w-full" />
                  <Skeleton className="h-3 sm:h-4 w-full" />
                  <Skeleton className="h-3 sm:h-4 w-1/2 sm:w-2/3" />
                  <Skeleton className="h-24 sm:h-32 w-full" />
                  <Skeleton className="h-3 sm:h-4 w-full" />
                  <Skeleton className="h-3 sm:h-4 w-4/5 sm:w-5/6" />
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar skeleton */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 sm:h-5 w-10 sm:w-12" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 sm:h-5 w-10 sm:w-12" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-18" />
                    <Skeleton className="h-4 sm:h-5 w-10 sm:w-12" />
                  </div>
                </CardContent>
              </Card>
              
              {/* Details Card */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-20" />
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                    <Skeleton className="h-5 sm:h-6 w-14 sm:w-16 rounded-full" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 sm:h-4 w-14 sm:w-16" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                    <Skeleton className="h-3 sm:h-4 w-24 sm:w-28" />
                  </div>
                </CardContent>
              </Card>
              
              {/* Links Card */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-16" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-9 sm:h-10 w-full" />
                  <Skeleton className="h-9 sm:h-10 w-full" />
                  <Skeleton className="h-9 sm:h-10 w-full" />
                  <Skeleton className="h-9 sm:h-10 w-full" />
                  <Skeleton className="h-9 sm:h-10 w-full" />
                </CardContent>
              </Card>

              {/* Versions Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-5 w-8 rounded-full ml-auto" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Dependencies Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 sm:h-5 w-full" />
                    <Skeleton className="h-4 sm:h-5 w-2/3 sm:w-3/4" />
                    <Skeleton className="h-4 sm:h-5 w-1/2 sm:w-2/3" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Client-side component that extracts owner/name from URL hash
interface RepoPageClientProps {
  registryEntries?: RegistryEntryWithCategory[];
}

export function RepoPageClient({ registryEntries = [] }: RepoPageClientProps) {
  const [owner, setOwner] = React.useState<string | null>(null);
  const [name, setName] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Get the path from either query params or hash
    const params = new URLSearchParams(window.location.search);
    const ownerParam = params.get("owner");
    const nameParam = params.get("name");

    if (ownerParam && nameParam) {
      setOwner(ownerParam);
      setName(nameParam);
    } else {
      // Try to parse from hash: #owner/name
      const hash = window.location.hash.slice(1); // Remove #
      if (hash) {
        const parts = hash.split("/");
        if (parts.length >= 2) {
          setOwner(parts[0]);
          setName(parts.slice(1).join("/")); // Handle names with slashes
        } else {
          setError("Invalid URL format. Expected: /repo?owner=xxx&name=yyy or /repo#owner/name");
        }
      } else {
        setError("No repository specified. Use /repo?owner=xxx&name=yyy or /repo#owner/name");
      }
    }
  }, []);

  // Look up the entry from registry
  const entry = React.useMemo(() => {
    if (!owner || !name) return undefined;
    return registryEntries.find(
      e => e.owner.toLowerCase() === owner.toLowerCase() && 
           e.repo.toLowerCase() === name.toLowerCase()
    );
  }, [registryEntries, owner, name]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="Invalid URL"
            description={error}
            action={{
              label: "Go to Registry",
              onClick: () => window.location.href = "/registry",
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (!owner || !name) {
    return <RepoPageSkeleton />;
  }

  return <RepoDetailContent owner={owner} name={name} entry={entry} />;
}

export default RepoPageClient;
