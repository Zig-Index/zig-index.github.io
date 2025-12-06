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

  const [manualToken, setManualToken] = React.useState("");
  const [isVerifyingToken, setIsVerifyingToken] = React.useState(false);

  const verifyManualToken = async () => {
    if (!manualToken.trim()) return;
    
    setIsVerifyingToken(true);
    try {
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${manualToken.trim()}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setToken(manualToken.trim());
        setUser({
          login: userData.login,
          avatar_url: userData.avatar_url,
          name: userData.name,
        });
        toast.success(`Signed in as ${userData.login}`);
        setIsOpen?.(false);
      } else {
        toast.error("Invalid token. Please check and try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify token");
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleSignIn = () => {
    // Redirect to the separate Auth Service
    const AUTH_SERVICE_URL = import.meta.env.PUBLIC_AUTH_SERVICE_URL || "https://zig-index-auth-service.netlify.app";
    window.location.href = `${AUTH_SERVICE_URL}/signin`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      setIsOpen?.(val);
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
              We use GitHub OAuth. No personal data is stored on our servers.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <Button onClick={handleSignIn} className="w-full">
              Sign In with GitHub
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              This will redirect you to our secure authentication service.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or enter token manually
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">Personal Access Token</Label>
            <div className="flex gap-2">
              <Input
                id="token"
                placeholder="ghp_..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                type="password"
              />
              <Button 
                variant="secondary" 
                onClick={verifyManualToken}
                disabled={isVerifyingToken || !manualToken}
              >
                {isVerifyingToken ? "Verifying..." : "Verify"}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Generate a token with <code>public_repo</code> scope in GitHub Settings.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

