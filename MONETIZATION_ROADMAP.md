# SentiVibe Monetization Roadmap

## 1. Introduction
This document outlines the phased approach for implementing SentiVibe's tiered monetization strategy. The goal is to segregate features and usage limits across different user tiers: Guest (unauthenticated), Free Member (signed up), and Pro Subscriber (paid). This roadmap will serve as a living document, updated as checkpoints are completed.

## 2. Overall Goal
To successfully integrate a tiered access and usage model into SentiVibe, allowing for monetization through Google Ads for non-paying users and subscription fees for Pro Subscribers, while maintaining a smooth and high-quality user experience.

## 3. Key Principles
*   **No Compromise:** Ensure existing functionality remains robust and undamaged.
*   **Smooth Experience:** Prioritize performance, clear user feedback, and intuitive UI/UX.
*   **Server-Side Enforcement:** All access controls and usage limits must be enforced on the backend (Supabase Edge Functions) to prevent bypass.
*   **Clear Communication:** The UI will clearly inform users about their tier, limits, and upgrade options.
*   **Iterative Development:** Implement changes in manageable phases, testing thoroughly at each step.

## 4. Tier Definitions (Summary)
*   **Guest (Unauthenticated):** Basic access to public content, heavily ad-supported, very limited feature usage.
*   **Free Member (Signed Up):** Enhanced access compared to Guest, personal dashboard, moderate ad presence, daily usage limits on key features.
*   **Pro Subscriber (Paid):** Full, unlimited, and ad-free access to all features, priority processing, advanced capabilities.

## 5. Roadmap Phases & Checkpoints

---

### Phase 0: Foundation & Infrastructure (Prerequisites)

**Objective:** Establish the core mechanisms for identifying user tiers and basic feature flagging.

*   **Checkpoint 0.1: Database Schema Update for User Tier**
    *   **Description:** Add a `subscription_tier` column (e.g., `TEXT` or `ENUM`) to the `public.profiles` table to store the user's current tier (`guest`, `free`, `pro`). Default to `free` for new signed-up users.
    *   **Affected Areas:** Database (`public.profiles`), Supabase Migrations.
    *   **Status:** Completed
    *   **Notes:** `guest` status is implicit for unauthenticated users; `free` and `pro` will be explicit.

*   **Checkpoint 0.2: AuthProvider to Expose User Tier**
    *   **Description:** Modify `src/integrations/supabase/auth.tsx` to fetch and expose the `subscription_tier` from the `public.profiles` table as part of the `useAuth` hook. This will make the tier available globally in the frontend.
    *   **Affected Areas:** Frontend (`src/integrations/supabase/auth.tsx`).
    *   **Status:** Pending

*   **Checkpoint 0.3: Edge Function User Tier Retrieval**
    *   **Description:** Update all relevant Supabase Edge Functions (`youtube-analyzer`, `chat-analyzer`, `library-copilot-analyzer`, `fetch-external-context`) to retrieve the calling user's `subscription_tier` from the database or JWT claims.
    *   **Affected Areas:** Backend (All Edge Functions).
    *   **Status:** Pending

---

### Phase 1: Core Feature Tiering & Access Control

**Objective:** Implement fundamental access restrictions and usage limits for key features.

*   **Checkpoint 1.1: Public Library Access**
    *   **Guest:** Full read access (ad-supported).
    *   **Free Member:** Full access (ad-supported).
    *   **Pro Subscriber:** Full access (ad-free or minimal ads).
    *   **Affected Areas:** Frontend (`VideoAnalysisLibrary.tsx`, `BlogPostDetail.tsx`), Ad integration (future).
    *   **Status:** Pending
    *   **Notes:** Initial implementation will focus on access; ad integration is a separate task.

*   **Checkpoint 1.2: My Analyses Dashboard Access**
    *   **Guest:** No access (redirect to login/signup).
    *   **Free Member:** Save & revisit past analyses.
    *   **Pro Subscriber:** Full history + download bundle (future).
    *   **Affected Areas:** Frontend (`MyAnalyses.tsx`, `ProtectedRoute.tsx`), Backend (RLS for `blog_posts` already handles user-specific access).
    *   **Status:** Pending

*   **Checkpoint 1.3: Analyze YouTube Video - Basic Limits**
    *   **Guest:** 1 analysis / day (≈ 30 comments sample).
    *   **Free Member:** 3 analyses / day (≈ 100 comments full set).
    *   **Pro Subscriber:** Unlimited analyses (no caps).
    *   **Affected Areas:** Frontend (`AnalyzeVideo.tsx`), Backend (`youtube-analyzer` Edge Function), Database (new table for daily usage tracking).
    *   **Status:** Pending
    *   **Notes:** This requires a new database table for `user_daily_usage` to track analysis counts.

*   **Checkpoint 1.4: Weighted Sentiment Analysis - Tiered Depth**
    *   **Guest:** Basic scoring (e.g., only overall sentiment, simplified summary).
    *   **Free Member:** Full sentiment + emotional tones + key themes.
    *   **Pro Subscriber:** Full analysis + advanced context fusion (future AI prompt enhancements).
    *   **Affected Areas:** Backend (`youtube-analyzer` Edge Function - AI prompt construction), Frontend (`AnalyzeVideo.tsx`, `BlogPostDetail.tsx` - conditional display of details).
    *   **Status:** Pending

---

### Phase 2: Advanced Feature Tiering & Enhancements

**Objective:** Implement more granular controls and advanced features based on subscription tiers.

