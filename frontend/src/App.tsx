import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PizzaMessageExperiment from "./pages/experiment/pizza-message/index";
import ControlVariant from "./pages/experiment/pizza-message/control/index";
import PizzaVariant from "./pages/experiment/pizza-message/pizza/index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/experiment/pizza-message" element={<PizzaMessageExperiment />} />
          <Route path="/experiment/pizza-message/control" element={<ControlVariant />} />
          <Route path="/experiment/pizza-message/pizza" element={<PizzaVariant />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
