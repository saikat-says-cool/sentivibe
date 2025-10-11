import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import AnalyzeVideo from './pages/AnalyzeVideo';
import VideoAnalysisLibrary from './pages/VideoAnalysisLibrary';
import BlogPostDetail from './pages/BlogPostDetail';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './integrations/supabase/auth';
import { ThemeProvider } from './components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/analyze-video" element={<AnalyzeVideo />} />
                  <Route path="/library" element={<VideoAnalysisLibrary />} />
                  <Route path="/blog/:slug" element={<BlogPostDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <Toaster />
            </div>
          </Router>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;