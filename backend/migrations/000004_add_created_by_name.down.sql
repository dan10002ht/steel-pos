-- Down migration: Remove created_by_name fields

-- Drop indexes first
DROP INDEX IF EXISTS idx_import_orders_approved_by_name;
DROP INDEX IF EXISTS idx_import_orders_created_by_name;
DROP INDEX IF EXISTS idx_product_variants_created_by_name;
DROP INDEX IF EXISTS idx_products_created_by_name;

-- Remove created_by_name columns
ALTER TABLE inventory_history DROP COLUMN IF EXISTS created_by_name;
ALTER TABLE import_order_items DROP COLUMN IF EXISTS created_by_name;
ALTER TABLE import_orders DROP COLUMN IF EXISTS created_by_name;
ALTER TABLE import_orders DROP COLUMN IF EXISTS approved_by_name;
ALTER TABLE product_variants DROP COLUMN IF EXISTS created_by_name;
ALTER TABLE products DROP COLUMN IF EXISTS created_by_name;
ALTER TABLE product_categories DROP COLUMN IF EXISTS created_by_name;
