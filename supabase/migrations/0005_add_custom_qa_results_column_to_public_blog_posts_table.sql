ALTER TABLE public.blog_posts
ADD COLUMN custom_qa_results JSONB[];

-- Optional: If you want to ensure existing rows have an empty array instead of NULL
UPDATE public.blog_posts
SET custom_qa_results = ARRAY[]::JSONB[]
WHERE custom_qa_results IS NULL;