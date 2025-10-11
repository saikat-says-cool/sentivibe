# SentiVibe Product Documentation

## 1. Product Overview
**SentiVibe** is an innovative web application designed to empower users with deep insights into public sentiment surrounding YouTube videos. By leveraging advanced AI, SentiVibe analyzes video comments to extract overall sentiment, emotional tones, key themes, and actionable summary insights. Beyond static reports, it now offers a **context-aware conversational AI** that can answer follow-up questions, drawing from the video analysis, top comments, external up-to-date information, and its own general knowledge. It also features **programmatic SEO**, automatically generating and publishing SEO-optimized blog posts for each video analysis, and organizing them in a searchable **Video Analysis Library**. The application now supports **multi-video comparisons**, allowing users to analyze and compare audience sentiment across several videos, complete with dedicated comparative insights and blog posts. It's an essential tool for content creators, marketers, researchers, and anyone interested in understanding audience reactions to online video content. The application now operates with a **public-first approach**, allowing unauthenticated users to access core analysis and library features, with enhanced theming options and a **tiered offering system** to manage access and features.

**Mission:** To decode the voice of the crowd—transforming unstructured online reactions into clear, actionable insight.
**Tagline:** “See what the crowd really feels.”
**Extended Descriptor:** AI‑powered YouTube Comment Insights & Sentiment Analysis
**Tone:** Professional clarity + warm confidence + data‑science credibility.
**Voice keywords:** Insightful, factual, transparent, modern, minimal.

## 2. Key Features

### 2.1. Secure User Authentication & Tiered Offerings
*   **Public Access:** Core features like video analysis and the analysis library are now accessible to **all users, even without logging in, under a Free Tier with specific limits.**
*   **Personalized Experience:** Users can securely sign up and log in to access personalized features like "My Analyses" history (available in Paid Tier).
*   **Protected Content:** User-specific analysis history is protected, ensuring only authenticated users can access their own saved reports (Paid Tier feature).
*   **Tiered System:** SentiVibe now operates with a tiered offering system:
    *   **Unauthenticated User Tier:** Limited access to core features, IP-based usage limits, watermarked PDF reports, and ad-supported.
    *   **Authenticated Free Tier:** Enhanced limits compared to unauthenticated users, access to "My Analyses" history, user-ID based usage limits, watermarked PDF reports, and ad-supported.
    *   **Paid Tier:** Significantly higher usage limits, unwatermarked PDF reports, ad-free experience, and full access to all features.
*   **Profile Management (Future-ready):** A user profile system is in place, ready for future enhancements like personalized dashboards.

### 2.2. AI-Powered YouTube Video Analysis
*   **Effortless Input:** Simply paste any public YouTube video link into the application.
*   **Minimum Comment Requirement:** A clear disclaimer states: "**Important: The video must have at least 50 comments for a proper sentiment analysis.**" This ensures robust and meaningful AI analysis.
*   **Dynamic Custom AI Questions:** Users can now add multiple custom questions with desired word count limits to be answered by the AI as part of the initial analysis report. The number of questions and max word count are **tier-dependent**.
*   **Intelligent Analysis Caching with Dynamic Q&A and Staleness Logic:** To optimize resource usage and prevent duplicate content, SentiVibe automatically saves each video analysis. If a video has been analyzed before, the system will instantly retrieve and display the existing report and blog post.
    *   **Staleness Check:** Analyses are considered "stale" after a predefined period (e.g., 30 days). If an analysis is stale, or if a user explicitly requests it, a **full re-analysis** will be performed, fetching the latest comments and re-running the AI sentiment analysis to ensure freshness.
    *   **Crucially, if a user submits new custom questions for an already analyzed video, these new questions will be processed by the AI, answered, and then merged with any existing custom Q&A results for that video. The combined "community questions" and their answers will be stored and displayed in the report and blog post, ensuring all user-submitted questions are addressed and become part of the collective insight.** The cached analysis includes the top 10 raw comments for future AI chat context.
