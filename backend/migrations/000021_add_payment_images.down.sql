-- Remove payment_images column from invoice_payments table
ALTER TABLE invoice_payments 
DROP COLUMN payment_images;
