-- Create inventory_logs table
CREATE TABLE inventory_logs (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('sale', 'import', 'adjustment', 'return', 'transfer')),
    quantity_change DECIMAL(10,3) NOT NULL,
    previous_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    new_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    reference_type VARCHAR(50), -- 'invoice', 'import_order', 'adjustment', etc.
    reference_id INTEGER, -- ID of the reference record
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_variant_id ON inventory_logs(variant_id);
CREATE INDEX idx_inventory_logs_movement_type ON inventory_logs(movement_type);
CREATE INDEX idx_inventory_logs_created_at ON inventory_logs(created_at);
CREATE INDEX idx_inventory_logs_reference ON inventory_logs(reference_type, reference_id);

-- Add trigger for updated_at
CREATE TRIGGER update_inventory_logs_updated_at
    BEFORE UPDATE ON inventory_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();



























