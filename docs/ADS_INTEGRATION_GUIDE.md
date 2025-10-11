# SentiVibe Ads Integration Guide

This document provides a step-by-step guide for integrating actual advertisement code into the SentiVibe application, replacing the placeholder `AdBanner` components.

## 1. Prerequisites

Before you begin, ensure you have:
*   An active advertising account (e.g., Google AdSense, Media.net, Ezoic).
*   Your website (`SentiVibe`) approved by the advertising provider.
*   Access to your advertising provider's dashboard to generate ad code.

## 2. Understanding Ad Placement Strategy

SentiVibe's monetization roadmap (Checkpoint 3.1) outlines the following ad display rules:
*   **Guest (Unauthenticated):** Ads displayed prominently (top + inline).
*   **Free Member (Signed Up):** Ads displayed moderately (top + inline).
*   **Pro Subscriber (Paid):** Ads removed or minimal sponsor footer.

The `AdBanner` component already handles this conditional rendering based on the user's `subscriptionTier`. You only need to replace the placeholder content within the `AdBanner` component with your actual ad code.

## 3. Generating Ad Code from Your Provider (Example: Google AdSense)

The exact steps will vary by provider, but generally involve:

1.  **Log in** to your advertising provider's dashboard (e.g., Google AdSense).
2.  Navigate to the **"Ads"** or **"Ad units"** section.
3.  **Create a new ad unit**. You'll typically choose an ad type (e.g., Display ads, In-feed ads, In-article ads).
4.  **Configure the ad unit**:
    *   Give it a descriptive name (e.g., "SentiVibe_Homepage_Top").
    *   Choose the ad size (e.g., Responsive, or a fixed size like 728x90 for a leaderboard, 300x250 for a medium rectangle). Responsive is often recommended for modern web design.
5.  **Save** the ad unit.
6.  **Copy the generated ad code snippet**. This code will typically look like a `<script>` tag followed by a `<ins>` tag (for AdSense).

**Example AdSense Code Snippet:**
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
     crossorigin="anonymous"></script>
<!-- SentiVibe_Homepage_Top -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
     data-ad-slot="YOUR_AD_SLOT_ID"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

## 4. Integrating Ad Code into SentiVibe

You will replace the placeholder content within the `AdBanner.tsx` component with your actual ad code.

### Step-by-Step Integration:

1.  **Open `src/components/AdBanner.tsx`**:
    This is the component I just created.

2.  **Locate the placeholder section**:
    Inside the `AdBanner` component, you'll find a `div` with the comment `<!-- Placeholder for actual ad code -->` and some gray box content.

    ```tsx
    <div className="mt-2 w-full h-24 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm rounded-sm">
      [Your Ad Code Here]
    </div>
    ```

3.  **Replace the placeholder with your ad code**:
    Carefully paste the ad code snippet you obtained from your advertising provider directly into this `div`.

    **Example (for Google AdSense):**
    ```tsx
    <div className="mt-2 w-full h-24 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm rounded-sm">
      {/* Your actual Google AdSense code goes here */}
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
           crossorigin="anonymous"></script>
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
           data-ad-slot="YOUR_AD_SLOT_ID"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>
           (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    </div>
    ```
    **Important Considerations:**
    *   **Script Tags:** Some ad networks provide `<script>` tags that need to be placed in the `<head>` of your `index.html` file for global loading. If your ad code includes such a script, place it in `index.html` (e.g., just before the closing `</head>` tag). The `AdBanner` component is primarily for the `ins` or `div` elements that define the ad slot itself.
    *   **React and External Scripts:** Directly embedding `<script>` tags within React components can sometimes lead to issues if not handled carefully. For simple ad units, it often works. For more complex scenarios or if you encounter problems, you might need to use a library like `react-helmet` (for managing `<head>` content) or dynamically inject scripts. However, for standard AdSense, direct placement usually suffices.
    *   **Multiple Ad Units:** If you want different ad units for different `location` props (e.g., a different size/type for 'top' vs. 'inline'), you can modify `AdBanner.tsx` to conditionally render different ad codes based on the `location` prop.

        ```tsx
        // Inside AdBanner.tsx
        {shouldShowAd && (
          <div className="my-4 ...">
            {location === 'top' && (
              // Ad code for top banner
              <div className="w-full h-24 bg-blue-100">Top Ad</div>
            )}
            {location === 'inline' && (
              // Ad code for inline banner
              <div className="w-full h-32 bg-green-100">Inline Ad</div>
            )}
            {/* ... other locations */}
          </div>
        )}
        ```
        Then, replace the `div`s with your actual ad code for each location.

4.  **Save the file.**

5.  **Refresh your application preview.**
    You should now see your actual ads (or a blank space if the ad network hasn't filled it yet) in the designated spots when logged in as a 'guest' or 'free' user. Pro users will not see these `AdBanner` components.

## 5. Testing and Monitoring

*   **Test across tiers:** Log in as a guest, free user, and pro user to ensure ads appear/disappear as expected.
*   **Check responsiveness:** Verify that ads display correctly on different screen sizes.
*   **Monitor performance:** Use your ad provider's dashboard to track ad impressions, clicks, and earnings.

By following these steps, you can effectively integrate advertisements into your SentiVibe application according to your monetization strategy.