*   **Comprehensive Data Extraction:** SentiVibe automatically retrieves:
    *   **Video Title & Description:** For context.
    *   **Video Thumbnail:** Visual identification of the video.
    *   **Video Tags:** To understand the video's categorization and keywords.
    *   **Comments:** Fetches up to 100 comments for analysis.
    *   **Creator Name:** Identifies the YouTube channel/creator.
*   **Weighted Sentiment Analysis:** The AI model is specifically instructed to give **significantly more weight to comments with higher "Likes" counts**. This ensures that the analysis reflects the sentiment of the most popular and influential opinions within the comment section.
*   **Detailed AI Insights:** The analysis provides:
    *   **Overall Sentiment:** A general classification (e.g., positive, negative, neutral).
    *   **Emotional Tones:** Identifies prevalent emotions (e.g., joy, anger, surprise, sadness).
    *   **Key Themes:** Highlights the main topics and recurring subjects discussed in the comments.
    *   **Summary Insights:** A concise, human-readable summary of the AI's findings, explaining the overall sentiment and key takeaways, with an emphasis on how popular comments influenced the assessment.
    *   **Community Q&A Section:** Displays all AI-generated answers to custom questions asked by any user about this video, respecting the specified word limits.
    *   **Top 10 Comments:** The raw text of the 10 most popular comments is explicitly listed in the analysis report for direct user review.

### 2.3. Multi-Video Comparison Analysis
*   **Compare Multiple Videos:** Users can input two or more YouTube video links to perform a comparative sentiment analysis.
*   **Custom Comparative Questions:** Similar to single video analysis, users can add custom questions specifically tailored for comparative insights, with desired word count limits. The number of questions and max word count are **tier-dependent**.
*   **Intelligent Comparison Caching with Staleness Logic:** Multi-comparisons are also cached. If a comparison of the exact same set of videos exists, it will be retrieved.
    *   **Staleness Check:** A multi-comparison is considered "stale" after a predefined period (e.g., 30 days) or if any of its individual constituent video analyses are stale. If stale, or if a user explicitly requests it, a **full re-comparison** will be performed, ensuring all underlying video data is fresh and then re-generating the comparative insights and blog post.
    *   **Dynamic Custom Q&A:** New custom comparative questions are always processed, answered, and merged with existing ones, then updated in the database.
*   **Comprehensive Comparative Insights:** The AI generates structured data comparing:
    *   **Overall Sentiment Trend:** General shifts in sentiment across the videos.
    *   **Common & Divergent Emotional Tones:** Emotions shared or unique to specific videos.
    *   **Common & Unique Themes:** Topics discussed across all videos or specific to one.
    *   **Summary Insights:** A high-level overview of the key comparative findings.
    *   **Individual Video Summaries:** Brief sentiment and theme summaries for each video in the comparison.
    *   **Comparative Q&A Section:** Displays all AI-generated answers to custom comparative questions.
    *   **Top 10 Comments for Each Video:** The raw text of the 10 most popular comments for *each* video in the comparison is explicitly listed for detailed review.

### 2.4. Programmatic SEO & Video Analysis Library
*   **Automated Blog Post Generation:** Immediately after a *new* video analysis or multi-video comparison is complete, the AI automatically generates a comprehensive, SEO-optimized blog post. For content previously analyzed, the existing blog post is retrieved and linked, ensuring **only one unique blog post exists per video or comparison**. During a full re-analysis/re-comparison, the blog post content is also regenerated to reflect updated sentiment/insights.
*   **SEO Optimization:** Each generated blog post includes:
    *   A compelling, SEO-optimized title (e.g., `{{VideoTitle}} YouTube Comment Sentiment Analysis ({{Year}}) | SentiVibe`).
    *   A URL-friendly slug (e.g., `/blog/{{slugified-video-title}}`).
    *   A concise meta description (e.g., `Discover how audiences responded to {{VideoTitle}} with SentiVibe's AI comment analysis: sentiment, emotions, key themes.`).
    *   A list of relevant keywords.
    *   Structured content with appropriate headings (H1, H2, H3) in Markdown format, following a logical content block layout (Intro, Sentiment Summary, Top Keywords, Viewer Insights, Conclusion/CTA).
    *   **Dynamic Meta Tags:** Blog post detail pages dynamically update the browser title and meta description for optimal search engine indexing.
    *   **Open Graph (OG) Tags:** Blog post detail pages include dynamic Open Graph meta tags for rich social media sharing previews.
    *   **Structured Data (JSON-LD):** Blog post detail pages incorporate `BlogPosting` and `SoftwareApplication` schema markup to provide structured information to search engines.
    *   **Image Alt Text:** All video thumbnail images include descriptive `alt` attributes for accessibility and SEO.
    *   **Content Freshness:** Blog post detail pages display publication and last updated dates, including the `Last Full Analysis` or `Last Full Comparison` timestamp.
