# SentiVibe Tier Offerings & Monetization Strategy

This document outlines the monetization strategy for SentiVibe, distinguishing between a Free Tier and a Paid Tier. The goal is to provide significant value upfront to attract users and monetize through advertising for the free tier, while offering an enhanced, unrestricted experience for paid subscribers.

## 1. Tier Definitions

### 1.1. Free Tier
*   **User Types:**
    *   Unauthenticated Users (visitors who have not signed up).
    *   Authenticated but Unpaid Users (users who have signed up but do not have an active paid subscription).
*   **Primary Goal:** User acquisition, product demonstration, and ad-based monetization.

### 1.2. Paid Tier
*   **User Types:**
    *   Authenticated and Paid Users (users who have signed up and have an active paid subscription).
*   **Primary Goal:** Direct subscription revenue, providing full access and an enhanced user experience.

---

## 2. Tier Offerings & Limitations

### 2.1. Free Tier Offerings

This tier provides access to core SentiVibe functionalities with specific usage limitations designed to manage API costs and encourage conversion to a paid plan.

*   **Core Feature Access:**
    *   **Analyze a Single Video:** Yes
    *   **Create Multi-Video Comparison:** Yes
    *   **Explore Analysis Library:** Yes (view all publicly available single video analyses)
    *   **Explore Comparison Library:** Yes (view all publicly available multi-video comparisons)
    *   **View Blog Post Detail (Single Video):** Yes
    *   **View Multi-Comparison Detail:** Yes
    *   **Chat with AI (Single Video Analysis):** Yes
    *   **Chat with AI (Comparison Analysis):** Yes
    *   **Library Copilot:** Yes (for searching public libraries and getting new topic recommendations)
    *   **Comparison Library Copilot:** Yes (for searching public libraries and getting new comparative topic recommendations)
    *   **"My Analyses" Page:** No (Access to personal analysis history is a paid feature. If an authenticated but unpaid user attempts to access, they will be prompted to upgrade.)

*   **Usage Limits (per 24-hour rolling period, reset daily):**
    *   **Single Video Analyses:** Limited to **2 analyses** per day.
    *   **Multi-Video Comparisons:** Limited to **1 comparison** per day.
    *   **AI Chat Messages (per analysis/comparison session):** Limited to **5 messages** per individual chat session.
    *   **Library Copilot Queries:** Limited to **5 queries** per day.
    *   **Comparison Library Copilot Queries:** Limited to **5 queries** per day.
    *   **Custom Questions (per analysis/comparison):** Max **1 custom question** per analysis or comparison, with a maximum AI-generated answer length of **100 words**.

*   **Monetization:**
    *   **Google Ads:** Google Ads will be displayed prominently on all pages accessible to Free Tier users to generate advertising revenue.

*   **Data Persistence & Reporting:**
    *   **"My Analyses" History:** Analyses performed by Free Tier users are **not saved** to a personal, persistent history.
    *   **PDF Export:** Available, but all PDF reports will be **watermarked** with "Free Tier - SentiVibe" or similar branding.

### 2.2. Paid Tier Offerings

This tier provides an unrestricted, personalized, and ad-free experience, unlocking the full capabilities of SentiVibe.

*   **Core Feature Access:**
    *   **All features available in the Free Tier.**
    *   **"My Analyses" Page:** Yes (Full access to a personal, persistent history of all their analyses and comparisons).

*   **Usage Limits:**
    *   **Single Video Analyses:** **50 analyses** per day (designed to be effectively unlimited for typical usage).
    *   **Multi-Video Comparisons:** **20 comparisons** per day (designed to be effectively unlimited for typical usage).
    *   **AI Chat Messages (per analysis/comparison session):** **100 messages** per individual chat session (designed to be effectively unlimited).
    *   **Library Copilot Queries:** **100 queries** per day (designed to be effectively unlimited).
    *   **Comparison Library Copilot Queries:** **100 queries** per day (designed to be effectively unlimited).
    *   **Custom Questions (per analysis/comparison):** Max **5 custom questions** per analysis or comparison, with a maximum AI-generated answer length of **500 words** per answer.

*   **Monetization:**
    *   **Subscription Revenue:** Direct revenue from monthly or annual subscriptions.

*   **Ad-Free Experience:**
    *   **No Google Ads** will be displayed on any pages for Paid Tier users.

*   **Data Persistence & Reporting:**
    *   **"My Analyses" History:** All analyses and comparisons performed by Paid Tier users are saved to their personal history, accessible anytime.
    *   **PDF Export:** Unwatermarked, professional PDF reports.

---

## 3. Conceptual Implementation Notes

*   **Subscription Management:** A new `public.subscriptions` table will be created in Supabase to track user payment status (e.g., `status: 'active'`, `plan_id`, `current_period_end`). This table will be linked to `auth.users.id`.
*   **Backend Enforcement:** All usage limits and feature access differentiations will be enforced within Supabase Edge Functions. Each relevant Edge Function will:
    1.  Check `auth.uid()` to determine if the user is authenticated.
    2.  If authenticated, query the `public.subscriptions` table to verify an active paid subscription.
    3.  Apply the appropriate Free Tier or Paid Tier limits based on the user's status.
    4.  Return an error response if a limit is exceeded, prompting the user to upgrade.
*   **Frontend UI:** The user interface will dynamically adapt based on the user's tier. This includes displaying upgrade prompts, usage counters, and hiding/showing premium features like "My Analyses."
*   **Payment Gateway:** Integration with a payment gateway (e.g., Stripe) will be required to handle subscriptions. Webhooks from the payment gateway will update the `public.subscriptions` table.