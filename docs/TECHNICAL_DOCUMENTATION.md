# SentiVibe Technical Documentation

## 1. Introduction
This document provides a comprehensive technical overview of the SentiVibe application, detailing its architecture, core components, data flow, Supabase integration, and external API interactions. SentiVibe is a React-based web application designed to perform AI-powered sentiment analysis on YouTube video comments, engage in context-aware conversations about the analysis, and automatically generate SEO-optimized blog posts for each analysis, which are then stored and made discoverable in a dedicated library.

## 2. Tech Stack
The application is built using the following technologies:
*   **Frontend:** React (with Vite), TypeScript
*   **Styling:** Tailwind CSS, Shadcn/ui (pre-built components), Radix UI (underlying Shadcn/ui)
*   **Routing:** React Router DOM
*   **State Management/Data Fetching:** TanStack Query (for server state management)
*   **Backend/Database/Auth:** Supabase (PostgreSQL, Auth, Edge Functions)
*   **AI Integration:** Longcat AI API
*   **Video Data:** YouTube Data API
*   **External Search:** Google Custom Search API (Programmable Search Engine)
*   **PDF Generation:** `html2pdf.js`
*   **Icons:** `lucide-react`
*   **Utilities:** `clsx`, `tailwind-merge` (`cn` utility)
*   **Markdown Rendering:** `react-markdown`, `remark-gfm`
*   **Fonts:** Google Fonts (`Arimo` for body, `Plus Jakarta Sans` for headings)
*   **Toast Notifications:** `sonner`

## 3. Project Structure
The project follows a standard React application structure with specific directories for organization:

*   `public/`: Static assets like `logo.svg` (for favicon), `favicon.ico`, `robots.txt`.
*   `src/`: Main application source code.
    *   `src/App.tsx`: Main application component, handles routing and context providers.
    *   `src/main.tsx`: Entry point for React rendering.
    *   `src/globals.css`: Global Tailwind CSS styles, custom CSS variables for the **Crowd Black/Pure White** theme, and custom sentiment colors.
    *   `src/lib/utils.ts`: Utility functions (e.g., `cn` for Tailwind class merging).
    *   `src/utils/toast.ts`: Utility functions for `sonner` toast notifications.
    *   `src/components/`: Reusable UI components.
        *   `src/components/Header.tsx`: Global application header with the **SentiVibe wordmark**, and a **theme toggle**.
        *   `src/components/ModeToggle.tsx`: Component for switching between light and dark themes.
        *   `src/components/ChatInterface.tsx`: Generic chat UI component.
        *   `src/components/ProtectedRoute.tsx`: Component for protecting routes.
        *   `src/components/Footer.tsx`: Application footer, now including the **brand ethics disclosure**.
        *   `src/components/theme-provider.tsx`: Theme context provider.
        *   `src/components/VideoChatDialog.tsx`: **Centralized AI chat pop-up.**
        *   `src/components/ui/`: Shadcn/ui components (e.g., Button, Card, Input, Badge, Alert, Skeleton, Collapsible, DropdownMenu).
    *   `src/hooks/`: Custom React hooks.
        *   `src/hooks/use-mobile.tsx`: Hook for detecting mobile viewport.
        *   `src/hooks/use-toast.ts`: Shadcn/ui toast hook (distinct from `sonner` toasts).
    *   `src/pages/`: Application pages/views.
        *   `src/pages/Index.tsx`: Landing page, updated with new tagline and wordmark styling.
        *   `src/pages/Login.tsx`: User authentication page, styled to integrate with the new color palette.
        *   `src/pages/AnalyzeVideo.tsx`: **Main page for YouTube video analysis.**
        *   `src/pages/VideoAnalysisLibrary.tsx`: **Page to list and search generated blog posts (video analyses).**
        *   `src/pages/BlogPostDetail.tsx`: **Page to display the full content of a single generated blog post.**
        *   `src/pages/NotFound.tsx`: 404 error page.
    *   `src/integrations/supabase/`: Supabase-specific integration files.
        *   `src/integrations/supabase/client.ts`: Supabase client initialization.
        *   `src/integrations/supabase/auth.tsx`: React Context Provider and hook for managing Supabase user sessions.
*   `supabase/`: Supabase-related backend files.
    *   `supabase/functions/`: Supabase Edge Functions.
        *   `supabase/functions/youtube-analyzer/index.ts`: **Edge Function for video analysis.**
        *   `supabase/functions/fetch-external-context/index.ts`: Edge Function for performing a one-time Google Custom Search.
        *   `supabase/functions/chat-analyzer/index.ts`: **Edge Function for handling AI chat conversations.**
    *   `supabase/migrations/`: Database migration files.
