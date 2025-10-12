import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react'; // Corrected import syntax
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Removed 'Link' import as it's only used in Markdown, not as a React component.

const LibrariesGuide = () => {
  useEffect(() => {
    document.title = "Explore Libraries & AI Copilots - SentiVibe Guide";
  }, []);

  const content = `
# Explore SentiVibe Libraries & AI Copilots: Your Hub for Discovery and Management

SentiVibe meticulously organizes all generated video analyses and multi-video comparisons into intuitive, searchable libraries. These libraries are supercharged with AI Copilots, designed to help you effortlessly find specific information, manage your reports, and proactively discover new analysis topics.

## 1. Video Analysis Library: Your Public Repository of Insights

The Video Analysis Library is a central hub for all single video analysis blog posts generated on SentiVibe.

*   **Access:** Navigate to the **"Analysis Library"** from the main navigation menu.
*   **Purpose:** This library contains all publicly available single video analysis blog posts. It's a rich resource for exploring diverse content and understanding audience reactions across various topics.
*   **Browsing & Visual Context:** Each entry is presented as a card, displaying the video's thumbnail, title, and creator name for quick identification. Click on any card to view the full blog post and detailed analysis report.
*   **Search Functionality:** Utilize the powerful search bar at the top of the page to filter analyses. You can search by:
    *   **Video Title:** Find analyses of specific videos.
    *   **Creator Name:** Discover content analyzed from particular YouTube channels.
    *   **Meta Description:** Search based on the summary of the video's content.
    *   **Keywords:** Find analyses related to specific themes or topics.

### Using the Library Copilot (Unlimited Queries)

The **(Message icon with plus) Library Copilot** is your intelligent AI assistant specifically designed for navigating and extracting value from the Analysis Library.

*   **Access:** Click the "Library Copilot" button prominently displayed on the "Analysis Library" page (and also on the "My Analyses" page).
*   **Semantic Search:** Instead of keyword matching, the Copilot understands natural language queries. Ask questions like:
    *   "Find analyses about product reviews for new tech gadgets."
    *   "Show me videos by Creator X that discuss gaming mechanics."
    *   "What are some popular analyses related to environmental topics?"
    The AI will semantically search the available blog posts and identify the **1 to 3 most relevant ones**.
*   **Clickable Links for Instant Access:** For each recommended existing blog post, the Copilot provides a direct, clickable Markdown link (e.g., \`[Title of Blog Post](/blog/slug-of-blog-post)\`). This allows you to jump straight to the full content and detailed report with a single click.
*   **Proactive Topic Recommendations:** If no relevant posts are found for your specific query, or after presenting search results, the Copilot will proactively suggest **1 to 3 new, related analysis topics or video ideas** that you might find valuable to explore. This helps you discover new content opportunities and expand your research.
*   **Unlimited Queries:** You can ask the Library Copilot as many questions as you like; there are **no daily limits** on its usage, regardless of your subscription tier.

## 2. Multi-Video Comparison Library: Uncovering Comparative Trends

The Multi-Video Comparison Library is dedicated to housing all generated multi-video comparison blog posts.

*   **Access:** Navigate to the **"Comparison Library"** from the main navigation menu.
*   **Purpose:** This library contains all publicly available multi-video comparison blog posts. It's ideal for understanding how audience sentiment and themes differ or converge across multiple pieces of content.
*   **Browsing & Visual Context:** Each entry displays a representative thumbnail (typically the first video's thumbnail from the comparison, with a "+X more" badge if multiple videos are included) and the comparison title. Click on any card to view the full multi-comparison blog post and detailed comparative insights.
*   **Search Functionality:** Use the search bar to filter comparisons. You can search by:
    *   **Comparison Title:** Find specific comparative analyses.
    *   **Video Titles:** Search for comparisons that include videos with certain titles.
    *   **Meta Description:** Filter based on the summary of the comparison.
    *   **Keywords:** Find comparisons related to specific comparative themes.

### Using the Comparison Library Copilot (Unlimited Queries)

The **(Compare icon) Comparison Copilot** is your intelligent AI assistant for navigating and extracting value from the Comparison Library.

*   **Access:** Click the "Comparison Copilot" button on the "Comparison Library" page.
*   **Semantic Search:** Ask natural language questions like:
    *   "Find comparisons about tech gadgets released in the last year."
    *   "Show me comparisons involving Creator Y's different video styles."
    *   "What are some popular movie trailer comparisons?"
    The AI will semantically search the available comparison blog posts and list the most relevant ones.
*   **Clickable Links for Instant Access:** Similar to the Library Copilot, it provides direct, clickable Markdown links (e.g., \`[Title of Comparison Blog Post](/multi-comparison/slug-of-comparison-blog-post)\`) to the relevant comparison blog posts.
*   **Proactive Topic Recommendations:** The Copilot will suggest **1 to 3 new, related comparative analysis topics or video pairs** to inspire your next multi-video comparison, helping you identify new areas for comparative research.
*   **Unlimited Queries:** You can ask the Comparison Library Copilot as many questions as you like; there are **no daily limits** on its usage, regardless of your subscription tier.

## 3. My Analyses: Your Personal History & Management Hub

The "My Analyses" page provides a personalized view of your SentiVibe activity.

*   **Access:** Navigate to **"My Analyses"** from the main navigation menu. This page is accessible only when you are logged in.
*   **Purpose:** This page displays a personal, persistent history of **all single video analyses and multi-video comparisons you have performed while authenticated**. It's your private dashboard for managing your insights.
*   **Availability:** This feature is available for **all authenticated users**, regardless of their subscription tier.
*   **Search & Copilot Integration:** You can use the search bar and the **(Message icon with plus) Library Copilot** on this page to efficiently find specific analyses or comparisons within your personal collection.

## 4. Optimal Usage Tips for Libraries & AI Copilots

*   **Refine Your Search:** For both manual search and Copilot queries, start with broader terms and then narrow down if you get too many results.
*   **Explore Recommendations:** Pay attention to the Copilots' topic recommendations. They are designed to spark new ideas and guide you to valuable, unexplored areas.
*   **Cross-Reference:** Use the libraries to find related analyses or comparisons. For example, if you analyze a new video, check the library for similar content to gain broader context.
*   **Utilize "My Analyses":** Regularly review your personal history to track your research progress, revisit key insights, and identify patterns in your own content or competitor analysis.
*   **Share Insights:** Once you find a valuable analysis or comparison, use the PDF export feature to share it with your team or stakeholders.

By effectively utilizing SentiVibe's libraries and AI Copilots, you transform simple browsing into an intelligent discovery and management workflow, maximizing the value you extract from audience sentiment data.
  `;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Explore Libraries & AI Copilots</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
};

export default LibrariesGuide;