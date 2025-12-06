"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { 
  Tag, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  BookOpen,
  Github,
  ArrowRight
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import type { SearchItem } from "@/lib/schemas";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function CodeBlock({ code, language = "text" }: { code: string; language?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        title={copied ? "Copied!" : "Copy code"}
        aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
      >
        {copied ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

interface HowToAddPageProps {
  searchItems?: SearchItem[];
}

export function HowToAddPage({ searchItems = [] }: HowToAddPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar searchItems={searchItems} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[40vh] flex items-center py-16 sm:py-20">
          {/* Full gradient background */}
          <div className="absolute inset-0 mesh-gradient hero-gradient" />
          
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-[10%] w-72 h-72 bg-linear-to-r from-primary/15 to-purple-500/15 rounded-full blur-3xl blob morph" />
            <div className="absolute bottom-10 right-[10%] w-80 h-80 bg-linear-to-r from-blue-500/10 to-primary/10 rounded-full blur-3xl blob blob-delay-1" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-green-500/5 to-cyan-500/5 rounded-full blur-3xl blob blob-delay-2" />
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[60px_60px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge variant="outline" className="mb-4 glass">
                <Tag className="w-3 h-3 mr-1.5" />
                Automated Discovery
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Add Your <span className="gradient-text">Zig Project</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                No Pull Requests needed. Just tag your repository on GitHub, and our bot will automatically index it within the hour.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 gradient-bg relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-primary/5 to-purple-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-br from-blue-500/5 to-primary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Step 1: Prepare Repo */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <CardTitle>Prepare Your Repository</CardTitle>
                        <CardDescription>Ensure your project meets the basic requirements</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg bg-card/50">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Public Repository
                        </h4>
                        <p className="text-sm text-muted-foreground">Your repository must be public on GitHub.</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-card/50">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Zig Project
                        </h4>
                        <p className="text-sm text-muted-foreground">Must contain Zig code or be related to the Zig ecosystem.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Step 2: Add Topics */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <CardTitle>Add GitHub Topics</CardTitle>
                        <CardDescription>Add these topics to your repository's "About" section</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        Required Topic
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">Add <strong>one</strong> of these to categorize your project:</p>
                      <div className="flex flex-wrap gap-4">
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">For Projects</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-base px-3 py-1 font-mono">zig-package</Badge>
                            <Button variant="ghost" size="icon-sm" onClick={() => navigator.clipboard.writeText('zig-package')}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Or</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-base px-3 py-1 font-mono">zig-application</Badge>
                            <Button variant="ghost" size="icon-sm" onClick={() => navigator.clipboard.writeText('zig-application')}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-500" />
                        Optional Topic
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">You can optionally add this topic to show support:</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-base px-3 py-1 font-mono">zig-index</Badge>
                        <Button variant="ghost" size="icon-sm" onClick={() => navigator.clipboard.writeText('zig-index')}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Step 3: Wait */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <CardTitle>Wait for Indexing</CardTitle>
                        <CardDescription>Our bot scans GitHub every hour</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 rounded-lg p-6 border border-dashed">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-primary/10 text-primary mt-1">
                          <Github className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">What happens next?</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            The bot will fetch your repository details, README, releases, and dependency information (from <code>build.zig.zon</code>).
                            It will then generate a JSON entry in the registry.
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>Updates automatically when you push changes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>


              {/* Step 4: Write a Good README */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        4
                      </div>
                      <div>
                        <CardTitle>Write a Good README</CardTitle>
                        <CardDescription>Help users understand your project</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      A well-written README helps users understand what your project does 
                      and how to use it. Include these sections:
                    </p>

                    <Tabs defaultValue="template" className="w-full">
                      <TabsList>
                        <TabsTrigger value="template">Template</TabsTrigger>
                        <TabsTrigger value="tips">Tips</TabsTrigger>
                      </TabsList>
                      <TabsContent value="template" className="mt-4">
                        <CodeBlock
                          language="markdown"
                          code={`# Your Project Name

Short description of what your package does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

Add this to your \`build.zig.zon\`:

\`\`\`zig
.dependencies = .{
    .your_package = .{
        .url = "https://github.com/you/your-package/archive/refs/tags/v1.0.0.tar.gz",
        .hash = "...",
    },
},
\`\`\`

## Usage

\`\`\`zig
const lib = @import("your_package");

pub fn main() !void {
    // Example usage
}
\`\`\`

## API Reference

Document your public API here.

## License

MIT License - see LICENSE file for details.`}
                        />
                      </TabsContent>
                      <TabsContent value="tips" className="mt-4">
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Start with a clear, one-line description</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Include installation instructions for Zig's package manager</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Provide usage examples with actual code</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Document minimum Zig version requirements</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Add badges for build status, version, etc.</span>
                          </li>
                        </ul>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>

              {/* What happens next */}
              <motion.div variants={itemVariants}>
                <Card className="bg-primary text-primary-foreground">
                  <CardHeader>
                    <CardTitle>What Happens Next?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-primary-foreground/90">
                      Once your PR is merged, your project will appear on Zig Index immediately!
                      The site is rebuilt automatically when changes are merged.
                      Live stats (stars, forks, watchers) are fetched on-demand from GitHub.
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <Button variant="secondary" asChild>
                        <a href="/projects">
                          Browse Projects
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Why use Zig Index?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The simplest way to discover quality Zig packages and applications.
                    We provide an automated registry, live GitHub stats with smart caching, 
                    powerful search, and a community-driven contribution process.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How long until my project appears?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our bot scans GitHub every hour. Once you add the required topic, 
                    your project should appear in the next indexing cycle.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Can I update my project information?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! Just update your GitHub repository (description, topics, README). 
                    The bot will automatically detect changes and update the registry.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Can I remove my project from Zig Index?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! Simply remove the <code>zig-package</code> or <code>zig-application</code> topic 
                    from your GitHub repository. The bot will remove it from the registry in the next cycle.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Where does the star/fork data come from?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Live stats are fetched from GitHub's API when users view the registry. 
                    This data is cached locally for performance. Your project's basic info (name, description) 
                    is synced from your GitHub repository.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default HowToAddPage;
