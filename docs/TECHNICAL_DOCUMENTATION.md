# SentiVibe Technical Documentation

## 1. Introduction
This document provides a comprehensive technical overview of the SentiVibe application, detailing its architecture, core components, data flow, Supabase integration, and external API interactions. SentiVibe is a React-based web application designed to perform AI-powered sentiment analysis on YouTube video comments and engage in context-aware conversations about the analysis.

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
*   **Font:** Google Fonts (Arimo)

## 3. Project Structure
The project follows a standard React application structure with specific directories for organization:

*   `public/`: Static assets like `logo.png`, `favicon.ico`.
*   `src/`: Main application source code.
    *   `src/App.tsx`: Main application component, handles routing and context providers.
    *   `src/main.tsx`: Entry point for React rendering.
    *   `src/globals.css`: Global Tailwind CSS styles and custom CSS variables.
    *   `src/lib/utils.ts`: Utility functions (e.g., `cn` for Tailwind class merging).
    *   `src/utils/toast.ts`: Utility functions for `sonner` toast notifications.
    *   `src/components/`: Reusable UI components.
        *   `src/components/Header.tsx`: Global application header with branding.
        *   `src/components/ChatInterface.tsx`: Generic chat UI component.
        *   `src/components/made-with-dyad.tsx`: Footer component.
        *   `src/components/ui/`: Shadcn/ui components (e.g., Button, Card, Input, Badge, Alert, Skeleton, Collapsible).
    *   `src/hooks/`: Custom React hooks.
        *   `src/hooks/use-mobile.tsx`: Hook for detecting mobile viewport.
        *   `src/hooks/use-toast.ts`: Shadcn/ui toast hook (distinct from `sonner` toasts).
    *   `src/pages/`: Application pages/views.
        *   `src/pages/Index.tsx`: Landing page.
        *   `src/pages/Login.tsx`: User authentication page.
        *   `src/pages/AnalyzeVideo.tsx`: Main page for YouTube video analysis and AI chat.
        *   `src/pages/NotFound.tsx`: 404 error page.
    *   `src/integrations/supabase/`: Supabase-specific integration files.
        *   `src/integrations/supabase/client.ts`: Supabase client initialization.
        *   `src/integrations/supabase/auth.tsx`: React Context Provider and hook for managing Supabase user sessions.
*   `supabase/`: Supabase-related backend files.
    *   `supabase/functions/`: Supabase Edge Functions.
        *   `supabase/functions/youtube-analyzer/index.ts`: Edge Function for video analysis.
        *   `supabase/functions/fetch-external-context/index.ts`: Edge Function for performing a one-time Google Custom Search.
        *   `supabase/functions/chat-analyzer/index.ts`: Edge Function for handling AI chat conversations.
    *   `supabase/migrations/`: Database migration files.
*   `tailwind.config.ts`: Tailwind CSS configuration, including custom fonts and colors.
*   `.env`: Environment variables (e.g., Supabase URLs, API keys).

## 4. Core Application Flow & Components

### 4.1. `App.tsx` (Root Component & Routing)
*   **Context Providers:** Wraps the entire application with necessary contexts:
    *   `QueryClientProvider`: Manages global state for data fetching with TanStack Query.
    *   `TooltipProvider`: Provides context for Shadcn/ui tooltips.
    *   `Toaster` (Shadcn/ui) and `Sonner` (external library): For displaying notifications.
    *   `AuthProvider`: Custom provider for Supabase authentication session management.
*   **`AppRoutes` Component:** Encapsulates `BrowserRouter` and `Routes`.
    *   Renders the `Header` component globally.
    *   Defines application routes: `/`, `/login`, `/analyze-video`, and a catch-all `*` for `NotFound`.
*   **`ProtectedRoute` Component:** A higher-order component that ensures only authenticated users can access specific routes (e.g., `/analyze-video`). It redirects unauthenticated users to `/login`.

### 4.2. `Header.tsx`
*   A simple React component that renders a consistent header across all pages.
*   Displays the "SentiVibe" word logo, which acts as a link back to the homepage (`/`).
*   Styled with Tailwind CSS for a clean, black-and-white appearance.

### 4.3. `Index.tsx` (Landing Page)
*   The default entry point for unauthenticated users or when navigating to the root.
*   Features the "SentiVibe" word logo prominently.
*   Provides a brief description of the application's purpose.
*   Includes a call-to-action button (`<Link to="/analyze-video">Analyze a Video</Link>` or `<Link to="/login">Get Started</Link>`) to direct users to the analysis page or login.

### 4.4. `Login.tsx` (Authentication Page)
*   Utilizes the `@supabase/auth-ui-react` component for a pre-built authentication UI.
*   Configured with `supabaseClient` from `src/integrations/supabase/client.ts`.
*   Uses `ThemeSupa` for styling and a `light` theme.
*   Automatically redirects authenticated users to the homepage (`/`) using `useAuth` and `useNavigate`.
*   Displays a "Welcome to SentiVibe" message.

