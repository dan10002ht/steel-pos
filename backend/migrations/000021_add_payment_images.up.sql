-- Add payment_images column to invoice_payments table
ALTER TABLE invoice_payments 
ADD COLUMN payment_images TEXT;

-- Add comment
COMMENT ON COLUMN invoice_payments.payment_images IS 'JSON array of base64 encoded payment proof images';
