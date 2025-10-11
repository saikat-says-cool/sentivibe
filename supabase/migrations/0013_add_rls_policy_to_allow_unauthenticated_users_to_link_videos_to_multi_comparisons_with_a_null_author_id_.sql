CREATE POLICY "Allow anon to link videos to their multi-comparisons" ON public.multi_comparison_videos
FOR INSERT TO anon WITH CHECK (
  EXISTS (SELECT 1 FROM public.multi_comparisons WHERE id = multi_comparison_id AND author_id IS NULL)
);