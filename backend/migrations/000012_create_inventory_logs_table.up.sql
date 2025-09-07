-- Migration: Create inventory_logs table
-- Created: 2024-01-25
-- Description: Track inventory movements for sales, imports, adjustments, returns

-- Create inventory_logs table
CREATE TABLE inventory_logs (
    id SERIAL PRIMARY KEY,
    
    -- Product reference (can be null if product deleted)
    product_id INTEGER NULL,  -- NULL if product deleted
    variant_id INTEGER NULL,  -- NULL if variant deleted
    
    -- Movement details
    movement_type VARCHAR(20) NOT NULL 
        CHECK (movement_type IN ('sale', 'import', 'adjustment', 'return')),
    quantity_change DECIMAL(10,3) NOT NULL,  -- positive for import, negative for sale
    previous_stock DECIMAL(10,3) NOT NULL,
    new_stock DECIMAL(10,3) NOT NULL,
    
    -- Reference to source
    reference_type VARCHAR(50) NOT NULL 
        CHECK (reference_type IN ('invoice', 'import_order', 'adjustment', 'return')),
    reference_id INTEGER NOT NULL,  -- invoice_id, import_order_id, etc.
    
    -- Additional info
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,  -- user_id
    
    -- Indexes
    INDEX idx_inventory_logs_product_variant (product_id, variant_id),
    INDEX idx_inventory_logs_reference (reference_type, reference_id),
    INDEX idx_inventory_logs_created_at (created_at),
    INDEX idx_inventory_logs_movement_type (movement_type)
);
