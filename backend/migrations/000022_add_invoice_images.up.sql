-- Add invoice_images column to invoices table
ALTER TABLE invoices 
ADD COLUMN invoice_images TEXT;

-- Add comment
COMMENT ON COLUMN invoices.invoice_images IS 'JSON array of invoice proof images (e.g., signed documents, delivery receipts)';


