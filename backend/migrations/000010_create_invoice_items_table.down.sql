-- Migration: Drop invoice_items table
-- Created: 2024-01-25

-- Drop trigger first
DROP TRIGGER IF EXISTS update_invoice_items_updated_at ON invoice_items;

-- Drop table
DROP TABLE IF EXISTS invoice_items;
