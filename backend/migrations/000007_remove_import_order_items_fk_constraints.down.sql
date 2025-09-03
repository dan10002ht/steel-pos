-- Restore foreign key constraints to import_order_items table

-- Add foreign key constraint on product_id
ALTER TABLE import_order_items ADD CONSTRAINT import_order_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id);

-- Add foreign key constraint on product_variant_id
ALTER TABLE import_order_items ADD CONSTRAINT import_order_items_product_variant_id_fkey 
    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id);

-- Remove comment
COMMENT ON TABLE import_order_items IS NULL;