*   `tailwind.config.ts`: Tailwind CSS configuration, including custom fonts (`Arimo`, `Plus Jakarta Sans`) and the new brand color palette.
*   `.env`: Environment variables (e.g., Supabase URLs, API keys).

## 4. Core Application Flow & Components

### 4.1. `App.tsx` (Root Component & Routing)
*   **Context Providers:** Wraps the entire application with necessary contexts:
    *   `QueryClientProvider`: Manages global state for data fetching with TanStack Query.
    *   `ThemeProvider`: Manages light/dark theme.
    *   `AuthProvider`: Custom provider for Supabase authentication session management.
    *   `Toaster` (from `sonner`): For displaying toast notifications, configured to use brand colors for success/error/neutral.
*   **`AppRoutes` Component:** Encapsulates `BrowserRouter` and `Routes`.
    *   Renders the `Header` component globally.
    *   Defines application routes: `/`, `/login`, `/analyze-video`, `/library`, `/blog/:slug`, and a catch-all `*` for `NotFound`.
*   **`ProtectedRoute` Component:** A higher-order component that ensures only authenticated users can access specific routes (e.g., `/analyze-video`, `/library`). It redirects unauthenticated users to `/login`.

### 4.2. `Header.tsx`
*   A React component that renders a consistent header across all pages.
*   Displays the **SentiVibe wordmark** (`<span className="text-foreground">Senti</span><span className="text-accent">Vibe</span>`) using the `font-heading` (Plus Jakarta Sans) typeface.
*   Includes navigation links to the `/library` route.
*   Integrates the `ModeToggle` component for theme switching.
*   Styled with Tailwind CSS for a clean, **Crowd Black** and **Pure White** appearance.

### 4.3. `Index.tsx` (Landing Page)
*   The default entry point for unauthenticated users or when navigating to the root.
*   Features the **SentiVibe wordmark** prominently (`text-5xl font-extrabold tracking-tight`).
*   Displays the new tagline: "Unlock the true sentiment behind YouTube comments. Analyze, understand, and gain insights into audience reactions with AI-powered sentiment analysis."
*   Includes a call-to-action button (`<Link to="/analyze-video">Analyze a Video</Link>` or `<Link to="/login">Get Started</Link>`) to direct users to the analysis page or login.

### 4.4. `Login.tsx` (Authentication Page)
*   Utilizes the `@supabase/auth-ui-react` component for a pre-built authentication UI.
*   Configured with `supabaseClient` from `src/integrations/supabase/client.ts`.
*   Uses `ThemeSupa` for styling and a `light` theme, with `brand` and `brandAccent` colors mapped to `primary` and `primary-foreground` from the new palette.
*   Automatically redirects authenticated users to the homepage (`/`) using `useAuth` and `useNavigate`.
*   Displays a "Welcome to SentiVibe" message.

### 4.5. `AnalyzeVideo.tsx` (Video Analysis Page)
*   **State Management:** Manages `videoLink` input, `analysisResult`, and `error` states using `useState`.
*   **Supabase Edge Function Invocation:** Uses `useMutation` to call the `youtube-analyzer` Supabase Edge Function. `onSuccess` updates `analysisResult`.
*   **UI Elements:**
    *   `Input` for video link submission.
    *   `Button` to trigger analysis, showing a `Loader2` icon (styled with `text-accent`) when pending.
    *   `Card` components to structure the input form and display results.
    *   `Skeleton` components provide a loading state visual for analysis.
    *   `Alert` component displays any errors from the analysis process.
    *   `Badge` components are used to display sentiment (using `sentiment-positive`, `sentiment-negative`, `sentiment-neutral` classes), emotional tones, and key themes.
    *   Displays a "View Blog Post" `Button` with a `Link` to `/blog/${analysisResult.blogPostSlug}` after a successful analysis.
    *   Displays an "Original Video" `Button` with an `<a>` tag linking to `analysisResult.originalVideoLink`.
*   **PDF Download:** Integrates `html2pdf.js` to convert the analysis results `Card` into a downloadable PDF.
*   **`VideoChatDialog` Integration:** Renders the `VideoChatDialog` component, passing `isChatDialogOpen`, `setIsChatDialogOpen`, and `analysisResult` as props.