*   **Instant Publishing:** Blog posts are automatically published to the SentiVibe platform and become accessible via unique, SEO-friendly URLs.
*   **Video Analysis Library:** All generated single video analysis blog posts are organized into a dedicated "Analysis Library."
    *   **Browse & Discover:** Users can easily browse through past video analyses.
    *   **Search & Filter:** The library provides robust search functionality, allowing users to find specific analyses by video title, creator name, or keywords.
    *   **Visual Context:** Each entry in the library displays the YouTube video's thumbnail, title, and creator name for quick identification.
    *   **Direct Chat Initiation:** From any blog post detail page, users can directly initiate a conversation with the AI, pre-loading the chat with the context of that specific video analysis.
    *   **Library Copilot:** An AI assistant is available in both the main "Analysis Library" and "My Analyses" pages to help users find specific video analyses based on their queries, providing clickable Markdown links to relevant blog posts. **It also proactively suggests new, related analysis topics or video ideas based on the user's query and the existing library content.**
*   **Multi-Comparison Library:** All generated multi-video comparison blog posts are organized into a dedicated "Comparison Library."
    *   **Browse & Discover:** Users can easily browse through past multi-comparisons.
    *   **Search & Filter:** Provides robust search functionality by comparison title, video titles, or keywords.
    *   **Visual Context:** Each entry displays the first video's thumbnail with a "+X more" badge if multiple videos are included, along with the comparison title.
    *   **Comparison Library Copilot:** An AI assistant helps users find specific comparisons or suggest new comparative analysis topics.

### 2.5. Context-Aware Conversational AI
*   **Interactive Q&A (Dialog-based):** After any video analysis or comparison, or when loading a saved analysis/comparison from the library, users can engage in a chat with SentiVibe AI to ask follow-up questions. This chat now occurs within a **pop-up dialog interface**, providing a consistent experience across the application.
*   **Customizable AI Persona:** Users can select from various AI personas (e.g., Friendly Assistant, Therapist, Storyteller, Motivational Coach, Argumentative) to tailor the AI's tone and conversational style to their preference.
*   **Precise Response Length Control:** Users have explicit control over the AI's response length by specifying a **desired word count** for each answer, ensuring the AI provides information at the exact level of detail required. The maximum word count is **tier-dependent**.
*   **Multi-Source Intelligence:** The AI intelligently synthesizes information from:
    *   **Video Analysis Report / Comparison Report:** All details from the initial analysis or comparison (sentiment, themes, summary, structured comparison data).
    *   **Exact Top Comments:** The raw text of the top 10 most popular comments for the single video, or for *each* video in a multi-comparison, allowing for deep dives into audience feedback.
    *   **Community Q&A:** The AI has access to all pre-generated answers for custom questions (single video or comparative), allowing it to reference or elaborate on them during the chat.
    *   **External Search Results:** Up-to-date information about the video's or comparison's broader topic, fetched *once at the start of each new analysis/comparison chat session* to provide relevant, current context for the chat.
    *   **Pre-existing Knowledge:** The AI leverages its vast general knowledge for time-independent questions that aren't covered by the video, comparison, or external search.
