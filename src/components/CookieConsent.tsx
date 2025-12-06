"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { Button } from "./ui/button";
import { initGA } from "@/lib/analytics";

export function CookieConsent() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    
    if (!consent) {
      // Show banner if no choice made
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else if (consent === "granted") {
      // Initialize GA if previously granted
      initGA();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "granted");
    setIsVisible(false);
    initGA();
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "denied");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-card/95 backdrop-blur-md border rounded-xl shadow-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Cookie className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Cookie Settings
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies and Google Analytics to analyze traffic and improve your experience. 
                  We respect your privacy and you can choose to opt-out of tracking. 
                  See our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> for details.
                </p>
              </div>
            </div>
            
            <div className="flex flex-row gap-3 w-full md:w-auto shrink-0">
              <Button 
                variant="outline" 
                onClick={handleReject}
                className="flex-1 md:flex-none"
              >
                Reject All
              </Button>
              <Button 
                onClick={handleAccept}
                className="flex-1 md:flex-none"
              >
                Accept All
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
