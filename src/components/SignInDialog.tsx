"use client";

import * as React from "react";
import { Github, Key, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { fetchUserProfile } from "@/lib/githubFetcher";
import { toast } from "sonner";

export function SignInDialog({ 
  trigger, 
  open, 
  onOpenChange 
}: { 
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [deviceCodeData, setDeviceCodeData] = React.useState<{
    device_code: string;
    user_code: string;
    verification_uri: string;
    expires_in: number;
    interval: number;
  } | null>(null);
  const { setToken, setUser } = useAuthStore();
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  // Poll for token
  React.useEffect(() => {
    if (!deviceCodeData || !isOpen) return;

    const CLIENT_ID = import.meta.env.PUBLIC_GITHUB_CLIENT_ID;
    if (!CLIENT_ID) return;

    let isMounted = true;
    const intervalId = setInterval(async () => {
      try {
        // Use proxy in dev, direct in prod (requires CORS proxy in prod)
        // Using corsproxy.io to bypass CORS on GitHub Pages
        const baseUrl = import.meta.env.DEV 
          ? "/api/github" 
          : "https://corsproxy.io/?https://github.com";
        
        const response = await fetch(`${baseUrl}/login/oauth/access_token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            client_id: CLIENT_ID,
            device_code: deviceCodeData.device_code,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          }),
        });

        const data = await response.json();

        if (data.access_token) {
          if (!isMounted) return;
          
          // Success!
          clearInterval(intervalId);
          
          // Fetch user data
          const userResponse = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
              Accept: "application/vnd.github.v3+json",
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setToken(data.access_token);
            setUser({
              login: userData.login,
              avatar_url: userData.avatar_url,
              name: userData.name,
            });
            toast.success(`Signed in as ${userData.login}`);
            setIsOpen?.(false);
          }
        } else if (data.error === "authorization_pending") {
          // Continue polling
        } else if (data.error === "slow_down") {
          // Should increase interval, but for simplicity we just keep going (GitHub adds 5s usually)
        } else if (data.error === "expired_token") {
          clearInterval(intervalId);
          setDeviceCodeData(null);
          toast.error("Code expired. Please try again.");
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, (deviceCodeData.interval * 1000) + 1000); // Add 1s buffer

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [deviceCodeData, isOpen, setToken, setUser, setIsOpen]);

  const startDeviceFlow = async () => {
    const CLIENT_ID = import.meta.env.PUBLIC_GITHUB_CLIENT_ID;
    if (!CLIENT_ID) {
      toast.error("GitHub Client ID not configured");
      return;
    }

    setIsLoading(true);
    try {
      // Use proxy in dev, direct in prod (requires CORS proxy in prod)
      // Using corsproxy.io to bypass CORS on GitHub Pages
      const baseUrl = import.meta.env.DEV 
        ? "/api/github" 
        : "https://corsproxy.io/?https://github.com";
      
      const response = await fetch(`${baseUrl}/login/device/code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          scope: "public_repo",
        }),
      });

      if (!response.ok) throw new Error("Failed to initiate login");

      const data = await response.json();
      setDeviceCodeData(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to start login flow. Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (deviceCodeData?.user_code) {
      navigator.clipboard.writeText(deviceCodeData.user_code);
      toast.success("Code copied to clipboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      setIsOpen?.(val);
      if (!val) setDeviceCodeData(null); // Reset on close
    }}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            Connect GitHub
          </DialogTitle>
          <DialogDescription>
            Sign in to increase GitHub API rate limits and access more features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground flex gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0 text-green-500" />
            <p>
              We use GitHub OAuth Device Flow. No personal data is stored on our servers.
            </p>
          </div>

          {!deviceCodeData ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <Button onClick={startDeviceFlow} disabled={isLoading} className="w-full">
                {isLoading ? "Connecting..." : "Sign In with GitHub"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                This will open a secure GitHub login page.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">1. Copy your one-time code:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-2xl font-mono font-bold bg-muted px-4 py-2 rounded tracking-widest">
                    {deviceCodeData.user_code}
                  </code>
                  <Button variant="ghost" size="icon" onClick={copyCode} title="Copy Code">
                    <Key className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">2. Paste it on GitHub:</p>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    copyCode();
                    window.open(deviceCodeData.verification_uri, "_blank");
                  }}
                >
                  Open GitHub Login <Github className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Waiting for authorization...
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen?.(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
