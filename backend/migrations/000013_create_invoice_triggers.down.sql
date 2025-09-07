-- Migration: Drop invoice triggers
-- Created: 2024-01-25

-- Drop triggers
DROP TRIGGER IF EXISTS update_invoice_payment_after_insert ON invoice_payments;
DROP TRIGGER IF EXISTS update_invoice_payment_after_update ON invoice_payments;
DROP TRIGGER IF EXISTS update_invoice_payment_after_delete ON invoice_payments;

-- Drop function
DROP FUNCTION IF EXISTS update_invoice_payment_status();