*   **Cost-Optimized External Context:** To ensure efficiency, external search for broader context is performed only once per analysis or comparison chat session, significantly reducing API costs while still providing valuable, up-to-date information.
*   **Chat Message Limits:** The number of AI responses per chat session is **tier-dependent**.

### 2.6. Interactive & Clear Analysis Reports
*   **Structured Display:** Analysis results are presented in a clean, easy-to-read card format.
*   **Visual Cues:** Uses **Positive Green**, **Negative Red**, and **Neutral Gray** badges to highlight sentiment, emotional tones, and key themes for quick comprehension.
*   **Raw Comment Snippets:** Displays the top 10 most popular comments (by like count) to give users a direct glimpse into the source data.
*   **Loading Indicators:** Provides clear visual feedback during the analysis process, including fetching external context and generating custom answers, with skeleton loaders and spinning icons in **Accent Blue**.
*   **Error Handling:** Displays user-friendly alerts for any issues encountered during analysis (e.g., invalid link, insufficient comments, API errors), including specific messages for **tier-based limit exceedances**.
*   **Formatted Chat Responses:** AI responses in *all* chat interfaces (including the main video analysis chat and the Library Copilot) are now rendered with proper Markdown formatting, including **underlined hyperlinks**, improving readability and presentation.
*   **Enhanced Navigation:**
    *   Each single video analysis report includes a direct link to its corresponding SEO-optimized blog post in the library, a link to the original YouTube video, and a **"Go to Video Analysis" button** on the blog post page to view the full report.
    *   Each multi-comparison analysis report includes a direct link to its corresponding SEO-optimized blog post in the library.
    *   **Crucially, both multi-comparison analysis reports and multi-comparison blog posts feature clickable video thumbnails that redirect to the individual sentiment analysis of that particular video.**
    *   **Bidirectional Navigation:** Dedicated buttons allow seamless navigation between a multi-comparison analysis report and its blog post, and vice-versa.
*   **Refresh Analysis/Comparison:** A **"Refresh Analysis" button** (for single videos) or **"Refresh Comparison" button** (for multi-videos) is available on both the analysis report page and the blog post detail page, allowing users to manually trigger a full re-analysis/re-comparison to get the latest sentiment and comments. The `Last Full Analysis` or `Last Full Comparison` timestamp is displayed for transparency.

### 2.7. Professional PDF Report Export
*   **One-Click Download:** Users can easily download the complete analysis report as a beautifully formatted PDF document. This now includes the community questions and their AI-generated answers.
*   **Branded Header:** The PDF report includes a header featuring the SentiVibe logo and the tagline "YouTube Audience Insight Report — Powered by SentiVibe."
*   **Watermarking:** PDF reports for Free Tier users are **watermarked** with "Free Tier - SentiVibe". Paid Tier users receive unwatermarked reports.
*   **Shareable & Archivable:** Ideal for sharing insights with teams, clients, or for archiving research findings.
*   **Customizable Filename:** The PDF filename is automatically generated based on the video title for easy organization.

### 2.8. Responsive & Modern User Interface
*   **Intuitive Design:** A clean, minimalist interface built with Shadcn/ui components and Tailwind CSS.
*   **Mobile-Friendly:** The application is designed to be fully responsive, providing an optimal experience across desktops, tablets, and mobile devices.
*   **Consistent Branding:** Features a sleek **Crowd Black** and **Pure White** theme with **Positive Green**, **Negative Red**, and **Accent Blue** for emotional cues and interactive elements. The application uses the **Jura** font for body text and headings, ensuring a professional and unified brand presence.
*   **Theme Toggle:** Users can switch between dark, system, and **new Emerald, Crimson, Yellow, Cyan, Deep Blue, Forest Green, and Purple Haze themes** using a dedicated theme toggle.

## 3. How to Use SentiVibe

