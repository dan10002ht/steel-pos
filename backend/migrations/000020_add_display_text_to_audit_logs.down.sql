-- Migration: Remove display_text column from audit_logs table
-- Created: 2025-01-15
-- Description: Remove display_text column and its index

-- Drop index
DROP INDEX IF EXISTS idx_audit_logs_display_text;

-- Drop column
ALTER TABLE audit_logs DROP COLUMN IF EXISTS display_text;