### 4.6. `VideoAnalysisLibrary.tsx`
*   **Purpose:** Displays a list of all generated blog posts (video analyses) from the Supabase database.
*   **Data Fetching:** Uses `useQuery` from `@tanstack/react-query` to fetch all entries from the `public.blog_posts` table, ordered by `published_at` date.
*   **Search Functionality:** Implements a client-side search filter based on `searchTerm` state, allowing users to search by `title`, `creator_name`, `meta_description`, or `keywords`.
*   **UI Elements:**
    *   `Input` for the search bar.
    *   `Card` components for each blog post, displaying the `thumbnail_url`, `title`, and `creator_name`.
    *   Each `Card` is wrapped in a `Link` to navigate to the `BlogPostDetail.tsx` page using the post's `slug`.
    *   `Skeleton` components provide loading state visuals.
    *   Handles cases where no posts are found or an error occurs during fetching.
    *   **SEO:** `img` tags for thumbnails include descriptive `alt` attributes.

### 4.7. `BlogPostDetail.tsx`
*   **Purpose:** Displays the full content of a single, SEO-optimized blog post.
*   **Data Fetching:** Uses `useParams` to extract the `slug` from the URL and `useQuery` from `@tanstack/react-query` to fetch the specific blog post from `public.blog_posts` via its `slug`.
*   **SEO Enhancements:**
    *   **Dynamic Meta Tags:** `useEffect` hook dynamically updates `document.title` and `meta name="description"` based on the blog post's title and meta description.
    *   **Open Graph (OG) Tags:** Dynamically adds `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, and `og:site_name` meta tags for rich social media previews.
    *   **Structured Data (JSON-LD):** Includes `BlogPosting` and `SoftwareApplication` schema markup to provide structured information to search engines, enhancing visibility and potential for rich results.
    *   **Alt Text:** `img` tags for thumbnails include descriptive `alt` attributes.
    *   **Content Freshness:** Displays `published_at` and `updated_at` dates.
*   **UI Elements:**
    *   Displays the `thumbnail_url`, `title`, `creator_name`, `published_at` date, `updated_at` date, and `meta_description`.
    *   Renders the `content` field (which is in Markdown) using `react-markdown` and `remarkGfm` for proper formatting.
    *   Displays `keywords` using `Badge` components.
    *   Includes a "Back to Analysis Library" `Link` for easy navigation.
    *   Includes an "Analyze a New Video" `Button` linking to `/analyze-video`.
    *   Includes an "Original Video" `<a>` tag linking to `blogPost.original_video_link`.
    *   `Skeleton` components provide loading state visuals.
    *   Handles cases where the blog post is not found or an error occurs.

### 4.8. `ChatInterface.tsx` (Generic Chat UI)
*   A reusable component designed to display a list of messages and provide an input field for sending new messages.
*   Supports both 'user' and 'ai' sender types, with distinct styling.
*   Includes a loading indicator (`Loader2` styled with `text-muted-foreground`) when `isLoading` is true.
*   Automatically scrolls to the bottom of the chat on new messages.
*   Handles message input and sending via `onSendMessage` prop.
*   **Markdown Rendering:** Integrates `react-markdown` with `remarkGfm` to correctly render Markdown formatting in AI responses, including **underlined hyperlinks**, improving readability. The `prose dark:prose-invert` Tailwind classes are applied to ensure consistent typography.

### 4.9. `VideoChatDialog.tsx` (Centralized AI Chat Pop-up)
*   **Purpose:** Centralizes the AI conversational chat experience for video analyses into a reusable pop-up dialog.
*   **Props:** Accepts `isOpen` (boolean to control visibility), `onOpenChange` (callback to update `isOpen`), and `initialAnalysisResult` (optional, for new analyses from `AnalyzeVideo`).
*   **Internal State:** Manages `chatMessages`, `currentExternalContext`, and `currentAnalysisResult`.
*   **External Context Fetching:** Uses an internal `fetchExternalContextMutation` (calling `fetch-external-context` Edge Function) to get up-to-date external information based on the video's title and tags, *once per dialog open*.
*   **Chat Mutation:** Uses an internal `chatMutation` (calling `chat-analyzer` Edge Function) to send user messages and receive AI responses.
*   **UI:** Renders the `ChatInterface` component within the dialog.

## 5. Supabase Integration Details

### 5.1. `src/integrations/supabase/client.ts`
*   Initializes the Supabase client using `createClient` from `@supabase/supabase-js`.
*   Retrieves `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from environment variables (`import.meta.env`).

### 5.2. `src/integrations/supabase/auth.tsx`
*   A React Context Provider that manages the Supabase authentication session globally.
*   Fetches the initial session on component mount.
*   Subscribes to `onAuthStateChange` events to keep the session state updated in real-time.
*   Provides `session` (the current Supabase session), `user`, and `isLoading` (whether the session is being fetched) to child components via the `useAuth` hook.

