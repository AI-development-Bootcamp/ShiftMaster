-- Migration: Create users table
-- Created: 2026-01-18
-- Description: Create users table for employees and administrators

CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_modified_by UUID REFERENCES users(user_id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  job_title TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

-- Comments
COMMENT ON TABLE users IS 'Employees and administrators';
COMMENT ON COLUMN users.active IS 'Soft delete flag - false means user is deleted';
COMMENT ON COLUMN users.password_hash IS 'Hashed password - never store plain text passwords';
