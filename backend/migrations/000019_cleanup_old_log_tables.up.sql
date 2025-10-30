-- Cleanup old log tables and create helper functions for unified logging

-- Drop old inventory tables (data already migrated to audit_logs)
DROP TABLE IF EXISTS inventory_history CASCADE;
DROP TABLE IF EXISTS inventory_logs CASCADE;

-- Create helper functions for unified logging

-- Function to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change(
    p_entity_type VARCHAR(50),
    p_entity_id INTEGER,
    p_log_type VARCHAR(50),
    p_quantity_change DECIMAL(10,3),
    p_previous_value DECIMAL(10,3),
    p_new_value DECIMAL(10,3),
    p_reference_entity_type VARCHAR(50) DEFAULT NULL,
    p_reference_entity_id INTEGER DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_created_by INTEGER DEFAULT NULL,
    p_created_by_name VARCHAR(255) DEFAULT NULL,
    p_inventory_data JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    log_id INTEGER;
BEGIN
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
    ) VALUES (
        p_entity_type,
        p_entity_id,
        'updated', -- Inventory changes are always updates
        'inventory',
        p_log_type,
        COALESCE(p_inventory_data, jsonb_build_object(
            'entity_type', p_entity_type,
            'entity_id', p_entity_id,
            'log_type', p_log_type,
            'quantity_change', p_quantity_change,
            'previous_value', p_previous_value,
            'new_value', p_new_value
        )),
        p_quantity_change,
        p_previous_value,
        p_new_value,
        p_reference_entity_type,
        p_reference_entity_id,
        p_notes,
        p_created_by,
        p_created_by_name,
        NOW()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log business events (invoices, customers, etc.)
CREATE OR REPLACE FUNCTION log_business_event(
    p_entity_type VARCHAR(50),
    p_entity_id INTEGER,
    p_action VARCHAR(20),
    p_log_type VARCHAR(50),
    p_old_data JSONB DEFAULT NULL,
    p_new_data JSONB DEFAULT NULL,
    p_business_data JSONB DEFAULT NULL,
    p_changes_summary TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_created_by INTEGER DEFAULT NULL,
    p_created_by_name VARCHAR(255) DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    log_id INTEGER;
BEGIN
    INSERT INTO audit_logs (
        entity_type,
        entity_id,
        action,
        log_category,
        log_type,
        old_data,
        new_data,
        business_data,
        changes_summary,
        notes,
        created_by,
        created_by_name,
        ip_address,
        user_agent,
        created_at
    ) VALUES (
        p_entity_type,
        p_entity_id,
        p_action,
        'business',
        p_log_type,
        p_old_data,
        p_new_data,
        COALESCE(p_business_data, jsonb_build_object(
            'entity_type', p_entity_type,
            'entity_id', p_entity_id,
            'action', p_action,
            'log_type', p_log_type
        )),
        p_changes_summary,
        p_notes,
        p_created_by,
        p_created_by_name,
        p_ip_address,
        p_user_agent,
        NOW()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log system events
CREATE OR REPLACE FUNCTION log_system_event(
    p_entity_type VARCHAR(50),
    p_entity_id INTEGER,
    p_log_type VARCHAR(50),
    p_system_data JSONB DEFAULT NULL,
    p_severity VARCHAR(20) DEFAULT 'info',
    p_notes TEXT DEFAULT NULL,
    p_created_by INTEGER DEFAULT NULL,
    p_created_by_name VARCHAR(255) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    log_id INTEGER;
BEGIN
    INSERT INTO audit_logs (
        entity_type,
        entity_id,
        action,
        log_category,
        log_type,
        system_data,
        severity,
        notes,
        created_by,
        created_by_name,
        created_at
    ) VALUES (
        p_entity_type,
        p_entity_id,
        'system', -- System events are always 'system' action
        'system',
        p_log_type,
        COALESCE(p_system_data, jsonb_build_object(
            'entity_type', p_entity_type,
            'entity_id', p_entity_id,
            'log_type', p_log_type,
            'severity', p_severity
        )),
        p_severity,
        p_notes,
        p_created_by,
        p_created_by_name,
        NOW()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION log_inventory_change IS 'Helper function to log inventory changes in unified audit_logs table';
COMMENT ON FUNCTION log_business_event IS 'Helper function to log business events (invoices, customers, etc.) in unified audit_logs table';
COMMENT ON FUNCTION log_system_event IS 'Helper function to log system events in unified audit_logs table';




























