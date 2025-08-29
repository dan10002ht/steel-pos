-- Down migration: Remove full-text search indexes

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_update_variant_search_vectors ON product_variants;
DROP TRIGGER IF EXISTS trigger_update_product_search_vectors ON products;

-- Drop functions
DROP FUNCTION IF EXISTS update_variant_search_vectors();
DROP FUNCTION IF EXISTS update_product_search_vectors();

-- Drop indexes for common search patterns
DROP INDEX IF EXISTS idx_product_variants_sku_lower;
DROP INDEX IF EXISTS idx_product_variants_name_lower;
DROP INDEX IF EXISTS idx_products_notes_lower;
DROP INDEX IF EXISTS idx_products_name_lower;

-- Drop composite indexes
DROP INDEX IF EXISTS idx_product_variants_search_composite;
DROP INDEX IF EXISTS idx_products_search_composite;

-- Drop full-text search indexes for product_variants table
DROP INDEX IF EXISTS idx_product_variants_sku_fts;
DROP INDEX IF EXISTS idx_product_variants_name_fts;

-- Drop full-text search indexes for products table
DROP INDEX IF EXISTS idx_products_notes_fts;
DROP INDEX IF EXISTS idx_products_name_fts;
