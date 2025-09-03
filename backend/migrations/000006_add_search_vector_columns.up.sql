-- Migration: Add search_vector columns for full-text search
-- This migration adds search_vector columns to products and product_variants tables

-- Add search_vector column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Add search_vector column to product_variants table
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN indexes for search_vector columns
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_product_variants_search_vector ON product_variants USING gin(search_vector);

-- Update existing records with search vectors
UPDATE products SET search_vector = to_tsvector('simple', name || ' ' || COALESCE(notes, ''));
UPDATE product_variants SET search_vector = to_tsvector('simple', name || ' ' || COALESCE(sku, ''));
