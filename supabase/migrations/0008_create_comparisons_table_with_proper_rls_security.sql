-- Create comparisons table
CREATE TABLE public.comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_a_blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  video_b_blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  meta_description TEXT,
  keywords TEXT[],
  content TEXT NOT NULL, -- Markdown content for the comparative blog post
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_compared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- New: Tracks last comparison
  comparison_data_json JSONB, -- Stores AI-generated comparative insights (sentiment delta, emotional tones, themes, weighted influence, keyword diff)
  custom_comparative_qa_results JSONB[] -- Stores AI-generated answers to custom comparative questions
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Authenticated users can create comparisons" ON public.comparisons
FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authenticated users can view their own comparisons" ON public.comparisons
FOR SELECT TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can update their own comparisons" ON public.comparisons
FOR UPDATE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can delete their own comparisons" ON public.comparisons
FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Policy for public read access to comparisons (if published, or if author_id is null for public comparisons)
CREATE POLICY "Public read access for comparisons" ON public.comparisons
FOR SELECT USING (true); -- For now, allow public read access to all comparisons. We can add a 'published' column later if needed.

-- Policy for unauthenticated users to create comparisons (if we allow public comparisons without login)
CREATE POLICY "Allow anon users to insert comparisons with null author_id" ON public.comparisons
FOR INSERT TO anon WITH CHECK (author_id IS NULL);