1.  **Access the Application:** Open SentiVibe in your web browser. The landing page will guide you to the main features.
2.  **Analyze a Single Video:**
    *   Click "Analyze a Video" in the header or on the landing page.
    *   In the input field, paste the full URL of the YouTube video you wish to analyze. Remember: **The video must have at least 50 comments for a proper sentiment analysis.**
    *   **Add Custom Questions (Optional):** Use the "Add Another Question" button to add one or more custom questions. For each question, type your query and specify the desired word count for the AI's answer. **Note: The number of questions and max word count are limited by your current tier.**
    *   **Initiate Analysis:** Click the "Analyze Comments & Get Answers" button. If the video has been analyzed before, the report will load almost instantly. If the existing analysis is stale (older than 30 days) or if you navigate from a blog post with a "Refresh Analysis" flag, a full re-analysis will occur. Any new custom questions you've added will be processed and merged with existing community questions. Otherwise, the application will display a loading state while the AI processes the data, fetches initial external context, and generates answers to your custom questions.
3.  **Create a Multi-Video Comparison:**
    *   Click "Compare Videos" in the header or on the landing page.
    *   In the input fields, paste the full URLs of at least two YouTube videos you wish to compare.
    *   **Add Custom Comparative Questions (Optional):** Use the "Add Another Comparative Question" button to add questions specifically for comparative insights. **Note: The number of questions and max word count are limited by your current tier.**
    *   **Initiate Comparison:** Click the "Create Multi-Video Comparison" button. The system will ensure all individual videos are analyzed (or refreshed if stale) before generating the comparative insights.
4.  **Review Report & Blog Post (Single Video):** Once the analysis is complete, a detailed report will appear, including the primary sentiment analysis, the answers to all community questions, and the top 10 raw comments. You will see a "View Blog Post" button to navigate to the full, SEO-optimized blog post, and an "Original Video" button to view the YouTube video. The `Last Full Analysis` timestamp will indicate when the core sentiment analysis was last performed.
5.  **Review Report & Blog Post (Multi-Video Comparison):** Once the comparison is complete, a detailed report will appear, including structured comparative data, answers to custom comparative questions, and the top 10 raw comments for *each* video. You will see a "View Full Multi-Comparison Blog Post" button to navigate to the dedicated blog post.
6.  **Refresh Analysis/Comparison (Optional):** If you believe the sentiment/comparison might have changed or simply want the latest data, click the **"Refresh Analysis" button** (for single videos) or **"Refresh Comparison" button** (for multi-videos) on the analysis report page or the blog post detail page to trigger a full re-analysis/re-comparison.
7.  **Navigate Between Analysis and Blog Post:**
    *   From a single video analysis report, click "View Blog Post" to go to the blog. From the blog, click "Go to Video Analysis" to return to the report.
    *   From a multi-video comparison analysis report, click "View Full Multi-Comparison Blog Post" to go to the blog. From the blog, click "Go to Multi-Comparison Analysis" to return to the report.
8.  **Explore Individual Videos within Multi-Comparison:** On both the multi-comparison analysis report and its blog post, **click on any video thumbnail** to view the individual sentiment analysis and blog post for that specific video.
9.  **Chat with AI:** Click the "Chat with AI" button (available on both single video and multi-video analysis/blog post pages) to open the **pop-up chat dialog**.
10. **Customize AI Chat (Optional):** Within the chat dialog, use the dropdown to select your preferred **AI Persona** and enter your **Desired Word Count** for the AI's response. **Note: The maximum word count and number of AI responses per session are limited by your current tier.**
11. **Engage with AI:** You can now ask questions about the video, its comments, the pre-generated community answers, or related topics. The AI will use all available context and your chosen persona/length preferences to provide informed answers, including clickable Markdown links.
12. **Download PDF Report:** To save or share the report, click the "Download Report PDF" button. A PDF file will be generated and downloaded to your device, featuring a branded header and including the community Q&A section. **Note: Free Tier reports will be watermarked.**
13. **Explore the Analysis Library:** Navigate to the "Analysis Library" from the header or landing page. Here, you can browse all past single video analyses, search by video title, creator, or keywords.
14. **Use Library Copilot:** On both the "Analysis Library" and "My Analyses" pages, click the "Library Copilot" button to open an AI chat that helps you find specific analyses from your collection, providing direct links to the blog posts. **It will also suggest new, related analysis topics or video ideas based on your query and the existing library content. Note: Daily queries are limited by your current tier.**
15. **Explore the Comparison Library:** Navigate to the "Comparison Library" from the header or landing page. Here, you can browse all past multi-video comparisons, search by comparison title, video titles, or keywords.
16. **Use Comparison Library Copilot:** On the "Comparison Library" page, click the "Comparison Copilot" button to open an AI chat that helps you find specific comparisons from your collection, providing direct links to the blog posts. **It will also suggest new, related comparative analysis topics or video pairs based on your query and the existing library content. Note: Daily queries are limited by your current tier.**
17. **Sign Up / Log In (Optional):** If you wish to save your analysis history and access higher limits, sign up or log in. You can then access your personal analyses via the "My Analyses" link in the header (Paid Tier feature).
18. **View Pricing:** The pricing details are available on the <Link to="/upgrade">Upgrade page</Link>.
19. **Toggle Theme:** Use the moon/sun icon in the header to switch between dark, system, or any of the **new Emerald, Crimson, Yellow, Cyan, Deep Blue, Forest Green, and Purple Haze themes**.

