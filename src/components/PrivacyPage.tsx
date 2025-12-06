"use client";

import * as React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import type { SearchItem } from "@/lib/schemas";

interface PrivacyPageProps {
  searchItems?: SearchItem[];
}

export function PrivacyPage({ searchItems = [] }: PrivacyPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar searchItems={searchItems} />

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert readme-content">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

          <p className="text-muted-foreground mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p>
              {import.meta.env.PUBLIC_SITE_NAME || "Zig Index"} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website at <a href={import.meta.env.PUBLIC_SITE_URL || "https://zig-index.github.io"} className="text-primary hover:underline">{import.meta.env.PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || "zig-index.github.io"}</a>.
            </p>
          </section>

          <section className="mb-8 p-4 bg-muted/50 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
            <p className="text-sm text-muted-foreground">
              {import.meta.env.PUBLIC_SITE_NAME || "Zig Index"} is an independent and unofficial registry of Zig projects. It is not affiliated with, endorsed by, or maintained by the Zig Software Foundation or any of its founders. All projects listed on this website are owned and maintained by their respective developers and the community. No ownership or responsibility is claimed over any third-party software hosted or indexed. We do not own or claim any rights to trademarks, logos, or names referenced or displayed; all such assets belong to their respective owners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>

            <h3 className="text-xl font-medium mb-3">Analytics Data</h3>
            <p>We use Google Analytics to understand how visitors interact with our website. This service may collect:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Pages visited and time spent on each page</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referring website</li>
              <li>General geographic location (country/city level)</li>
              <li>Device type (desktop, mobile, tablet)</li>
            </ul>
            <p>
              Google Analytics uses cookies and similar technologies to collect this information. 
              <strong>We only activate Google Analytics if you explicitly accept cookies via our consent banner.</strong>
              You can change your preference at any time by clearing your browser's local storage for this site.
              Additionally, you can opt out of Google Analytics across all websites by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a>.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">Local Storage</h3>
            <p>
              We use your browser's local storage (IndexedDB) to cache repository data from GitHub. This improves performance and reduces API requests. This data is stored locally on your device and is not transmitted to our servers.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">Public Repository Indexing</h3>
            <p>
              Our automated system scans public GitHub repositories that are tagged with specific topics (e.g., <code>zig-package</code> or <code>zig-application</code>). We collect and display public metadata from these repositories, including:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Repository name, description, and URL</li>
              <li>Owner username and avatar</li>
              <li>Star counts, fork counts, and license information</li>
              <li>Release information and tags</li>
              <li>Dependency information from <code>build.zig.zon</code> files</li>
            </ul>
            <p>
              This information is already publicly available on GitHub. By tagging your repository, you consent to having this public information indexed and displayed on our service. We do not access private repositories or collect personal data beyond what is publicly exposed via the GitHub API.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6">
              <li>Understand how visitors use our website</li>
              <li>Improve our website's performance and user experience</li>
              <li>Identify and fix technical issues</li>
              <li>Analyze traffic patterns and popular content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p>Our website integrates with the following third-party services:</p>

            <h3 className="text-xl font-medium mb-3">GitHub API</h3>
            <p>
              We fetch repository information from GitHub's public API. When you browse package details, we request data directly from GitHub. This is subject to <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub's Privacy Policy</a>.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-4">GitHub Pages</h3>
            <p>
              This website is hosted on GitHub Pages, which may collect basic server logs. See <a href="https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#data-collection" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub Pages Data Collection</a> for more information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
            <p>
              We use cookies primarily through Google Analytics. Cookies are small text files stored on your device that help us analyze web traffic. 
            </p>
            <p className="mt-2">
              When you first visit our site, we ask for your consent to use these cookies. If you choose to "Reject All", we will not load Google Analytics scripts, and no analytics cookies will be set.
              You can also control cookies through your browser settings or by using browser extensions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p>
              We do not collect personal information directly. All data processing is done through established third-party services (Google Analytics, GitHub) that maintain their own security standards. Local cached data in IndexedDB remains on your device.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6">
              <li>Opt out of Google Analytics tracking</li>
              <li>Clear locally stored cache data through your browser settings</li>
              <li>Use browser privacy features (incognito mode, tracking protection)</li>
              <li>Contact us with questions about this policy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p>
              Our website is not directed at children under 13 years of age. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Open Source</h2>
            <p>
              {import.meta.env.PUBLIC_SITE_NAME || "Zig Index"} is an open-source project. You can review our source code on <a href={import.meta.env.PUBLIC_REPO_URL || "https://github.com/Zig-Index/zig-index.github.io"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub</a> to see exactly how we handle data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please open an issue on our <a href={`${import.meta.env.PUBLIC_REPO_URL || "https://github.com/Zig-Index/zig-index.github.io"}/issues`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub repository</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PrivacyPage;