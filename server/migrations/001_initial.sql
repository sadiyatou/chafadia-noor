-- Chafadia Noor - Initial Database Schema
-- Run: psql -U postgres -d chafadia_noor -f server/migrations/001_initial.sql

-- =============================================
-- USERS
-- =============================================

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  uid           UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(50) DEFAULT '',
  photo_url     TEXT DEFAULT '',
  bio           TEXT DEFAULT 'السلام عليكم ورحمة الله وبركاته',
  role          VARCHAR(50) DEFAULT 'user',
  verified      BOOLEAN DEFAULT FALSE,
  is_online     BOOLEAN DEFAULT FALSE,
  is_banned     BOOLEAN DEFAULT FALSE,
  last_seen     TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================
-- FOLLOWS
-- =============================================

CREATE TABLE IF NOT EXISTS follows (
  id           SERIAL PRIMARY KEY,
  follower_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- =============================================
-- POSTS (Community Feed)
-- =============================================

CREATE TABLE IF NOT EXISTS posts (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT DEFAULT '',
  media_url  TEXT DEFAULT '',
  media_type VARCHAR(50) DEFAULT '',
  likes      INTEGER DEFAULT 0,
  views      INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

CREATE TABLE IF NOT EXISTS post_likes (
  id         SERIAL PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
  id         SERIAL PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id);

-- =============================================
-- CHATS
-- =============================================

CREATE TABLE IF NOT EXISTS chats (
  id                SERIAL PRIMARY KEY,
  type              VARCHAR(20) NOT NULL DEFAULT 'private',
  name              VARCHAR(255) DEFAULT '',
  photo_url         TEXT DEFAULT '',
  last_message      TEXT DEFAULT '',
  last_message_type VARCHAR(50) DEFAULT '',
  last_message_time TIMESTAMPTZ DEFAULT NOW(),
  created_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_members (
  id         SERIAL PRIMARY KEY,
  chat_id    INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       VARCHAR(20) DEFAULT 'member',
  unread     INTEGER DEFAULT 0,
  muted      BOOLEAN DEFAULT FALSE,
  archived   BOOLEAN DEFAULT FALSE,
  pinned     BOOLEAN DEFAULT FALSE,
  blocked    BOOLEAN DEFAULT FALSE,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

CREATE INDEX idx_chat_members_user ON chat_members(user_id);
CREATE INDEX idx_chat_members_chat ON chat_members(chat_id);

-- =============================================
-- MESSAGES
-- =============================================

CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  chat_id     INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(50) DEFAULT 'text',
  text        TEXT DEFAULT '',
  media_url   TEXT DEFAULT '',
  file_name   VARCHAR(255) DEFAULT '',
  reply_to    INTEGER REFERENCES messages(id) ON DELETE SET NULL,
  pinned      BOOLEAN DEFAULT FALSE,
  edited      BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_chat ON messages(chat_id, created_at);

CREATE TABLE IF NOT EXISTS message_reads (
  id         SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

CREATE TABLE IF NOT EXISTS message_reactions (
  id         SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji      VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

CREATE TABLE IF NOT EXISTS message_deletions (
  id         SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(message_id, user_id)
);

-- =============================================
-- CALLS
-- =============================================

CREATE TABLE IF NOT EXISTS calls (
  id          SERIAL PRIMARY KEY,
  caller_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(20) DEFAULT 'audio',
  status      VARCHAR(20) DEFAULT 'ringing',
  started_at  TIMESTAMPTZ,
  ended_at    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calls_receiver ON calls(receiver_id, status);

CREATE TABLE IF NOT EXISTS scheduled_calls (
  id           SERIAL PRIMARY KEY,
  created_by   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  type         VARCHAR(20) DEFAULT 'audio',
  status       VARCHAR(20) DEFAULT 'pending',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheduled_call_participants (
  id                SERIAL PRIMARY KEY,
  scheduled_call_id INTEGER NOT NULL REFERENCES scheduled_calls(id) ON DELETE CASCADE,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(scheduled_call_id, user_id)
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  type        VARCHAR(50) NOT NULL,
  title       VARCHAR(255) DEFAULT '',
  body        TEXT DEFAULT '',
  data        JSONB DEFAULT '{}',
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

-- =============================================
-- LIVE STREAMS
-- =============================================

CREATE TABLE IF NOT EXISTS live_streams (
  id            SERIAL PRIMARY KEY,
  host_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  description   TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  status        VARCHAR(20) DEFAULT 'live',
  viewer_count  INTEGER DEFAULT 0,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  ended_at      TIMESTAMPTZ
);

CREATE INDEX idx_live_streams_status ON live_streams(status);

CREATE TABLE IF NOT EXISTS live_stream_comments (
  id         SERIAL PRIMARY KEY,
  stream_id  INTEGER NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stream_comments_stream ON live_stream_comments(stream_id, created_at);

-- =============================================
-- REPORTS (for admin moderation)
-- =============================================

CREATE TABLE IF NOT EXISTS reports (
  id              SERIAL PRIMARY KEY,
  reporter_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reported_post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
  reason          TEXT NOT NULL,
  status          VARCHAR(20) DEFAULT 'open',
  resolved_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status);
