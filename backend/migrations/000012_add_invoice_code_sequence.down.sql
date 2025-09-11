-- Migration: Remove invoice code sequence
-- Created: 2024-01-25
-- Description: Drop sequences and function for invoice code generation

-- Drop function
DROP FUNCTION IF EXISTS get_next_invoice_code();

-- Drop sequences
DROP SEQUENCE IF EXISTS invoice_code_seq_2024;
DROP SEQUENCE IF EXISTS invoice_code_seq_2025;
DROP SEQUENCE IF EXISTS invoice_code_seq_2026;
DROP SEQUENCE IF EXISTS invoice_code_seq_2027;
DROP SEQUENCE IF EXISTS invoice_code_seq_2028;
