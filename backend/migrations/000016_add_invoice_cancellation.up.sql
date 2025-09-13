-- Add cancellation fields to invoices table
ALTER TABLE invoices ADD COLUMN cancelled_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN cancelled_by INTEGER REFERENCES users(id);
ALTER TABLE invoices ADD COLUMN cancellation_reason TEXT;

-- Update check constraint to include 'cancelled' status
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
    CHECK (status IN ('draft', 'confirmed', 'cancelled'));
