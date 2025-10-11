CREATE POLICY "Allow anon users to insert blog posts with null author_id" ON public.blog_posts
FOR INSERT TO anon WITH CHECK (author_id IS NULL);