-- Migration: Add embedding_status and embedding_error columns to documents table
-- Run this in Supabase SQL Editor if you already have the documents table created.

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS embedding_status text DEFAULT 'pending'
    CHECK (embedding_status IN ('pending', 'processing', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS embedding_error text;

-- Drop the old function first (required because we're changing the return type)
DROP FUNCTION IF EXISTS public.match_document_embeddings(vector, int);

-- Recreate with document_title in the return type
CREATE OR REPLACE FUNCTION public.match_document_embeddings(
  query_embedding vector(1536),
  match_count int DEFAULT 10
)
RETURNS TABLE (id uuid, document_id uuid, content text, chunk_index int, similarity float, document_title text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.document_id,
    de.content,
    de.chunk_index,
    1 - (de.embedding <=> query_embedding) AS similarity,
    d.title AS document_title
  FROM public.document_embeddings de
  JOIN public.documents d ON d.id = de.document_id
  WHERE de.embedding is not null
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
