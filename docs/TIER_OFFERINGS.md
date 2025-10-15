# SentiVibe Tier Offerings & Monetization Strategy

This document outlines the simplified monetization strategy for SentiVibe, distinguishing between a Free Tier and a Paid Tier. The goal is to provide significant value upfront to attract users and monetize through advertising for the free tier, while offering an enhanced, unrestricted experience for paid subscribers.

## 1. Tier Definitions

### 1.1. Free Tier (Authenticated or Unauthenticated)
*   **User Types:** Visitors who have not signed up, and users who have signed up but do not have an active paid subscription.
*   **Primary Goal:** User acquisition, product demonstration, and ad-based monetization.

### 1.2. Paid Tier
*   **User Types:** Authenticated and Paid Users (users who have signed up and have an active paid subscription).
*   **Primary Goal:** Direct subscription revenue, providing full access and an enhanced user experience.

---

## 2. Tier Offerings & Limitations

### 2.1. Free Tier Offerings

This tier provides access to core SentiVibe functionalities with specific daily usage limitations for analyses and comparisons, designed to manage API costs and encourage upgrading. All other features are unlimited.

*   **Core Feature Access:**
    *   **Analyze a Single Video:** Yes
    *   **Create Multi-Video Comparison:** Yes
    *   **Explore Analysis Library:** Yes (view all publicly available single video analyses)
    *   **Explore Comparison Library:** Yes (view all publicly available multi-video comparisons)
    *   **View Blog Post Detail (Single Video):** Yes
    *   **View Multi-Comparison Detail:** Yes
    *   **Chat with AI (Single Video Analysis):** Yes (**Unlimited** messages per session)
    *   **Chat with AI (Comparison Analysis):** Yes (**Unlimited** messages per session)
    *   **Library Copilot:** Yes (**Unlimited** queries per day)
    *   **Comparison Library Copilot:** Yes (**Unlimited** queries per day)
    *   **Custom Questions (per analysis/comparison):** **Unlimited** questions, **unlimited** AI-generated answer length.
    *   **"My Analyses" Page:** Yes (Access to personal analysis history is now available for **all authenticated users**.)

*   **Usage Limits (per 24-hour rolling period):**
    *   **Single Video Analyses:** Limited to **5 analyses** per day (IP-based for unauthenticated, User-ID based for authenticated).
    *   **Multi-Video Comparisons:** Limited to **3 comparisons** per day (IP-based for unauthenticated, User-ID based for authenticated).
    *   **DeepThink Mode:** **Not available** for Free Tier users.
    *   **DeepSearch Mode:** **Not available** for Free Tier users.

*   **Monetization:**
    *   **Google Ads:** Google Ads will be displayed prominently on all pages accessible to Free Tier users to generate advertising revenue.

*   **Data Persistence & Reporting:**
    *   **"My Analyses" History:** Analyses performed by Free Tier users are **now saved** to a personal, persistent history, accessible via the "My Analyses" page.
    *   **PDF Export:** Available, but all PDF reports will be **watermarked** with "Free Tier - SentiVibe" or similar branding.

### 2.2. Paid Tier Offerings

This tier provides an unrestricted, personalized, and ad-free experience, unlocking the full capabilities of SentiVibe.

*   **Core Feature Access:**
    *   **All features available in the Free Tier.**
    *   **"My Analyses" Page:** Yes (Access to a personal, persistent history of all their analyses and comparisons).

*   **Usage Limits (per 24-hour rolling period, User-ID based):**
    *   **Single Video Analyses:** **50 analyses** per day (designed to be effectively unlimited for typical usage).
    *   **Multi-Video Comparisons:** **20 comparisons** per day (designed to be effectively unlimited for typical usage).
    *   **DeepThink Mode:** **Available** for Paid Tier users.
    *   **DeepSearch Mode:** **Available** for Paid Tier users.
    *   **All other features are UNLIMITED:** Custom questions (count and word count), AI chat messages (per session), Daily Copilot Queries.

*   **Monetization:**
    *   **Subscription Revenue:** Direct revenue from monthly or annual subscriptions.
    *   **Ad-Free Experience:** No Google Ads will be displayed on any pages for Paid Tier users.

*   **Data Persistence & Reporting:**
    *   **"My Analyses" History:** All analyses and comparisons performed by Paid Tier users are saved to their personal history, accessible anytime.
    *   **PDF Export:** Unwatermarked, professional PDF reports.

---

## 3. Conceptual Implementation Notes

*   **Subscription Management:** The `public.subscriptions` table tracks user payment status.
*   **Backend Enforcement:** Daily analysis and comparison limits are enforced within Supabase Edge Functions. Each relevant Edge Function will:
    1.  Check `auth.uid()` to determine if the user is authenticated.
    2.  If authenticated, query the `public.subscriptions` table to verify an active paid subscription.
    3.  Apply the appropriate Free or Paid Tier daily limits based on the user's status.
    4.  Return an error response if a limit is exceeded, prompting the user to upgrade.
*   **Frontend UI:** The user interface will dynamically adapt based on the user's tier. This includes displaying upgrade prompts, usage counters for daily analyses/comparisons, and hiding/showing premium features like "My Analyses."
*   **Payment Gateway:** Integration with a payment gateway (e.g., Stripe) will be required to handle subscriptions. Webhooks from the payment gateway will update the `public.subscriptions` table.
*   **Pricing Page:** A dedicated `/pricing` page has been created to clearly list all tier offerings and their respective features.