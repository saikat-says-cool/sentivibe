import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './integrations/supabase/auth';
import { ThemeProvider } from './components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppContent from './components/AppContent';
// Removed PaddleProvider import

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            {/* Removed PaddleProvider wrapper */}
            <AppContent />
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;