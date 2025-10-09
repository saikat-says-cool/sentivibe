import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AnalyzeVideo from "./pages/AnalyzeVideo";
import Login from "./pages/Login"; // Import the Login component
import { SessionContextProvider, useSession } from "./integrations/supabase/SessionContextProvider"; // Import SessionContextProvider and useSession

const queryClient = new QueryClient();

// A wrapper component for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Index />} />
      <Route
        path="/analyze"
        element={
          <ProtectedRoute>
            <AnalyzeVideo />
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SessionContextProvider>
        <AppRoutes />
      </SessionContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;