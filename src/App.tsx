import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './integrations/supabase/auth';
import { ThemeProvider } from './components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppContent from './components/AppContent';
import { TooltipProvider } from './components/ui/tooltip'; // Import TooltipProvider

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <TooltipProvider> {/* Wrap AppContent with TooltipProvider */}
              <AppContent />
            </TooltipProvider>
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;