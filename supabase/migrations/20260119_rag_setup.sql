-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create the wedding_knowledge table
create table if not exists wedding_knowledge (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb,
  embedding vector(768) -- using 768 dimensions for text-embedding-004
);

-- Create HNSW index for faster similarity search
create index on wedding_knowledge using hnsw (embedding vector_cosine_ops);

-- Function to match relevant documents
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    wedding_knowledge.id,
    wedding_knowledge.content,
    wedding_knowledge.metadata,
    1 - (wedding_knowledge.embedding <=> query_embedding) as similarity
  from wedding_knowledge
  where 1 - (wedding_knowledge.embedding <=> query_embedding) > match_threshold
  order by wedding_knowledge.embedding <=> query_embedding
  limit match_count;
end;
$$;
