-- Migration: Create clients table
-- Created: 2026-01-18
-- Description: Create clients table for external organizations

CREATE TABLE clients (
  client_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_info TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_clients_active ON clients(active);
CREATE INDEX idx_clients_name ON clients(name);

-- Comments
COMMENT ON TABLE clients IS 'External organizations that projects belong to';
COMMENT ON COLUMN clients.active IS 'Soft delete flag - false means client is deleted';
