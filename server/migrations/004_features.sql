-- Arabic Resources
CREATE TABLE IF NOT EXISTS arabic_resources (
  id           SERIAL       PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  type         VARCHAR(20)  NOT NULL CHECK (type IN ('pdf','image','video','audio')),
  url          TEXT         NOT NULL,
  file_name    VARCHAR(255),
  file_size    BIGINT,
  duration     INTEGER,
  uploaded_by  INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  is_published BOOLEAN      DEFAULT true,
  view_count   INTEGER      DEFAULT 0,
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- Islamic Courses
CREATE TABLE IF NOT EXISTS courses (
  id               SERIAL       PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  cover_image      TEXT,
  level            VARCHAR(20)  DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced')),
  language         VARCHAR(10)  DEFAULT 'en',
  duration_minutes INTEGER      DEFAULT 0,
  created_by       INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  is_published     BOOLEAN      DEFAULT false,
  enrollment_count INTEGER      DEFAULT 0,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_lessons (
  id               SERIAL       PRIMARY KEY,
  course_id        INTEGER      NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  content          TEXT,
  type             VARCHAR(20)  DEFAULT 'text' CHECK (type IN ('text','video','audio','pdf','quiz')),
  media_url        TEXT,
  file_name        VARCHAR(255),
  order_index      INTEGER      DEFAULT 0,
  duration_minutes INTEGER      DEFAULT 0,
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id                SERIAL      PRIMARY KEY,
  course_id         INTEGER     NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id           INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  progress_percent  INTEGER     DEFAULT 0,
  certificate_sent  BOOLEAN     DEFAULT false,
  UNIQUE(course_id, user_id)
);

CREATE TABLE IF NOT EXISTS course_lesson_progress (
  id            SERIAL      PRIMARY KEY,
  enrollment_id INTEGER     NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  lesson_id     INTEGER     NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id, lesson_id)
);

-- Community Groups (extends existing chats — adds group metadata)
CREATE TABLE IF NOT EXISTS community_groups (
  id           SERIAL       PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  description  TEXT,
  cover_image  TEXT,
  created_by   INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  is_public    BOOLEAN      DEFAULT true,
  is_active    BOOLEAN      DEFAULT true,
  chat_id      INTEGER      REFERENCES chats(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_group_members (
  id         SERIAL      PRIMARY KEY,
  group_id   INTEGER     NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin','moderator','member')),
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_arabic_resources_type       ON arabic_resources(type, is_published);
CREATE INDEX IF NOT EXISTS idx_courses_published           ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course       ON course_lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_enrollments_user            ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course          ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment  ON course_lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_community_groups_active     ON community_groups(is_active, is_public);
CREATE INDEX IF NOT EXISTS idx_community_group_members     ON community_group_members(group_id, user_id);
