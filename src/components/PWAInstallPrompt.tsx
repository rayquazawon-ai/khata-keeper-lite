import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X, Share, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if already running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInStandaloneMode(isStandalone);

    console.log('PWA Install: iOS detected:', isIOSDevice);
    console.log('PWA Install: Standalone mode:', isStandalone);

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('PWA Install: beforeinstallprompt event fired');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA Install: App was installed');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS, show manual install instructions after a delay if not in standalone mode
    if (isIOSDevice && !isStandalone) {
      const timer = setTimeout(() => {
        console.log('PWA Install: Showing iOS install prompt');
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      console.log('PWA Install: Triggering install prompt');
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('PWA Install: User choice:', outcome);
      
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    console.log('PWA Install: User dismissed prompt');
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  // Don't show if already in standalone mode
  if (isInStandaloneMode) {
    return null;
  }

  // Don't show prompt if not applicable
  if (!showPrompt && !isIOS) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 p-4 bg-background border-primary/20 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Install Khata Keeper</p>
            {isIOS ? (
              <p className="text-xs text-muted-foreground">
                Tap <Share className="inline h-3 w-3 mx-1" /> then "Add to Home Screen"
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Add to home screen for quick access</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isIOS && deferredPrompt && (
            <Button size="sm" onClick={handleInstallClick}>
              Install
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}