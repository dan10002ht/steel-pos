-- Migration: Drop customers table
-- Created: 2024-01-25

-- Drop trigger first
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;

-- Drop table
DROP TABLE IF EXISTS customers;
