-- Islamic Articles
CREATE TABLE IF NOT EXISTS articles (
  id           SERIAL       PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  category     VARCHAR(50)  NOT NULL DEFAULT 'general',
  excerpt      TEXT,
  content      TEXT         NOT NULL,
  cover_image  TEXT,
  author       VARCHAR(150),
  read_minutes INTEGER      DEFAULT 5,
  created_by   INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  is_published BOOLEAN      DEFAULT true,
  view_count   INTEGER      DEFAULT 0,
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- Islamic Essentials (pillars, beliefs, worship, character lessons)
CREATE TABLE IF NOT EXISTS essentials (
  id           SERIAL       PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  category     VARCHAR(50)  NOT NULL DEFAULT 'general',
  description  TEXT,
  content      TEXT,
  media_url    TEXT,
  media_type   VARCHAR(20)  CHECK (media_type IN ('text','video','audio','image')) DEFAULT 'text',
  order_index  INTEGER      DEFAULT 0,
  created_by   INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  is_published BOOLEAN      DEFAULT true,
  view_count   INTEGER      DEFAULT 0,
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- Admin-managed offline downloads (videos, audio, PDFs shared for offline use)
CREATE TABLE IF NOT EXISTS downloads (
  id             SERIAL       PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  category       VARCHAR(50)  NOT NULL DEFAULT 'general',
  file_type      VARCHAR(20)  NOT NULL CHECK (file_type IN ('video','audio','pdf','document','image')),
  file_url       TEXT         NOT NULL,
  file_name      VARCHAR(255),
  file_size      BIGINT,
  thumbnail_url  TEXT,
  uploaded_by    INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  is_published   BOOLEAN      DEFAULT true,
  download_count INTEGER      DEFAULT 0,
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_published    ON articles(is_published, category);
CREATE INDEX IF NOT EXISTS idx_essentials_published  ON essentials(is_published, category, order_index);
CREATE INDEX IF NOT EXISTS idx_downloads_published   ON downloads(is_published, category);
