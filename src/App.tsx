import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import AnalyzeVideo from './pages/AnalyzeVideo';
import VideoAnalysisLibrary from './pages/VideoAnalysisLibrary';
import MyAnalyses from './pages/MyAnalyses';
import BlogPostDetail from './pages/BlogPostDetail';
import AccountCenter from './pages/AccountCenter'; // New import
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
                  <Route
                    path="/my-analyses"
                    element={
                      <ProtectedRoute>
                        <MyAnalyses />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account" // New protected route
                    element={
                      <ProtectedRoute>
                        <AccountCenter />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/blog/:slug" element={<BlogPostDetail />} />
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