## 4. Value Proposition
SentiVibe provides immense value by:
*   **Saving Time:** Automates the tedious process of manually sifting through thousands of comments and researching related topics, and now automates content creation and specific question answering. **Significantly reduces redundant AI and API costs by reusing past analyses and dynamically adding new custom Q&A to existing reports, while intelligently refreshing stale data for both single videos and multi-comparisons.**
*   **Ensuring Data Freshness:** The new staleness logic and user-initiated refresh options ensure that sentiment analysis and comparative insights remain relevant and up-to-date, even for dynamic content.
*   **Enhanced Reliability:** The API key rotation mechanism ensures continuous operation even if individual free API keys hit their rate limits, providing a more robust and uninterrupted service.
*   **Gaining Deeper Understanding:** Offers AI-driven insights and interactive conversations that go beyond surface-level reading, incorporating direct audience feedback, broader context, and now, direct answers to user-defined questions for both single videos and comparisons.
*   **Personalized Interaction:** Users can tailor the AI's conversational style and response detail to match their specific needs and preferences, and get targeted answers to their most pressing questions.
*   **Informing Strategy:** Helps content creators understand what resonates with their audience, marketers to gauge campaign reception, and researchers to analyze public opinion with a more complete picture.
*   **Providing Actionable Data:** The weighted analysis ensures that the most impactful opinions are prioritized, and the AI can elaborate on these, including providing direct answers to custom questions.
*   **Professional Reporting:** Enables easy sharing of findings with high-quality PDF reports, now with a professional branded header and a dedicated section for community Q&A. **Watermarking for free tiers encourages upgrades.**
*   **Cost-Effective Intelligence:** Streamlined external search ensures you get the necessary up-to-date information without incurring excessive API costs.
*   **Boosting SEO & Content Strategy:** Automatically generates valuable, SEO-optimized content, expanding your digital footprint and making your insights discoverable to a wider audience through search engines. The searchable libraries further enhance content discoverability within the app, **ensuring no duplicate blog posts for the same video or comparison.** Comprehensive SEO features like dynamic meta tags, structured data, Open Graph tags, and proper alt text ensure maximum visibility and crawlability.
*   **Seamless Workflow:** The ability to initiate AI chat directly from a saved blog post, now within a consistent pop-up dialog, creates a more integrated and efficient user workflow, allowing for immediate follow-up questions on past analyses. The `LibraryCopilot` and `ComparisonLibraryCopilot` further enhance discoverability within a user's own analyses **and now proactively suggest new analysis topics, fostering continuous content exploration.**
*   **Modern & Intuitive Experience:** A sleek, responsive, and themeable user interface that aligns with modern design principles and your distinct brand identity, **now with multiple vibrant theme options.**

SentiVibe is continuously evolving, with a strong foundation laid for future enhancements to further enrich your video analysis, conversational AI, and content generation experience.