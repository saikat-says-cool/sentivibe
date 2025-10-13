# SentiVibe Product Documentation

## 1. Product Overview
**SentiVibe** is an AI-powered insight platform that transforms unstructured YouTube video comments into a living, interactive intelligence hub. For data-driven content creators, marketers, and researchers who need to understand audience reception and public opinion on YouTube, SentiVibe provides a dynamic, conversational AI that answers your specific questions, automates the creation of SEO-optimized content from its findings, and ensures insights are always fresh and relevant. Unlike static sentiment analysis tools and manual comment review, SentiVibe offers an ongoing conversation and an evolving asset.

**Mission:** To decode the voice of the crowd—transforming unstructured online reactions into clear, actionable insight.
**Tagline:** “SentiVibe: Your Audience, Understood. See what the crowd really feels. Then ask it anything.”
**Extended Descriptor:** AI‑powered YouTube Comment Insights & Sentiment Analysis
**Tone:** Professional clarity + warm confidence + data‑science credibility.
**Voice keywords:** Insightful, factual, transparent, modern, minimal.

## 2. Key Features

### 2.1. Secure User Authentication & Simplified Tiered Offerings
*   **The Most Generous Insight Tool:** Get real value, right now, for free. Experience the full power of our AI, no credit card required.
*   **Public Access:** Core features like video analysis and the analysis library are now accessible to **all users, even without logging in, under a Free Tier with specific daily limits for analyses and comparisons.**
*   **Personalized Experience:** Users can securely sign up and log in to access personalized features like "My Analyses" history (available for **all authenticated users**) and the new **Account Center**.
*   **Protected Content:** User-specific analysis history is protected, ensuring only authenticated users can access their own saved reports.
*   **Simplified Tiered System:** SentiVibe now operates with a simplified two-tier offering system:
    *   **Free Tier (Authenticated or Unauthenticated):** Limited daily analyses and comparisons. All other features (custom questions, AI chat, copilots) are **unlimited**. Watermarked PDF reports and ad-supported.
    *   **Paid Tier:** Significantly higher daily analysis and comparison limits. All other features (custom questions, AI chat, copilots) are **unlimited**. Unwatermarked PDF reports, ad-free experience, and full access to "My Analyses" history.
*   **Profile Management (Future-ready):** A user profile system is in place, ready for future enhancements like personalized dashboards.
*   **Dedicated Pricing Page:** A new <Link to="/pricing">Pricing page</Link> clearly outlines the features and limitations of each tier.

### 2.2. AI-Powered YouTube Video Analysis
*   **Effortless Input:** Simply paste any public YouTube video link into the application.
*   **Minimum Comment Requirement:** A clear disclaimer states: "**Important: The video must have at least 50 comments for a proper sentiment analysis.**" This ensures robust and meaningful AI analysis.
*   **Dynamic Custom AI Questions:** Users can now add multiple custom questions with desired word count limits to be answered by the AI as part of the initial analysis report. **We don't meter your curiosity. Ask unlimited questions, on any plan.**
*   **Intelligent Analysis Caching with Dynamic Q&A and Staleness Logic:** To optimize resource usage and prevent duplicate content, SentiVibe automatically saves each video analysis. If a video has been analyzed before, the system will instantly retrieve and display the existing report and blog post.
    *   **Staleness Check:** Analyses are considered "stale" after a predefined period (e.g., 30 days). If an analysis is stale, or if a user explicitly requests it, a **full re-analysis** will be performed, fetching the latest comments and re-running the AI sentiment analysis to ensure freshness.
    *   **Crucially, if a user submits new custom questions for an already analyzed video, these new questions will be processed by the AI, answered, and then merged with any existing custom Q&A results for that video. The combined "community questions" and their answers will be stored and displayed in the report and blog post, ensuring all user-submitted questions are addressed and become part of the collective insight.** The cached analysis includes the top 10 raw comments for future AI chat context.
