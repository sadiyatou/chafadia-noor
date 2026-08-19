-- Migration 006: Live / scheduled classes support
-- Run: psql -U postgres -d chafadia_noor -f server/migrations/006_live_courses.sql

ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_live       BOOLEAN   DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS scheduled_at  TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_courses_live ON courses(is_live, scheduled_at);
