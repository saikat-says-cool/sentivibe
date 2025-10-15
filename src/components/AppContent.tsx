import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import AnalyzeVideo from '@/pages/AnalyzeVideo';
import VideoAnalysisLibrary from '@/pages/VideoAnalysisLibrary';
import MyAnalyses from '@/pages/MyAnalyses';
import BlogPostDetail from '@/pages/BlogPostDetail';
import CreateMultiComparison from '@/pages/CreateMultiComparison';
import MultiComparisonLibrary from '@/pages/MultiComparisonLibrary';
import MultiComparisonDetail from '@/pages/MultiComparisonDetail';
import AboutUs from '@/pages/AboutUs';
import HowItWorks from '@/pages/HowItWorks';
import Overview from '@/pages/how-it-works/Overview';
import AnalyzeVideoGuide from '@/pages/how-it-works/AnalyzeVideoGuide';
import CompareVideosGuide from '@/pages/how-it-works/CompareVideosGuide';
import AiChatGuide from '@/pages/how-it-works/AiChatGuide';
import LibrariesGuide from '@/pages/how-it-works/LibrariesGuide';
import PdfExportGuide from '@/pages/how-it-works/PdfExportGuide';
import Upgrade from '@/pages/Upgrade';
import AccountCenter from '@/pages/AccountCenter';
import Pricing from '@/pages/Pricing';
import Checkout from '@/pages/Checkout';
import TermsOfService from '@/pages/TermsOfService';
import PrivacyNotice from '@/pages/PrivacyNotice';
import RefundPolicy from '@/pages/RefundPolicy';
import NotFound from '@/pages/NotFound';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/use-scroll-to-top';

function AppContent() {
  useScrollToTop();

  return (
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
          <Route path="/how-it-works/overview" element={<Overview />} />
          <Route path="/how-it-works/analyze-video" element={<AnalyzeVideoGuide />} />
          <Route path="/how-it-works/compare-videos" element={<CompareVideosGuide />} />
          <Route path="/how-it-works/ai-chat" element={<AiChatGuide />} />
          <Route path="/how-it-works/libraries" element={<LibrariesGuide />} />
          <Route path="/how-it-works/pdf-export" element={<PdfExportGuide />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/account" element={<AccountCenter />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-notice" element={<PrivacyNotice />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default AppContent;