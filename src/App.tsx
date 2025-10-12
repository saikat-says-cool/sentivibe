import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './integrations/supabase/auth';
import { ThemeProvider } from './components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppContent from './components/AppContent';
import { PaddleProvider } from './components/PaddleProvider'; // Import PaddleProvider

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <PaddleProvider> {/* Wrap AppContent with PaddleProvider */}
              <AppContent />
            </PaddleProvider>
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;