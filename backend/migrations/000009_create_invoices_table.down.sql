-- Migration: Drop invoices table
-- Created: 2024-01-25

-- Drop trigger first
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;

-- Drop table
DROP TABLE IF EXISTS invoices;
