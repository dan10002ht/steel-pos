-- Create functional indexes for normalized invoice search
CREATE INDEX idx_invoices_code_normalized 
ON invoices (normalize_vietnamese(invoice_code));

CREATE INDEX idx_invoices_customer_name_normalized 
ON invoices (normalize_vietnamese(customer_name));

CREATE INDEX idx_invoices_customer_phone_normalized 
ON invoices (normalize_vietnamese(customer_phone));

-- Create full-text search index for invoices
CREATE INDEX idx_invoices_fulltext 
ON invoices USING gin(to_tsvector('simple', invoice_code || ' ' || customer_name || ' ' || customer_phone));

-- Create composite index for better performance
CREATE INDEX idx_invoices_search_composite 
ON invoices (normalize_vietnamese(invoice_code), normalize_vietnamese(customer_name), normalize_vietnamese(customer_phone));
