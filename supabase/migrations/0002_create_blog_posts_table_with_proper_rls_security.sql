-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL, -- YouTube video ID
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  meta_description TEXT,
  keywords TEXT[], -- Array of keywords
  content TEXT NOT NULL, -- Blog post content in Markdown
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional: Link to user who created it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to insert their own blog posts
CREATE POLICY "Authenticated users can create blog posts" ON public.blog_posts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- Policy for authenticated users to update their own blog posts
CREATE POLICY "Authenticated users can update their own blog posts" ON public.blog_posts
FOR UPDATE TO authenticated USING (auth.uid() = author_id);

-- Policy for authenticated users to delete their own blog posts
CREATE POLICY "Authenticated users can delete their own blog posts" ON public.blog_posts
FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Policy for public read access to published blog posts
CREATE POLICY "Public read access for published blog posts" ON public.blog_posts
FOR SELECT USING (published_at IS NOT NULL);