-- Remove invoice_images column from invoices table
ALTER TABLE invoices 
DROP COLUMN IF EXISTS invoice_images;


