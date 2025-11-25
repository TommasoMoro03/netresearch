import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, ServerCrash, Server } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { checkBackendHealth } from "@/services/api";

interface BackendStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BackendStatusDialog = ({ open, onOpenChange }: BackendStatusDialogProps) => {
  const [progress, setProgress] = useState(0);
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 8; // About 20 seconds total (8 * 2.5 seconds)

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setRetryCount(0);
      setIsChecking(true);
      return;
    }

    let isMounted = true;
    let checkInterval: NodeJS.Timeout;

    const checkHealth = async () => {
      try {
        const result = await checkBackendHealth();

        if (!isMounted) return;

        if (result.isHealthy) {
          setProgress(100);
          setIsChecking(false);
          setTimeout(() => {
            if (isMounted) {
              onOpenChange(false);
            }
          }, 500);
        } else {
          setRetryCount((prev) => {
            const newCount = prev + 1;
            setProgress((newCount / maxRetries) * 100);

            if (newCount >= maxRetries) {
              setIsChecking(false);
              clearInterval(checkInterval);
            }

            return newCount;
          });
        }
      } catch (error) {
        console.error("Health check error:", error);
      }
    };

    // Start checking immediately
    checkHealth();

    // Then check every 2.5 seconds
    checkInterval = setInterval(checkHealth, 2500);

    return () => {
      isMounted = false;
      clearInterval(checkInterval);
    };
  }, [open, onOpenChange]);

  const getStatusMessage = () => {
    if (retryCount >= maxRetries) {
      return "Backend is taking longer than expected to wake up. Please try again in a moment.";
    }
    return "The backend service is waking up from sleep mode. This usually takes 15-20 seconds...";
  };

  const getIcon = () => {
    if (retryCount >= maxRetries) {
      return <ServerCrash className="w-12 h-12 text-destructive" />;
    }
    if (isChecking) {
      return <Loader2 className="w-12 h-12 text-primary animate-spin" />;
    }
    return <Server className="w-12 h-12 text-green-500" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {retryCount >= maxRetries ? "Backend Timeout" : "Starting Backend Service"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-6 py-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            {getIcon()}
          </div>

          <DialogDescription className="text-center px-4">
            {getStatusMessage()}
          </DialogDescription>

          {isChecking && (
            <div className="w-full space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                Attempt {retryCount} of {maxRetries}
              </p>
            </div>
          )}

          {retryCount >= maxRetries && (
            <p className="text-sm text-muted-foreground text-center">
              The server may need more time to start. Please refresh the page or try again in a few moments.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