### 4.5. `AnalyzeVideo.tsx` (Video Analysis Page)
*   **State Management:** Manages `videoLink` input, `customInstructions`, `analysisResult`, `error`, `chatMessages`, and `externalContext` states using `useState`.
*   **Supabase Edge Function Invocation:**
    *   **`analyzeVideoMutation`:** Uses `useMutation` to call the `youtube-analyzer` Supabase Edge Function. `onSuccess` updates `analysisResult` and then triggers `fetchExternalContextMutation`.
    *   **`fetchExternalContextMutation`:** A new `useMutation` hook that calls the `fetch-external-context` Edge Function *once* after a successful video analysis. It uses the video title and tags as a search query and stores the results in `externalContext` state.
    *   **`chatMutation`:** Uses `useMutation` to handle asynchronous calls to the `chat-analyzer` Supabase Edge Function. It sends the `userMessage`, `chatMessages` history, `analysisResult`, and the pre-fetched `externalContext`.
*   **UI Elements:**
    *   `Input` for video link submission.
    *   `Textarea` for custom instructions.
    *   `Button` to trigger analysis, showing a `Loader2` icon when pending.
    *   `Card` components to structure the input form, display results, and house the chat interface.
    *   `Skeleton` components provide a loading state visual for both analysis and external context fetching.
    *   `Alert` component displays any errors from the analysis process.
    *   `Badge` components are used to display sentiment, emotional tones, and key themes.
    *   `Collapsible` component is prepared for subtitles (though currently empty).
    *   `ChatInterface` component is rendered after a successful analysis, displaying conversation history and allowing user input. The chat input is disabled while analysis or external context fetching is pending.
*   **PDF Download:**
    *   Integrates `html2pdf.js` to convert the analysis results `Card` into a downloadable PDF.
    *   A `useRef` (`analysisReportRef`) is used to target the specific DOM element for conversion.
    *   `handleDownloadPdf` function configures `html2pdf.js` options and triggers the download.

### 4.6. `ChatInterface.tsx` (Generic Chat UI)
*   A reusable component designed to display a list of messages and provide an input field for sending new messages.
*   Supports both 'user' and 'ai' sender types, with distinct styling and icons (`User2`, `Bot`).
*   Includes a loading indicator (`Loader2`) when `isLoading` is true.
*   Automatically scrolls to the bottom of the chat on new messages.
*   Handles message input and sending via `onSendMessage` prop.

## 5. Supabase Integration Details

