# SentiVibe Product Documentation

## 1. Product Overview
**SentiVibe** is an innovative web application designed to empower users with deep insights into public sentiment surrounding YouTube videos. By leveraging advanced AI, SentiVibe analyzes video comments to extract overall sentiment, emotional tones, key themes, and actionable summary insights. Beyond static reports, it now offers a **context-aware conversational AI** that can answer follow-up questions, drawing from the video analysis, top comments, external up-to-date information, and its own general knowledge. It also features **programmatic SEO**, automatically generating and publishing SEO-optimized blog posts for each video analysis, and organizing them in a searchable **Video Analysis Library**. It's an essential tool for content creators, marketers, researchers, and anyone interested in understanding audience reactions to online video content.

**Mission:** To decode the voice of the crowd—transforming unstructured online reactions into clear, actionable insight.
**Tagline:** “See what the crowd really feels.”
**Extended Descriptor:** AI‑powered YouTube Comment Insights & Sentiment Analysis
**Tone:** Professional clarity + warm confidence + data‑science credibility.
**Voice keywords:** Insightful, factual, transparent, modern, minimal.

## 2. Key Features

### 2.1. Secure User Authentication
*   **Personalized Experience:** Users can securely sign up and log in to access SentiVibe's features.
*   **Protected Content:** Analysis tools and reports are protected, ensuring only authenticated users can access them.
*   **Profile Management (Future-ready):** A user profile system is in place, ready for future enhancements like saving analysis history or personalized dashboards.

### 2.2. AI-Powered YouTube Video Analysis
*   **Effortless Input:** Simply paste any public YouTube video link into the application.
*   **Custom AI Questions:** Users can now add multiple custom questions with desired word count limits to be answered by the AI as part of the initial analysis report.
*   **Intelligent Analysis Caching:** To optimize resource usage and prevent duplicate content, SentiVibe automatically saves each video analysis. If a video has been analyzed before, the system will instantly retrieve and display the existing report, blog post, and **all previously generated custom Q&A results**, saving AI credits and API calls. The cached analysis includes the top 10 raw comments for future AI chat context.
*   **Comprehensive Data Extraction:** SentiVibe automatically retrieves:
    *   **Video Title & Description:** For context.
    *   **Video Thumbnail:** Visual identification of the video.
    *   **Video Tags:** To understand the video's categorization and keywords.
    *   **Comments:** Fetches up to 100 comments for analysis.
    *   **Creator Name:** Identifies the YouTube channel/creator.
*   **Intelligent Comment Filtering:** Requires a minimum of 50 comments to ensure a robust and meaningful AI analysis, preventing skewed results from low engagement videos.
*   **Weighted Sentiment Analysis:** The AI model is specifically instructed to give **significantly more weight to comments with higher "Likes" counts**. This ensures that the analysis reflects the sentiment of the most popular and influential opinions within the comment section.
*   **Detailed AI Insights:** The analysis provides:
    *   **Overall Sentiment:** A general classification (e.g., positive, negative, neutral).
    *   **Emotional Tones:** Identifies prevalent emotions (e.g., joy, anger, surprise, sadness).
    *   **Key Themes:** Highlights the main topics and recurring subjects discussed in the comments.
    *   **Summary Insights:** A concise, human-readable summary of the AI's findings, explaining the overall sentiment and key takeaways, with an emphasis on how popular comments influenced the assessment.
    *   **Custom Q&A Section:** Displays the AI-generated answers to the user's specific custom questions, respecting the specified word limits.

### 2.3. Programmatic SEO & Video Analysis Library
*   **Automated Blog Post Generation:** Immediately after a *new* video analysis is complete, the AI automatically generates a comprehensive, SEO-optimized blog post. For videos previously analyzed, the existing blog post is retrieved and linked, ensuring **only one unique blog post exists per video**.
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
    *   **Content Freshness:** Blog post detail pages display publication and last updated dates.
*   **Instant Publishing:** Blog posts are automatically published to the SentiVibe platform and become accessible via unique, SEO-friendly URLs.
*   **Video Analysis Library:** All generated blog posts are organized into a dedicated "Analysis Library."
    *   **Browse & Discover:** Users can easily browse through past video analyses.
    *   **Search & Filter:** The library provides robust search functionality, allowing users to find specific analyses by video title, creator name, or keywords.
    *   **Visual Context:** Each entry in the library displays the YouTube video's thumbnail, title, and creator name for quick identification.
    *   **Direct Chat Initiation:** From any blog post detail page, users can directly initiate a conversation with the AI, pre-loading the chat with the context of that specific video analysis.
    *   **Library Copilot:** An AI assistant is available in both the main "Analysis Library" and "My Analyses" pages to help users find specific video analyses based on their queries, providing clickable Markdown links to relevant blog posts.

