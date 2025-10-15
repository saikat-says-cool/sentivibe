# SentiVibe Technical Documentation

## 1. Introduction
This document provides a comprehensive technical overview of the SentiVibe application, detailing its architecture, core components, data flow, Supabase integration, and external API interactions. SentiVibe is an AI-powered insight platform that transforms unstructured YouTube video comments into a living, interactive intelligence hub. For data-driven content creators, marketers, and researchers who need to understand audience reception and public opinion on YouTube, SentiVibe provides a dynamic, conversational AI that answers your specific questions, automates the creation of SEO-optimized content from its findings, and ensures insights are always fresh and relevant. Unlike static sentiment analysis tools and manual comment review, SentiVibe offers an ongoing conversation and an evolving asset.

## 2. Tech Stack
The application is built using the following technologies:
*   **Frontend:** React (with Vite), TypeScript
*   **Styling:** Tailwind CSS, Shadcn/ui (pre-built components), Radix UI (underlying Shadcn/ui)
*   **Routing:** React Router DOM
*   **State Management/Data Fetching:** TanStack Query (for server state management)
*   **Backend/Database/Auth:** Supabase (PostgreSQL, Auth, Edge Functions)
*   **AI Integration:** Longcat AI API
*   **Video Data:** YouTube Data API
*   **External Search:** **(Removed - Google Custom Search API is no longer used)**
*   **PDF Generation:** \`html2pdf.js\`
*   **Icons:** \`lucide-react\`
*   **Utilities:** \`clsx\`, \`tailwind-merge\` (\`cn\` utility)
*   **Markdown Rendering:** \`react-markdown\`, \`remark-gfm\`
*   **Fonts:** Google Fonts (\`Inter\` for body and headings)
*   **Toast Notifications:** \`sonner\`

## 3. Project Structure
The project follows a standard React application structure with specific directories for organization:

*   \`public/\`: Static assets like \`logo.svg\` (for favicon), \`favicon.ico\`, \`robots.txt\`.
*   \`src/\`: Main application source code.
    *   \`src/App.tsx\`: Main application component, handles routing and context providers.
    *   \`src/main.tsx\`: Entry point for React rendering.
    *   \`src/globals.css\`: Global Tailwind CSS styles, custom CSS variables for the **Crowd Black/Pure White** theme, custom sentiment colors, and **new Emerald, Crimson, Yellow, Cyan, Deep Blue, Forest Green, and Purple Haze themes**.
    *   \`src/lib/utils.ts\`: Utility functions (e.g., \`cn\` for Tailwind class merging).
    *   \`src/utils/toast.ts\`: Utility functions for \`sonner\` toast notifications.
    *   \`src/components/\`: Reusable UI components.
        *   \`src/components/Header.tsx\`: Global application header with the **SentiVibe wordmark**, a **theme toggle**, and **public links to 'Analyze a Video', 'Analysis Library', 'Compare Videos', 'Comparison Library'**. Now includes an "Upgrade" button for authenticated free users and an "Account" link.
        *   \`src/components/ModeToggle.tsx\`: Component for switching between themes.
        *   \`src/components/ChatInterface.tsx\`: Generic chat UI component, now with \`disabled\` prop.
        *   \`src/components/ProtectedRoute.tsx\`: Component for protecting routes (now less critical due to public-first strategy, but still present for \`MyAnalyses\`).
        *   \`src/components/Footer.tsx\`: Application footer, now including the **brand ethics disclosure**.
        *   \`src/components/theme-provider.tsx\`: Theme context provider, **updated to support new themes**.
        *   \`src/components/VideoChatDialog.tsx\`: **Updated component for the centralized AI chat pop-up for single video analyses, now passing custom Q&A results as context, allowing precise word count control, and with chat message limits and max response word count removed. External context fetching has been removed.**
        *   \`src/components/LibraryCopilot.tsx\`: **Enhanced AI assistant for searching the analysis library and recommending new analysis topics, with daily query limits removed.**
        *   \`src/components/ComparisonDataDisplay.tsx\`: **Component to display structured comparison data for two videos, with robust rendering for \`delta_description\`.**
        *   \`src/components/MultiComparisonDataDisplay.tsx\`: **Component to display structured comparison data for multiple videos.**
        *   \`src/components/ComparisonChatDialog.tsx\`: **New component for the centralized AI chat pop-up for two-video comparisons, with chat message limits and max response word count removed. External context fetching has been removed.**
        *   \`src/components/MultiComparisonChatDialog.tsx\`: **New component for the centralized AI chat pop-up for multi-video comparisons, with chat message limits and max response word count removed. External context fetching has been removed.**
        *   \`src/components/ComparisonLibraryCopilot.tsx\`: **New AI assistant for searching the comparison library and recommending new comparative analysis topics, with daily query limits removed. External context has been removed from the AI prompt.**
        *   \`src/components/HowItWorksCopilot.tsx\`: **New component for the How It Works guide assistant.**
        *   \`src/components/ui/\`: Shadcn/ui components (e.g., Button, Card, Input, Badge, Alert, Skeleton, Collapsible).
    *   \`src/hooks/\`: Custom React hooks.
        *   \`src/hooks/use-mobile.tsx\`: Hook for detecting mobile viewport.
        *   \`src/hooks/use-toast.ts\`: Shadcn/ui toast hook (distinct from \`sonner\` toasts).
        *   \`src/hooks/use-loading-messages.tsx\`: **New hook to provide dynamic, context-aware loading messages for AI operations.**
    *   \`src/pages/\`: Application pages/views.
        *   \`src/pages/Index.tsx\`: **Updated landing page, now featuring direct calls to action for analyzing videos, comparing videos, and exploring both analysis and comparison libraries.**
        *   \`src/pages/Login.tsx\`: User authentication page, styled to integrate with the new color palette.
        *   \`src/pages/AnalyzeVideo.tsx\`: **Significantly updated main page for YouTube video analysis, now featuring dynamic custom question input fields with unlimited questions and word limits, displaying AI-generated answers, including a 'Refresh Analysis' button and 'Last Full Analysis' timestamp, and enforcing tier-based daily analysis limits. Also explicitly lists top 10 comments.**
        *   \`src/pages/VideoAnalysisLibrary.tsx\`: **Updated page to list and search generated blog posts (video analyses), with updated BlogPost interface, and integrating the enhanced \`LibraryCopilot\`.**
        *   \`src/pages/MyAnalyses.tsx\`: **Updated page to list a user's own analyses, now integrating the enhanced \`LibraryCopilot\`. Access is available for all authenticated users.**
        *   \`src/pages/BlogPostDetail.tsx\`: **Updated page to display the full content of a single generated blog post, including the new custom Q&A section, a 'Go to Video Analysis' button, a 'Refresh Analysis' button, the 'Last Full Analysis' timestamp, and explicitly lists top 10 comments.**
        *   \`src/pages/CreateMultiComparison.tsx\`: **New page for initiating multi-video comparisons, allowing input of multiple video links and custom comparative questions with unlimited questions and word limits. Displays the multi-comparison analysis results, links to individual video analyses, and includes a 'Refresh Comparison' button and 'Last Compared' timestamp. Enforces tier-based daily comparison limits.**
        *   \`src/pages/MultiComparisonLibrary.tsx\`: **New page to list and search generated multi-video comparison blog posts, integrating the \`ComparisonLibraryCopilot\`. Displays the first video thumbnail with a "+X more" badge if multiple videos are included, along with the comparison title.**
        *   \`src/pages/MultiComparisonDetail.tsx\`: **New page to display the full content of a single generated multi-video comparison blog post. Includes links to individual video analyses, a 'Go to Multi-Comparison Analysis' button, a 'Refresh Comparison' button, the 'Last Full Comparison' timestamp, and explicitly lists top 10 comments for each video.**
        *   \`src/pages/ComparisonDetail.tsx\`: (Legacy, but still present) Page for displaying two-video comparisons.
        *   \`src/pages/Upgrade.tsx\`: **Updated page detailing the benefits of upgrading to a paid tier, reflecting the simplified tier structure.**
        *   \`src/pages/AccountCenter.tsx\`: **New page for authenticated users to manage their profile and view subscription details.**
        *   \`src/pages/how-it-works/\`: **New directory for detailed guide pages.**
            *   \`src/pages/how-it-works/Overview.tsx\`: **The main introduction to the guide.**
            *   \`src/pages/how-it-works/AnalyzeVideoGuide.tsx\`: **Detailed guide for single video analysis.**
            *   \`src/pages/how-it-works/CompareVideosGuide.tsx\`: **Detailed guide for multi-video comparison.**
            *   \`src/pages/how-it-works/AiChatGuide.tsx\`: **Detailed guide for AI chat interactions.**
            *   \`src/pages/how-it-works/LibrariesGuide.tsx\`: **Detailed guide for libraries and AI copilots.**
            *   \`src/pages/how-it-works/PdfExportGuide.tsx\`: **Detailed guide for PDF report export.**
    *   \`src/integrations/\`: Supabase-related client-side files.
        *   \`src/integrations/supabase/client.ts\`: Supabase client initialization.
        *   \`src/integrations/supabase/auth.tsx\`: **Updated AuthProvider to fetch and expose \`subscriptionStatus\` and \`subscriptionPlanId\` via the \`useAuth\` hook.**
    *   \`supabase/\`: Supabase-related backend files.
        *   \`supabase/functions/\`: Supabase Edge Functions.
            *   \`supabase/functions/youtube-analyzer/index.ts\`: **Significantly updated Edge Function for video analysis, now implementing staleness-freshness logic, processing custom questions (unlimited), making additional AI calls for answers, and storing these Q&A results in the database, even for cached videos. It also handles a \`forceReanalyze\` flag, explicitly stores top 10 comments, and enforces tier-based daily analysis limits. AI prompts have been extensively engineered for high-quality, production-grade responses for sentiment analysis, blog post generation, and custom Q&A, and the authentication check has been removed to allow unauthenticated access.**
            *   \`supabase/functions/fetch-external-context/index.ts\`: **(Removed) This Edge Function has been deleted as external context is no longer used for chat or analysis.**
            *   \`supabase/functions/chat-analyzer/index.ts\`: **Updated Edge Function for handling AI chat conversations for single videos, now incorporating custom Q&A results into the AI's context, using a desired word count for response length, and with chat message limits and max response word count removed. External context has been removed from the AI prompt. AI prompts have been extensively engineered for high-quality, production-grade responses, including a strict information hierarchy, precise word count adherence, and mandatory Markdown hyperlink formatting. The authentication check has been removed to allow unauthenticated access.**
            *   \`supabase/functions/library-copilot-analyzer/index.ts\`: **Enhanced AI assistant for handling AI chat for the Library Copilot, now performing semantic search, proactively recommending new analysis topics, and with daily query limits removed. External context has been removed from the AI prompt. AI prompts have been extensively engineered for high-quality, production-grade responses, including precise matching, clear recommendations, and mandatory Markdown hyperlink formatting. The authentication check has been removed to allow unauthenticated access.**
            *   \`supabase/functions/video-comparator/index.ts\`: **Updated Edge Function for two-video comparisons, removing external context fetching.**
            *   \`supabase/functions/comparison-chat-analyzer/index.ts\`: **New Edge Function for handling AI chat conversations for two-video comparisons, with chat message limits and max response word count removed. External context has been removed from the AI prompt.**
            *   \`supabase/functions/multi-video-comparator/index.ts\`: **New Edge Function for multi-video comparisons, implementing robust staleness/freshness logic, orchestrating individual video analysis refreshes, generating comparative insights, handling custom comparative questions (unlimited), and enforcing tier-based daily comparison limits. External context fetching has been removed.**
            *   \`supabase/functions/multi-comparison-chat-analyzer/index.ts\`: **New Edge Function for handling AI chat conversations for multi-video comparisons, with chat message limits and max response word count removed. External context has been removed from the AI prompt.**
            *   \`supabase/functions/comparison-library-copilot-analyzer/index.ts\`: **New AI assistant for handling AI chat for the Comparison Library Copilot, performing semantic search, recommending new comparative analysis topics, and with daily query limits removed. External context has been removed from the AI prompt.**
            *   \`supabase/functions/how-it-works-copilot-analyzer/index.ts\`: **New Edge Function for the How It Works guide assistant.**
            *   \`supabase/functions/get-anon-usage/index.ts\`: **New Edge Function to retrieve anonymous user usage data for IP-based rate limiting, now only tracking analyses and comparisons.**
            *   \`supabase/functions/paddle-webhook-handler/index.ts\`: **Updated Edge Function to correctly verify Paddle V2 webhooks using Deno's Web Crypto API and manage user subscriptions.**
        *   \`supabase/migrations/\`: Database migration files.
*   \`tailwind.config.ts\`: Tailwind CSS configuration, including custom fonts (\`Inter\`) and the new brand color palette.
*   \`.env\`: Environment variables (e.g., Supabase URLs, API keys).

## 4. Core Application Flow & Components

### 4.1. \`App.tsx\` (Root Component & Routing)
*   **Context Providers:** Wraps the entire application with necessary contexts:
    *   \`QueryClientProvider\`: Manages global state for data fetching with TanStack Query.
    *   \`ThemeProvider\`: Manages light/dark/custom themes.
    *   \`AuthProvider\`: Custom provider for Supabase authentication session management, **now also providing subscription status.**
    *   \`Toaster\` (from \`sonner\`): For displaying toast notifications, configured to use brand colors for success/error/neutral.
*   **\`AppRoutes\` Component:** Encapsulates \`BrowserRouter\` and \`Routes\`.
    *   Renders the \`Header\` component globally.
    *   Defines application routes: \`/\`, \`/login\`, \`/analyze-video\`, \`/library\`, \`/my-analyses\`, \`/blog/:slug\`, \`/create-multi-comparison\`, \`/multi-comparison-library\`, \`/multi-comparison/:slug\`, \`/upgrade\`, \`/account\`, \`/about-us\`, \`/how-it-works\`, and a catch-all \`*\` for \`NotFound\`.
*   **\`ProtectedRoute\` Component:** A higher-order component that ensures only authenticated users can access specific routes (e.g., \`/my-analyses\`). It redirects unauthenticated users to \`/login\`. Note: \`/analyze-video\`, \`/library\`, \`/create-multi-comparison\`, and \`/multi-comparison-library\` are now publicly accessible.

### 4.2. \`Header.tsx\`
*   A React component that renders a consistent header across all pages.
*   Displays the **SentiVibe wordmark** (\`<span className="text-foreground">Senti</span><span className="text-accent">Vibe</span>\`) using the \`font-heading\` (Inter) typeface.
*   **Now includes navigation links to \`/analyze-video\`, \`/library\`, \`/create-multi-comparison\`, \`/multi-comparison-library\`, \`/how-it-works\`, and \`/about-us\` for all users.**
*   Includes a link to \`/my-analyses\` and the new \`/account\` page for authenticated users.
*   **Conditionally renders an "Upgrade" button for authenticated users who are not on a paid tier.**
*   Includes a link to \`/login\` ("Sign In / Sign Up") for unauthenticated users.
*   Integrates the \`ModeToggle\` component for theme switching.
*   Styled with Tailwind CSS for a clean, **Crowd Black** and **Pure White** appearance.

### 4.3. \`Index.tsx\` (Landing Page)
*   **The default entry point for all users.**
*   Features the **SentiVibe wordmark** prominently (\`text-5xl font-extrabold tracking-tight\`).
*   Displays the new tagline: "Unlock Video Insights with SentiVibe".
*   **Includes clear calls-to-action** with buttons to "Analyze a Video", "Compare Videos", "Explore the Library", and "View Comparisons", directly guiding users to the core functionalities.
*   **Multi-Video Comparison Disclaimer:** A note is added under the "Compare Videos" card: "\`<span class='font-semibold text-red-500'>Note:</span> Reliable for up to 3 videos simultaneously.\`"

### 4.4. \`Login.tsx\` (Authentication Page)
*   Utilizes the \`@supabase/auth-ui-react\` component for a pre-built authentication UI.
*   Configured with \`supabaseClient\` from \`src/integrations/supabase/client.ts\`.
*   Uses \`ThemeSupa\` for styling and a \`light\` theme, with \`brand\` and \`brandAccent\` colors mapped to \`primary\` and \`primary-foreground\` from the new palette.
*   Automatically redirects authenticated users to the homepage (\`/\`) using \`useAuth\` and \`useNavigate\`.
*   Displays a "Welcome to SentiVibe" message.

### 4.5. \`AnalyzeVideo.tsx\` (Video Analysis Page)
*   **State Management:** Manages \`videoLink\` input, \`customQuestions\` (an array of objects, each with \`question\` and \`wordCount\`), \`analysisResult\`, \`error\`, \`isChatDialogOpen\`, and \`analysesToday\` states using \`useState\`.
*   **Tier-based Limits:** Dynamically sets \`currentLimits\` (daily analyses) based on \`useAuth\`'s \`user\`, \`subscriptionStatus\`, and \`subscriptionPlanId\`.
*   **Anonymous Usage Tracking:** Uses \`useQuery\` to fetch \`anonUsage\` from the \`get-anon-usage\` Edge Function for unauthenticated users.
*   **Authenticated Usage Tracking:** Uses \`useQuery\` to fetch \`dailyAnalysesCount\` from \`public.blog_posts\` for authenticated users.
*   **Dynamic Custom Questions:** Provides UI to add/remove multiple custom question input fields, each with a corresponding word count input. **Custom questions are now unlimited in count and word count for all tiers.**
*   **Initial Load from Blog Post:** Uses \`useLocation\` to check for \`blogPost\` data passed via navigation state. If present, it reconstructs the \`analysisResult\` from the \`blogPost\` (including \`ai_analysis_json\`, \`raw_comments_for_chat\`, \`custom_qa_results\`, and \`last_reanalyzed_at\`), sets \`analysisResult\`, and conditionally opens the \`VideoChatDialog\` based on the \`openChat\` flag. It also checks for a \`forceReanalyze\` flag from navigation to trigger an an immediate re-analysis.
*   **Supabase Edge Function Invocation:**
    *   **\`analyzeVideoMutation\`:** Uses \`useMutation\` to call the \`youtube-analyzer\` Supabase Edge Function. The payload now includes the \`customQuestions\` array and an optional \`forceReanalyze\` boolean flag. **Handles 403 errors from the Edge Function to display tier-specific daily analysis limit messages.**
*   **UI Elements:**
    *   \`Input\` for video link submission, \`Textarea\` for custom questions, \`Input\` for word count.
    *   **Updated disclaimer:** "SentiVibe will analyze the available comments. Analysis may take up to 30 seconds."
    *   **Displays current usage:** "Analyses today: X/Y" with a link to \`/upgrade\` if not on a paid tier.
    *   \`Button\` to trigger analysis, showing a \`Loader2\` icon (styled with \`text-accent\`) when pending. **Disabled if \`isAnalysisLimitReached\`.**
    *   \`Card\` components to structure the input form and display results.
    *   \`Skeleton\` components provide a loading state visual for analysis.
    *   \`Alert\` component displays any errors from the analysis process, **including tier-based daily analysis limit exceedance messages.**
    *   \`Badge\` components are used to display sentiment (using \`sentiment-positive\`, \`sentiment-negative\`, \`sentiment-neutral\` classes), emotional tones, and key themes.
    *   \`Collapsible\` component is prepared for subtitles (though currently empty).
    *   Displays a "View Blog Post" \`Button\` with a \`Link\` to \`/blog/${analysisResult.blogPostSlug}\` after a successful analysis.
    *   Displays an "Original Video" \`Button\` with an \`<a>\` tag linking to \`analysisResult.originalVideoLink\`.
    *   **"Refresh Analysis" Button:** Triggers \`handleRefreshAnalysis\` to force a full re-analysis of the video.
    *   **"Chat with AI" Button:** Triggers the \`VideoChatDialog\` pop-up.
    *   **Community Q&A Display:** A new section displays the AI-generated answers for all community questions.
    *   **\`Last Full Analysis\` Timestamp:** Displays the \`lastReanalyzedAt\` date to indicate the freshness of the core sentiment analysis.
    *   **Top 10 Raw Comments:** A dedicated section lists the top 10 most popular comments.
*   **PDF Download:** Integrates \`html2pdf.js\` to convert the analysis results \`Card\` into a downloadable PDF. The PDF generation now includes a custom header with the SentiVibe logo and tagline, and the community Q&A section. **Applies a "Free Tier - SentiVibe" watermark if the user is not on a paid tier.**
*   **\`VideoChatDialog\` Integration:** Renders the \`VideoChatDialog\` component, passing \`isChatDialogOpen\`, \`onOpenChange\`, and \`initialAnalysisResult\` (which now includes \`customQaResults\`) as props.

### 4.6. \`VideoAnalysisLibrary.tsx\`
*   **Purpose:** Displays a list of all generated blog posts (video analyses) from the Supabase database.
*   **Data Fetching:** Uses \`useQuery\` from \`@tanstack/react-query\` to fetch all entries from the \`public.blog_posts\` table, ordered by \`published_at\` date. The \`BlogPost\` interface has been updated to include \`custom_qa_results\` and \`last_reanalyzed_at\`.
*   **Search Functionality:** Implements a client-side search filter based on \`searchTerm\` state, allowing users to search by \`title\`, \`creator_name\`, \`meta_description\`, or \`keywords\`.
*   **UI Elements:**
    *   \`Input\` for the search bar.
    *   \`Card\` components for each blog post, displaying the \`thumbnail_url\`, \`title\`, and \`creator_name\`.
    *   Each \`Card\` is wrapped in a \`Link\` to navigate to the \`BlogPostDetail.tsx\` page using the post's \`slug\`.
    *   \`Skeleton\` components provide loading state visuals.
    *   Handles cases where no posts are found or an error occurs during fetching.
    *   **SEO:** \`img\` tags for thumbnails include descriptive \`alt\` attributes.
    *   **\`LibraryCopilot\` Integration:** Renders the **enhanced** \`LibraryCopilot\` component, passing the fetched \`blogPosts\` for AI-powered search and topic recommendations. **Copilot queries are now unlimited for all tiers.**
*   **Pagination:** Implements pagination to handle large datasets, fetching only a subset of data per page.

### 4.7. \`BlogPostDetail.tsx\`
*   **Purpose:** Displays the full content of a single, SEO-optimized blog post.
*   **Data Fetching:** Uses \`useParams\` to extract the \`slug\` from the URL and \`useQuery\` from \`@tanstack/react-query\` to fetch the specific blog post from \`public.blog_posts\` via its \`slug\`. The \`BlogPost\` interface has been updated to include \`custom_qa_results\` and \`last_reanalyzed_at\`.
*   **"Go to Video Analysis" Button:** Navigates to the \`/analyze-video\` page, passing the \`blogPost\` object and \`openChat: false\` to display the full analysis report.
*   **"Refresh Analysis" Button:** Navigates to the \`/analyze-video\` page, passing the \`blogPost\` object and \`forceReanalyze: true\` to trigger a full re-analysis.
*   **"Chat with AI" Button:** Now opens the \`VideoChatDialog\` directly, passing the current \`blogPost\` object (which includes \`custom_qa_results\`) as the \`initialBlogPost\` prop and \`openChat: true\`. This allows the \`VideoChatDialog\` to initialize the chat with the context of the loaded blog post.
*   **SEO Enhancements:**
    *   **Dynamic Meta Tags:** \`useEffect\` hook dynamically updates \`document.title\` and \`meta name="description"\` based on the blog post's title and meta description.
    *   **Open Graph (OG) Tags:** Dynamically adds \`og:title\`, \`og:description\`, \`og:image\`, \`og:url\`, \`og:type\`, and \`og:site_name\` meta tags for rich social media previews.
    *   **Structured Data (JSON-LD):** Blog post detail pages incorporate \`BlogPosting\` and \`SoftwareApplication\` schema markup to provide structured information to search engines, enhancing visibility and potential for rich results.
    *   **Alt Text:** \`img\` tags for thumbnails include descriptive \`alt\` attributes.
    *   **Content Freshness:** Displays \`published_at\`, \`updated_at\`, and \`last_reanalyzed_at\` dates.
*   **UI Elements:**
    *   Displays the \`thumbnail_url\`, \`title\`, \`creator_name\`, \`published_at\` date, \`updated_at\` date, \`last_reanalyzed_at\` date, and \`meta_description\`.
    *   Renders the \`content\` field (which is in Markdown) using \`react-markdown\` and \`remarkGfm\` for proper formatting.
    *   Displays \`keywords\` using \`Badge\` components.
    *   **Community Q&A Section:** A new section displays the AI-generated answers for all community questions if \`blogPost.custom_qa_results\` are present.
    *   **Top 10 Raw Comments:** A dedicated section lists the top 10 most popular comments (from \`ai_analysis_json.raw_comments_for_chat\`).
    *   Includes a "Back to Analysis Library" \`Link\` for easy navigation.
    *   Includes an "Analyze a New Video" \`Button\` linking to \`/analyze-video\`.
    *   Includes an "Original Video" \`<a>\` tag linking to \`blogPost.original_video_link\`.
    *   \`Skeleton\` components provide loading state visuals.
    *   Handles cases where the blog post is not found or an error occurs.
*   **\`VideoChatDialog\` Integration:** Renders the \`VideoChatDialog\` component, passing \`isChatDialogOpen\`, \`onOpenChange\`, and \`blogPost\` as props.

### 4.8. \`CreateMultiComparison.tsx\` (Multi-Video Comparison Page)
*   **Purpose:** Allows users to input multiple YouTube video links and custom comparative questions to generate a multi-video comparison analysis.
*   **State Management:** Manages \`videoLinks\` (array of strings), \`customComparativeQuestions\` (array of objects), \`multiComparisonResult\`, \`error\`, \`isChatDialogOpen\`, and \`comparisonsToday\`.
*   **Tier-based Limits:** Dynamically sets \`currentLimits\` (daily comparisons) based on \`useAuth\`'s \`user\`, \`subscriptionStatus\`, and \`subscriptionPlanId\`.
*   **Anonymous Usage Tracking:** Uses \`useQuery\` to fetch \`anonUsage\` from the \`get-anon-usage\` Edge Function for unauthenticated users.
*   **Authenticated Usage Tracking:** Uses \`useQuery\` to fetch \`dailyComparisonsCount\` from \`public.multi_comparisons\` for authenticated users.
*   **Initial Load from Navigation:** Uses \`useLocation\` to check for an \`initialMultiComparison\` object passed via navigation state. If present, it pre-fills the \`videoLinks\` and \`customComparativeQuestions\` fields and sets the \`multiComparisonResult\`. It also handles a \`forceRecompare\` flag to trigger an immediate re-comparison.
*   **Supabase Edge Function Invocation:**
    *   **\`createMultiComparisonMutation\`:** Uses \`useMutation\` to call the \`multi-video-comparator\` Supabase Edge Function. The payload includes \`videoLinks\`, \`customComparativeQuestions\`, and an optional \`forceRecompare\` flag. **Handles 403 errors from the Edge Function to display tier-specific daily comparison limit messages.**
*   **UI Elements:**
    *   Dynamic input fields for \`videoLinks\` (minimum 2, with add/remove buttons).
    *   **Multi-Video Comparison Disclaimer:** A note is added under the video link input fields: "\`<span class='font-semibold text-red-500'>Note:</span> For reliable and stable performance, multi-video comparisons are currently limited to a maximum of 3 videos simultaneously.\`" The "Add Another Video" button is disabled if 3 videos are already added.
    *   Dynamic input fields for \`customComparativeQuestions\` (with question and word count). **Custom comparative questions are now unlimited in count and word count for all tiers.**
    *   **Updated disclaimer:** "SentiVibe will analyze the available comments for each video. Analysis may take up to 30 seconds per video."
    *   **Displays current usage:** "Comparisons today: X/Y" with a link to \`/upgrade\` if not on a paid tier.
    *   \`Button\` to trigger the comparison, showing a \`Loader2\` icon when pending. **Disabled if \`isComparisonLimitReached\`.**
    *   \`Alert\` component displays any errors, **including tier-based daily comparison limit exceedance messages.**
    *   **Display of Individual Video Thumbnails:** Shows a row of clickable thumbnails for each video in the comparison, each linking to its respective \`BlogPostDetail.tsx\` page. A clear instruction "Click on any video thumbnail above to view its individual analysis." is provided.
    *   **\`Last Compared\` Timestamp:** Displays the \`last_compared_at\` date from \`multiComparisonResult\`.
    *   **"Refresh Comparison" Button:** Triggers \`handleRefreshComparison\` to force a full re-comparison.
    *   **"Chat with AI" Button:** Opens the \`MultiComparisonChatDialog\`.
    *   **"View Full Multi-Comparison Blog Post" Button:** Links to the \`MultiComparisonDetail.tsx\` page.
    *   **\`MultiComparisonDataDisplay\`:** Renders the structured comparative insights.
    *   **Comparative Q&A Display:** Displays AI-generated answers to custom comparative questions.
    *   **Top 10 Raw Comments for Each Video:** A dedicated section lists the top 10 most popular comments for *each* video in the comparison.
*   **\`MultiComparisonChatDialog\` Integration:** Renders the \`MultiComparisonChatDialog\` component, passing \`isChatDialogOpen\`, \`onOpenChange\`, and \`multiComparisonResult\` as props.

### 4.9. \`MultiComparisonLibrary.tsx\` (Multi-Comparison Library Page)
*   **Purpose:** Displays a list of all generated multi-video comparison blog posts from the Supabase database.
*   **Data Fetching:** Uses \`useQuery\` to fetch entries from the \`public.multi_comparisons\` table, joining with \`multi_comparison_videos\` and \`blog_posts\` to get details of the constituent videos.
*   **Search Functionality:** Implements client-side search by comparison title, video titles, or keywords.
*   **UI Elements:**
    *   \`Input\` for the search bar.
    *   \`Card\` components for each comparison.
    *   **Thumbnail Display:** Displays the first video's thumbnail. If there are more videos, a \`Badge\` with "+X more" is overlaid to indicate a multi-video comparison.
    *   Each \`Card\` is wrapped in a \`Link\` to navigate to the \`MultiComparisonDetail.tsx\` page.
    *   \`Skeleton\` components provide loading state visuals.
    *   Handles cases where no posts are found or an error occurs during fetching.
    *   **\`ComparisonLibraryCopilot\` Integration:** Renders the AI copilot for searching comparisons and suggesting new topics. **Copilot queries are now unlimited for all tiers.**
*   **Pagination:** Implements pagination to handle large datasets, fetching only a subset of data per page.

### 4.10. \`MultiComparisonDetail.tsx\` (Multi-Comparison Blog Post Detail Page)
*   **Purpose:** Displays the full content of a single, SEO-optimized multi-video comparison blog post.
*   **Data Fetching:** Uses \`useParams\` to extract the \`slug\` and \`useQuery\` to fetch the specific multi-comparison from \`public.multi_comparisons\`, joining with \`multi_comparison_videos\` and \`blog_posts\` to get all video details, including \`ai_analysis_json\` for raw comments.
*   **SEO Enhancements:** Dynamically updates \`document.title\`, \`meta description\`, \`Open Graph tags\`, and \`JSON-LD structured data\` based on the comparison's details.
*   **UI Elements:**
    *   Displays the comparison \`title\`, \`meta_description\`, \`keywords\`, \`created_at\`, \`updated_at\`, and \`last_compared_at\`.
    *   **Display of Individual Video Thumbnails:** Shows a row of clickable thumbnails for each video in the comparison, each linking to its respective \`BlogPostDetail.tsx\` page. A clear instruction "Click on any video thumbnail above to view its individual analysis." is provided.
    *   Renders the \`content\` field (Markdown) using \`react-markdown\`.
    *   **\`MultiComparisonDataDisplay\`:** Renders the structured comparative insights.
    *   **Comparative Q&A Section:** Displays AI-generated answers to custom comparative questions.
    *   **Top 10 Raw Comments for Each Video:** A dedicated section lists the top 10 most popular comments for *each* video in the comparison.
    *   **"Go to Multi-Comparison Analysis" Button:** Navigates to \`/create-multi-comparison\`, passing the \`multiComparison\` object in \`location.state\` to pre-fill the analysis view.
    *   **"Refresh Comparison" Button:** Navigates to \`/create-multi-comparison\`, passing the \`multiComparison\` object and \`forceRecompare: true\` in \`location.state\` to trigger a full re-comparison.
    *   **"Chat with AI" Button:** Opens the \`MultiComparisonChatDialog\`.
    *   Includes a "Back to Comparison Library" \`Link\`.
*   **\`MultiComparisonChatDialog\` Integration:** Renders the \`MultiComparisonChatDialog\` component, passing \`isChatDialogOpen\`, \`onOpenChange\`, and \`multiComparison\` as props.

### 4.11. \`MyAnalyses.tsx\` (User's Analysis History Page)
*   **Purpose:** Displays a list of blog posts (video analyses) created by the currently authenticated user.
*   **Tier-based Access:** **Access to this page is available for all authenticated users.**
*   **Data Fetching:** Uses \`useQuery\` to fetch \`blog_posts\` where \`author_id\` matches the current user's ID, ordered by \`created_at\`. The \`BlogPost\` interface has been updated to include \`custom_qa_results\` and \`last_reanalyzed_at\`.
*   **Search Functionality:** Similar client-side search as \`VideoAnalysisLibrary.tsx\`.
*   **UI Elements:** Displays user-specific analyses in \`Card\` components, linked to \`BlogPostDetail.tsx\`.
*   **\`LibraryCopilot\` Integration:** Renders the **enhanced** \`LibraryCopilot\` component, passing the user's \`blogPosts\` for AI-powered search and topic recommendations within their personal history. **Copilot queries are now unlimited for all tiers.**

### 4.12. \`ChatInterface.tsx\` (Generic Chat UI)
*   A reusable component designed to display a list of messages and provide an input field for sending new messages.
*   Supports both 'user' and 'ai' sender types, with distinct styling.
*   Includes a loading indicator (\`Loader2\` styled with \`text-muted-foreground\`) when \`isLoading\` is true.
*   Automatically scrolls to the bottom of the chat on new messages.
*   Handles message input and sending via \`onSendMessage\` prop.
*   **Includes a \`disabled\` prop to prevent input when a chat mutation is pending or no analysis/comparison is loaded.**
*   **Markdown Rendering:** Integrates \`react-markdown\` with \`remarkGfm\` to correctly render Markdown formatting in AI responses, including **underlined hyperlinks**, improving readability. The \`prose dark:prose-invert\` Tailwind classes are applied to ensure consistent typography.

### 4.13. \`VideoChatDialog.tsx\` (Single Video Chat Dialog)
*   **Purpose:** Centralizes the AI conversational chat experience for single video analyses into a reusable pop-up dialog.
*   **Props:** Accepts \`isOpen\`, \`onOpenChange\`, \`initialAnalysisResult\` (for new analyses from \`AnalyzeVideo\`), and \`initialBlogPost\` (for analyses loaded from \`BlogPostDetail\`).
*   **Internal State:** Manages \`chatMessages\`, \`desiredWordCount\`, \`selectedPersona\`, \`currentAnalysisResult\`, and \`error\`.
*   **Tier-based Limits:** **All chat messages and desired word counts are now unlimited for all tiers.**
*   **Context Initialization:** On dialog open, it checks \`initialAnalysisResult\` or \`initialBlogPost\` to set \`currentAnalysisResult\`. If \`initialBlogPost\` is provided, it reconstructs the \`AnalysisResponse\` object from the blog post data, including \`ai_analysis_json\`, \`raw_comments_for_chat\`, and **\`customQaResults\`**.
*   **External Context Fetching:** **Removed. External context is no longer fetched for chat.**
*   **Chat Mutation:** Uses an internal \`chatMutation\` (calling \`chat-analyzer\` Edge Function) to send user messages and receive AI responses. The \`customQaResults\` are now passed as part of the \`analysisResult\` to the \`chat-analyzer\` Edge Function.
*   **AI Controls:** Provides a \`Select\` component for users to choose \`selectedPersona\` and an \`Input\` for \`desiredWordCount\`, which are passed to the \`chat-analyzer\` Edge Function.
*   **UI:** Renders the \`ChatInterface\` component within the dialog.

### 4.14. \`MultiComparisonChatDialog.tsx\` (Multi-Video Comparison Chat Dialog)
*   **Purpose:** Centralizes the AI conversational chat experience for multi-video comparisons into a reusable pop-up dialog.
*   **Props:** Accepts \`isOpen\`, \`onOpenChange\`, and \`initialMultiComparisonResult\`.
*   **Internal State:** Manages \`chatMessages\`, \`desiredWordCount\`, \`selectedPersona\`, and \`error\`.
*   **Tier-based Limits:** **All chat messages and desired word counts are now unlimited for all tiers.**
*   **Context Initialization:** On dialog open, it sets \`initialMultiComparisonResult\`.
*   **External Context Fetching:** **Removed. External context is no longer fetched for chat.**
*   **Chat Mutation:** Uses \`chatMutation\` (calling \`multi-comparison-chat-analyzer\` Edge Function) to send user messages and receive AI responses. The \`multiComparisonResult\` (including \`custom_comparative_qa_results\` and \`raw_comments_for_chat\` for each video) is passed as context.
*   **AI Controls:** Provides \`Select\` for \`selectedPersona\` and \`Input\` for \`desiredWordCount\`.
*   **UI:** Renders the \`ChatInterface\` component.

### 4.15. \`LibraryCopilot.tsx\` (Single Video Library Copilot)
*   **Purpose:** Provides an AI assistant within the single video analysis library pages to help users find specific video analyses **and recommend new analysis topics.**
*   **Props:** Accepts \`blogPosts\` (an array of \`BlogPost\` objects) from the parent page.
*   **Internal State:** Manages \`isOpen\` (for the dialog), \`chatMessages\`, and \`error\`.
*   **Tier-based Limits:** **All copilot queries are now unlimited for all tiers.**
*   **Chat Mutation:** Uses \`copilotChatMutation\` to invoke the **enhanced** \`library-copilot-analyzer\` Edge Function, passing the user's query and a simplified list of \`blogPostsData\`.
*   **Markdown Links:** The AI is instructed to respond with clickable Markdown links (\`[Title](/blog/slug)\`) to relevant blog posts.
*   **UI:** Renders the \`ChatInterface\` component within the dialog.

### 4.16. \`ComparisonLibraryCopilot.tsx\` (Multi-Video Comparison Library Copilot)
*   **Purpose:** Provides an AI assistant within the multi-video comparison library page to help users find specific comparisons **and acts as a comparative analysis topic recommender. Daily query limits are removed.**
*   **Props:** Accepts \`comparisons\` (an array of \`MultiComparison\` objects) from the parent page.
*   **Internal State:** Manages \`isOpen\` (for the dialog), \`chatMessages\`, and \`error\`.
*   **Tier-based Limits:** **All copilot queries are now unlimited for all tiers.**
*   **Chat Mutation:** Uses \`copilotChatMutation\` to invoke the \`comparison-library-copilot-analyzer\` Edge Function, passing the user's query and a simplified list of \`comparisonsData\`.
*   **Markdown Links:** The AI is instructed to respond with clickable Markdown links (\`[Title](/comparison/slug)\`) to relevant comparison blog posts.
*   **UI:** Renders the \`ChatInterface\` component within the dialog.

### 4.17. \`Upgrade.tsx\` (Upgrade Page)
*   **Purpose:** Informs users about the benefits of upgrading to a paid tier.
*      **UI:** Displays a comparison of features and limits between the Free Tier and Paid Tier, with a call to action to upgrade. **This page has been updated to reflect the simplified tier structure.**

### 4.18. \`AccountCenter.tsx\` (Account Center Page)
*   **Purpose:** Provides a dedicated page for authenticated users to view and manage their profile information and subscription details.
*   **UI:** Displays user's email, first name, last name, and avatar. Shows current subscription status and plan. Includes a form to update first and last names and a button to sign out. Links to the Upgrade page for free tier users.

## 5. Supabase Integration Details

### 5.1. \`src/integrations/supabase/client.ts\`
*   Initializes the Supabase client using \`createClient\` from \`@supabase/supabase-js\`.
*   Retrieves \`VITE_SUPABASE_URL\` and \`VITE_SUPABASE_ANON_KEY\` from environment variables (\`import.meta.env\`).

### 5.2. \`src/integrations/supabase/auth.tsx\`
*   A React Context Provider that manages the Supabase authentication session globally.
*   Fetches the initial session on component mount.
*   Subscribes to \`onAuthStateChange\` events to keep the session state updated in real-time.
*   **Now also fetches the user's \`subscriptionStatus\` and \`subscriptionPlanId\` from the \`public.subscriptions\` table.**
*   Provides \`session\` (the current Supabase session), \`user\`, \`isLoading\`, \`subscriptionStatus\`, and \`subscriptionPlanId\` to child components via the \`useAuth\` hook.

### 5.3. Database Schema (\`public.profiles\`, \`public.blog_posts\`, \`public.multi_comparisons\`, \`public.multi_comparison_videos\`, \`public.subscriptions\`, \`public.anon_usage\`)
*   **Table:** \`public.profiles\` (Existing)
    *   \`id\`: UUID, Primary Key, references \`auth.users(id)\` (CASCADE on delete).
    *   \`first_name\`: TEXT
    *   \`last_name\`: TEXT
    *   \`avatar_url\`: TEXT
    *   \`updated_at\`: TIMESTAMP WITH TIME ZONE, defaults to \`NOW()\`.
*   **Row Level Security (RLS) for \`public.profiles\`:** Enabled.
    *   \`profiles_select_policy\`: \`FOR SELECT TO authenticated USING (auth.uid() = id)\`
    *   \`profiles_insert_policy\`: \`FOR INSERT TO authenticated WITH CHECK (auth.uid() = id)\`
    *   \`profiles_update_policy\`: \`FOR UPDATE TO authenticated USING (auth.uid() = id)\`
    *   \`profiles_delete_policy\`: \`FOR DELETE TO authenticated USING (auth.uid() = id)\`
    *   These policies ensure that authenticated users can only view, insert, update, or delete their own profile data.
*   **Table:** \`public.blog_posts\` (Updated)
    *   \`id\`: UUID, Primary Key, defaults to \`gen_random_uuid()\`.
    *   \`video_id\`: TEXT, NOT NULL (YouTube video ID).
    *   \`title\`: TEXT, NOT NULL.
    *   \`slug\`: TEXT, NOT NULL, UNIQUE.
    *   \`meta_description\`: TEXT.
    *   \`keywords\`: TEXT[] (Array of keywords).
    *   \`content\`: TEXT, NOT NULL (Blog post content in Markdown).
    *   \`published_at\`: TIMESTAMP WITH TIME ZONE.
    *   \`author_id\`: UUID, references \`auth.users(id)\` (ON DELETE SET NULL).
    *   \`created_at\`: TIMESTAMP WITH TIME ZONE, defaults to \`NOW()\`.
    *   \`updated_at\`: TIMESTAMP WITH TIME ZONE, defaults to \`NOW()\`.
    *   \`creator_name\`: TEXT (YouTube channel/creator name).
    *   \`thumbnail_url\`: TEXT (YouTube video thumbnail URL).
    *   \`original_video_link\`: TEXT (Original YouTube video URL).
    *   \`ai_analysis_json\`: JSONB (Stores the full AI sentiment analysis result **and the top 10 raw comments for chat context**).
    *   \`custom_qa_results\`: JSONB[] (New column: Stores an array of custom questions and their AI-generated answers).
    *   \`last_reanalyzed_at\`: TIMESTAMP WITH TIME ZONE, defaults to \`NOW()\` (New column: Tracks the last time a full sentiment analysis was performed).
*   **Row Level Security (RLS) for \`public.blog_posts\`:** Enabled.
    *   \`Authenticated users can create blog posts\`: \`FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id)\`
    *   \`Authenticated users can update their own blog posts\`: \`FOR UPDATE TO authenticated USING (auth.uid() = author_id)\`
    *   \`Authenticated users can delete their own blog posts\`: \`FOR DELETE TO authenticated USING (auth.uid() = author_id)\`
    *   \`Public read access for published blog posts\`: \`FOR SELECT USING (published_at IS NOT NULL)\`
    *   \`Allow anon users to insert blog posts with null author_id\`: \`FOR INSERT TO anon WITH CHECK (author_id IS NULL)\`
    *   These policies ensure authenticated users manage their own posts, only published posts are publicly viewable, and unauthenticated users can create public analyses.
*   **Table:** \`public.multi_comparisons\` (New)
    *   \`id\`: UUID, Primary Key, defaults to \`gen_random_uuid()\`.
    *   \`title\`: TEXT, NOT NULL.
    *   \`slug\`: TEXT, NOT NULL, UNIQUE.
    *   \`meta_description\`: TEXT.
    *   \`keywords\`: TEXT[] (Array of keywords).
    *   \`content\`: TEXT, NOT NULL (Blog post content in Markdown).
    *   \`author_id\`: UUID, references \`auth.users(id)\` (ON DELETE SET NULL).
    *   \`created_at\`: TIMESTAMP WITH TIME ZONE, defaults to \`NOW()\`.
    *   \`updated_at\`: TIMESTAMP WITH TIME ZONE, defaults to \`NOW()\`.
    *   \`last_compared_at\`: TIMESTAMP WITH TIME ZONE, defaults to \`NOW()\` (Tracks the last time a full multi-comparison was performed).
    *   \`comparison_data_json\`: JSONB (Stores the structured AI multi-comparison result).
    *   \`custom_comparative_qa_results\`: JSONB[] (Stores an array of custom comparative questions and their AI-generated answers).
    *   \`overall_thumbnail_url\`: TEXT (A representative thumbnail for the comparison, if applicable).
*   **Row Level Security (RLS) for \`public.multi_comparisons\`:** Enabled.
    *   \`Authenticated users can create multi-comparisons\`: \`FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id)\`
    *   \`Authenticated users can update their own multi-comparisons\`: \`FOR UPDATE TO authenticated USING (auth.uid() = author_id)\`
    *   \`Authenticated users can delete their own multi-comparisons\`: \`FOR DELETE TO authenticated USING (auth.uid() = author_id)\`
    *   \`Public read access for multi-comparisons\`: \`FOR SELECT USING (true)\`
    *   \`Allow anon users to insert multi-comparisons with null author_id\`: \`FOR INSERT TO anon WITH CHECK (author_id IS NULL)\`
*   **Table:** \`public.multi_comparison_videos\` (New Junction Table)
    *   \`multi_comparison_id\`: UUID, NOT NULL, references \`public.multi_comparisons(id)\` (ON DELETE CASCADE).
    *   \`blog_post_id\`: UUID, NOT NULL, references \`public.blog_posts(id)\` (ON DELETE CASCADE).
    *   \`video_order\`: INTEGER, NOT NULL (Order of video in the comparison).
    *   **Composite Primary Key:** \`(multi_comparison_id, blog_post_id)\`
*   **Row Level Security (RLS) for \`public.multi_comparison_videos\`:** Enabled.
    *   \`Users can manage videos in their multi-comparisons\`: \`FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM multi_comparisons WHERE multi_comparisons.id = multi_comparison_videos.multi_comparison_id AND multi_comparisons.author_id = auth.uid()))\`
    *   \`Public read access for multi-comparison videos\`: \`FOR SELECT USING (EXISTS (SELECT 1 FROM multi_comparisons WHERE multi_comparisons.id = multi_comparison_videos.multi_comparison_id AND true))\`
    *   \`Allow anon to link videos to their multi-comparisons\`: \`FOR INSERT TO anon WITH CHECK (EXISTS (SELECT 1 FROM multi_comparisons WHERE multi_comparisons.id = multi_comparison_videos.multi_comparison_id AND multi_comparisons.author_id IS NULL))\`
*   **Table:** \`public.subscriptions\` (New)
    *   \`id\`: UUID, Primary Key, references \`auth.users(id)\` (CASCADE on delete).
    *   \`status\`: TEXT, NOT NULL (e.g., 'active', 'inactive', 'trial', 'free').
    *   \`plan_id\`: TEXT, NOT NULL (e.g., 'free', 'paid_monthly', 'paid_annual').
    *   \`current_period_end\`: TIMESTAMP WITH TIME ZONE (NULL for 'free' plan, otherwise indicates subscription expiry).
    *   \`created_at\`: TIMESTAMP WITH TIME ZONE, defaults to \`NOW()\`.
    *   \`updated_at\`: TIMESTAMP WITH TIME ZONE, defaults to \`NOW()\`.
*   **Row Level Security (RLS) for \`public.subscriptions\`:** Enabled.
    *   \`Subscriptions select policy\`: \`FOR SELECT TO authenticated USING (auth.uid() = id)\`
    *   \`Subscriptions insert policy\`: \`FOR INSERT TO authenticated WITH CHECK (auth.uid() = id)\`
    *   \`Subscriptions update policy\`: \`FOR UPDATE TO authenticated USING (auth.uid() = id)\`
    *   \`Subscriptions delete policy\`: \`FOR DELETE TO authenticated USING (auth.uid() = id)\`
    *   These policies ensure authenticated users can only manage their own subscription data.
*   **Table:** \`public.anon_usage\` (Updated)
    *   \`ip_address\`: TEXT, Primary Key.
    *   \`analyses_count\`: INTEGER, NOT NULL, defaults to \`0\`.
    *   \`comparisons_count\`: INTEGER, NOT NULL, defaults to \`0\`.
    *   \`last_reset_at\`: TIMESTAMP WITH TIME ZONE, NOT NULL, defaults to \`NOW()\`.
    *   \`created_at\`: TIMESTAMP WITH TIME ZONE, NOT NULL, defaults to \`NOW()\`.
    *   \`updated_at\`: TIMESTAMP WITH TIME ZONE, NOT NULL, defaults to \`NOW()\`.
*   **Row Level Security (RLS) for \`public.anon_usage\`:** Enabled.
    *   \`Allow Edge Functions to manage anon usage\`: \`FOR ALL USING (true)\` (This policy is intentionally broad to allow Edge Functions to manage usage based on IP, as \`auth.uid()\` is not available for unauthenticated requests).

### 5.4. Database Functions & Triggers
*   **Function:** \`public.handle_new_user()\` (Existing)
    *   \`LANGUAGE PLPGSQL SECURITY DEFINER\`: Ensures the function runs with elevated privileges to insert into \`public.profiles\`.
    *   Inserts a new row into \`public.profiles\` with the \`id\`, \`first_name\`, and \`last_name\` from the newly created \`auth.users\` entry's \`raw_user_meta_data\`.
*   **Trigger:** \`on_auth_user_created\` (Existing)
    *   \`AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()\`
    *   Automatically calls \`handle_new_user\` whenever a new user is inserted into \`auth.users\`, ensuring a profile is created for every new signup.

### 5.5. Supabase Edge Function (\`supabase/functions/youtube-analyzer/index.ts\`)
This Deno-based serverless function is the core backend logic for video analysis and blog post generation, **now enhanced with an intelligent caching mechanism, SEO-focused AI prompting, API key rotation, custom question processing (unlimited), and staleness-freshness logic. AI prompts have been extensively engineered for high-quality, production-grade responses for sentiment analysis, blog post generation, and custom Q&A. It now includes robust tier-based daily analysis limits for unauthenticated, authenticated free, and paid users.**
*   **CORS Handling:** Includes \`corsHeaders\` and handles \`OPTIONS\` preflight requests.
*   **Supabase Client Initialization:** Creates a Supabase client within the function, gracefully handling a potentially missing user \`Authorization\` header for unauthenticated users.
*   **Tier Determination:** Determines the \`currentLimits\` (daily analyses) based on the authenticated \`user\`'s subscription status or defaults to \`UNAUTHENTICATED_LIMITS\`.
*   **Usage Enforcement:**
    *   **Daily Analysis Limit:** Checks \`public.blog_posts\` for authenticated users or \`public.anon_usage\` for unauthenticated users to enforce daily analysis limits. Increments counts on successful analysis.
    *   **Custom Question Limits:** **Removed. Custom questions are now unlimited.**
*   **Input Validation:** Checks for \`videoLink\` and extracts \`videoId\`. Now also receives \`customQuestions\` array and an optional \`forceReanalyze\` boolean flag.
*   **Analysis Caching & Staleness Logic:**
    *   Upon receiving a \`videoLink\`, the function first extracts the \`videoId\`.
    *   It then queries the \`public.blog_posts\` table to check if an entry with this \`videoId\` already exists.
    *   **If an \`existingBlogPost\` is found:**
        *   It checks the \`last_reanalyzed_at\` timestamp against a \`STALENESS_THRESHOLD_DAYS\` (currently 30 days).
        *   If \`forceReanalyze\` is \`true\` OR the analysis is \`stale\`, it proceeds with a **full re-analysis**.
        *   Otherwise (analysis is fresh and no \`forceReanalyze\`), it reuses the existing core analysis data.
    *   **If no existing analysis is found OR a full re-analysis is triggered:** The function proceeds with the full analysis workflow:
        *   Fetch the latest video details and comments from YouTube.
        *   Perform AI sentiment analysis using Longcat AI.
        *   Generate a new SEO-optimized blog post content.
        *   Process any \`customQuestions\` (newly submitted or existing).
        *   **Crucially, it retrieves all existing \`custom_qa_results\` from the database and merges them with any new custom questions submitted in the current request.**
        *   **If \`existingBlogPost\` was found (re-analysis):** The function updates the existing \`blog_posts\` entry with the new \`ai_analysis_json\`, regenerated \`content\`, combined \`custom_qa_results\`, and updates \`last_reanalyzed_at\` and \`updated_at\` to the current timestamp.
        *   **If no \`existingBlogPost\` (new analysis):** The function inserts all generated data (including \`aiAnalysis\`, \`raw_comments_for_chat\`, \`customQaResults\`, and \`last_reanalyzed_at\`) into a new \`public.blog_posts\` entry.
    *   **If analysis is fresh and only new custom questions are submitted:** It processes *only those new questions*, generates answers, merges them with existing \`custom_qa_results\`, and updates the \`public.blog_posts\` entry (updating \`updated_at\`, but *not* \`last_reanalyzed_at\`).
*   **API Key Retrieval & Rotation:**
    *   Retrieves a list of \`YOUTUBE_API_KEY\`s and \`LONGCAT_AI_API_KEY\`s using the \`getApiKeys\` helper function.
    *   For each API call (YouTube video details, YouTube comments, Longcat AI analysis, Longcat AI blog post generation, and Longcat AI custom question answering), it iterates through the available keys. If a request fails with a rate limit error (HTTP 429 or YouTube's \`quotaExceeded\` 403), it attempts the request again with the next key in the list.
*   **YouTube Data API Calls (if new/re-analysis):** Fetches video \`snippet\` (title, description, thumbnail, tags, \`channelTitle\`) and top-level comments (\`maxResults=100\`).
*   **Comment Processing (if new/re-analysis):** Maps comments to include \`text\` and \`likeCount\`, and sorts them by \`likeCount\`.
*   **Longcat AI API Call (Sentiment Analysis):** Constructs a \`longcatPrompt\` including video details, tags, and weighted comments. Instructs the AI to prioritize comments with higher like counts. Sends a \`POST\` request to Longcat AI, requesting a \`json_object\` response for sentiment analysis.
*   **Longcat AI API Call (Blog Post Generation):** After successful sentiment analysis, a *second* \`POST\` request is made to Longcat AI for blog post generation.
*   **Longcat AI API Call (Custom Questions - always if new questions):** If \`customQuestions\` are provided, the function iterates through each question. For each, it constructs a specific prompt including the full video analysis context and the user's question, instructing the AI to generate an answer of the specified \`wordCount\`. These answers are collected into \`customQaResults\`.
*   **Response:** Returns a \`200 OK\` response with video details, comments, the AI analysis result, the \`blogPostSlug\`, the \`originalVideoLink\`, the \`customQaResults\`, and the \`lastReanalyzedAt\` timestamp for frontend display.
*   **Error Handling:** Includes comprehensive \`try-catch\` blocks, **returning 403 status for daily analysis limit exceedances.**

### 5.6. Supabase Edge Function (\`supabase/functions/multi-video-comparator/index.ts\`)
This Deno-based serverless function is responsible for orchestrating multi-video comparisons, including individual video analysis, comparative AI insights, and blog post generation. **It implements robust staleness/freshness logic for the multi-comparison itself, ensures individual videos are up-to-date, handles custom comparative questions (unlimited), and enforces tier-based daily comparison limits.**
*   **CORS Handling:** Includes \`corsHeaders\` and handles \`OPTIONS\` preflight requests.
*   **Supabase Client Initialization & User Authentication:** Creates a Supabase client within the function, gracefully handling a potentially missing user \`Authorization\` header.
*   **Tier Determination:** Determines the \`currentLimits\` (daily comparisons) based on the authenticated \`user\`'s subscription status or defaults to \`UNAUTHENTICATED_LIMITS\`.
*   **Usage Enforcement:**
    *   **Daily Comparison Limit:** Checks \`public.multi_comparisons\` for authenticated users or \`public.anon_usage\` for unauthenticated users to enforce daily comparison limits. Increments counts on successful comparison.
    *   **Custom Comparative Question Limits:** **Removed. Custom comparative questions are now unlimited.**
*   **Input Validation:** Checks for \`videoLinks\` (minimum 2, **maximum 3 for reliable performance**) and extracts \`videoIds\`. Also receives \`customComparativeQuestions\` and an optional \`forceRecompare\` flag.
*   **Analysis Orchestration:** For each \`videoLink\`, it ensures the individual video analysis is fresh (re-analyzing if stale or forced) by invoking the \`youtube-analyzer\` Edge Function.
*   **Multi-Comparison Caching & Staleness Logic:** After ensuring all individual videos are fresh, it attempts to find an existing \`multi_comparison\` that matches the exact set of \`blog_post_id\`s. If found and fresh, it reuses existing data; otherwise, it regenerates.
*   **API Key Retrieval & Rotation:** Retrieves \`LONGCAT_AI_API_KEY\`s and iterates through them for AI calls, handling rate limits.
*   **External Context Fetching:** **Removed. External context is no longer fetched for multi-comparison analysis.**
*   **Longcat AI Calls (if regenerating multi-comparison):**
    *   **Core Multi-Comparison Data:** Constructs a prompt with all individual video analyses, instructing Longcat AI to generate structured comparative insights in JSON format.
    *   **Multi-Comparative Blog Post Generation:** Constructs a prompt with the core comparison data, instructing Longcat AI to generate a comprehensive, SEO-optimized blog post in Markdown format, also in JSON.
*   **Process Custom Comparative Questions:** If \`customComparativeQuestions\` are provided, it processes each question, generates answers, and merges them with any existing \`custom_comparative_qa_results\`.
*   **Slug Generation:** Ensures a unique \`slug\` for the multi-comparison blog post.
*   **Database Save/Update:** Inserts a new \`multi_comparison\` or updates an existing one, and manages the \`multi_comparison_videos\` junction table.
*   **Response:** Returns a \`200 OK\` response with the full \`MultiComparisonResult\` object.
*   **Error Handling:** Includes comprehensive \`try-catch\` blocks, **returning 403 status for daily comparison limit exceedances.**

### 5.7. Supabase Edge Function (\`supabase/functions/fetch-external-context/index.ts\`)
**This Edge Function has been removed as external context is no longer used for chat or analysis.**

### 5.8. Supabase Edge Function (\`supabase/functions/chat-analyzer/index.ts\`)
This Deno-based serverless function handles the conversational AI aspect for **single video analyses**. **It now includes API key rotation, explicit instructions for Markdown hyperlinks, incorporates custom Q&A results into its context, and with chat message limits and max response word count removed. External context has been removed from the AI prompt. AI prompts have been extensively engineered for high-quality, production-grade responses, including a strict information hierarchy, precise word count adherence, and mandatory Markdown hyperlink formatting.**
*   **CORS Handling:** Includes \`corsHeaders\` and handles \`OPTIONS\` preflight requests.
*   **Supabase Client Initialization & User Authentication:** Creates a Supabase client within the function, gracefully handling a potentially missing user \`Authorization\` header.
*   **Tier Determination:** **Removed. Chat is now unlimited for all tiers.**
*   **Usage Enforcement:** **Removed. Chat is now unlimited for all tiers.**
*   **Input:** Receives \`userMessage\`, \`chatMessages\` (conversation history), \`analysisResult\` (full video analysis including top comments, creator name, thumbnail URL, \`aiAnalysis\` object, and **\`customQaResults\`**), \`desiredWordCount\`, and \`selectedPersona\` from the frontend.
*   **API Key Retrieval & Rotation:**
    *   Retrieves a list of \`LONGCAT_AI_API_KEY\`s using the \`getApiKeys\` helper function.
    *   Iterates through the available keys, retrying the Longcat AI API call with the next key if a rate limit error (HTTP 429) is encountered.
*   **Dynamic \`max_tokens\`:** Adjusts the \`max_tokens\` parameter for the Longcat AI API call based on the \`finalDesiredWordCount\`.
*   **Dynamic \`systemPrompt\`:** Constructs the AI's \`systemPrompt\` based on the \`selectedPersona\`, guiding the AI's tone, style, and conversational boundaries, and now includes explicit word count targets. **Crucially, it now explicitly instructs the AI to format any URLs or resources as Markdown hyperlinks (\`[Link Text](URL)\`).**
*   **Prompt Construction:**
    *   **System Prompt:** Dynamically generated based on persona, including instructions for information prioritization, adherence to response length, explicit word count targets, and **Markdown link formatting**.
    *   **Analysis Context:** Formats \`analysisResult\` (video details, sentiment, themes, summary, top 10 raw comments, creator name, thumbnail URL) into a dedicated string.
    *   **Custom Q&A Context:** A new section is added to the \`fullContext\` string, including the \`customQaResults\` if available, allowing the chat AI to reference these pre-generated answers.
    *   **External Context:** **Removed from prompt construction.**
    *   **Conversation History:** Appends formatted \`chatMessages\` to maintain conversational flow.
    *   **User Message:** Includes the current \`userMessage\`.
*   **Longcat AI API Call:** Sends the constructed \`messages\` array to the Longcat AI API.
*   **Response:** Returns a \`200 OK\` response with the AI's \`aiResponse\`.
*   **Error Handling:** Includes comprehensive \`try-catch\` blocks.

### 5.9. Supabase Edge Function (\`supabase/functions/multi-comparison-chat-analyzer/index.ts\`)
This Deno-based serverless function handles the conversational AI aspect for **multi-video comparisons**. **It now includes API key rotation, explicit instructions for Markdown hyperlinks, incorporates custom Q&A results into its context, and with chat message limits and max response word count removed. External context has been removed from the AI prompt.**
*   **CORS Handling:** Includes \`corsHeaders\` and handles \`OPTIONS\` preflight requests.
*   **Supabase Client Initialization & User Authentication:** Creates a Supabase client within the function, gracefully handling a potentially missing user \`Authorization\` header.
*   **Tier Determination:** **Removed. Chat is now unlimited for all tiers.**
*   **Usage Enforcement:** **Removed. Chat is now unlimited for all tiers.**
*   **Input:** Receives \`userMessage\`, \`chatMessages\`, \`multiComparisonResult\` (including structured comparison data, custom comparative Q&A, and raw comments for each video), \`desiredWordCount\`, and \`selectedPersona\`.
*   **API Key Retrieval & Rotation:** Retrieves \`LONGCAT_AI_API_KEY\`s and handles rate limits.
*   **Dynamic \`max_tokens\`:** Adjusts \`max_tokens\` based on \`finalDesiredWordCount\`.
*   **Dynamic \`systemPrompt\`:** Constructs the AI's \`systemPrompt\` based on \`selectedPersona\`, including instructions for information prioritization, word count, and Markdown hyperlink formatting.
*   **Prompt Construction:**
    *   **System Prompt:** Dynamically generated based on persona, including instructions for information prioritization, adherence to response length, explicit word count targets, and Markdown link formatting.
    *   **Multi-Comparison Context:** Formats \`multiComparisonResult\` (comparison title, meta description, keywords, structured comparison data, individual video contexts including top comments) into a dedicated string.
    *   **Custom Comparative Q&A Context:** Includes \`custom_comparative_qa_results\` if available.
    *   **External Context:** **Removed from prompt construction.**
    *   **Conversation History:** Appends formatted \`chatMessages\` to maintain conversational flow.
    *   **User Message:** Includes the current \`userMessage\`.
*   **Longcat AI API Call:** Sends the constructed \`messages\` array to the Longcat AI API.
*   **Response:** Returns a \`200 OK\` response with the AI's \`aiResponse\`.
*   **Error Handling:** Includes comprehensive \`try-catch\` blocks.

### 5.10. Supabase Edge Function (\`supabase/functions/library-copilot-analyzer/index.ts\`)
This Deno-based serverless function handles the AI-powered search within the single video analysis library **and now acts as an analysis topic recommender. Daily query limits are removed.**
*   **CORS Handling:** Includes \`corsHeaders\` and handles \`OPTIONS\` preflight requests.
*   **Supabase Client Initialization & User Authentication:** Creates a Supabase client within the function, gracefully handling a potentially missing user \`Authorization\` header.
*   **Tier Determination:** **Removed. Copilot queries are now unlimited for all tiers.**
*   **Usage Enforcement:** **Removed. Copilot queries are now unlimited for all tiers.**
*   **Input:** Receives \`userQuery\` and \`blogPostsData\` (a simplified list of blog posts) from the frontend.
*   **API Key Retrieval & Rotation:** Retrieves a list of \`LONGCAT_AI_API_KEY\`s and iterates through them for API calls.
*   **\`systemPrompt\`:** Explicitly instructs the AI to identify relevant blog posts and provide their titles with **Markdown links in the format \`[Title of Blog Post](/blog/slug-of-blog-post)\`**. **It also now instructs the AI to suggest 1 to 3 new, related analysis topics or video ideas based on the user's query and the existing library content.**
*   **Longcat AI API Call:** Sends the formatted blog post data and user query to the Longcat AI API.
*   **Response:** Returns a \`200 OK\` response with the AI's \`aiResponse\` containing the recommendations with clickable Markdown links and new topic suggestions.
*   **Error Handling:** Includes comprehensive \`try-catch\` blocks.

### 5.11. Supabase Edge Function (\`supabase/functions/comparison-library-copilot-analyzer/index.ts\`)
This Deno-based serverless function handles the AI-powered search within the multi-video comparison library **and acts as a comparative analysis topic recommender. Daily query limits are removed.**
*   **CORS Handling:** Includes \`corsHeaders\` and handles \`OPTIONS\` preflight requests.
*   **Supabase Client Initialization & User Authentication:** Creates a Supabase client within the function, gracefully handling a potentially missing user \`Authorization\` header.
*   **Tier Determination:** **Removed. Copilot queries are now unlimited for all tiers.**
*   **Usage Enforcement:** **Removed. Copilot queries are now unlimited for all tiers.**
*   **Input:** Receives \`userQuery\` and \`comparisonsData\` (a simplified list of multi-comparisons) from the frontend.
*   **API Key Retrieval & Rotation:** Retrieves \`LONGCAT_AI_API_KEY\`s and handles rate limits.
*   **\`systemPrompt\`:** Explicitly instructs the AI to identify relevant comparison blog posts and provide their titles with **Markdown links in the format \`[Title of Comparison Blog Post](/multi-comparison/slug-of-comparison-blog-post)\`**. **It also instructs the AI to suggest 1 to 3 new, related comparative analysis topics or video pairs based on the user's query and the existing library content.**
*   **Longcat AI API Call:** Sends the formatted comparison data and user query to the Longcat AI API.
*   **Response:** Returns a \`200 OK\` response with the AI's \`aiResponse\` containing the recommendations with clickable Markdown links and new topic suggestions.
*   **Error Handling:** Includes comprehensive \`try-catch\` blocks.

### 5.12. Supabase Edge Function (\`supabase/functions/get-anon-usage/index.ts\`)
This Deno-based serverless function is used by the frontend to retrieve the current daily usage counts for unauthenticated users based on their IP address.
*   **CORS Handling:** Includes \`corsHeaders\` and handles \`OPTIONS\` preflight requests.
*   **Supabase Client Initialization:** Creates a Supabase client.
*   **IP Address Retrieval:** Extracts the client's IP address from request headers.
*   **Usage Retrieval:** Queries the \`public.anon_usage\` table for the given IP.
*   **Reset Logic:** If no usage is found or the \`last_reset_at\` timestamp is older than 24 hours, it returns reset counts (0 for all).
*   **Response:** Returns a \`200 OK\` response with \`analyses_count\`, \`comparisons_count\`, and the \`FREE_TIER_LIMITS\`.
*   **Error Handling:** Includes \`try-catch\` blocks.

### 6. Styling and Branding
*   **Tailwind CSS:** Used extensively for all styling, providing a utility-first approach.
*   **\`src/globals.css\`:**
    *   Defines custom CSS variables for the **Crowd Black** and **Pure White** color palette for dark mode. This ensures consistent theming across the application.
    *   Includes specific variables for **Positive Green**, **Neutral Gray**, **Negative Red**, and **Accent Blue** to be used for sentiment and interactive elements.
    *   **Now includes color variables for Emerald, Crimson, Yellow, Cyan, Deep Blue, Forest Green, and Purple Haze themes.**
    *   Applies the \`Inter\` font globally to the \`body\` element.
    *   **New CSS Rule:** Includes \`.prose a { text-decoration: underline; }\` to ensure all links within Markdown-rendered content are clearly underlined.
*   **\`tailwind.config.ts\`:** Configures Tailwind to use \`Inter\` as the default \`font-sans\` family and \`font-heading\`. It also extends the color palette with the new brand colors and sentiment-specific colors.
*   **Branding:** The application features a distinct "SentiVibe" word logo with \`text-3xl font-extrabold tracking-tight\` styling in the header and \`text-5xl font-extrabold tracking-tight\` on the landing page, using the \`font-heading\` (Inter) typeface. The "Vibe" part of the logo is highlighted with the \`text-accent\` color.

## 7. Dependencies
Key dependencies include:
*   \`react\`, \`react-dom\`, \`react-router-dom\`: Core React and routing.
*   \`@supabase/supabase-js\`, \`@supabase/auth-ui-react\`, \`@supabase/auth-ui-shared\`: Supabase client and authentication UI.
*   \`@tanstack/react-query\`: Server state management.
*   \`lucide-react\`: Icon library.
*   \`html2pdf.js\`: Client-side PDF generation.
*   \`tailwind-merge\`, \`clsx\`: Utilities for merging Tailwind CSS classes.
*   \`sonner\`: For toast notifications.
*   \`react-markdown\`, \`remark-gfm\`: For rendering Markdown in chat messages and blog posts.
*   Shadcn/ui components and their Radix UI foundations.
*   **Google Custom Search API (external service): No longer used.**