### 5.3. Database Schema (`public.profiles`, `public.blog_posts`)
*   **Table:** `public.profiles`
    *   `id`: UUID, Primary Key, references `auth.users(id)` (CASCADE on delete).
    *   `first_name`: TEXT
    *   `last_name`: TEXT
    *   `avatar_url`: TEXT
    *   `updated_at`: TIMESTAMP WITH TIME ZONE, defaults to `NOW()`.
*   **Row Level Security (RLS) for `public.profiles`:** Enabled.
    *   `profiles_select_policy`: `FOR SELECT TO authenticated USING (auth.uid() = id)`
    *   `profiles_insert_policy`: `FOR INSERT TO authenticated WITH CHECK (auth.uid() = id)`
    *   `profiles_update_policy`: `FOR UPDATE TO authenticated USING (auth.uid() = id)`
    *   `profiles_delete_policy`: `FOR DELETE TO authenticated USING (auth.uid() = id)`
    *   These policies ensure that authenticated users can only view, insert, update, or delete their own profile data.
*   **Table:** `public.blog_posts`
    *   `id`: UUID, Primary Key, defaults to `gen_random_uuid()`.
    *   `video_id`: TEXT, NOT NULL (YouTube video ID).
    *   `title`: TEXT, NOT NULL.
    *   `slug`: TEXT, NOT NULL, UNIQUE.
    *   `meta_description`: TEXT.
    *   `keywords`: TEXT[] (Array of keywords).
    *   `content`: TEXT, NOT NULL (Blog post content in Markdown).
    *   `published_at`: TIMESTAMP WITH TIME ZONE.
    *   `author_id`: UUID, references `auth.users(id)` (ON DELETE SET NULL).
    *   `created_at`: TIMESTAMP WITH TIME ZONE, defaults to `NOW()`.
    *   `updated_at`: TIMESTAMP WITH TIME ZONE, defaults to `NOW()`.
    *   `creator_name`: TEXT (YouTube channel/creator name).
    *   `thumbnail_url`: TEXT (YouTube video thumbnail URL).
    *   `original_video_link`: TEXT (Original YouTube video URL).
    *   `ai_analysis_json`: JSONB (Stores the full AI sentiment analysis result **and the top 10 raw comments for chat context**).
*   **Row Level Security (RLS) for `public.blog_posts`:** Enabled.
    *   `Authenticated users can create blog posts`: `FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id)`
    *   `Authenticated users can update their own blog posts`: `FOR UPDATE TO authenticated USING (auth.uid() = author_id)`
    *   `Authenticated users can delete their own blog posts`: `FOR DELETE TO authenticated USING (auth.uid() = author_id)`
    *   `Public read access for published blog posts`: `FOR SELECT USING (published_at IS NOT NULL)`
    *   These policies ensure authenticated users manage their own posts, and only published posts are publicly viewable.

### 5.4. Database Functions & Triggers
*   **Function:** `public.handle_new_user()`
    *   `LANGUAGE PLPGSQL SECURITY DEFINER`: Ensures the function runs with elevated privileges to insert into `public.profiles`.
    *   Inserts a new row into `public.profiles` with the `id`, `first_name`, and `last_name` from the newly created `auth.users` entry's `raw_user_meta_data`.
*   **Trigger:** `on_auth_user_created`
    *   `AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()`
    *   Automatically calls `handle_new_user` whenever a new user is inserted into `auth.users`, ensuring a profile is created for every new signup.

### 5.5. Supabase Edge Function (`supabase/functions/youtube-analyzer/index.ts`)
This Deno-based serverless function is the core backend logic for video analysis and blog post generation.
*   **CORS Handling:** Includes `corsHeaders` and handles `OPTIONS` preflight requests.
*   **Supabase Client Initialization:** Creates a Supabase client within the function, passing the user's `Authorization` header.
*   **User Authentication:** Verifies the user's session.
*   **Input Validation:** Checks for `videoLink`.
*   **API Key Retrieval & Rotation:** Retrieves and rotates `YOUTUBE_API_KEY`s and `LONGCAT_AI_API_KEY`s.
*   **YouTube Data API Calls:** Fetches video `snippet` (title, description, thumbnail, tags, `channelTitle`) and top-level comments.
*   **Comment Processing:** Maps comments to include `text` and `likeCount`, enforces a minimum of 50 comments, and sorts them by `likeCount`.
*   **Longcat AI API Call (Analysis):** Constructs a `longcatPrompt` including video details, tags, and weighted comments. Instructs the AI to prioritize comments with higher like counts. Sends a `POST` request to Longcat AI, requesting a `json_object` response for sentiment analysis.
*   **Longcat AI API Call (Blog Post Generation):** After successful sentiment analysis, a *second* `POST` request is made to Longcat AI for blog post generation.
*   **Database Operations:** Inserts new `blog_posts` entries with all generated data, including `aiAnalysis` and `raw_comments_for_chat`.
*   **Response:** Returns a `200 OK` response with video details, AI analysis, and blog post slug.
*   **Error Handling:** Includes comprehensive `try-catch` blocks for API calls and database operations.

