# SentiVibe Technical Documentation

This document provides an in-depth overview of SentiVibe's technical architecture, key components, and implementation details.

## 1. Architecture Overview

SentiVibe is a modern web application built with a serverless-first approach, leveraging a combination of React (Next.js), Supabase, and Deno Edge Functions.

-   **Frontend:** Next.js (React) for a fast, responsive user interface.
-   **Backend/Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions) for database management, authentication, file storage, and serverless function execution.
-   **AI/ML:** Longcat AI API for advanced natural language processing and sentiment analysis.
-   **External Search:** Serper API for real-time web search capabilities.

## 2. Frontend (Next.js/React)

### 2.1. Component Structure
The application follows a component-based architecture, with reusable UI components (e.g., `ChatInterface`, `VideoChatDialog`, `LibraryCopilot`) organized in `src/components`.

### 2.2. State Management
React's `useState` and `useReducer` hooks are primarily used for local component state. `react-query` (TanStack Query) is utilized for server state management, handling data fetching, caching, and synchronization with Supabase.

### 2.3. Styling
Tailwind CSS is used for utility-first styling, enabling rapid UI development and consistent design. `src/globals.css` contains global styles and custom utility classes.

### 2.4. Routing
Next.js file-system based routing is used for navigation between different pages (e.g., `/`, `/blog/[slug]`, `/multi-comparison/[slug]`).

## 3. Backend (Supabase & Edge Functions)

### 3.1. Database Schema
The PostgreSQL database in Supabase stores:
-   `blog_posts`: Details of individual video analyses.
-   `multi_comparisons`: Details of multi-video comparison analyses.
-   `users`: User authentication information.
-   `profiles`: Additional user profile data.
-   `custom_questions`: User-defined questions for video analysis.
-   `custom_comparative_questions`: User-defined questions for comparative analysis.

### 3.2. Authentication
Supabase Auth handles user registration, login, and session management. Row-Level Security (RLS) is implemented to ensure users can only access their own data.

### 3.3. Edge Functions (Deno)
Supabase Edge Functions are critical for executing server-side logic, especially for AI interactions and external API calls. These functions are written in TypeScript and deployed on Deno.

#### Key Edge Functions:

-   **`youtube-analyzer`**: Orchestrates the process of fetching YouTube video data (title, description, comments, subtitles) and sending it to Longcat AI for analysis. It then stores the results in the `blog_posts` table.
    -   **AI Prompting:** The system prompt is carefully crafted to guide Longcat AI in generating comprehensive sentiment analysis, emotional tones, key themes, and summary insights. It also includes instructions for generating SEO-optimized titles and meta descriptions for blog posts, emphasizing "hooking" and "click-worthy" language within character limits.
-   **`video-comparator`**: Handles the comparison of two YouTube videos, fetching their data, sending it to Longcat AI for comparative analysis, and storing the results in `multi_comparisons`.
    -   **AI Prompting:** Similar to `youtube-analyzer`, but tailored for comparative analysis. The prompt instructs the AI to identify similarities, differences, and unique insights between two videos, and to generate SEO-optimized titles and meta descriptions for comparison blog posts.
-   **`multi-video-comparator`**: Extends `video-comparator` to handle comparisons of more than two videos.
    -   **AI Prompting:** The prompt is designed to guide the AI in synthesizing insights across multiple videos, identifying overarching trends, and generating SEO-optimized titles and meta descriptions for multi-comparison blog posts.
-   **`chat-analyzer`**: Powers the AI chat interface for individual video analyses. It takes user messages, chat history, and the current video analysis context, then queries Longcat AI for a response.
    -   **AI Prompting:** The system prompt emphasizes adaptive response length, conciseness by default, and expansion only when explicitly requested. It integrates the video analysis context, custom Q&A results, and external search results (if DeepSearch is enabled).
-   **`comparison-chat-analyzer`**: Powers the AI chat interface for two-video comparisons.
    -   **AI Prompting:** Similar to `chat-analyzer`, but tailored to the comparison context, including structured comparison data and individual video comments.
-   **`multi-comparison-chat-analyzer`**: Powers the AI chat interface for multi-video comparisons.
    -   **AI Prompting:** Adapts the chat prompt for multi-video context, integrating all relevant comparison data and individual video details.
-   **`library-copilot-analyzer`**: Provides AI assistance for searching and recommending individual video analysis blog posts from the user's library.
    -   **AI Prompting:** The prompt guides the AI to perform semantic search against existing blog post data, list relevant results with Markdown hyperlinks, and suggest new analysis topics. It emphasizes a friendly, conversational tone and adaptive response length.
-   **`comparison-library-copilot-analyzer`**: Provides AI assistance for searching and recommending multi-video comparison blog posts.
    -   **AI Prompting:** Similar to `library-copilot-analyzer`, but focused on multi-comparison data.
-   **`how-it-works-copilot-analyzer`**: The Guide Assistant function, which answers questions based on the product and technical documentation.
    -   **AI Prompting:** The prompt instructs the AI to act as an expert guide, leveraging both product and technical documentation (including code details, loopholes, and blindspots) to provide comprehensive and accurate solutions. It also emphasizes adaptive response length and clear Markdown formatting.
-   **`fetch-external-context`**: A utility function that queries the Serper API to fetch real-time search results, used by other Edge Functions when DeepSearch is enabled.

#### AI Response Length Management:
The `desiredWordCount` parameter has been removed from the chat interface and AI function payloads. AI response length is now adaptively determined by the AI model based on the prompt's instructions, emphasizing conciseness by default and expanding for detail when warranted. The system prompts for all chat-related Edge Functions (`chat-analyzer`, `comparison-chat-analyzer`, `multi-comparison-chat-analyzer`, `library-copilot-analyzer`, `comparison-library-copilot-analyzer`, `how-it-works-copilot-analyzer`) have been updated to guide the AI in generating appropriate, adaptive response lengths.

## 4. AI Integration (Longcat AI)

SentiVibe integrates with Longcat AI for all its natural language processing needs. API keys are managed securely as environment variables, with a fallback mechanism for multiple keys to handle rate limits.

## 5. Development & Deployment

-   **Local Development:** `npm run dev` for frontend, Supabase CLI for local database and Edge Function development.
-   **Deployment:** Next.js frontend is deployed to Vercel. Supabase handles database and Edge Function deployments.
-   **Version Control:** Git and GitHub are used for source code management.

## 6. Error Handling & Logging

Comprehensive error handling is implemented across the frontend and backend. Edge Functions include `try-catch` blocks and `console.error` for logging issues to Supabase logs. Frontend errors are displayed to the user via `Alert` components.

## 7. Security Considerations

-   **Authentication:** Supabase Auth with secure token management.
-   **Authorization:** Row-Level Security (RLS) on Supabase tables.
-   **API Key Management:** API keys are stored as environment variables and accessed securely within Edge Functions.
-   **CORS:** Edge Functions implement CORS headers to allow requests from the frontend.