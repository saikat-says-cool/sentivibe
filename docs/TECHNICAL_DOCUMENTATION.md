# SentiVibe Technical Documentation

## 1. Introduction
This document provides a comprehensive technical overview of the SentiVibe application, detailing its architecture, core components, data flow, Supabase integration, and external API interactions. SentiVibe is a React-based web application designed to perform AI-powered sentiment analysis on YouTube video comments.

## 2. Tech Stack
The application is built using the following technologies:
*   **Frontend:** React (with Vite), TypeScript
*   **Styling:** Tailwind CSS, Shadcn/ui (pre-built components), Radix UI (underlying Shadcn/ui)
*   **Routing:** React Router DOM
*   **State Management/Data Fetching:** TanStack Query (for server state management)
*   **Backend/Database/Auth:** Supabase (PostgreSQL, Auth, Edge Functions)
*   **AI Integration:** Longcat AI API
*   **Video Data:** YouTube Data API
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
        *   `src/components/ChatInterface.tsx`: Generic chat UI component (currently unused).
        *   `src/components/made-with-dyad.tsx`: Footer component.
        *   `src/components/ui/`: Shadcn/ui components (e.g., Button, Card, Input, Badge, Alert, Skeleton, Collapsible).
    *   `src/hooks/`: Custom React hooks.
        *   `src/hooks/use-mobile.tsx`: Hook for detecting mobile viewport.
        *   `src/hooks/use-toast.ts`: Shadcn/ui toast hook (distinct from `sonner` toasts).
    *   `src/pages/`: Application pages/views.
        *   `src/pages/Index.tsx`: Landing page.
        *   `src/pages/Login.tsx`: User authentication page.
        *   `src/pages/AnalyzeVideo.tsx`: Main page for YouTube video analysis.
        *   `src/pages/NotFound.tsx`: 404 error page.
    *   `src/integrations/supabase/`: Supabase-specific integration files.
        *   `src/integrations/supabase/client.ts`: Supabase client initialization.
        *   `src/integrations/supabase/SessionContextProvider.tsx`: React Context Provider for managing Supabase user sessions.
*   `supabase/`: Supabase-related backend files.
    *   `supabase/functions/`: Supabase Edge Functions.
        *   `supabase/functions/youtube-analyzer/index.ts`: Edge Function for video analysis.
    *   `supabase/migrations/`: Database migration files.
*   `tailwind.config.ts`: Tailwind CSS configuration, including custom fonts and colors.
*   `.env`: Environment variables (e.g., Supabase URLs, API keys).

## 4. Core Application Flow & Components

### 4.1. `App.tsx` (Root Component & Routing)
*   **Context Providers:** Wraps the entire application with necessary contexts:
    *   `QueryClientProvider`: Manages global state for data fetching with TanStack Query.
    *   `TooltipProvider`: Provides context for Shadcn/ui tooltips.
    *   `Toaster` (Shadcn/ui) and `Sonner` (external library): For displaying notifications.
    *   `SessionContextProvider`: Custom provider for Supabase authentication session management.
*   **`AppRoutes` Component:** Encapsulates `BrowserRouter` and `Routes`.
    *   Renders the `Header` component globally.
    *   Defines application routes: `/`, `/login`, `/analyze`, and a catch-all `*` for `NotFound`.
*   **`ProtectedRoute` Component:** A higher-order component that ensures only authenticated users can access specific routes (e.g., `/analyze`). It redirects unauthenticated users to `/login`.

### 4.2. `Header.tsx`
*   A simple React component that renders a consistent header across all pages.
*   Displays the "SentiVibe" word logo, which acts as a link back to the homepage (`/`).
*   Styled with Tailwind CSS for a clean, black-and-white appearance.

### 4.3. `Index.tsx` (Landing Page)
*   The default entry point for unauthenticated users or when navigating to the root.
*   Features the "SentiVibe" word logo prominently.
*   Provides a brief description of the application's purpose.
*   Includes a call-to-action button (`<Link to="/analyze">Start Analyzing a Video</Link>`) to direct users to the analysis page.

### 4.4. `Login.tsx` (Authentication Page)
*   Utilizes the `@supabase/auth-ui-react` component for a pre-built authentication UI.
*   Configured with `supabaseClient` from `src/integrations/supabase/client.ts`.
*   Uses `ThemeSupa` for styling and a `light` theme.
*   Automatically redirects authenticated users to the homepage (`/`) using `useSession` and `useNavigate`.
*   Displays a "Welcome to SentiVibe" message.