*   **Comprehensive Data Extraction:** SentiVibe automatically retrieves:
    *   **Video Title & Description:** For context.
    *   **Video Thumbnail:** Visual identification of the video.
    *   **Video Tags:** To understand the video's categorization and keywords.
    *   **Comments:** Fetches up to 100 comments for analysis.
    *   **Creator Name:** Identifies the YouTube channel/creator.
*   **Weighted Sentiment Analysis:** The AI model is specifically instructed to give **significantly more weight to comments that have a higher "Likes" counts**. This ensures that the analysis reflects the sentiment of the most popular and influential opinions within the comment section. **Hear the most influential voices, not just the loudest.**
*   **Detailed AI Insights:** The analysis provides:
    *   **Overall Sentiment:** A general classification (e.g., positive, negative, neutral).
    *   **Emotional Tones:** Identifies prevalent emotions (e.g., joy, anger, surprise, sadness).
    *   **Key Themes:** Highlights the main topics and recurring subjects discussed in the comments.
    *   **Summary Insights:** A concise, human-readable summary of the AI's findings, explaining the overall sentiment and key takeaways, with an emphasis on how popular comments influenced the assessment.
    *   **Community Q&A Section:** Displays all AI-generated answers to custom questions asked by any user about this video.
    *   **Top 10 Comments:** The raw text of the 10 most popular comments is explicitly listed in the analysis report for direct user review.

