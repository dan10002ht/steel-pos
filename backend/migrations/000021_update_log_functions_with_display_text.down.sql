-- Migration: Revert log functions to original state
-- Created: 2025-01-15
-- Description: Revert log_business_event and log_inventory_change functions to original state

-- Revert log_business_event function to original state
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
        created_at,
        updated_at
    ) VALUES (
        p_entity_type,
        p_entity_id,
        p_action,
        'business',
        p_log_type,
        p_old_data,
        p_new_data,
        p_business_data,
        p_changes_summary,
        p_notes,
        p_created_by,
        p_created_by_name,
        p_ip_address,
        p_user_agent,
        NOW(),
        NOW()
    ) RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Revert log_inventory_change function to original state
CREATE OR REPLACE FUNCTION log_inventory_change(
    p_entity_type VARCHAR(50),
    p_entity_id INTEGER,
    p_log_type VARCHAR(50),
    p_quantity_change DECIMAL(10,3),
    p_previous_value DECIMAL(10,3),
    p_new_value DECIMAL(10,3),
    p_reference_entity_type VARCHAR(50),
    p_reference_entity_id INTEGER,
    p_notes TEXT,
    p_created_by INTEGER,
    p_created_by_name VARCHAR(255)
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
        quantity_change,
        previous_value,
        new_value,
        reference_entity_type,
        reference_entity_id,
        notes,
        created_by,
        created_by_name,
        created_at,
        updated_at
    ) VALUES (
        p_entity_type,
        p_entity_id,
        'updated',
        'inventory',
        p_log_type,
        p_quantity_change,
        p_previous_value,
        p_new_value,
        p_reference_entity_type,
        p_reference_entity_id,
        p_notes,
        p_created_by,
        p_created_by_name,
        NOW(),
        NOW()
    ) RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql;
