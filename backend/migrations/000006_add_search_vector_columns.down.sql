-- Down migration: Remove search_vector columns

-- Drop indexes first
DROP INDEX IF EXISTS idx_product_variants_search_vector;
DROP INDEX IF EXISTS idx_products_search_vector;

-- Remove search_vector columns
ALTER TABLE product_variants DROP COLUMN IF EXISTS search_vector;
ALTER TABLE products DROP COLUMN IF EXISTS search_vector;
