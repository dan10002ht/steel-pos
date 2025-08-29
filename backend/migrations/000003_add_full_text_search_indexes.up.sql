-- Migration: Add full-text search indexes for hybrid search
-- This migration adds PostgreSQL full-text search indexes for better search performance

-- Enable Vietnamese full-text search dictionary (if available)
-- Note: This requires the 'unaccent' extension and Vietnamese dictionary
-- CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add full-text search indexes for products
CREATE INDEX idx_products_name_fts ON products USING gin(to_tsvector('simple', name));
CREATE INDEX idx_products_notes_fts ON products USING gin(to_tsvector('simple', notes));

-- Add full-text search indexes for product variants
CREATE INDEX idx_product_variants_name_fts ON product_variants USING gin(to_tsvector('simple', name));
CREATE INDEX idx_product_variants_sku_fts ON product_variants USING gin(to_tsvector('simple', sku));

-- Add composite search indexes
CREATE INDEX idx_products_search_composite ON products USING gin(to_tsvector('simple', name || ' ' || COALESCE(notes, '')));
CREATE INDEX idx_product_variants_search_composite ON product_variants USING gin(to_tsvector('simple', name || ' ' || COALESCE(sku, '')));

-- Add lower-case indexes for ILIKE searches
CREATE INDEX idx_products_name_lower ON products (LOWER(name));
CREATE INDEX idx_products_notes_lower ON products (LOWER(notes));
CREATE INDEX idx_product_variants_name_lower ON product_variants (LOWER(name));
CREATE INDEX idx_product_variants_sku_lower ON product_variants (LOWER(sku));

-- Create function to update search vectors
CREATE OR REPLACE FUNCTION update_product_search_vectors()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', NEW.name || ' ' || COALESCE(NEW.notes, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vectors
CREATE TRIGGER trigger_update_product_search_vectors
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_vectors();

-- Create function to update variant search vectors
CREATE OR REPLACE FUNCTION update_variant_search_vectors()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', NEW.name || ' ' || COALESCE(NEW.sku, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update variant search vectors
CREATE TRIGGER trigger_update_variant_search_vectors
  BEFORE INSERT OR UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_variant_search_vectors();
