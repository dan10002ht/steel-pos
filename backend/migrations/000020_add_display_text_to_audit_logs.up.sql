-- Migration: Add display_text column to audit_logs table
-- Created: 2025-01-15
-- Description: Add display_text column for human-readable log descriptions

-- Add display_text column to audit_logs table
ALTER TABLE audit_logs ADD COLUMN display_text TEXT;

-- Add index for display_text column
CREATE INDEX idx_audit_logs_display_text ON audit_logs(display_text);

-- Add comment for documentation
COMMENT ON COLUMN audit_logs.display_text IS 'Human-readable description of the audit log action';
