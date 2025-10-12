import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Removed unused lucide-react icons: BookOpen, GitCompare, Search, MessageSquarePlus, Youtube
// Removed unused Link import
import { useEffect } from 'react'; // Corrected import syntax
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Removed 'Link' import as it's only used in Markdown, not as a React component.

const LibrariesGuide = () => {
  useEffect(() => {
    document.title = "Explore Libraries & AI Copilots - SentiVibe Guide";
  }, []);

  const content = `
# Explore SentiVibe Libraries & AI Copilots

SentiVibe organizes all generated analyses and comparisons into searchable libraries, enhanced with AI Copilots to help you find information and discover new topics.

## 1. Video Analysis Library

*   **Access:** Navigate to the **"Analysis Library"** from the main navigation.
*   **Purpose:** This library contains all publicly available single video analysis blog posts generated on SentiVibe.
*   **Browsing:** Each entry displays the video's thumbnail, title, and creator name. Click on any card to view the full blog post and analysis details.
*   **Search Functionality:** Use the search bar to filter analyses by video title, creator name, meta description, or keywords.

### Using the Library Copilot (Unlimited Queries)

The **(Message icon with plus) Library Copilot** is your AI assistant for navigating the Analysis Library.

*   **Access:** Click the "Library Copilot" button on the "Analysis Library" page (and also on the "My Analyses" page).
*   **Semantic Search:** Ask natural language questions like "Find analyses about product reviews" or "Show me videos by Creator X." The AI will semantically search the available blog posts and list the most relevant ones.
*   **Clickable Links:** The Copilot provides direct, clickable Markdown links (e.g., \`[Title of Blog Post](/blog/slug-of-blog-post)\`) to the relevant blog posts, allowing you to jump straight to the content.
*   **Topic Recommendations:** If no relevant posts are found, or after presenting search results, the Copilot will proactively suggest **new, related analysis topics or video ideas** that you might find valuable to explore. This helps you discover new content opportunities.
*   **Unlimited Queries:** You can ask the Library Copilot as many questions as you like; there are no daily limits on its usage.

## 2. Multi-Video Comparison Library

*   **Access:** Navigate to the **"Comparison Library"** from the main navigation.
*   **Purpose:** This library contains all publicly available multi-video comparison blog posts generated on SentiVibe.
*   **Browsing:** Each entry displays a thumbnail (usually the first video's thumbnail with a "+X more" badge if multiple videos are included) and the comparison title. Click on any card to view the full multi-comparison blog post and details.
*   **Search Functionality:** Use the search bar to filter comparisons by comparison title, meta description, or keywords.

### Using the Comparison Library Copilot (Unlimited Queries)

The **(Compare icon) Comparison Copilot** is your AI assistant for navigating the Comparison Library.

*   **Access:** Click the "Comparison Copilot" button on the "Comparison Library" page.
*   **Semantic Search:** Ask natural language questions like "Find comparisons about tech gadgets" or "Show me comparisons involving Creator Y." The AI will semantically search the available comparison blog posts.
*   **Clickable Links:** The Copilot provides direct, clickable Markdown links (e.g., \`[Title of Comparison Blog Post](/multi-comparison/slug-of-comparison-blog-post)\`) to the relevant comparison blog posts.
*   **Topic Recommendations:** Similar to the Library Copilot, it will suggest **new, related comparative analysis topics or video pairs** to inspire your next comparison.
*   **Unlimited Queries:** You can ask the Comparison Library Copilot as many questions as you like; there are no daily limits on its usage.

## 3. My Analyses (Personal History)

*   **Access:** Navigate to **"My Analyses"** from the main navigation (available only when logged in).
*   **Purpose:** This page displays a personal, persistent history of all single video analyses and multi-video comparisons you have performed while authenticated.
*   **Availability:** This feature is available for **all authenticated users**, regardless of their subscription tier.
*   **Search & Copilot:** You can also use the search bar and the **(Message icon with plus) Library Copilot** on this page to efficiently find specific analyses within your personal collection.

By utilizing these libraries and AI Copilots, you can efficiently manage your insights, discover new content, and streamline your research workflow.
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