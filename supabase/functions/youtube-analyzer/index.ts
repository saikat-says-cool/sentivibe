// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to get multiple API keys from environment variables
function getApiKeys(baseName: string): string[] {
  const keys: string[] = [];
  let i = 1;
  while (true) {
    // @ts-ignore
    const key = Deno.env.get(`${baseName}_${i}`);
    if (key) {
      keys.push(key);
      i++;
    } else {
      break;
    }
  }
  // Fallback to single key if numbered keys are not found
  if (keys.length === 0) {
    // @ts-ignore
    const singleKey = Deno.env.get(baseName);
    if (singleKey) {
      keys.push(singleKey);
    }
  }
  return keys;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // @ts-ignore
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication (optional, but good practice for protected functions)
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { videoLink, customQuestions } = await req.json(); // Destructure customQuestions
    if (!videoLink) {
      return new Response(JSON.stringify({ error: 'Video link is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Extract video ID from the link
    const videoIdMatch = videoLink.match(/(?:v=|\/videos\/|embed\/|youtu.be\/|\/v\/|\/e\/|watch\?v=|&v=)([^#&?]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return new Response(JSON.stringify({ error: 'Invalid YouTube video link' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Access the Longcat AI API Keys from Supabase Secrets (needed for both new and cached QA)
    const longcatApiKeys = getApiKeys('LONGCAT_AI_API_KEY');
    if (longcatApiKeys.length === 0) {
      return new Response(JSON.stringify({ error: 'Longcat AI API key(s) not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    const longcatApiUrl = "https://api.longcat.chat/openai/v1/chat/completions";

    // --- Caching Logic: Check for existing analysis ---
    const { data: existingBlogPost, error: fetchError } = await supabaseClient
      .from('blog_posts')
      .select('*')
      .eq('video_id', videoId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Supabase fetch existing blog post error:', fetchError);
      return new Response(JSON.stringify({ error: 'Failed to check for existing analysis', details: fetchError }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let videoTitle: string;
    let videoDescription: string;
    let videoThumbnailUrl: string;
    let videoTags: string[];
    let creatorName: string;
    let videoSubtitles: string = '';
    let allFetchedCommentsText: string[];
    let aiAnalysis: any;
    let blogPostSlug: string;
    let originalVideoLink: string;
    let combinedQaResults: { question: string; wordCount: number; answer: string }[] = [];

    if (existingBlogPost) {
      console.log(`Reusing existing analysis for video ID: ${videoId}`);
      videoTitle = existingBlogPost.title;
      videoDescription = existingBlogPost.meta_description;
      videoThumbnailUrl = existingBlogPost.thumbnail_url;
      videoTags = existingBlogPost.keywords || [];
      creatorName = existingBlogPost.creator_name;
      allFetchedCommentsText = existingBlogPost.ai_analysis_json?.raw_comments_for_chat || [];
      aiAnalysis = existingBlogPost.ai_analysis_json;
      blogPostSlug = existingBlogPost.slug;
      originalVideoLink = existingBlogPost.original_video_link;
      combinedQaResults = existingBlogPost.custom_qa_results || [];

      // --- Process NEW Custom Questions for an existing analysis ---
      if (customQuestions && customQuestions.length > 0) {
        for (const qa of customQuestions) {
          if (qa.question.trim() === "") continue; // Skip empty questions

          const customQuestionPrompt = `Based on the following YouTube video analysis, answer the user's custom question.
          
          Video Title: "${videoTitle}"
          Video Description: "${videoDescription}"
          Video Creator: "${creatorName}"
          Video Tags: ${videoTags.length > 0 ? videoTags.join(', ') : 'None'}
          Overall Sentiment: ${aiAnalysis.overall_sentiment}
          Emotional Tones: ${aiAnalysis.emotional_tones.join(', ')}
          Key Themes: ${aiAnalysis.key_themes.join(', ')}
          Summary Insights: ${aiAnalysis.summary_insights}
          Top Comments (for reference):
          ${allFetchedCommentsText.slice(0, 10).map((comment: string, index: number) => `- ${comment}`).join('\n')}

          User's Question: "${qa.question}"
          
          Please provide an answer that is approximately ${qa.wordCount} words long. Ensure the answer is complete and directly addresses the question using the provided context.
          `;

          let customQaResponse;
          for (const currentLongcatApiKey of longcatApiKeys) {
            customQaResponse = await fetch(longcatApiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${currentLongcatApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: "LongCat-Flash-Chat",
                messages: [
                  { "role": "system", "content": "You are an expert AI assistant providing concise and accurate answers based on provided context. Adhere strictly to the requested word count." },
                  { "role": "user", "content": customQuestionPrompt }
                ],
                max_tokens: Math.ceil(qa.wordCount * 1.5), // Allow some buffer for token count
                temperature: 0.5,
                stream: false,
              }),
            });

            if (customQaResponse.ok) {
              break;
            } else if (customQaResponse.status === 429) {
              console.warn(`Longcat AI API key hit rate limit for custom QA. Trying next key.`);
              continue;
            }
            break;
          }

          if (!customQaResponse || !customQaResponse.ok) {
            const errorData = customQaResponse ? await customQaResponse.json() : { message: "No response from Longcat AI for custom question" };
            console.error('Longcat AI Custom QA API error:', errorData);
            combinedQaResults.push({ ...qa, answer: `Error generating answer: ${errorData.message || 'Unknown error'}` });
          } else {
            const customQaData = await customQaResponse.json();
            const answerContent = customQaData.choices[0].message.content;
            combinedQaResults.push({ ...qa, answer: answerContent });
          }
        }

        // Update the existing blog post with the new combined custom QA results
        const { error: updateError } = await supabaseClient
          .from('blog_posts')
          .update({ custom_qa_results: combinedQaResults, updated_at: new Date().toISOString() })
          .eq('id', existingBlogPost.id);

        if (updateError) {
          console.error('Supabase Blog Post Update Error for custom QA:', updateError);
          return new Response(JSON.stringify({ error: 'Failed to update blog post with new custom questions', details: updateError }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
      }

      // Return existing data, potentially updated with new custom QA results
      return new Response(JSON.stringify({
        message: `Reusing existing analysis for video ID: ${videoId}`,
        videoTitle: videoTitle,
        videoDescription: videoDescription,
        videoThumbnailUrl: videoThumbnailUrl,
        videoTags: videoTags,
        creatorName: creatorName,
        videoSubtitles: videoSubtitles,
        comments: allFetchedCommentsText,
        aiAnalysis: aiAnalysis,
        blogPostSlug: blogPostSlug,
        originalVideoLink: originalVideoLink,
        customQaResults: combinedQaResults, // Return the combined results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } else {
      // --- If no existing analysis, proceed with new analysis ---

      // Access the YouTube API Keys from Supabase Secrets
      const youtubeApiKeys = getApiKeys('YOUTUBE_API_KEY');
      if (youtubeApiKeys.length === 0) {
        return new Response(JSON.stringify({ error: 'YouTube API key(s) not configured' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      // --- Fetch Video Details (Title, Description, Thumbnails, Tags, Channel Title) ---
      let videoDetailsResponse;
      for (const currentYoutubeApiKey of youtubeApiKeys) {
        const videoDetailsApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${currentYoutubeApiKey}`;
        videoDetailsResponse = await fetch(videoDetailsApiUrl);
        if (videoDetailsResponse.ok) {
          break; // Key worked, proceed
        } else if (videoDetailsResponse.status === 403 || videoDetailsResponse.status === 429) {
          const errorData = await videoDetailsResponse.json();
          if (errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
            console.warn(`YouTube API key ${currentYoutubeApiKey} hit quota limit for video details. Trying next key.`);
            continue; // Try next key
          }
        }
        break; // For other errors, or if not quota exceeded, break and report the error
      }

      if (!videoDetailsResponse || !videoDetailsResponse.ok) {
        const errorData = videoDetailsResponse ? await videoDetailsResponse.json() : { message: "No response from YouTube API" };
        console.error('YouTube Video Details API error:', errorData);
        return new Response(JSON.stringify({ error: 'Failed to fetch video details from YouTube API', details: errorData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: videoDetailsResponse?.status || 500,
        });
      }
      const videoDetailsData = await videoDetailsResponse.json();
      const videoSnippet = videoDetailsData.items?.[0]?.snippet;

      videoTitle = videoSnippet?.title || 'Unknown Title';
      videoDescription = videoSnippet?.description || 'No description available.';
      videoThumbnailUrl = videoSnippet?.thumbnails?.high?.url || videoSnippet?.thumbnails?.medium?.url || '';
      videoTags = videoSnippet?.tags || [];
      creatorName = videoSnippet?.channelTitle || 'Unknown Creator'; // Extract creator name

      // --- Fetch Comments ---
      let youtubeCommentsResponse;
      for (const currentYoutubeApiKey of youtubeApiKeys) { // Reuse youtubeApiKeys for comments
        const youtubeCommentsApiUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${currentYoutubeApiKey}&maxResults=100`;
        youtubeCommentsResponse = await fetch(youtubeCommentsApiUrl);
        if (youtubeCommentsResponse.ok) {
          break; // Key worked, proceed
        } else if (youtubeCommentsResponse.status === 403 || youtubeCommentsResponse.status === 429) {
          const errorData = await youtubeCommentsResponse.json();
          if (errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
            console.warn(`YouTube API key ${currentYoutubeApiKey} hit quota limit for comments. Trying next key.`);
            continue; // Try next key
          }
        }
        break;
      }

      if (!youtubeCommentsResponse || !youtubeCommentsResponse.ok) {
        const errorData = youtubeCommentsResponse ? await youtubeCommentsResponse.json() : { message: "No response from YouTube Comments API" };
        console.error('YouTube Comments API error:', errorData);
        return new Response(JSON.stringify({ error: 'Failed to fetch comments from YouTube API', details: errorData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: youtubeCommentsResponse?.status || 500,
        });
      }

      const youtubeCommentsData = await youtubeCommentsResponse.json();
      let commentsWithLikes = youtubeCommentsData.items
        ? youtubeCommentsData.items.map((item: any) => ({
            text: item.snippet.topLevelComment.snippet.textOriginal,
            likeCount: item.snippet.topLevelComment.snippet.likeCount,
          }))
        : [];

      // Enforce 50-comment minimum
      if (commentsWithLikes.length < 50) {
        return new Response(JSON.stringify({ error: `Video must have at least 50 comments to proceed with analysis. This video has ${commentsWithLikes.length} comments.` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Sort comments by likeCount in descending order for consistent processing and display
      commentsWithLikes.sort((a: any, b: any) => b.likeCount - a.likeCount);

      // Prepare comments for AI, including their like counts
      const formattedCommentsForAI = commentsWithLikes.map((comment: any) => `(Likes: ${comment.likeCount}) ${comment.text}`);
      allFetchedCommentsText = commentsWithLikes.map((comment: any) => comment.text); // Keep all fetched comments text for display

      // Prepare prompt for Longcat AI, instructing it to consider like counts as weights and subtitles as additional context
      let longcatPrompt = `Analyze the following YouTube video content. When determining the overall sentiment, emotional tones, key themes, and summary insights, please give significantly more weight and importance to comments that have a higher 'Likes' count. This should reflect a weighted average sentiment where more popular comments have a greater influence on the final analysis.
      
      Video Title: "${videoTitle}"
      Video Description: "${videoDescription}"
      Video Creator: "${creatorName}"
      Video Tags: ${videoTags.length > 0 ? videoTags.join(', ') : 'None'}

      Respond in a structured JSON format.

      Example JSON format:
      {
        "overall_sentiment": "positive",
        "emotional_tones": ["joy", "excitement"],
        "key_themes": ["product review", "user experience"],
        "summary_insights": "The comments are overwhelmingly positive, highlighting the product's ease of use and innovative features, with popular comments strongly influencing this assessment. The video's content, as described in the subtitles, aligns with these sentiments."
      }

      YouTube Comments:\n\n${formattedCommentsForAI.join('\n')}`;

      longcatPrompt += `\n\nNote: Subtitles were not available for this video. Please base your analysis solely on the comments, video title, description, tags, and creator name.`;


      let longcatResponse;
      for (const currentLongcatApiKey of longcatApiKeys) {
        longcatResponse = await fetch(longcatApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentLongcatApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "LongCat-Flash-Chat",
            messages: [
              { "role": "system", "content": "You are an expert sentiment analysis AI. Your task is to analyze a YouTube video's comments, providing a concise summary of sentiment, emotional tone, key themes, and overall insights. Prioritize popular comments and use video title, description, tags, and creator name for broader context. Respond in a structured JSON format." },
              { "role": "user", "content": longcatPrompt }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            response_format: { type: "json_object" } // Request JSON output
          }),
        });

        if (longcatResponse.ok) {
          break;
        } else if (longcatResponse.status === 429) {
          console.warn(`Longcat AI API key hit quota limit for analysis. Trying next key.`);
          continue;
        }
        break;
      }

      if (!longcatResponse || !longcatResponse.ok) {
        const errorData = longcatResponse ? await longcatResponse.json() : { message: "No response from Longcat AI" };
        console.error('Longcat AI API error:', errorData);
        return new Response(JSON.stringify({ error: 'Failed to get analysis from Longcat AI', details: errorData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: longcatResponse?.status || 500,
        });
      }

      const longcatData = await longcatResponse.json();
      let aiContent = longcatData.choices[0].message.content;

      // Remove markdown code block fences if present
      if (aiContent.startsWith('```json') && aiContent.endsWith('```')) {
        aiContent = aiContent.substring(7, aiContent.length - 3).trim();
      }

      aiAnalysis = JSON.parse(aiContent);

      // --- Generate SEO-optimized blog post ---
      const blogPostPrompt = `Based on the following YouTube video analysis, generate a comprehensive, SEO-optimized blog post.
      
      Video Title: "${videoTitle}"
      Video Description: "${videoDescription}"
      Video Creator: "${creatorName}"
      Video Tags: ${videoTags.length > 0 ? videoTags.join(', ') : 'None'}
      Overall Sentiment: ${aiAnalysis.overall_sentiment}
      Emotional Tones: ${aiAnalysis.emotional_tones.join(', ')}
      Key Themes: ${aiAnalysis.key_themes.join(', ')}
      Summary Insights: ${aiAnalysis.summary_insights}
      Top Comments (for reference, do not list all):
      ${allFetchedCommentsText.slice(0, 5).map((comment: string, index: number) => `- ${comment}`).join('\n')}

      The blog post should:
      1. Have a compelling, SEO-optimized title (max 70 characters).
      2. Generate a URL-friendly slug from the title (lowercase, hyphen-separated, **without any leading or trailing slashes or path segments**).
      3. Include a concise meta description (max 160 characters).
      4. List 5-10 relevant keywords as an array.
      5. Be structured with an H1 (the title), H2s for sections, and H3s for sub-sections.
      6. Be at least 500 words long.
      7. Discuss the public sentiment, emotional tones, and key themes of the video.
      8. Incorporate insights from the summary and reference the top comments naturally.
      9. Be written in Markdown format.

      Respond in a structured JSON format:
      {
        "title": "SEO Optimized Blog Post Title",
        "slug": "seo-optimized-blog-post-title", // Example: "my-awesome-blog-post" NOT "/blog/my-awesome-blog-post"
        "meta_description": "A concise meta description for search engines.",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "content": "# H1 Title\\n\\nIntroduction...\\n\\n## H2 Section\\n\\nContent...\\n\\n### H3 Sub-section\\n\\nMore content..."
      }
      `;

      let blogPostResponse;
      for (const currentLongcatApiKey of longcatApiKeys) { // Reuse longcatApiKeys for blog post generation
        blogPostResponse = await fetch(longcatApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentLongcatApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "LongCat-Flash-Chat", // Or a more capable model if available
            messages: [
              { "role": "system", "content": "You are an expert SEO content writer. Your task is to generate a detailed, SEO-optimized blog post in Markdown format based on provided video analysis data. Ensure the output is a valid JSON object." },
              { "role": "user", "content": blogPostPrompt }
            ],
            max_tokens: 2000, // Increased tokens for a longer blog post
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });

        if (blogPostResponse.ok) {
          break;
        } else if (blogPostResponse.status === 429) {
          console.warn(`Longcat AI API key hit rate limit for blog post generation. Trying next key.`);
          continue;
        }
        break;
      }

      if (!blogPostResponse || !blogPostResponse.ok) {
        const errorData = blogPostResponse ? await blogPostResponse.json() : { message: "No response from Longcat AI for blog post" };
        console.error('Longcat AI Blog Post API error:', errorData);
        return new Response(JSON.stringify({ error: 'Failed to generate blog post from Longcat AI', details: errorData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: blogPostResponse?.status || 500,
        });
      }

      const blogPostData = await blogPostResponse.json();
      let blogPostContent = blogPostData.choices[0].message.content;

      if (blogPostContent.startsWith('```json') && blogPostContent.endsWith('```')) {
        blogPostContent = blogPostContent.substring(7, blogPostContent.length - 3).trim();
      }
      const generatedBlogPost = JSON.parse(blogPostContent);

      // Log the generated slug for debugging
      console.log("Generated Blog Post Slug:", generatedBlogPost.slug);
      blogPostSlug = generatedBlogPost.slug;
      originalVideoLink = videoLink; // Store the original video link

      // --- Process Custom Questions for a NEW analysis ---
      if (customQuestions && customQuestions.length > 0) {
        for (const qa of customQuestions) {
          if (qa.question.trim() === "") continue; // Skip empty questions

          const customQuestionPrompt = `Based on the following YouTube video analysis, answer the user's custom question.
          
          Video Title: "${videoTitle}"
          Video Description: "${videoDescription}"
          Video Creator: "${creatorName}"
          Video Tags: ${videoTags.length > 0 ? videoTags.join(', ') : 'None'}
          Overall Sentiment: ${aiAnalysis.overall_sentiment}
          Emotional Tones: ${aiAnalysis.emotional_tones.join(', ')}
          Key Themes: ${aiAnalysis.key_themes.join(', ')}
          Summary Insights: ${aiAnalysis.summary_insights}
          Top Comments (for reference):
          ${allFetchedCommentsText.slice(0, 10).map((comment: string, index: number) => `- ${comment}`).join('\n')}

          User's Question: "${qa.question}"
          
          Please provide an answer that is approximately ${qa.wordCount} words long. Ensure the answer is complete and directly addresses the question using the provided context.
          `;

          let customQaResponse;
          for (const currentLongcatApiKey of longcatApiKeys) {
            customQaResponse = await fetch(longcatApiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${currentLongcatApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: "LongCat-Flash-Chat",
                messages: [
                  { "role": "system", "content": "You are an expert AI assistant providing concise and accurate answers based on provided context. Adhere strictly to the requested word count." },
                  { "role": "user", "content": customQuestionPrompt }
                ],
                max_tokens: Math.ceil(qa.wordCount * 1.5), // Allow some buffer for token count
                temperature: 0.5,
                stream: false,
              }),
            });

            if (customQaResponse.ok) {
              break;
            } else if (customQaResponse.status === 429) {
              console.warn(`Longcat AI API key hit rate limit for custom QA. Trying next key.`);
              continue;
            }
            break;
          }

          if (!customQaResponse || !customQaResponse.ok) {
            const errorData = customQaResponse ? await customQaResponse.json() : { message: "No response from Longcat AI for custom question" };
            console.error('Longcat AI Custom QA API error:', errorData);
            combinedQaResults.push({ ...qa, answer: `Error generating answer: ${errorData.message || 'Unknown error'}` });
          } else {
            const customQaData = await customQaResponse.json();
            const answerContent = customQaData.choices[0].message.content;
            combinedQaResults.push({ ...qa, answer: answerContent });
          }
        }
      }

      // Insert the generated blog post into the database, including ai_analysis_json and custom_qa_results
      const { error: insertError } = await supabaseClient
        .from('blog_posts')
        .insert({
          video_id: videoId,
          title: generatedBlogPost.title,
          slug: generatedBlogPost.slug,
          meta_description: generatedBlogPost.meta_description,
          keywords: generatedBlogPost.keywords,
          content: generatedBlogPost.content,
          published_at: new Date().toISOString(), // Publish immediately
          author_id: user.id, // Link to the user who initiated the analysis
          creator_name: creatorName, // New column
          thumbnail_url: videoThumbnailUrl, // New column
          original_video_link: videoLink, // Store the original video link
          ai_analysis_json: { // Store the full AI analysis JSON AND top comments for chat context
            ...aiAnalysis,
            raw_comments_for_chat: allFetchedCommentsText.slice(0, 10), // Store top 10 comments
          },
          custom_qa_results: combinedQaResults, // Store custom QA results
        });

      if (insertError) {
        console.error('Supabase Blog Post Insert Error:', insertError);
        return new Response(JSON.stringify({ error: 'Failed to save blog post to database', details: insertError }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }


      return new Response(JSON.stringify({
        message: `Successfully fetched comments and performed AI analysis for video ID: ${videoId}`,
        videoTitle: videoTitle,
        videoDescription: videoDescription,
        videoThumbnailUrl: videoThumbnailUrl, // Include thumbnail URL
        videoTags: videoTags,               // Include video tags
        creatorName: creatorName,           // Include creator name
        videoSubtitles: videoSubtitles, // Will be an empty string for now
        comments: allFetchedCommentsText, // Return all fetched comments for initial display
        aiAnalysis: aiAnalysis,
        blogPostSlug: blogPostSlug, // Return the slug for linking
        originalVideoLink: originalVideoLink, // Return the original video link
        customQaResults: combinedQaResults, // Return custom QA results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('Edge Function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});