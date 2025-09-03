-- Remove foreign key constraints from import_order_items table
-- These constraints are not needed since we're storing log data, not references

-- Drop foreign key constraint on product_id
ALTER TABLE import_order_items DROP CONSTRAINT IF EXISTS import_order_items_product_id_fkey;

-- Drop foreign key constraint on product_variant_id  
ALTER TABLE import_order_items DROP CONSTRAINT IF EXISTS import_order_items_product_variant_id_fkey;

-- Add comment explaining why constraints were removed
COMMENT ON TABLE import_order_items IS 'Stores log data of import order items. Foreign key constraints removed to allow storing historical data even if products/variants are deleted.';
