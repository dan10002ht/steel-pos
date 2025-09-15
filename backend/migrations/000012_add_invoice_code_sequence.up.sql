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
    result_code TEXT;
    max_existing_number INTEGER;
    sequence_name TEXT;
    exists_count INTEGER;
BEGIN
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    sequence_name := 'invoice_code_seq_' || current_year;
    
    -- Get the maximum existing number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoices.invoice_code FROM 'INV-' || current_year || '-([0-9]+)') AS INTEGER)), 0)
    INTO max_existing_number
    FROM invoices
    WHERE invoices.invoice_code LIKE 'INV-' || current_year || '-%';
    
    -- Set sequence to start from max_existing_number + 1 (ensure minimum value is 1)
    EXECUTE format('SELECT setval(''%s'', %s, false)', sequence_name, GREATEST(max_existing_number + 1, 1));
    
    -- Loop until we find a unique invoice code
    LOOP
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
                EXECUTE format('SELECT setval(''%s'', %s, false)', sequence_name, GREATEST(max_existing_number + 1, 1));
                EXECUTE format('SELECT nextval(''%s'')', sequence_name) INTO next_number;
        END CASE;
        
        result_code := 'INV-' || current_year || '-' || LPAD(next_number::TEXT, 3, '0');
        
        -- Check if this code already exists
        SELECT COUNT(*) INTO exists_count
        FROM invoices
        WHERE invoices.invoice_code = result_code;
        
        -- If code doesn't exist, we can use it
        IF exists_count = 0 THEN
            EXIT;
        END IF;
        
        -- If we've tried too many times, throw an error
        IF next_number > max_existing_number + 1000 THEN
            RAISE EXCEPTION 'Unable to generate unique invoice code after 1000 attempts';
        END IF;
    END LOOP;
    
    RETURN result_code;
END;
$$ LANGUAGE plpgsql;