*   **Checkpoint 2.1: Community Q&A View & Submission**
    *   **Guest:** View existing AI answers.
    *   **Free Member:** View + submit up to 3 custom questions per video / day (with word count limits).
    *   **Pro Subscriber:** Unlimited custom questions & word-count control.
    *   **Affected Areas:** Frontend (`AnalyzeVideo.tsx`, `BlogPostDetail.tsx`), Backend (`youtube-analyzer` Edge Function - custom question processing and limits), Database (`user_daily_usage`).
    *   **Status:** Pending

*   **Checkpoint 2.2: Analysis Caching & Staleness Logic**
    *   **Guest:** Passive (use cached data, no refresh option).
    *   **Free Member:** Auto-refresh after 30 days (no manual "Refresh Now").
    *   **Pro Subscriber:** Manual "Refresh Now" anytime.
    *   **Affected Areas:** Frontend (`AnalyzeVideo.tsx`, `BlogPostDetail.tsx` - "Refresh Analysis" button visibility/behavior), Backend (`youtube-analyzer` Edge Function - staleness check logic).
    *   **Status:** Pending

*   **Checkpoint 2.3: Chat with AI (Insight Dialog)**
    *   **Guest:** No access.
    *   **Free Member:** 5 messages per session (limited personas).
    *   **Pro Subscriber:** Unlimited messages, all personas, priority tokens (future).
    *   **Affected Areas:** Frontend (`VideoChatDialog.tsx`, `ChatInterface.tsx` - message count, persona selection), Backend (`chat-analyzer` Edge Function - message limits, persona access).
    *   **Status:** Pending

*   **Checkpoint 2.4: Library Copilot (AI Search)**
    *   **Guest:** No access.
    *   **Free Member:** Search personal library only.
    *   **Pro Subscriber:** Full semantic search + cross-user recommendations + new-video suggestions (future AI prompt enhancements).
    *   **Affected Areas:** Frontend (`LibraryCopilot.tsx`), Backend (`library-copilot-analyzer` Edge Function - search scope).
    *   **Status:** Pending

*   **Checkpoint 2.5: External Context Search**
    *   **Guest:** No access.
    *   **Free Member:** Included (1 context fetch per analysis).
    *   **Pro Subscriber:** Enhanced context fetch + depth modes (future AI prompt enhancements).
    *   **Affected Areas:** Backend (`fetch-external-context` Edge Function - access control, potential for advanced modes).
    *   **Status:** Pending

*   **Checkpoint 2.6: PDF Export**
    *   **Guest:** No access.
    *   **Free Member:** 1 PDF / day (branded header).
    *   **Pro Subscriber:** Unlimited PDFs (unbranded / customizable - future).
    *   **Affected Areas:** Frontend (`AnalyzeVideo.tsx` - PDF button visibility/limits), Database (`user_daily_usage`).
    *   **Status:** Pending

---

### Phase 3: Monetization & Optimization

**Objective:** Integrate payment systems, advertising, and performance optimizations.

*   **Checkpoint 3.1: Ads Integration**
    *   **Guest:** Displayed (top + inline).
    *   **Free Member:** Displayed (moderate placement).
    *   **Pro Subscriber:** Removed or minimal sponsor footer.
    *   **Affected Areas:** Frontend (various pages), External (Google AdSense or similar integration).
    *   **Status:** Pending
    *   **Notes:** This is a significant external integration and requires careful placement to avoid disrupting UX.

*   **Checkpoint 3.2: Priority Queue & Speed**
    *   **Guest:** Standard (public threads shared).
    *   **Free Member:** Faster requests.
    *   **Pro Subscriber:** Immediate execution (high priority token).
    *   **Affected Areas:** Backend (Edge Functions - potential for queuing logic or different API key usage based on tier).
    *   **Status:** Pending
    *   **Notes:** This is an advanced optimization that might involve multiple sets of API keys or a custom queuing system.

*   **Checkpoint 3.3: Payment Gateway Integration**
    *   **Description:** Integrate a payment gateway (e.g., Stripe) for handling Pro Subscriber payments and managing subscriptions.
    *   **Affected Areas:** New backend services, Frontend (subscription management UI).
    *   **Status:** Pending
    *   **Notes:** This is a major external integration and is outside the scope of direct AI assistance for code generation.

---

### Phase 4: Polish & Support

**Objective:** Refine the user experience and establish support channels.

*   **Checkpoint 4.1: Theme Toggle / Customization**
    *   **Guest:** ✅
    *   **Free Member:** ✅
    *   **Pro Subscriber:** ✅ + saved preference (future).
    *   **Affected Areas:** Frontend (`ModeToggle.tsx`, `ThemeProvider.tsx`).
    *   **Status:** Pending
    *   **Notes:** Saved preference for Pro users would require storing theme choice in `public.profiles`.

*   **Checkpoint 4.2: Support Level**
    *   **Guest:** Self-help FAQ.
    *   **Free Member:** Email support / community.
    *   **Pro Subscriber:** Priority support via chat.
    *   **Affected Areas:** External (support system integration), Frontend (support links).
    *   **Status:** Pending

*   **Checkpoint 4.3: API Key Integration (Future)**
    *   **Guest:** ❌
    *   **Free Member:** ❌
    *   **Pro Subscriber:** ✅ Access endpoint for batch analysis.
    *   **Affected Areas:** New backend services, Frontend (API key management UI).
    *   **Status:** Pending
    *   **Notes:** This is a future expansion for advanced users.

---

This roadmap provides a clear path forward. We can now use this document to guide our implementation, updating the status of each checkpoint as we complete them.