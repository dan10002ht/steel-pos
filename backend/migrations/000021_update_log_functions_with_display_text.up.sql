-- Migration: Update log functions to include display_text
-- Created: 2025-01-15
-- Description: Update log_business_event and log_inventory_change functions to generate display_text

-- Update log_business_event function to include display_text
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
    display_text TEXT;
    user_name TEXT;
    date_str TEXT;
    amount_str TEXT;
    method_str TEXT;
BEGIN
    -- Generate display text
    user_name := COALESCE(p_created_by_name, 'Hệ thống');
    date_str := TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI:SS');
    
    -- Generate display text based on entity type and action
    IF p_entity_type = 'invoice' THEN
        CASE p_action
            WHEN 'created' THEN
                display_text := user_name || ' tạo hoá đơn vào ' || date_str;
            WHEN 'updated' THEN
                display_text := user_name || ' cập nhật hoá đơn vào ' || date_str;
            WHEN 'cancelled' THEN
                display_text := user_name || ' hủy hoá đơn vào ' || date_str;
            WHEN 'payment_created' THEN
                IF p_new_data IS NOT NULL THEN
                    amount_str := COALESCE(TO_CHAR((p_new_data->>'amount')::NUMERIC, 'FM999,999,999'), '0') || ' VNĐ';
                    method_str := CASE p_new_data->>'payment_method'
                        WHEN 'cash' THEN 'tiền mặt'
                        WHEN 'card' THEN 'thẻ'
                        WHEN 'bank_transfer' THEN 'chuyển khoản'
                        WHEN 'credit' THEN 'ghi nợ'
                        ELSE 'không xác định'
                    END;
                    display_text := user_name || ' thanh toán ' || amount_str || ' bằng ' || method_str || ' vào ' || date_str;
                ELSE
                    display_text := user_name || ' thêm thanh toán vào ' || date_str;
                END IF;
            WHEN 'payment_updated' THEN
                display_text := user_name || ' cập nhật thanh toán vào ' || date_str;
            WHEN 'payment_deleted' THEN
                display_text := user_name || ' xóa thanh toán vào ' || date_str;
            ELSE
                display_text := user_name || ' thực hiện ' || p_action || ' vào ' || date_str;
        END CASE;
    ELSIF p_entity_type = 'customer' THEN
        CASE p_action
            WHEN 'created' THEN
                display_text := user_name || ' tạo khách hàng vào ' || date_str;
            WHEN 'updated' THEN
                display_text := user_name || ' cập nhật khách hàng vào ' || date_str;
            WHEN 'deleted' THEN
                display_text := user_name || ' xóa khách hàng vào ' || date_str;
            ELSE
                display_text := user_name || ' thực hiện ' || p_action || ' khách hàng vào ' || date_str;
        END CASE;
    ELSIF p_entity_type = 'product' THEN
        CASE p_action
            WHEN 'created' THEN
                display_text := user_name || ' tạo sản phẩm vào ' || date_str;
            WHEN 'updated' THEN
                display_text := user_name || ' cập nhật sản phẩm vào ' || date_str;
            WHEN 'deleted' THEN
                display_text := user_name || ' xóa sản phẩm vào ' || date_str;
            ELSE
                display_text := user_name || ' thực hiện ' || p_action || ' sản phẩm vào ' || date_str;
        END CASE;
    ELSIF p_entity_type = 'product_variant' THEN
        CASE p_action
            WHEN 'created' THEN
                display_text := user_name || ' tạo biến thể sản phẩm vào ' || date_str;
            WHEN 'updated' THEN
                display_text := user_name || ' cập nhật biến thể sản phẩm vào ' || date_str;
            WHEN 'deleted' THEN
                display_text := user_name || ' xóa biến thể sản phẩm vào ' || date_str;
            WHEN 'cancellation' THEN
                display_text := user_name || ' khôi phục tồn kho vào ' || date_str;
            ELSE
                display_text := user_name || ' thực hiện ' || p_action || ' biến thể sản phẩm vào ' || date_str;
        END CASE;
    ELSE
        display_text := user_name || ' thực hiện ' || p_action || ' ' || p_entity_type || ' vào ' || date_str;
    END IF;

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
        display_text,
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
        display_text,
        NOW(),
        NOW()
    ) RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Update log_inventory_change function to include display_text
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
    display_text TEXT;
    user_name TEXT;
    date_str TEXT;
BEGIN
    -- Generate display text
    user_name := COALESCE(p_created_by_name, 'Hệ thống');
    date_str := TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI:SS');
    
    -- Generate display text based on log type
    CASE p_log_type
        WHEN 'sale' THEN
            display_text := user_name || ' bán sản phẩm (giảm ' || p_quantity_change || ') vào ' || date_str;
        WHEN 'import' THEN
            display_text := user_name || ' nhập hàng (tăng ' || p_quantity_change || ') vào ' || date_str;
        WHEN 'adjustment' THEN
            display_text := user_name || ' điều chỉnh tồn kho (' || p_quantity_change || ') vào ' || date_str;
        WHEN 'return' THEN
            display_text := user_name || ' trả hàng (tăng ' || p_quantity_change || ') vào ' || date_str;
        WHEN 'transfer' THEN
            display_text := user_name || ' chuyển kho (thay đổi ' || p_quantity_change || ') vào ' || date_str;
        WHEN 'cancellation' THEN
            display_text := user_name || ' khôi phục tồn kho (tăng ' || p_quantity_change || ') vào ' || date_str;
        ELSE
            display_text := user_name || ' thay đổi tồn kho (' || p_quantity_change || ') vào ' || date_str;
    END CASE;

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
        display_text,
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
        display_text,
        NOW(),
        NOW()
    ) RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION log_business_event IS 'Helper function to log business events with display_text';
COMMENT ON FUNCTION log_inventory_change IS 'Helper function to log inventory changes with display_text';
