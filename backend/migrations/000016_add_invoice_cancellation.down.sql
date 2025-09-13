-- Remove cancellation fields from invoices table
ALTER TABLE invoices DROP COLUMN IF EXISTS cancellation_reason;
ALTER TABLE invoices DROP COLUMN IF EXISTS cancelled_by;
ALTER TABLE invoices DROP COLUMN IF EXISTS cancelled_at;

-- Note: Cannot remove enum value 'cancelled' in PostgreSQL
-- The cancelled status will remain but won't be used