### 5.6. Supabase Edge Function (`supabase/functions/fetch-external-context/index.ts`)
This Deno-based serverless function is responsible for fetching external, up-to-date information using Google Custom Search.
*   **CORS Handling:** Includes `corsHeaders` and handles `OPTIONS` preflight requests.
*   **User Authentication:** Verifies the user's session.
*   **Input Validation:** Checks for a `query` string.
*   **API Key Retrieval & Rotation:** Retrieves and rotates `GOOGLE_SEARCH_API_KEY`s.
*   **Google Custom Search API Call:** Performs a search using the provided query.
*   **Result Processing:** Extracts snippets from the top 3 search results.
*   **Response:** Returns a `200 OK` response with `externalSearchResults`.
*   **Cost Optimization:** This function is called only once per video analysis session from the frontend, reducing repeated Google Search API calls.

### 5.7. Supabase Edge Function (`supabase/functions/chat-analyzer/index.ts`)
This Deno-based serverless function handles the conversational AI aspect.
*   **CORS Handling:** Includes `corsHeaders` and handles `OPTIONS` preflight requests.
*   **Supabase Client Initialization & User Authentication:** Verifies the user.
*   **Input:** Receives `userMessage`, `chatMessages` (conversation history), `analysisResult` (full video analysis including top comments, creator name, thumbnail URL, and `aiAnalysis` object), and `externalContext` (pre-fetched Google search results) from the frontend.
*   **API Key Retrieval & Rotation:** Retrieves and rotates `LONGCAT_AI_API_KEY`s.
*   **Prompt Construction:** Combines system prompt, video analysis context, external context, conversation history, and user message.
*   **Longcat AI API Call:** Sends the constructed `messages` array to the Longcat AI API.
*   **Response:** Returns a `200 OK` response with the AI's `aiResponse`.
*   **Cost Efficiency:** This function no longer makes direct Google Search API calls, relying on the frontend to provide the `externalContext`.

## 6. Styling and Branding
*   **Tailwind CSS:** Used extensively for all styling, providing a utility-first approach.
*   **`src/globals.css`:**
    *   Defines custom CSS variables for the **Crowd Black** and **Pure White** color palette for both light and dark modes. This ensures consistent theming across the application.
    *   Includes specific variables for **Positive Green**, **Neutral Gray**, **Negative Red**, and **Accent Blue** to be used for sentiment and interactive elements.
    *   Applies the `Arimo` font globally to the `body` element.
    *   **New CSS Rule:** Includes `.prose a { text-decoration: underline; }` to ensure all links within Markdown-rendered content are clearly underlined.
*   **`tailwind.config.ts`:** Configures Tailwind to use `Arimo` as the default `font-sans` family and `Plus Jakarta Sans` for `font-heading`. It also extends the color palette with the new brand colors and sentiment-specific colors.
*   **Branding:** The application features a distinct "SentiVibe" word logo with `text-3xl font-extrabold tracking-tight` styling in the header and `text-5xl font-extrabold tracking-tight` on the landing page, using the `font-heading` (Plus Jakarta Sans) typeface. The "Vibe" part of the logo is highlighted with the `text-accent` color.

## 7. Dependencies
Key dependencies include:
*   `react`, `react-dom`, `react-router-dom`: Core React and routing.
*   `@supabase/supabase-js`, `@supabase/auth-ui-react`, `@supabase/auth-ui-shared`: Supabase client and authentication UI.
*   `@tanstack/react-query`: Server state management.
*   `lucide-react`: Icon library.
*   `html2pdf.js`: Client-side PDF generation.
*   `tailwind-merge`, `clsx`: Utilities for merging Tailwind CSS classes.
*   `sonner`: For toast notifications.
*   `react-markdown`, `remark-gfm`: For rendering Markdown in chat messages and blog posts.
*   Shadcn/ui components and their Radix UI foundations.
*   Google Custom Search API (external service).

This technical documentation provides a detailed insight into how SentiVibe is constructed and operates internally.