-- Drop functional indexes
DROP INDEX IF EXISTS idx_products_name_normalized;
DROP INDEX IF EXISTS idx_product_variants_name_normalized;
DROP INDEX IF EXISTS idx_product_variants_sku_normalized;

-- Drop Vietnamese normalization function
DROP FUNCTION IF EXISTS normalize_vietnamese(text);
