-- Migration: Drop invoice_payments table
-- Created: 2024-01-25

-- Drop trigger first
DROP TRIGGER IF EXISTS update_invoice_payments_updated_at ON invoice_payments;

-- Drop table
DROP TABLE IF EXISTS invoice_payments;
