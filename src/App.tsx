import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import AnalyzeVideo from './pages/AnalyzeVideo';
import VideoAnalysisLibrary from './pages/VideoAnalysisLibrary';
import MyAnalyses from './pages/MyAnalyses';
import BlogPostDetail from './pages/BlogPostDetail';
import CreateMultiComparison from './pages/CreateMultiComparison';
import MultiComparisonLibrary from './pages/MultiComparisonLibrary';
import ComparisonDetail from './pages/ComparisonDetail';
import MultiComparisonDetail from './pages/MultiComparisonDetail';
import AboutUs from './pages/AboutUs';
import HowItWorks from './pages/HowItWorks';
import Upgrade from './pages/Upgrade';
import Pricing from './pages/Pricing'; // Added import
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
                  <Route path="/create-multi-comparison" element={<CreateMultiComparison />} />
                  <Route path="/multi-comparison-library" element={<MultiComparisonLibrary />} />
                  <Route path="/comparison/:slug" element={<ComparisonDetail />} />
                  <Route path="/multi-comparison/:slug" element={<MultiComparisonDetail />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/upgrade" element={<Upgrade />} />
                  <Route path="/pricing" element={<Pricing />} /> {/* Added route */}
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