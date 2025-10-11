-- Create the multi_comparisons table
CREATE TABLE public.multi_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  meta_description TEXT,
  keywords TEXT[],
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_compared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comparison_data_json JSONB, -- This will store the AI's structured multi-comparison insights
  custom_comparative_qa_results JSONB[], -- Custom Q&A for multi-comparisons
  overall_thumbnail_url TEXT -- A single representative thumbnail for the comparison, or a generated one
);

-- Enable RLS for multi_comparisons
ALTER TABLE public.multi_comparisons ENABLE ROW LEVEL SECURITY;

-- Policies for multi_comparisons
CREATE POLICY "Authenticated users can create multi-comparisons" ON public.multi_comparisons
FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authenticated users can view their own multi-comparisons" ON public.multi_comparisons
FOR SELECT TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can update their own multi-comparisons" ON public.multi_comparisons
FOR UPDATE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can delete their own multi-comparisons" ON public.multi_comparisons
FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Public read access for multi-comparisons" ON public.multi_comparisons
FOR SELECT USING (true); -- Allow public read access for now, similar to blog_posts

-- Create the multi_comparison_videos junction table
CREATE TABLE public.multi_comparison_videos (
  multi_comparison_id UUID REFERENCES public.multi_comparisons(id) ON DELETE CASCADE,
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  video_order INT NOT NULL, -- To maintain the order of videos in the comparison
  PRIMARY KEY (multi_comparison_id, blog_post_id)
);

-- Enable RLS for multi_comparison_videos
ALTER TABLE public.multi_comparison_videos ENABLE ROW LEVEL SECURITY;

-- Policies for multi_comparison_videos (linked to the parent multi_comparison's author)
CREATE POLICY "Users can manage videos in their multi-comparisons" ON public.multi_comparison_videos
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.multi_comparisons WHERE id = multi_comparison_id AND author_id = auth.uid())
);

CREATE POLICY "Public read access for multi-comparison videos" ON public.multi_comparison_videos
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.multi_comparisons WHERE id = multi_comparison_id AND true) -- Public read if parent comparison is public
);