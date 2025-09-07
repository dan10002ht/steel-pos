-- Migration: Create invoice_items table
-- Created: 2024-01-25
-- Description: Invoice items with snapshot data (no foreign keys to products/variants)

-- Create invoice_items table
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Product reference (for analytics, no FK constraints)
    product_id INTEGER,         -- NULL if product deleted
    variant_id INTEGER,         -- NULL if variant deleted
    
    -- Snapshot data (no foreign keys to products/variants)
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,  -- "cây", "m²", "kg"
    
    -- Pricing & quantities
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(15,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(15,2) NOT NULL CHECK (total_price >= 0),
    
    -- Optional product info for reference
    product_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_invoice_items_invoice_id (invoice_id),
    INDEX idx_invoice_items_product_id (product_id),
    INDEX idx_invoice_items_variant_id (variant_id),
    INDEX idx_invoice_items_product_name (product_name)
);

-- Create trigger for updated_at
CREATE TRIGGER update_invoice_items_updated_at 
    BEFORE UPDATE ON invoice_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
