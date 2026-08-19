-- Migration 005: Add type and title columns to posts table
-- Run: psql -U postgres -d chafadia_noor -f server/migrations/005_posts_type.sql

ALTER TABLE posts ADD COLUMN IF NOT EXISTS type  VARCHAR(30)  DEFAULT 'General';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type, created_at DESC);