### 4.5. `AnalyzeVideo.tsx` (Video Analysis Page)
*   **State Management:** Manages `videoLink` input, `analysisResult`, and `error` states using `useState`.
*   **Supabase Edge Function Invocation:**
    *   Uses `useMutation` from TanStack Query to handle the asynchronous call to the `youtube-analyzer` Supabase Edge Function.
    *   `mutationFn` sends the `videoLink` to the Edge Function.
    *   `onSuccess` updates `analysisResult` with the data received from the Edge Function.
    *   `onError` sets the `error` state for display in an `Alert` component.
*   **UI Elements:**
    *   `Input` for video link submission.
    *   `Button` to trigger analysis, showing a `Loader2` icon when pending.
    *   `Card` components to structure the input form and display results.
    *   `Skeleton` components provide a loading state visual.
    *   `Alert` component displays any errors from the analysis process.
    *   `Badge` components are used to display sentiment, emotional tones, and key themes.
    *   `Collapsible` component is prepared for subtitles (though currently empty).
*   **PDF Download:**
    *   Integrates `html2pdf.js` to convert the analysis results `Card` into a downloadable PDF.
    *   A `useRef` (`analysisReportRef`) is used to target the specific DOM element for conversion.
    *   `handleDownloadPdf` function configures `html2pdf.js` options (margin, filename, image quality, PDF format/orientation) and triggers the download.

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

### 5.2. `src/integrations/supabase/SessionContextProvider.tsx`
*   A React Context Provider that manages the Supabase authentication session globally.
*   Fetches the initial session on component mount.
*   Subscribes to `onAuthStateChange` events to keep the session state updated in real-time.
*   Provides `session` (the current Supabase session) and `isLoading` (whether the session is being fetched) to child components via the `useSession` hook.

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
*   **CORS Handling:** Includes `corsHeaders` and handles `OPTIONS` preflight requests to allow cross-origin calls from the frontend.
*   **Supabase Client Initialization:** Creates a Supabase client within the function, passing the user's `Authorization` header for RLS and user context.
*   **User Authentication:** Verifies the user's session using `supabaseClient.auth.getUser()`, returning `401 Unauthorized` if no user is found.
*   **Input Validation:**
    *   Checks for `videoLink` in the request body.
    *   Extracts `videoId` using a regex, returning `400 Bad Request` for invalid links.
*   **API Key Retrieval:** Accesses `YOUTUBE_API_KEY` and `LONGCAT_AI_API_KEY` from Supabase environment secrets (`Deno.env.get`). Returns `500 Internal Server Error` if keys are missing.
*   **YouTube Data API Calls:**
    *   **Video Details:** Fetches `snippet` (title, description, thumbnail, tags) using `videos?part=snippet`. The problematic `'captions'` part was removed to resolve a `400` API error.
    *   **Comments:** Fetches `snippet` for top-level comments using `commentThreads?part=snippet&maxResults=100`.
*   **Comment Processing:**
    *   Maps fetched comments to include `text` and `likeCount`.
    *   **Minimum Comment Count:** Enforces a minimum of 50 comments, returning `400 Bad Request` if the video has fewer.
    *   **Sorting:** Sorts comments by `likeCount` in descending order.
    *   Formats comments for AI input, including their like counts as weights.
*   **Longcat AI API Call:**
    *   Constructs a detailed `longcatPrompt` that includes video title, description, tags, and the weighted comments.
    *   Instructs the AI to prioritize comments with higher like counts for sentiment analysis.
    *   Sends a `POST` request to `https://api.longcat.chat/openai/v1/chat/completions` with `LongCat-Flash-Chat` model.
    *   Requests a `json_object` response format.
    *   Handles potential errors from the Longcat AI API.
    *   Parses the AI's JSON response, removing markdown fences if present.
*   **Response:** Returns a `200 OK` response with video details, comments, and the AI analysis result.
*   **Error Handling:** Includes a general `try-catch` block for unexpected errors, returning `500 Internal Server Error`.

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

This technical documentation provides a detailed insight into how SentiVibe is constructed and operates internally.