### 2.4. Context-Aware Conversational AI
*   **Interactive Q&A (Dialog-based):** After a video analysis, or when loading a saved analysis from the library, users can engage in a chat with SentiVibe AI to ask follow-up questions about the video, its comments, or related topics. This chat now occurs within a **pop-up dialog interface**, providing a consistent experience across the application.
*   **Customizable AI Persona:** Users can select from various AI personas (e.g., Friendly Assistant, Therapist, Storyteller, Motivational Coach, Argumentative) to tailor the AI's tone and conversational style to their preference.
*   **Adjustable Response Length:** Users have explicit control over the AI's response verbosity, choosing between concise, standard, or detailed answers.
*   **Multi-Source Intelligence:** The AI intelligently synthesizes information from:
    *   **Video Analysis Report:** All details from the initial analysis (sentiment, themes, summary).
    *   **Exact Top Comments:** The raw text of the top 10 most popular comments, allowing for deep dives into audience feedback.
    *   **Pre-generated Custom Q&A:** The AI has access to the answers generated for the custom questions, allowing it to reference or elaborate on them during the chat.
    *   **External Search Results:** Up-to-date information about the video's broader topic, fetched *once at the start of each new analysis session* to provide relevant, current context for the chat. **Note:** While video analysis results are cached, each chat session starts fresh, ensuring a focused conversation with the latest external context.
    *   **Pre-existing Knowledge:** The AI leverages its vast general knowledge for time-independent questions that aren't covered by the video or external search.
*   **Cost-Optimized External Context:** To ensure efficiency, external search for broader context is performed only once per video analysis session, significantly reducing API costs while still providing valuable, up-to-date information.

### 2.5. Interactive & Clear Analysis Reports
*   **Structured Display:** Analysis results are presented in a clean, easy-to-read card format.
*   **Visual Cues:** Uses **Positive Green**, **Negative Red**, and **Neutral Gray** badges to highlight sentiment, emotional tones, and key themes for quick comprehension.
*   **Raw Comment Snippets:** Displays the top 10 most popular comments (by like count) to give users a direct glimpse into the source data.
*   **Loading Indicators:** Provides clear visual feedback during the analysis process, including fetching external context and generating custom answers, with skeleton loaders and spinning icons in **Accent Blue**.
*   **Error Handling:** Displays user-friendly alerts for any issues encountered during analysis (e.g., invalid link, insufficient comments, API errors).
*   **Formatted Chat Responses:** AI responses in *all* chat interfaces (including the main video analysis chat and the Library Copilot) are now rendered with proper Markdown formatting, including **underlined hyperlinks**, improving readability and presentation.
*   **Enhanced Navigation:** Each analysis report includes a direct link to its corresponding SEO-optimized blog post in the library, and a link to the original YouTube video.

### 2.6. Professional PDF Report Export
*   **One-Click Download:** Users can easily download the complete analysis report as a beautifully formatted PDF document. This now includes the custom questions and their AI-generated answers.
*   **Branded Header:** The PDF report includes a header featuring the SentiVibe logo and the tagline "YouTube Audience Insight Report — Powered by SentiVibe."
*   **Shareable & Archivable:** Ideal for sharing insights with teams, clients, or for archiving research findings.
*   **Customizable Filename:** The PDF filename is automatically generated based on the video title for easy organization.

### 2.7. Responsive & Modern User Interface
*   **Intuitive Design:** A clean, minimalist interface built with Shadcn/ui components and Tailwind CSS.
*   **Mobile-Friendly:** The application is designed to be fully responsive, providing an optimal experience across desktops, tablets, and mobile devices.
*   **Consistent Branding:** Features a sleek **Crowd Black** and **Pure White** theme with **Positive Green**, **Negative Red**, and **Accent Blue** for emotional cues and interactive elements. The application uses the **Arimo** font for body text and **Plus Jakarta Sans** for headings and the prominent "SentiVibe" word logo, ensuring a professional and unified brand presence.
*   **Theme Toggle:** Users can switch between light and dark modes using a dedicated theme toggle.

## 3. How to Use SentiVibe

