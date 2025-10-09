# SentiVibe Product Documentation

## 1. Product Overview
**SentiVibe** is an innovative web application designed to empower users with deep insights into public sentiment surrounding YouTube videos. By leveraging advanced AI, SentiVibe analyzes video comments to extract overall sentiment, emotional tones, key themes, and actionable summary insights. It's an essential tool for content creators, marketers, researchers, and anyone interested in understanding audience reactions to online video content.

**Mission:** To unlock the true sentiment and key discussions within YouTube comments, providing clear, AI-driven analysis that helps users understand their audience better.

## 2. Key Features

### 2.1. Secure User Authentication
*   **Personalized Experience:** Users can securely sign up and log in to access SentiVibe's features.
*   **Protected Content:** Analysis tools and reports are protected, ensuring only authenticated users can access them.
*   **Profile Management (Future-ready):** A user profile system is in place, ready for future enhancements like saving analysis history or personalized dashboards.

### 2.2. AI-Powered YouTube Video Analysis
*   **Effortless Input:** Simply paste any public YouTube video link into the application.
*   **Comprehensive Data Extraction:** SentiVibe automatically retrieves:
    *   **Video Title & Description:** For context.
    *   **Video Thumbnail:** Visual identification of the video.
    *   **Video Tags:** To understand the video's categorization and keywords.
    *   **Comments:** Fetches up to 100 comments for analysis.
*   **Intelligent Comment Filtering:** Requires a minimum of 50 comments to ensure a robust and meaningful AI analysis, preventing skewed results from low engagement videos.
*   **Weighted Sentiment Analysis:** The AI model is specifically instructed to give **significantly more weight to comments with higher "Likes" counts**. This ensures that the analysis reflects the sentiment of the most popular and influential opinions within the comment section.
*   **Detailed AI Insights:** The analysis provides:
    *   **Overall Sentiment:** A general classification (e.g., positive, negative, neutral).
    *   **Emotional Tones:** Identifies prevalent emotions (e.g., joy, anger, surprise, sadness).
    *   **Key Themes:** Highlights the main topics and recurring subjects discussed in the comments.
    *   **Summary Insights:** A concise, human-readable summary of the AI's findings, explaining the overall sentiment and key takeaways, with an emphasis on how popular comments influenced the assessment.

### 2.3. Interactive & Clear Analysis Reports
*   **Structured Display:** Analysis results are presented in a clean, easy-to-read card format.
*   **Visual Cues:** Uses badges to highlight sentiment, emotional tones, and key themes for quick comprehension.
*   **Raw Comment Snippets:** Displays the top 10 most popular comments (by like count) to give users a direct glimpse into the source data.
*   **Loading Indicators:** Provides clear visual feedback during the analysis process with skeleton loaders and spinning icons.
*   **Error Handling:** Displays user-friendly alerts for any issues encountered during analysis (e.g., invalid link, insufficient comments, API errors).

### 2.4. Professional PDF Report Export
*   **One-Click Download:** Users can easily download the complete analysis report as a beautifully formatted PDF document.
*   **Shareable & Archivable:** Ideal for sharing insights with teams, clients, or for archiving research findings.
*   **Customizable Filename:** The PDF filename is automatically generated based on the video title for easy organization.

### 2.5. Responsive & Modern User Interface
*   **Intuitive Design:** A clean, minimalist interface built with Shadcn/ui components and Tailwind CSS.
*   **Mobile-Friendly:** The application is designed to be fully responsive, providing an optimal experience across desktops, tablets, and mobile devices.
*   **Consistent Branding:** Features a sleek black and white theme with the elegant "Arimo" font and a prominent "SentiVibe" word logo, ensuring a professional and unified brand presence.

### 2.6. Future-Ready Chat Interface
*   A robust chat interface component has been developed and integrated into the codebase, ready to be activated for future conversational AI features, allowing users to interact directly with the AI about their analysis results.

## 3. How to Use SentiVibe

1.  **Access the Application:** Open SentiVibe in your web browser.
2.  **Sign Up / Log In:** If you're a new user, sign up for an account. Otherwise, log in with your existing credentials.
3.  **Navigate to Analyze Video:** From the homepage, click the "Start Analyzing a Video" button or navigate to the `/analyze` route.
4.  **Paste YouTube Link:** In the input field, paste the full URL of the YouTube video you wish to analyze.
5.  **Initiate Analysis:** Click the "Analyze Comments" button. The application will display a loading state while the AI processes the data.
6.  **Review Report:** Once the analysis is complete, a detailed report will appear, showing:
    *   Video details (title, description, thumbnail, tags).
    *   Overall sentiment.
    *   Emotional tones.
    *   Key themes.
    *   A summary of insights.
    *   The top 10 most popular raw comments.
7.  **Download PDF Report:** To save or share the report, click the "Download Report PDF" button. A PDF file will be generated and downloaded to your device.

## 4. Value Proposition
SentiVibe provides immense value by:
*   **Saving Time:** Automates the tedious process of manually sifting through thousands of comments.
*   **Gaining Deeper Understanding:** Offers AI-driven insights that go beyond surface-level reading.
*   **Informing Strategy:** Helps content creators understand what resonates with their audience, marketers to gauge campaign reception, and researchers to analyze public opinion.
*   **Providing Actionable Data:** The weighted analysis ensures that the most impactful opinions are prioritized.
*   **Professional Reporting:** Enables easy sharing of findings with high-quality PDF reports.

SentiVibe is continuously evolving, with a strong foundation laid for future enhancements to further enrich your video analysis experience.