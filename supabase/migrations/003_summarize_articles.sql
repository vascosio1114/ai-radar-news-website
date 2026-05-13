-- Add summary content columns to articles table
ALTER TABLE articles ADD COLUMN summary_content TEXT;
ALTER TABLE articles ADD COLUMN summary_content_zh TEXT;