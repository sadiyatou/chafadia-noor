-- Migration 003: OTP verification system
-- Existing users keep their verified status; new users start unverified

ALTER TABLE users ALTER COLUMN verified SET DEFAULT false;

-- Mark all existing users as verified so they can still log in
UPDATE users SET verified = true WHERE verified IS NULL OR verified = false;

CREATE TABLE IF NOT EXISTS otp_verifications (
  id           SERIAL       PRIMARY KEY,
  contact      VARCHAR(255) NOT NULL,
  contact_type VARCHAR(10)  NOT NULL CHECK (contact_type IN ('email', 'phone')),
  otp          VARCHAR(6)   NOT NULL,
  user_id      INTEGER      REFERENCES users(id) ON DELETE CASCADE,
  expires_at   TIMESTAMPTZ  NOT NULL,
  used         BOOLEAN      DEFAULT false,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_lookup
  ON otp_verifications(contact, used, expires_at);
