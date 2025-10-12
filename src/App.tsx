import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import AnalyzeVideo from './pages/AnalyzeVideo';
import VideoAnalysisLibrary from './pages/VideoAnalysisLibrary';
import MyAnalyses from './pages/MyAnalyses';
import BlogPostDetail from './pages/BlogPostDetail';
import CreateMultiComparison from './pages/CreateMultiComparison';
import MultiComparisonLibrary from './pages/MultiComparisonLibrary';
import MultiComparisonDetail from './pages/MultiComparisonDetail';
import AboutUs from './pages/AboutUs';
import HowItWorks from './pages/HowItWorks';
import Upgrade from './pages/Upgrade';
import AccountCenter from './pages/AccountCenter';
import Pricing from './pages/Pricing';
import Checkout from './pages/Checkout';
import TermsOfService from './pages/TermsOfService'; // Import new page
import PrivacyNotice from './pages/PrivacyNotice';   // Import new page
import RefundPolicy from './pages/RefundPolicy';     // Import new page
import NotFound from './pages/NotFound'; // Import NotFound page
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
                  <Route path="/multi-comparison/:slug" element={<MultiComparisonDetail />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/upgrade" element={<Upgrade />} />
                  <Route path="/account" element={<AccountCenter />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} /> {/* New route */}
                  <Route path="/privacy-notice" element={<PrivacyNotice />} />     {/* New route */}
                  <Route path="/refund-policy" element={<RefundPolicy />} />       {/* New route */}
                  <Route path="*" element={<NotFound />} /> {/* Catch-all for 404 */}
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