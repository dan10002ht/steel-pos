-- Drop invoice search indexes
DROP INDEX IF EXISTS idx_invoices_code_normalized;
DROP INDEX IF EXISTS idx_invoices_customer_name_normalized;
DROP INDEX IF EXISTS idx_invoices_customer_phone_normalized;
DROP INDEX IF EXISTS idx_invoices_fulltext;
DROP INDEX IF EXISTS idx_invoices_search_composite;
