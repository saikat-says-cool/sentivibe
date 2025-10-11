CREATE POLICY "Allow anon users to insert multi-comparisons with null author_id" ON public.multi_comparisons
FOR INSERT TO anon WITH CHECK (author_id IS NULL);