### 5.1. `src/integrations/supabase/client.ts`
*   Initializes the Supabase client using `createClient` from `@supabase/supabase-js`.
*   Retrieves `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from environment variables (`import.meta.env`).

### 5.2. `src/integrations/supabase/auth.tsx`
*   A React Context Provider that manages the Supabase authentication session globally.
*   Fetches the initial session on component mount.
*   Subscribes to `onAuthStateChange` events to keep the session state updated in real-time.
*   Provides `session` (the current Supabase session), `user`, and `isLoading` (whether the session is being fetched) to child components via the `useAuth` hook.

### 5.3. Database Schema (`public.profiles`)
*   **Table:** `public.profiles`
    *   `id`: UUID, Primary Key, references `auth.users(id)` (CASCADE on delete).
    *   `first_name`: TEXT
    *   `last_name`: TEXT
    *   `avatar_url`: TEXT
    *   `updated_at`: TIMESTAMP WITH TIME ZONE, defaults to `NOW()`.
*   **Row Level Security (RLS):** Enabled on `public.profiles`.
    *   `profiles_select_policy`: `FOR SELECT TO authenticated USING (auth.uid() = id)`
    *   `profiles_insert_policy`: `FOR INSERT TO authenticated WITH CHECK (auth.uid() = id)`
    *   `profiles_update_policy`: `FOR UPDATE TO authenticated USING (auth.uid() = id)`
    *   `profiles_delete_policy`: `FOR DELETE TO authenticated USING (auth.uid() = id)`
    *   These policies ensure that authenticated users can only view, insert, update, or delete their own profile data.

### 5.4. Database Functions & Triggers
*   **Function:** `public.handle_new_user()`
    *   `LANGUAGE PLPGSQL SECURITY DEFINER`: Ensures the function runs with elevated privileges to insert into `public.profiles`.
    *   Inserts a new row into `public.profiles` with the `id`, `first_name`, and `last_name` from the newly created `auth.users` entry's `raw_user_meta_data`.
*   **Trigger:** `on_auth_user_created`
    *   `AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()`
    *   Automatically calls `handle_new_user` whenever a new user is inserted into `auth.users`, ensuring a profile is created for every new signup.

### 5.5. Supabase Edge Function (`supabase/functions/youtube-analyzer/index.ts`)
This Deno-based serverless function is the core backend logic for video analysis.
*   **CORS Handling:** Includes `corsHeaders` and handles `OPTIONS` preflight requests.
*   **Supabase Client Initialization:** Creates a Supabase client within the function, passing the user's `Authorization` header.
*   **User Authentication:** Verifies the user's session.
*   **Input Validation:** Checks for `videoLink` and extracts `videoId`.
*   **API Key Retrieval:** Accesses `YOUTUBE_API_KEY` and `LONGCAT_AI_API_KEY` from Supabase environment secrets.
*   **YouTube Data API Calls:** Fetches video `snippet` (title, description, thumbnail, tags) and top-level comments (`maxResults=100`).
*   **Comment Processing:** Maps comments to include `text` and `likeCount`, enforces a minimum of 50 comments, and sorts them by `likeCount`.
*   **Longcat AI API Call:** Constructs a `longcatPrompt` including video details, tags, and weighted comments. Instructs the AI to prioritize comments with higher like counts. Sends a `POST` request to Longcat AI, requesting a `json_object` response.
*   **Response:** Returns a `200 OK` response with video details, comments, and the AI analysis result.
*   **Error Handling:** Includes a general `try-catch` block.

### 5.6. Supabase Edge Function (`supabase/functions/fetch-external-context/index.ts`)
This new Deno-based serverless function is responsible for fetching external, up-to-date information using Google Custom Search.
*   **CORS Handling:** Includes `corsHeaders` and handles `OPTIONS` preflight requests.
*   **Input Validation:** Checks for a `query` string.
*   **API Key Retrieval:** Accesses `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` from Supabase environment secrets.
*   **Google Custom Search API Call:** Performs a search using the provided query.
*   **Result Processing:** Extracts snippets from the top 3 search results.
*   **Response:** Returns a `200 OK` response with `externalSearchResults`.
*   **Cost Optimization:** This function is called only once per video analysis session from the frontend, reducing repeated Google Search API calls.

### 5.7. Supabase Edge Function (`supabase/functions/chat-analyzer/index.ts`)
This Deno-based serverless function handles the conversational AI aspect.
*   **CORS Handling:** Includes `corsHeaders` and handles `OPTIONS` preflight requests.
*   **Supabase Client Initialization & User Authentication:** Verifies the user.
*   **Input:** Receives `userMessage`, `chatMessages` (conversation history), `analysisResult` (full video analysis including top comments), and `externalContext` (pre-fetched Google search results) from the frontend.
*   **API Key Retrieval:** Accesses `LONGCAT_AI_API_KEY` from Supabase environment secrets.
*   **Prompt Construction:**
    *   **System Prompt:** Defines the AI's persona (`SentiVibe AI`) and a clear hierarchy for information usage:
        1.  **Prioritize:** Video analysis context (including top comments) for video-specific questions.
        2.  **Augment:** Provided `externalContext` for up-to-date or broader context, relating it back to the video.
        3.  **Leverage:** AI's own pre-existing knowledge for general, time-independent questions not covered by the above.
    *   **Analysis Context:** Formats `analysisResult` (video details, sentiment, themes, summary, and **top 10 raw comments**) into a dedicated string.
    *   **External Context:** Integrates the received `externalContext` into the user's prompt, clearly labeled.
    *   **Conversation History:** Appends formatted `chatMessages` to maintain conversational flow.
    *   **User Message:** Includes the current `userMessage`.
*   **Longcat AI API Call:** Sends the constructed `messages` array to the Longcat AI API.
*   **Response:** Returns a `200 OK` response with the AI's `aiResponse`.
*   **Cost Efficiency:** This function no longer makes direct Google Search API calls, relying on the frontend to provide the `externalContext`.

## 6. Styling and Branding
*   **Tailwind CSS:** Used extensively for all styling, providing a utility-first approach.
*   **`src/globals.css`:**
    *   Defines custom CSS variables for a **black and white color palette** for both light and dark modes. This ensures consistent theming across the application.
    *   Applies the `Arimo` font globally to the `body` element.
*   **`tailwind.config.ts`:** Configures Tailwind to use `Arimo` as the default `font-sans` family.
*   **Branding:** The application features a "SentiVibe" word logo with `text-3xl font-extrabold tracking-tight` styling in the header and `text-5xl font-extrabold tracking-tight` on the landing page, replacing any image-based logos.

## 7. Dependencies
Key dependencies include:
*   `react`, `react-dom`, `react-router-dom`: Core React and routing.
*   `@supabase/supabase-js`, `@supabase/auth-ui-react`, `@supabase/auth-ui-shared`: Supabase client and authentication UI.
*   `@tanstack/react-query`: Server state management.
*   `lucide-react`: Icon library.
*   `html2pdf.js`: Client-side PDF generation.
*   `tailwind-merge`, `clsx`: Utilities for merging Tailwind CSS classes.
*   `sonner`: For toast notifications.
*   Shadcn/ui components and their Radix UI foundations.
*   Google Custom Search API (external service).

This technical documentation provides a detailed insight into how SentiVibe is constructed and operates internally.