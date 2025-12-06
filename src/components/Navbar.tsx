"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { 
  Search, 
  Menu, 
  Package, 
  Cpu, 
  Github, 
  Zap, 
  Plus,
  ArrowRight,
  X,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import Fuse from "fuse.js";
import { useNavbarStore } from "@/stores/useAppStore";
import type { SearchItem } from "@/lib/schemas";
import { useAuthStore } from "@/stores/useAuthStore";
import { SignInDialog } from "./SignInDialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

interface NavbarProps {
  onSearch?: (query: string) => void;
  searchValue?: string;
  searchItems?: SearchItem[];
  /** If true, search acts as a filter for the current page instead of navigating */
  isFilterMode?: boolean;
  /** The type of page we're on (for filtering context) */
  pageType?: "packages" | "applications" | "search" | "all";
}

const navLinks = [
  { href: "/packages", label: "Packages", icon: Package },
  { href: "/applications", label: "Applications", icon: Cpu },
];

// Default empty array to prevent re-renders
const DEFAULT_SEARCH_ITEMS: SearchItem[] = [];

export function Navbar({ 
  onSearch, 
  searchValue, 
  searchItems = DEFAULT_SEARCH_ITEMS,
  isFilterMode = false,
  pageType = "all"
}: NavbarProps) {
  const {
    isOpen, setIsOpen,
    showSuggestions, setShowSuggestions,
    suggestions, setSuggestions,
    typeFilter, setTypeFilter,
    localSearch, setLocalSearch
  } = useNavbarStore();

  const { 
    user, 
    isAuthenticated, 
    logout, 
    showSignInDialog, 
    setShowSignInDialog,
    setToken,
    setUser
  } = useAuthStore();

  // Handle OAuth callback
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1)); // remove #
      const accessToken = params.get("access_token");

      if (accessToken) {
        // Clear hash to clean up URL
        window.history.replaceState(null, "", window.location.pathname);
        
        // Verify token and set user
        const verifyToken = async () => {
          try {
            const userResponse = await fetch("https://api.github.com/user", {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
              },
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              setToken(accessToken);
              setUser({
                login: userData.login,
                avatar_url: userData.avatar_url,
                name: userData.name,
              });
            }
          } catch (e) {
            console.error("Failed to verify token", e);
          }
        };
        verifyToken();
      }
    }
  }, [setToken, setUser]);

  const searchRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Build search index
  const fuse = React.useMemo(() => {
    if (!searchItems || searchItems.length === 0) return null;
    return new Fuse(searchItems, {
      keys: [
        { name: "name", weight: 2 },
        { name: "description", weight: 1 },
        { name: "owner", weight: 0.8 },
        { name: "category", weight: 0.5 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
    });
  }, [searchItems]);

  // Update suggestions when search changes
  React.useEffect(() => {
    let itemsToShow: SearchItem[] = [];
    
    if (!localSearch.trim()) {
      // Show all items when focused but no search query (grouped by type)
      itemsToShow = [...searchItems];
    } else if (fuse) {
      // Show search results
      const results = fuse.search(localSearch);
      itemsToShow = results.map(r => r.item);
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      itemsToShow = itemsToShow.filter(item => item.type === typeFilter);
    }
    
    // Limit to 12 suggestions
    const newSuggestions = itemsToShow.slice(0, 12);
    
    // Only update if suggestions actually changed to prevent loops
    // Simple length check + first/last item check for performance
    // or just rely on Zustand's equality check if we passed a selector, but here we set it.
    // We can check if JSON stringify matches but that's expensive.
    // Instead, we rely on the fact that if dependencies haven't changed, this effect won't run.
    // The issue before was searchItems changing on every render.
    // Now we use DEFAULT_SEARCH_ITEMS.
    
    setSuggestions(newSuggestions);
  }, [localSearch, fuse, searchItems, typeFilter, setSuggestions]);

  // Close suggestions when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowSuggestions]);

  // Navigate to search page on submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (localSearch.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(localSearch.trim())}`;
    }
  };

  // Handle search input change - just update local state for suggestions
  const handleSearchInputChange = (value: string) => {
    setLocalSearch(value);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getCategoryIcon = (type: "package" | "application") => {
    return type === "package" ? Package : Cpu;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 mr-6 shrink-0" title={`${import.meta.env.PUBLIC_SITE_NAME || "Zig Index"} - Home`}>
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-8 h-8 bg-linear-to-br from-primary to-primary/70 rounded-lg shadow-lg"
          >
            <Zap className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          <span className="font-bold text-xl hidden sm:block bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
            {import.meta.env.PUBLIC_SITE_NAME || "Zig Index"}
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
              title={`Browse ${link.label}`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </a>
          ))}
        </nav>

        {/* Spacer to push search and actions to right */}
        <div className="flex-1" />

        {/* Search Bar with Dropdown - Desktop (now on right side) */}
        <div ref={searchRef} className="hidden md:flex items-center w-full max-w-sm relative mr-4">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search packages & applications..."
                value={localSearch}
                onChange={(e) => {
                  handleSearchInputChange(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="pl-10 pr-8 w-full bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
                aria-label="Search packages and applications"
              />
              {localSearch && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>

          {/* Search Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && searchItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-xl overflow-hidden z-50"
              >
                {/* Type Filter Tabs */}
                <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
                  <span className="text-xs text-muted-foreground mr-2">
                    <Filter className="w-3 h-3 inline mr-1" />
                    Filter:
                  </span>
                  <Button
                    variant={typeFilter === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTypeFilter("all")}
                    className="h-6 text-xs px-2"
                  >
                    All ({searchItems.length})
                  </Button>
                  <Button
                    variant={typeFilter === "package" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTypeFilter("package")}
                    className="h-6 text-xs px-2"
                  >
                    <Package className="w-3 h-3 mr-1" />
                    Packages ({searchItems.filter(i => i.type === "package").length})
                  </Button>
                  <Button
                    variant={typeFilter === "application" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTypeFilter("application")}
                    className="h-6 text-xs px-2"
                  >
                    <Cpu className="w-3 h-3 mr-1" />
                    Apps ({searchItems.filter(i => i.type === "application").length})
                  </Button>
                </div>

                {/* Results */}
                <div className="p-2 max-h-[400px] overflow-y-auto">
                  {suggestions.length > 0 ? (
                    suggestions.map((item, index) => {
                      const Icon = getCategoryIcon(item.type);
                      return (
                        <motion.a
                          key={item.fullName}
                          href={`/repo?owner=${encodeURIComponent(item.owner)}&name=${encodeURIComponent(item.repo)}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-start gap-3 p-3 rounded-md hover:bg-accent transition-colors group"
                          title={`View ${item.name} details`}
                        >
                          <div className={cn(
                            "p-2 rounded-md shrink-0",
                            item.type === "package" 
                              ? "bg-blue-500/10 text-blue-500" 
                              : "bg-green-500/10 text-green-500"
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{item.name}</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {item.type}
                              </Badge>
                              {item.category && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {item.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {item.description}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-0.5">
                              by {item.owner}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2" />
                        </motion.a>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No {typeFilter === "all" ? "items" : typeFilter + "s"} found
                      {localSearch && ` matching "${localSearch}"`}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="border-t p-2 bg-muted/30">
                  <div className="flex items-center gap-2">
                    {localSearch ? (
                      <a
                        href={`/search?q=${encodeURIComponent(localSearch)}`}
                        className="flex items-center justify-center gap-2 flex-1 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                        title={`Search all for "${localSearch}"`}
                      >
                        <Search className="w-4 h-4" />
                        View all results for "{localSearch}"
                      </a>
                    ) : (
                      <>
                        <a
                          href="/packages"
                          className="flex items-center justify-center gap-2 flex-1 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                          title="Browse all packages"
                        >
                          <Package className="w-4 h-4" />
                          Browse Packages
                        </a>
                        <a
                          href="/applications"
                          className="flex items-center justify-center gap-2 flex-1 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                          title="Browse all applications"
                        >
                          <Cpu className="w-4 h-4" />
                          Browse Applications
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Add Project Button - Desktop */}
          <Button 
            asChild 
            size="sm" 
            className="hidden sm:flex bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
          >
            <a href="/how-to-add" title="Add your Zig project to the registry">
              <Plus className="w-4 h-4 mr-1" />
              Add Project
            </a>
          </Button>

          <Button variant="ghost" size="icon" asChild className="hidden sm:flex" title={`View ${import.meta.env.PUBLIC_SITE_NAME || "Zig Index"} on GitHub`}>
            <a 
              href={import.meta.env.PUBLIC_REPO_URL || "https://github.com/Zig-Index/zig-index.github.io"}
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={`View ${import.meta.env.PUBLIC_SITE_NAME || "Zig Index"} source code on GitHub`}
            >
              <Github className="w-4 h-4" />
            </a>
          </Button>

          {/* Auth Button - Desktop */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 p-0 border border-border/50 hidden sm:flex">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar_url} alt={user.login} />
                    <AvatarFallback>{user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || user.login}</p>
                    <p className="text-xs leading-none text-muted-foreground">@{user.login}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSignInDialog(true)}
              className="hidden sm:flex gap-2"
            >
              <Github className="w-4 h-4" />
              Sign In
            </Button>
          )}
          
          <SignInDialog open={showSignInDialog} onOpenChange={setShowSignInDialog} />

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open navigation menu" title="Open menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-[350px] flex flex-col p-0">
              {/* Accessible Title (visually hidden) */}
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Main navigation menu for Zig Index</SheetDescription>
              
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
                <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-primary to-primary/70 rounded-lg shadow-lg">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">{import.meta.env.PUBLIC_SITE_NAME || "Zig Index"}</span>
              </div>

              <div className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
                {/* Mobile Search */}
                <div className="relative mb-2">
                  <form onSubmit={(e) => {
                    handleSearchSubmit(e);
                    setIsOpen(false);
                    window.location.href = `/search?q=${encodeURIComponent(localSearch)}`;
                  }}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search packages & applications..."
                        value={localSearch}
                        onChange={(e) => handleSearchInputChange(e.target.value)}
                        className="pl-10 pr-10 w-full h-12 text-base"
                        aria-label="Search packages and applications"
                      />
                      {localSearch && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleClearSearch}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                          title="Clear search"
                          aria-label="Clear search"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Mobile Nav Links */}
                <nav className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
                    Browse
                  </span>
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-3.5 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
                      title={`Browse ${link.label}`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                        <link.icon className="w-5 h-5 text-foreground" />
                      </div>
                      {link.label}
                    </a>
                  ))}
                </nav>

                {/* Mobile Actions */}
                <div className="flex flex-col gap-2 pt-4 border-t mt-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
                    Account & Actions
                  </span>

                  {/* Mobile Auth */}
                  {isAuthenticated && user ? (
                    <div className="flex flex-col gap-2 mb-2 px-2">
                       <div className="flex items-center gap-3 py-2 mb-2 bg-muted/50 rounded-lg p-3">
                          <Avatar className="w-10 h-10 border border-border/50">
                            <AvatarImage src={user.avatar_url} alt={user.login} />
                            <AvatarFallback>{user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-medium text-sm truncate">{user.name || user.login}</span>
                            <span className="text-xs text-muted-foreground truncate">@{user.login}</span>
                          </div>
                       </div>
                       <Button 
                         variant="outline" 
                         className="justify-start h-10 text-sm w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/30"
                         onClick={() => {
                           logout();
                           setIsOpen(false);
                         }}
                       >
                         <LogOut className="w-4 h-4 mr-2" />
                         Sign Out
                       </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="secondary" 
                      className="justify-start h-12 text-base mb-2"
                      onClick={() => {
                        setShowSignInDialog(true);
                        setIsOpen(false);
                      }}
                    >
                      <Github className="w-5 h-5 mr-3" />
                      Sign In with GitHub
                    </Button>
                  )}

                  <Button asChild className="justify-start h-12 text-base" title="Add your Zig project">
                    <a href="/how-to-add" onClick={() => setIsOpen(false)}>
                      <Plus className="w-5 h-5 mr-3" />
                      Add Your Project
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="justify-start h-12 text-base" title="View on GitHub">
                    <a 
                      href={import.meta.env.PUBLIC_REPO_URL || "https://github.com/Zig-Index/zig-index.github.io"}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Github className="w-5 h-5 mr-3" />
                      View on GitHub
                    </a>
                  </Button>
                </div>

                {/* Theme Toggle in Mobile */}
                <div className="flex items-center justify-between p-4 border-t mt-auto bg-muted/30 -mx-4 -mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Toggle Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
