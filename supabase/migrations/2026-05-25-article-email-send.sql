-- Add email-optimized HTML content column to articles
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS email_content text;

-- Add content_mode to digest_presets
ALTER TABLE digest_presets
  ADD COLUMN IF NOT EXISTS content_mode text
  NOT NULL DEFAULT 'excerpt'
  CHECK (content_mode = ANY (ARRAY['excerpt', 'full_content']));

-- Comments for documentation
COMMENT ON COLUMN articles.email_content IS 'Email-optimized HTML body. Falls back to excerpt if NULL.';
COMMENT ON COLUMN digest_presets.content_mode IS 'excerpt = show excerpt only; full_content = use email_content.';