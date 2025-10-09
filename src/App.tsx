import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AnalyzeVideo from "./pages/AnalyzeVideo";
import Login from "./pages/Login";
import { SessionContextProvider, useSession } from "./integrations/supabase/SessionContextProvider";
import Header from "./components/Header"; // Import the Header component

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
    <Header /> {/* Render the Header component here */}
    <main className="flex-1"> {/* Ensure main content takes remaining space */}
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
    </main>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SessionContextProvider>
        <div className="flex flex-col min-h-screen"> {/* Added flex-col to make header stick to top */}
          <AppRoutes />
        </div>
      </SessionContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;