1.  **Access the Application:** Open SentiVibe in your web browser.
2.  **Sign Up / Log In:** If you're a new user, sign up for an account. Otherwise, log in with your existing credentials.
3.  **Navigate to Analyze Video:** From the homepage, click the "Analyze a Video" button or navigate to the `/analyze-video` route.
4.  **Paste YouTube Link:** In the input field, paste the full URL of the YouTube video you wish to analyze.
5.  **Add Custom Questions (Optional):** Use the "Add Another Question" button to add one or more custom questions. For each question, type your query and specify the desired word count for the AI's answer.
6.  **Initiate Analysis:** Click the "Analyze Comments & Get Answers" button. If the video has been analyzed before, the report will load almost instantly. Otherwise, the application will display a loading state while the AI processes the data, fetches initial external context, and generates answers to your custom questions.
7.  **Review Report & Blog Post:** Once the analysis is complete, a detailed report will appear, including the primary sentiment analysis and the answers to your custom questions. You will see a "View Blog Post" button to navigate to the full, SEO-optimized blog post, and an "Original Video" button to view the YouTube video.
8.  **Chat with AI:** Click the "Chat with AI" button to open the **pop-up chat dialog**.
9.  **Customize AI Chat (Optional):** Within the chat dialog, use the dropdowns to select your preferred **AI Persona** and **Response Length**.
10. **Engage with AI:** You can now ask questions about the video, its comments, the pre-generated custom answers, or related topics. The AI will use all available context and your chosen persona/length preferences to provide informed answers, including clickable Markdown links.
11. **Download PDF Report:** To save or share the report, click the "Download Report PDF" button. A PDF file will be generated and downloaded to your device, featuring a branded header and including the custom Q&A section.
12. **Explore the Analysis Library:** Navigate to the "Analysis Library" from the header. Here, you can browse all past video analyses, search by video title, creator, or keywords.
13. **Use Library Copilot:** On both the "Analysis Library" and "My Analyses" pages, click the "Library Copilot" button to open an AI chat that helps you find specific analyses from your collection, providing direct links to the blog posts.
14. **Chat from Library (New!):** From a blog post detail page, click the "Chat with AI" button to seamlessly open the **pop-up chat dialog** with the blog post's context pre-loaded, ready for conversation.
15. **Toggle Theme:** Use the moon/sun icon in the header to switch between light and dark modes.

## 4. Value Proposition
SentiVibe provides immense value by:
*   **Saving Time:** Automates the tedious process of manually sifting through thousands of comments and researching related topics, and now automates content creation and specific question answering. **Significantly reduces redundant AI and API costs by reusing past analyses.**
*   **Enhanced Reliability:** The API key rotation mechanism ensures continuous operation even if individual free API keys hit their rate limits, providing a more robust and uninterrupted service.
*   **Gaining Deeper Understanding:** Offers AI-driven insights and interactive conversations that go beyond surface-level reading, incorporating direct audience feedback, broader context, and now, direct answers to user-defined questions.
*   **Personalized Interaction:** Users can tailor the AI's conversational style and response detail to match their specific needs and preferences, and get targeted answers to their most pressing questions.
*   **Informing Strategy:** Helps content creators understand what resonates with their audience, marketers to gauge campaign reception, and researchers to analyze public opinion with a more complete picture.
*   **Providing Actionable Data:** The weighted analysis ensures that the most impactful opinions are prioritized, and the AI can elaborate on these, including providing direct answers to custom questions.
*   **Professional Reporting:** Enables easy sharing of findings with high-quality PDF reports, now with a professional branded header and a dedicated section for custom Q&A.
*   **Cost-Effective Intelligence:** Streamlined external search ensures you get the necessary up-to-date information without incurring excessive API costs.
*   **Boosting SEO & Content Strategy:** Automatically generates valuable, SEO-optimized content, expanding your digital footprint and making your insights discoverable to a wider audience through search engines. The searchable library further enhances content discoverability within the app, **ensuring no duplicate blog posts for the same video.** Comprehensive SEO features like dynamic meta tags, structured data, Open Graph tags, and proper alt text ensure maximum visibility and crawlability.
*   **Seamless Workflow:** The ability to initiate AI chat directly from a saved blog post, now within a consistent pop-up dialog, creates a more integrated and efficient user workflow, allowing for immediate follow-up questions on past analyses. The `LibraryCopilot` further enhances discoverability within a user's own analyses.
*   **Modern & Intuitive Experience:** A sleek, responsive, and themeable user interface that aligns with modern design principles and your distinct brand identity.

SentiVibe is continuously evolving, with a strong foundation laid for future enhancements to further enrich your video analysis, conversational AI, and content generation experience.