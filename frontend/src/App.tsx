import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { BackendStatusDialog } from "@/components/BackendStatusDialog";
import { checkBackendHealth } from "@/services/api";

const queryClient = new QueryClient();

const App = () => {
  const [showBackendStatus, setShowBackendStatus] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      const result = await checkBackendHealth();
      if (!result.isHealthy) {
        setShowBackendStatus(true);
      }
    };

    checkBackend();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BackendStatusDialog
          open={showBackendStatus}
          onOpenChange={setShowBackendStatus}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
