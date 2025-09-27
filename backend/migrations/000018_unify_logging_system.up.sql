-- Unify logging system by extending audit_logs table
-- This migration consolidates all logging into a single, flexible table

-- Add new columns to audit_logs for unified logging
ALTER TABLE audit_logs ADD COLUMN log_category VARCHAR(20) DEFAULT 'audit' CHECK (log_category IN ('audit', 'inventory', 'system', 'business'));
ALTER TABLE audit_logs ADD COLUMN log_type VARCHAR(50); -- More specific than action: 'sale', 'import', 'adjustment', 'return', 'transfer', 'created', 'updated', 'deleted'
ALTER TABLE audit_logs ADD COLUMN inventory_data JSONB; -- For inventory-specific data
ALTER TABLE audit_logs ADD COLUMN business_data JSONB; -- For business-specific data (invoices, customers, etc.)
ALTER TABLE audit_logs ADD COLUMN system_data JSONB; -- For system events
ALTER TABLE audit_logs ADD COLUMN quantity_change DECIMAL(10,3); -- For inventory changes
ALTER TABLE audit_logs ADD COLUMN previous_value DECIMAL(10,3); -- Previous value (stock, amount, etc.)
ALTER TABLE audit_logs ADD COLUMN new_value DECIMAL(10,3); -- New value (stock, amount, etc.)
ALTER TABLE audit_logs ADD COLUMN reference_entity_type VARCHAR(50); -- Type of reference entity
ALTER TABLE audit_logs ADD COLUMN reference_entity_id INTEGER; -- ID of reference entity
ALTER TABLE audit_logs ADD COLUMN notes TEXT; -- Additional notes
ALTER TABLE audit_logs ADD COLUMN severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warn', 'error', 'critical'));

-- Create new indexes for better performance
CREATE INDEX idx_audit_logs_category ON audit_logs(log_category);
CREATE INDEX idx_audit_logs_log_type ON audit_logs(log_type);
CREATE INDEX idx_audit_logs_reference ON audit_logs(reference_entity_type, reference_entity_id);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_inventory_data ON audit_logs USING GIN(inventory_data);
CREATE INDEX idx_audit_logs_business_data ON audit_logs USING GIN(business_data);
CREATE INDEX idx_audit_logs_system_data ON audit_logs USING GIN(system_data);

-- Migrate data from inventory_history to audit_logs
INSERT INTO audit_logs (
    entity_type,
    entity_id,
    action,
    log_category,
    log_type,
    inventory_data,
    quantity_change,
    previous_value,
    new_value,
    reference_entity_type,
    reference_entity_id,
    notes,
    created_by,
    created_by_name,
    created_at
)
SELECT 
    'product_variant' as entity_type,
    ih.product_variant_id as entity_id,
    CASE 
        WHEN ih.type = 'import' THEN 'created'
        WHEN ih.type = 'sale' THEN 'updated'
        WHEN ih.type = 'adjustment' THEN 'updated'
        WHEN ih.type = 'return' THEN 'updated'
        ELSE 'updated'
    END as action,
    'inventory' as log_category,
    ih.type as log_type,
    jsonb_build_object(
        'product_variant_id', ih.product_variant_id,
        'type', ih.type,
        'quantity', ih.quantity,
        'previous_stock', ih.previous_stock,
        'new_stock', ih.new_stock,
        'reference_id', ih.reference_id,
        'reference_type', ih.reference_type
    ) as inventory_data,
    ih.quantity::DECIMAL(10,3) as quantity_change,
    ih.previous_stock::DECIMAL(10,3) as previous_value,
    ih.new_stock::DECIMAL(10,3) as new_value,
    ih.reference_type as reference_entity_type,
    ih.reference_id as reference_entity_id,
    ih.notes,
    ih.created_by,
    ih.created_by_name,
    ih.created_at
FROM inventory_history ih;

-- Migrate data from inventory_logs to audit_logs (if any exists)
INSERT INTO audit_logs (
    entity_type,
    entity_id,
    action,
    log_category,
    log_type,
    inventory_data,
    quantity_change,
    previous_value,
    new_value,
    reference_entity_type,
    reference_entity_id,
    notes,
    created_by,
    created_at
)
SELECT 
    'product_variant' as entity_type,
    il.variant_id as entity_id,
    CASE 
        WHEN il.movement_type = 'import' THEN 'created'
        WHEN il.movement_type = 'sale' THEN 'updated'
        WHEN il.movement_type = 'adjustment' THEN 'updated'
        WHEN il.movement_type = 'return' THEN 'updated'
        WHEN il.movement_type = 'transfer' THEN 'updated'
        ELSE 'updated'
    END as action,
    'inventory' as log_category,
    il.movement_type as log_type,
    jsonb_build_object(
        'product_id', il.product_id,
        'variant_id', il.variant_id,
        'movement_type', il.movement_type,
        'quantity_change', il.quantity_change,
        'previous_stock', il.previous_stock,
        'new_stock', il.new_stock,
        'reference_type', il.reference_type,
        'reference_id', il.reference_id
    ) as inventory_data,
    il.quantity_change,
    il.previous_stock,
    il.new_stock,
    il.reference_type as reference_entity_type,
    il.reference_id as reference_entity_id,
    il.notes,
    il.created_by,
    il.created_at
FROM inventory_logs il
WHERE NOT EXISTS (
    SELECT 1 FROM audit_logs al 
    WHERE al.entity_type = 'product_variant' 
    AND al.entity_id = il.variant_id 
    AND al.log_type = il.movement_type
    AND al.created_at = il.created_at
);

-- Add comments for documentation
COMMENT ON COLUMN audit_logs.log_category IS 'Category of log: audit, inventory, system, business';
COMMENT ON COLUMN audit_logs.log_type IS 'Specific type of log: sale, import, adjustment, return, transfer, created, updated, deleted';
COMMENT ON COLUMN audit_logs.inventory_data IS 'Inventory-specific data in JSON format';
COMMENT ON COLUMN audit_logs.business_data IS 'Business-specific data in JSON format (invoices, customers, etc.)';
COMMENT ON COLUMN audit_logs.system_data IS 'System events data in JSON format';
COMMENT ON COLUMN audit_logs.quantity_change IS 'Change in quantity for inventory logs';
COMMENT ON COLUMN audit_logs.previous_value IS 'Previous value (stock, amount, etc.)';
COMMENT ON COLUMN audit_logs.new_value IS 'New value (stock, amount, etc.)';
COMMENT ON COLUMN audit_logs.reference_entity_type IS 'Type of reference entity';
COMMENT ON COLUMN audit_logs.reference_entity_id IS 'ID of reference entity';
COMMENT ON COLUMN audit_logs.notes IS 'Additional notes';
COMMENT ON COLUMN audit_logs.severity IS 'Log severity level: debug, info, warn, error, critical';















