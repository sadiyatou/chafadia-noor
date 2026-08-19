-- Migration 002: Fill gaps found by cross-referencing Firebase modules
-- Run: psql -U postgres -d chafadia_noor -f server/migrations/002_fill_gaps.sql

-- =============================================
-- USERS: add friends support and total_likes
-- (from auth.js: friends[], friendsCount, totalLikes)
-- =============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS total_likes INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS friendships (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);

-- =============================================
-- MESSAGES: add delivery tracking
-- (from messaging.js: deliveredTo[])
-- =============================================

CREATE TABLE IF NOT EXISTS message_deliveries (
  id           SERIAL PRIMARY KEY,
  message_id   INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- =============================================
-- CALLS: support group calls
-- (from firestore.js: participants array)
-- =============================================

ALTER TABLE calls ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS call_participants (
  id      SERIAL PRIMARY KEY,
  call_id INTEGER NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role    VARCHAR(20) DEFAULT 'participant',
  UNIQUE(call_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_call_participants_user ON call_participants(user_id);

-- =============================================
-- POSTS: add shares count
-- =============================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0;

-- =============================================
-- PASSWORD RESET TOKENS
-- (from auth.js: sendPasswordResetEmail — Firebase handles this
--  internally, but with our own backend we need a table)
-- =============================================

CREATE TABLE IF NOT EXISTS password_resets (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

-- =============================================
-- SESSIONS / REFRESH TOKENS
-- (optional: allows token invalidation on logout)
-- =============================================

CREATE TABLE IF NOT EXISTS sessions (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) UNIQUE NOT NULL,
  device_info   TEXT DEFAULT '',
  ip_address    VARCHAR(45) DEFAULT '',
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(refresh_token);

-- =============================================
-- BLOCKED USERS (global user-level blocking,
-- separate from per-chat blocking in chat_members)
-- =============================================

CREATE TABLE IF NOT EXISTS blocked_users (
  id         SERIAL PRIMARY KEY,
  blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);
