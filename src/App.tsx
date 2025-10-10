import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async'; // New import
import Index from './pages/Index';
import Login from './pages/Login';
import AnalyzeVideo from './pages/AnalyzeVideo';
import VideoAnalysisLibrary from './pages/VideoAnalysisLibrary';
import BlogPostDetail from './pages/BlogPostDetail';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './integrations/supabase/auth';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './components/theme-provider';
import Header from './components/Header';
import Footer from './components/Footer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider> {/* Wrap with HelmetProvider */}
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <Router>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/analyze-video"
                      element={
                        <ProtectedRoute>
                          <AnalyzeVideo />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/library"
                      element={
                        <ProtectedRoute>
                          <VideoAnalysisLibrary />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/analyze/youtube-comments/:slug" element={<BlogPostDetail />} /> {/* Updated route */}
                  </Routes>
                </main>
                <Footer />
                <Toaster />
              </div>
            </Router>
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;