### 2.3. Multi-Video Comparison Analysis
*   **Compare Multiple Videos:** Users can input two or more YouTube video links to perform a comparative sentiment analysis. **See the full picture by comparing sentiment across videos.**
*   **Reliability Note:** For reliable and stable performance, multi-video comparisons are currently limited to a **maximum of 3 videos simultaneously**.
*   **Custom Comparative Questions:** Similar to single video analysis, users can add custom questions specifically tailored for comparative insights, with desired word count limits. **We don't meter your curiosity. Ask unlimited questions, on any plan.**
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
*   **Insights that Build Your Brand:** Turn Audience Insight into SEO Power. Every analysis automatically becomes a new, discoverable asset for your brand. Stop just analyzing—start publishing.
*   **Automated Blog Post Generation:** Immediately after a *new* video analysis or multi-video comparison is complete, the AI automatically generates a comprehensive, SEO-optimized blog post. For content previously analyzed, the existing blog post is retrieved and linked, ensuring **only one unique blog post exists per video or comparison**. During a full re-analysis/re-comparison, the blog post content is also regenerated to reflect updated sentiment/insights.
*   **SEO Optimization:** Each generated blog post includes:
    *   A compelling, SEO-optimized title (e.g., \`{{VideoTitle}} YouTube Comment Sentiment Analysis ({{Year}}) | SentiVibe\`).
    *   A URL-friendly slug (e.g., \`/blog/{{slugified-video-title}}\`).
    *   A concise meta description (e.g., \`Discover how audiences responded to {{VideoTitle}} with SentiVibe's AI comment analysis: sentiment, emotions, key themes.\`).
    *   A list of relevant keywords.
    *   Structured content with appropriate headings (H1, H2, H3) in Markdown format, following a logical content block layout (Intro, Sentiment Summary, Top Keywords, Viewer Insights, Conclusion/CTA).
    *   **Dynamic Meta Tags:** Blog post detail pages dynamically update the browser title and meta description for optimal search engine indexing.
    *   **Open Graph (OG) Tags:** Dynamically adds \`og:title\`, \`og:description\`, \`og:image\`, \`og:url\`, \`og:type\`, and \`og:site_name\` meta tags for rich social media sharing previews.
    *   **Structured Data (JSON-LD):** Blog post detail pages incorporate \`BlogPosting\` and \`SoftwareApplication\` schema markup to provide structured information to search engines.
    *   **Image Alt Text:** All video thumbnail images include descriptive \`alt\` attributes for accessibility and SEO.
    *   **Content Freshness:** Blog post detail pages display publication and last updated dates, including the \`Last Full Analysis\` or \`Last Full Comparison\` timestamp.
*   **Instant Publishing:** Blog posts are automatically published to the SentiVibe platform and become accessible via unique, SEO-friendly URLs.
*   **Video Analysis Library:** All generated single video analysis blog posts are organized into a dedicated "Analysis Library."
    *   **Browse & Discover:** Users can easily browse through past video analyses.
    *   **Search & Filter:** The library provides robust search functionality, allowing users to find specific analyses by video title, creator name, or keywords.
    *   **Visual Context:** Each entry in the library displays the YouTube video's thumbnail, title, and creator name for quick identification.
    *   **Direct Chat Initiation:** From any blog post detail page, users can directly initiate a conversation with the AI, pre-loading the chat with the context of that specific video analysis.
    *   **Library Copilot:** An AI assistant is available in both the main "Analysis Library" and "My Analyses" pages to help users find specific video analyses based on their queries, providing clickable Markdown links to relevant blog posts. **It also proactively suggests new, related analysis topics or video ideas based on the user's query and the existing library content. Copilot queries are now unlimited for all tiers.**
*   **Multi-Comparison Library:** All generated multi-video comparison blog posts are organized into a dedicated "Comparison Library."
    *   **Browse & Discover:** Users can easily browse through past multi-comparisons.
    *   **Search & Filter:** Provides robust search functionality by comparison title, video titles, or keywords.
    *   **Visual Context:** Each entry displays the first video's thumbnail with a "+X more" badge if multiple videos are included, along with the comparison title.
    *   **Comparison Library Copilot:** An AI assistant helps users find specific comparisons or suggest new comparative analysis topics. **Copilot queries are now unlimited for all tiers.**

### 2.5. From Static Report to Living Intelligence
*   **Interactive Q&A (Dialog-based):** After any video analysis or comparison, or when loading a saved analysis/comparison from the library, users can engage in a chat with SentiVibe AI to ask follow-up questions. This chat now occurs within a **pop-up dialog interface**, providing a consistent experience across the application. **Don't just get a report, start a conversation. Your insights are alive—always fresh, always ready for your follow-up questions. SentiVibe is your AI research partner, not just a data-pulling tool.**
*   **Customizable AI Persona:** Users can select from various AI personas (e.g., Friendly Assistant, Therapist, Storyteller, Motivational Coach, Argumentative) to tailor the AI's tone and conversational style to their preference.
*   **Precise Response Length Control:** Users have explicit control over the AI's response length by specifying a **desired word count** for each answer, ensuring the AI provides information at the exact level of detail required. **This is now unlimited for all tiers.**
*   **Multi-Source Intelligence:** The AI intelligently synthesizes information from:
    *   **Video Analysis Report / Comparison Report:** All details from the initial analysis or comparison (sentiment, themes, summary, structured comparison data).
    *   **Exact Top Comments:** The raw text of the top 10 most popular comments for the single video, or for *each* video in a multi-comparison, allowing for deep dives into audience feedback.
    *   **Community Q&A:** The AI has access to all pre-generated answers for custom questions (single video or comparative), allowing it to reference or elaborate on them during the chat.
    *   **Pre-existing Knowledge:** The AI leverages its vast general knowledge for time-independent questions that aren't covered by the video or comparison. **(Note: External search results are no longer used for chat context to optimize for cost-efficiency and reliability, ensuring the AI focuses on the most relevant, internal data.)**
*   **Cost-Optimized External Context:** **External search for broader context has been removed from chat functions to optimize costs and improve reliability.**
*   **Chat Message Limits:** **The number of AI responses per chat session is now unlimited for all tiers.**

### 2.6. Interactive & Clear Analysis Reports
*   **Structured Display:** Analysis results are presented in a clean, easy-to-read card format.
*   **Visual Cues:** Uses **Positive Green**, **Negative Red**, and **Neutral Gray** badges to highlight sentiment, emotional tones, and key themes for quick comprehension.
*   **Raw Comment Snippets:** Displays the top 10 most popular comments (by like count) to give users a direct glimpse into the source data.
*   **Loading Indicators:** Provides clear visual feedback during the analysis process, including generating custom answers, with skeleton loaders and spinning icons in **Accent Blue**.
*   **Error Handling:** Displays user-friendly alerts for any issues encountered during analysis (e.g., invalid link, insufficient comments, API errors), including specific messages for **tier-based daily analysis/comparison limit exceedances.**
*   **Formatted Chat Responses:** AI responses in *all* chat interfaces (including the main video analysis chat and the Library Copilot) are now rendered with proper Markdown formatting, including **underlined hyperlinks**, improving readability and presentation.
*   **Enhanced Navigation:**
    *   Each single video analysis report includes a direct link to its corresponding SEO-optimized blog post in the library, a link to the original YouTube video, and a **"Go to Video Analysis" button** on the blog post page to view the full report.
    *   Each multi-comparison analysis report includes a direct link to its corresponding SEO-optimized blog post in the library.
    *   **Crucially, both multi-comparison analysis reports and multi-comparison blog posts feature clickable video thumbnails that redirect to the individual sentiment analysis of that particular video.**
    *   **Bidirectional Navigation:** Dedicated buttons allow seamless navigation between a multi-comparison analysis report and its blog post, and vice-versa.
*   **Refresh Analysis/Comparison:** A **"Refresh Analysis" button** (for single videos) or **"Refresh Comparison" button** (for multi-videos) is available on both the analysis report page and the blog post detail page, allowing users to manually trigger a full re-analysis/re-comparison to get the latest sentiment and comments. The \`Last Full Analysis\` or \`Last Full Comparison\` timestamp is displayed for transparency.

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
    *   **Add Custom Questions (Unlimited):** Use the "Add Another Question" button to add one or more custom questions. For each question, type your query and specify the desired word count for the AI's answer.
    *   **Initiate Analysis:** Click the "Analyze Comments & Get Answers" button. If the video has been analyzed before, the report will load almost instantly. If the existing analysis is stale (older than 30 days) or if you navigate from a blog post with a "Refresh Analysis" flag, a full re-analysis will occur. Any new custom questions you've added will be processed and merged with existing community questions. Otherwise, the application will display a loading state while the AI processes the data and generates answers to your custom questions.
4.  **Review Report & Blog Post (Single Video):** Once the analysis is complete, a detailed report will appear, including the primary sentiment analysis, the answers to all community questions, and the top 10 raw comments. You will see a "View Blog Post" button to navigate to the full, SEO-optimized blog post, and an "Original Video" button to view the YouTube video. The \`Last Full Analysis\` timestamp will indicate when the core sentiment analysis was last performed.
5.  **Review Report & Blog Post (Multi-Video Comparison):** Once the comparison is complete, a detailed report will appear, including structured comparative data, answers to custom comparative questions, and the top 10 raw comments for *each* video. You will see a "View Full Multi-Comparison Blog Post" button to navigate to the dedicated blog post.
6.  **Refresh Analysis/Comparison (Optional):** If you believe the sentiment/comparison might have changed or simply want the latest data, click the **"Refresh Analysis" button** (for single videos) or **"Refresh Comparison" button** (for multi-videos) on the analysis report page or the blog post detail page to trigger a full re-analysis/re-comparison.
7.  **Navigate Between Analysis and Blog Post:**
    *   From a single video analysis report, click "View Blog Post" to go to the blog. From the blog, click "Go to Video Analysis" to return to the report.
    *   From a multi-video comparison analysis report, click "View Full Multi-Comparison Blog Post" to go to the blog. From the blog, click "Go to Multi-Comparison Analysis" to return to the report.
8.  **Explore Individual Videos within Multi-Comparison:** On both the multi-comparison analysis report and its blog post, **click on any video thumbnail** to view the individual sentiment analysis and blog post for that specific video.
9.  **Chat with AI (Unlimited):** Click the "Chat with AI" button (available on both single video and multi-video analysis/blog post pages) to open the **pop-up chat dialog**.
10. **Customize AI Chat (Unlimited):** Within the chat dialog, use the dropdown to select your preferred **AI Persona** and enter your **Desired Word Count** for the AI's response.
11. **Engage with AI:** You can now ask questions about the video, its comments, the pre-generated community answers, or related topics. The AI will use all available context and your chosen persona/length preferences to provide informed answers, including clickable Markdown links.
12. **Download PDF Report:** To save or share the report, click the "Download Report PDF" button. A PDF file will be generated and downloaded to your device, featuring a branded header and including the community Q&A section. **Note: Free Tier reports will be watermarked.**
13. **Explore the Analysis Library:** Navigate to the "Analysis Library" from the header or landing page. Here, you can browse all past single video analyses, search by video title, creator, or keywords.
14. **Use Library Copilot (Unlimited):** On both the "Analysis Library" and "My Analyses" pages, click the "Library Copilot" button to open an AI chat that helps you find specific analyses from your collection, providing direct links to the blog posts. **It will also suggest new, related analysis topics or video ideas based on the user's query and the existing library content.**
15. **Explore the Comparison Library:** Navigate to the "Comparison Library" from the header or landing page. Here, you can browse all past multi-video comparisons, search by comparison title, video titles, or keywords.
16. **Use Comparison Library Copilot (Unlimited):** On the "Comparison Library" page, click the "Comparison Copilot" button to open an AI chat that helps you find specific comparisons from your collection, providing direct links to the blog posts. **It will also suggest new, related comparative analysis topics or video pairs based on your query and the existing library content.**
17. **Sign Up / Log In (Optional):** If you wish to access your personal analysis history, sign up or log in. You can then access your personal analyses via the "My Analyses" link in the header.
18. **View Pricing:** The pricing details are available on the new <Link to="/pricing">Pricing page</Link>.
19. **Manage Account:** Authenticated users can visit the new "Account" page to view and update their profile information and check their subscription status.
20. **Toggle Theme:** Use the moon/sun icon in the header to switch between dark, system, or any of the **new Emerald, Crimson, Yellow, Cyan, Deep Blue, Forest Green, and Purple Haze themes**.

## 4. Value Proposition
SentiVibe provides immense value by:
*   **Saving Time:** Automates the tedious process of manually sifting through thousands of comments and researching related topics, and now automates content creation and specific question answering. **Significantly reduces redundant AI and API costs by reusing past analyses and dynamically adding new custom Q&A to existing reports, while intelligently refreshing stale data for both single videos and multi-comparisons.**
*   **Ensuring Data Freshness:** The new staleness logic and user-initiated refresh options ensure that sentiment analysis and comparative insights remain relevant and up-to-date, even for dynamic content.
*   **Enhanced Reliability:** The API key rotation mechanism ensures continuous operation even if individual free API keys hit their rate limits, providing a more robust and uninterrupted service.
*   **Gaining Deeper Understanding:** Offers AI-driven insights and interactive conversations that go beyond surface-level reading, incorporating direct audience feedback, broader context, and now, direct answers to user-defined questions for both single videos and comparisons.
*   **Personalized Interaction:** Users can tailor the AI's conversational style and response detail to match their specific needs and preferences, and get targeted answers to their most pressing questions. **All custom questions, chat messages, and copilot queries are now unlimited for all tiers.**
*   **Informing Strategy:** Helps content creators understand what resonates with their audience, marketers to gauge campaign reception, and researchers to analyze public opinion with a more complete picture.
*   **Providing Actionable Data:** The weighted analysis ensures that the most impactful opinions are prioritized, and the AI can elaborate on these, including providing direct answers to custom questions.
*   **Professional Reporting:** Enables easy sharing of findings with high-quality PDF reports, now with a professional branded header and a dedicated section for community Q&A. **Watermarking for free tiers encourages upgrades.**
*   **Cost-Effective Intelligence:** **External search for chat context has been removed to optimize costs and improve reliability.**
*   **Boosting SEO & Content Strategy:** Automatically generates valuable, SEO-optimized content, expanding your digital footprint and making your insights discoverable to a wider audience through search engines. The searchable libraries further enhance content discoverability within the app, **ensuring no duplicate blog posts for the same video or comparison.** Comprehensive SEO features like dynamic meta tags, structured data, Open Graph tags, and proper alt text ensure maximum visibility and crawlability.
*   **Seamless Workflow:** The ability to initiate AI chat directly from a saved blog post, now within a consistent pop-up dialog, creates a more integrated and efficient user workflow, allowing for immediate follow-up questions on past analyses. The \`LibraryCopilot\` and \`ComparisonLibraryCopilot\` further enhance discoverability within a user's own analyses **and now proactively suggest new analysis topics, fostering continuous content exploration. All copilot queries are now unlimited for all tiers.**
*   **Modern & Intuitive Experience:** A sleek, responsive, and themeable user interface that aligns with modern design principles and your distinct brand identity, **now with multiple vibrant theme options.**

SentiVibe is continuously evolving, with a strong foundation laid for future enhancements to further enrich your video analysis, conversational AI, and content generation experience.
`;

const BlogPostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false); // State for chat dialog
  const analysisReportRef = useRef<HTMLDivElement>(null); // Ref for PDF download
  const { subscriptionStatus, subscriptionPlanId } = useAuth(); // Get subscription info
  const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free';

  console.log("Current URL slug from useParams:", slug);

  const { data: blogPost, isLoading, error } = useQuery<BlogPost | null, Error>({
    queryKey: ['blogPost', slug],
    queryFn: () => fetchBlogPostBySlug(slug!),
    enabled: !!slug,
  });

  console.log("useQuery state - isLoading:", isLoading, "error:", error, "blogPost:", blogPost);

  useEffect(() => {
    const head = document.head;
    const domain = "https://sentivibe.online"; // Use the new domain

    // Function to create or update a meta tag
    const updateMetaTag = (name: string, content: string, property?: string) => {
      let tag = document.querySelector(`meta[${property ? `property="${property}"` : `name="${name}"`}]`);
      if (!tag) {
        tag = document.createElement('meta');
        if (property) tag.setAttribute('property', property);
        else tag.setAttribute('name', name);
        head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Function to remove a meta tag
    const removeMetaTag = (name: string, property?: string) => {
      const tag = document.querySelector(`meta[${property ? `property="${property}"` : `name="${name}"`}]`);
      if (tag) tag.remove();
    };

    if (blogPost) {
      // Update document title
      document.title = blogPost.title;

      // Update meta description
      updateMetaTag('description', blogPost.meta_description);

      // Add Open Graph (OG) tags for social media
      updateMetaTag('og:title', blogPost.title, 'og:title');
      updateMetaTag('og:description', blogPost.meta_description, 'og:description');
      updateMetaTag('og:image', blogPost.thumbnail_url, 'og:image');
      updateMetaTag('og:url', `${domain}/blog/${blogPost.slug}`, 'og:url');
      updateMetaTag('og:type', 'article', 'og:type');
      updateMetaTag('og:site_name', 'SentiVibe', 'og:site_name');

      // Add JSON-LD Structured Data for BlogPosting
      const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting",
            "headline": blogPost.title,
            "description": blogPost.meta_description,
            "image": blogPost.thumbnail_url,
            "datePublished": blogPost.published_at,
            "dateModified": blogPost.updated_at,
            "author": {
              "@type": "Person",
              "name": blogPost.creator_name || "SentiVibe AI"
            },
            "publisher": {
              "@type": "Organization",
              "name": "SentiVibe",
              "logo": {
                "@type": "ImageObject",
                "url": `${domain}/logo.png`
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${domain}/blog/${blogPost.slug}`
            }
          },
          {
            "@type": "SoftwareApplication",
            "name": "SentiVibe - YouTube Comment Sentiment Analyzer",
            "applicationCategory": "AI Tool",
            "operatingSystem": "Web",
            "url": `${domain}`,
            "description": "AI tool to analyze YouTube comments for sentiment and insights.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          }
        ]
      };

      let scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schemaData);

    } else {
      // Reset to default if no blog post is loaded
      document.title = "SentiVibe - Video Analysis Library"; // Consistent fallback title
      updateMetaTag('description', 'Unlock the true sentiment behind YouTube comments. Analyze, understand, and gain insights into audience reactions with AI-powered sentiment analysis.');

      // Remove OG tags
      removeMetaTag('og:title', 'og:title');
      removeMetaTag('og:description', 'og:description');
      removeMetaTag('og:image', 'og:image');
      removeMetaTag('og:url', 'og:url');
      removeMetaTag('og:type', 'og:type');
      removeMetaTag('og:site_name', 'og:site_name');

      const scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (scriptTag) {
        scriptTag.remove();
      }
    }
  }, [blogPost]);

  const contentWithoutDuplicateTitle = (markdownContent: string, title: string): string => {
    const lines = markdownContent.split('\n');
    if (lines.length > 0 && lines[0].startsWith('#')) {
      const firstLineTitle = lines[0].substring(1).trim();
      if (title.includes(firstLineTitle) || firstLineTitle.includes(title)) {
        return lines.slice(1).join('\n').trim();
      }
    }
    return markdownContent;
  };

  const handleDownloadPdf = () => {
    if (analysisReportRef.current && blogPost) {
      const element = analysisReportRef.current;
      const opt = {
        margin: 1,
        filename: `SentiVibe_BlogPost_${blogPost.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as 'portrait' }
      };

      const tempDiv = document.createElement('div');
      tempDiv.className = 'pdf-light-mode'; // Apply the new class
      tempDiv.style.position = 'relative';
      tempDiv.style.width = element.offsetWidth + 'px';
      tempDiv.style.height = element.offsetHeight + 'px';
      tempDiv.innerHTML = element.innerHTML;

      // Add header
      const header = document.createElement('div');
      header.style.textAlign = 'center';
      header.style.marginBottom = '1rem';
      header.style.paddingBottom = '0.5rem';
      header.style.borderBottom = '1px solid #ccc';
      header.innerHTML = `
        <img src="/logo.svg" alt="SentiVibe Logo" style="height: 30px; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <span style="font-weight: bold; font-size: 1.2em; vertical-align: middle;">SentiVibe</span>
        <p style="font-size: 0.8em; color: #555; margin-top: 5px;">YouTube Audience Insight Report</p>
      `;
      tempDiv.prepend(header);

      // Add footer
      const footer = document.createElement('div');
      footer.style.textAlign = 'center';
      footer.style.marginTop = '1rem';
      footer.style.paddingTop = '0.5rem';
      footer.style.borderTop = '1px solid #ccc';
      footer.style.fontSize = '0.8em';
      footer.style.color = '#555';
      footer.innerHTML = `
        <p>&copy; ${new Date().getFullYear()} SentiVibe. All rights reserved.</p>
        <p>Analyses generated by AI based on public YouTube comments.</p>
      `;
      tempDiv.appendChild(footer);

      if (!isPaidTier) {
        const watermark = document.createElement('div');
        watermark.style.position = 'absolute';
        watermark.style.top = '50%';
        watermark.style.left = '50%';
        watermark.style.transform = 'translate(-50%, -50%) rotate(-45deg)';
        watermark.style.fontSize = '48px';
        watermark.style.fontWeight = 'bold';
        watermark.style.color = 'rgba(0, 0, 0, 0.1)';
        watermark.style.zIndex = '1000';
        watermark.style.pointerEvents = 'none';
        watermark.textContent = 'SentiVibe - Free Tier';
        tempDiv.appendChild(watermark);
      }

      document.body.appendChild(tempDiv);

      html2pdf().from(tempDiv).set(opt).save().then(() => {
        document.body.removeChild(tempDiv);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-red-500">
        Error loading blog post: {error.message}
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center text-gray-500 dark:text-gray-400">
        <h2 className="text-2xl font-bold mb-4">Blog Post Not Found</h2>
        <p>The analysis you are looking for does not exist or has been removed.</p>
        <Link to="/library" className="text-blue-500 hover:underline mt-4 flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Analysis Library
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 flex-wrap">
        <Link to="/library" className="text-blue-500 hover:underline flex items-center w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Analysis Library
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/analyze-video">Analyze a New Video</Link>
          </Button>
          <Button
            onClick={() => navigate('/analyze-video', { state: { blogPost: blogPost, openChat: false } })}
            className="flex items-center gap-2"
          >
            <BarChart className="h-4 w-4" /> Go to Video Analysis
          </Button>
          <Button
            onClick={() => navigate('/analyze-video', { state: { blogPost: blogPost, openChat: false, forceReanalyze: true } })}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Analysis
          </Button>
          <Button
            onClick={() => setIsChatDialogOpen(true)} // Directly set state to open chat
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" /> Chat with AI
          </Button>
          <Button onClick={handleDownloadPdf} className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Download Report PDF
          </Button>
        </div>
      </div>
      <Card ref={analysisReportRef} className="mb-6">
        <CardHeader>
          {blogPost.thumbnail_url && (
            <img
              src={blogPost.thumbnail_url}
              alt={`Thumbnail for ${blogPost.title}`}
              className="w-full h-auto rounded-md mb-4 aspect-video object-cover"
            />
          )}
          <CardTitle className="text-3xl font-bold mb-2">{blogPost.title}</CardTitle>
          {blogPost.creator_name && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">By: {blogPost.creator_name}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Published on: {new Date(blogPost.published_at).toLocaleDateString()}
            {blogPost.updated_at && blogPost.updated_at !== blogPost.published_at && (
              <span> (Last updated: {new Date(blogPost.updated_at).toLocaleDateString()})</span>
            )}
          </p>
          {blogPost.last_reanalyzed_at && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Last Full Analysis: {new Date(blogPost.last_reanalyzed_at).toLocaleDateString()}
            </p>
          )}
          {blogPost.original_video_link && (
            <a
              href={blogPost.original_video_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center mt-2 w-fit"
            >
              <Youtube className="h-4 w-4 mr-2" /> View Original Video
            </a>
          )}
          {blogPost.meta_description && (
            <p className="text-md text-gray-700 dark:text-gray-300 mt-4 italic">
              {blogPost.meta_description}
            </p>
          )}
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {contentWithoutDuplicateTitle(blogPost.content, blogPost.title)}
          </ReactMarkdown>
        </CardContent>
        {blogPost.keywords && blogPost.keywords.length > 0 && (
          <CardContent className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {blogPost.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
        {blogPost.custom_qa_results && blogPost.custom_qa_results.length > 0 && (
          <CardContent className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Questions about this video asked by the community</h3>
            <div className="space-y-4">
              {blogPost.custom_qa_results.map((qa, index) => (
                <div key={index} className="border p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Q{index + 1}: {String(qa.question)}</p>
                  <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {qa.answer || "No answer generated."}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
        {blogPost.ai_analysis_json?.raw_comments_for_chat && blogPost.ai_analysis_json.raw_comments_for_chat.length > 0 && (
          <CardContent className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Raw Comments (First 10, by popularity)</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {blogPost.ai_analysis_json.raw_comments_for_chat.slice(0, 10).map((comment, index) => (
                <li key={index}>{comment}</li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
      <UpgradeCTA /> {/* Add the UpgradeCTA here */}
      {blogPost && (
        <VideoChatDialog
          isOpen={isChatDialogOpen}
          onOpenChange={setIsChatDialogOpen}
          initialBlogPost={blogPost}
        />
      )}
    </div>
  );
};

export default BlogPostDetail;