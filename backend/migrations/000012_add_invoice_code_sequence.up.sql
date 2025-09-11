-- Migration: Add invoice code sequence for better uniqueness
-- Created: 2024-01-25
-- Description: Create sequence for invoice code generation to prevent duplicates

-- Create sequence for invoice numbers per year
CREATE SEQUENCE invoice_code_seq_2024 START 1;
CREATE SEQUENCE invoice_code_seq_2025 START 1;
CREATE SEQUENCE invoice_code_seq_2026 START 1;
CREATE SEQUENCE invoice_code_seq_2027 START 1;
CREATE SEQUENCE invoice_code_seq_2028 START 1;

-- Function to get next invoice code with uniqueness check
CREATE OR REPLACE FUNCTION get_next_invoice_code()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_number INTEGER;
    invoice_code TEXT;
    max_existing_number INTEGER;
    sequence_name TEXT;
BEGIN
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    sequence_name := 'invoice_code_seq_' || current_year;
    
    -- Get the maximum existing number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_code FROM 'INV-' || current_year || '-([0-9]+)') AS INTEGER)), 0)
    INTO max_existing_number
    FROM invoices
    WHERE invoice_code LIKE 'INV-' || current_year || '-%';
    
    -- Set sequence to start from max_existing_number + 1
    EXECUTE format('SELECT setval(''%s'', %s, false)', sequence_name, max_existing_number);
    
    -- Get next number from sequence
    CASE current_year
        WHEN '2024' THEN next_number := nextval('invoice_code_seq_2024');
        WHEN '2025' THEN next_number := nextval('invoice_code_seq_2025');
        WHEN '2026' THEN next_number := nextval('invoice_code_seq_2026');
        WHEN '2027' THEN next_number := nextval('invoice_code_seq_2027');
        WHEN '2028' THEN next_number := nextval('invoice_code_seq_2028');
        ELSE 
            -- For years beyond 2028, create sequence dynamically
            EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %s START 1', sequence_name);
            EXECUTE format('SELECT setval(''%s'', %s, false)', sequence_name, max_existing_number);
            EXECUTE format('SELECT nextval(''%s'')', sequence_name) INTO next_number;
    END CASE;
    
    invoice_code := 'INV-' || current_year || '-' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN invoice_code;
END;
$$ LANGUAGE plpgsql;
