-- Migration: Add created_by_name field to all tables
-- This migration adds created_by_name field to store the name of the user who created the record

-- Add created_by_name to product_categories table
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(100);

-- Add created_by_name to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(100);

-- Add created_by_name to product_variants table
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(100);

-- Add created_by_name to import_orders table
ALTER TABLE import_orders ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(100);

-- Add created_by_name to import_order_items table
ALTER TABLE import_order_items ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(100);

-- Add created_by_name to inventory_history table
ALTER TABLE inventory_history ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(100);

-- Add approved_by_name to import_orders table
ALTER TABLE import_orders ADD COLUMN IF NOT EXISTS approved_by_name VARCHAR(100);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_created_by_name ON products(created_by_name);
CREATE INDEX IF NOT EXISTS idx_product_variants_created_by_name ON product_variants(created_by_name);
CREATE INDEX IF NOT EXISTS idx_import_orders_created_by_name ON import_orders(created_by_name);
CREATE INDEX IF NOT EXISTS idx_import_orders_approved_by_name ON import_orders(approved_by_name);
