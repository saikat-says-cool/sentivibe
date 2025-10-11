import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import AnalyzeVideo from './pages/AnalyzeVideo';
import VideoAnalysisLibrary from './pages/VideoAnalysisLibrary';
import MyAnalyses from './pages/MyAnalyses';
import BlogPostDetail from './pages/BlogPostDetail';
import CompareVideos from './pages/CompareVideos';
import ComparisonLibrary from './pages/ComparisonLibrary'; // Import new page
import ComparisonDetail from './pages/ComparisonDetail'; // Import new page
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './integrations/supabase/auth';
import { ThemeProvider } from './components/theme-provider';
import Header from './components/Header';
import Footer from './components/Footer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
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
                  <Route path="/analyze-video" element={<AnalyzeVideo />} />
                  <Route path="/library" element={<VideoAnalysisLibrary />} />
                  <Route path="/my-analyses" element={<MyAnalyses />} />
                  <Route path="/blog/:slug" element={<BlogPostDetail />} />
                  <Route path="/compare-videos" element={<CompareVideos />} />
                  <Route path="/comparison-library" element={<ComparisonLibrary />} /> {/* New route */}
                  <Route path="/comparison/:slug" element={<ComparisonDetail />} /> {/* New route */}
                </Routes>
              </main>
              <Footer />
              <Toaster />
            </div>
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;