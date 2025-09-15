-- Migration: Add inventory update function for import order approval
-- Created: 2024-01-25

-- Function to update inventory when import order is approved
CREATE OR REPLACE FUNCTION update_inventory_on_import_approval(
    p_import_order_id INTEGER,
    p_approved_by INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_item RECORD;
    v_previous_stock INTEGER;
    v_new_stock INTEGER;
    v_approved_by_name VARCHAR(100);
BEGIN
    -- Get approved_by username
    SELECT username INTO v_approved_by_name
    FROM users 
    WHERE id = p_approved_by;
    
    -- Loop through all items in the import order
    FOR v_item IN 
        SELECT 
            ioi.product_variant_id,
            ioi.quantity,
            pv.stock as current_stock,
            pv.product_id,
            p.name as product_name,
            pv.name as variant_name
        FROM import_order_items ioi
        JOIN product_variants pv ON ioi.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE ioi.import_order_id = p_import_order_id
    LOOP
        -- Get current stock
        v_previous_stock := v_item.current_stock;
        v_new_stock := v_previous_stock + v_item.quantity;
        
        -- Update product variant stock
        UPDATE product_variants 
        SET stock = v_new_stock,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_item.product_variant_id;
        
        -- Log inventory change using unified audit_logs system
        INSERT INTO audit_logs (
            entity_type,
            entity_id,
            action,
            log_type,
            log_category,
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
            'product_variant',
            v_item.product_variant_id,
            'import_approval',
            'inventory_change',
            'inventory',
            v_item.quantity,
            v_previous_stock,
            v_new_stock,
            'import_order',
            p_import_order_id,
            'Phê duyệt đơn nhập - ' || v_item.product_name || ' ' || v_item.variant_name,
            p_approved_by,
            v_approved_by_name,
            CURRENT_TIMESTAMP
        );
    END LOOP;
    
    -- Update import order status
    UPDATE import_orders 
    SET status = 'approved',
        approved_by = p_approved_by,
        approved_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_import_order_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next import code
CREATE OR REPLACE FUNCTION generate_next_import_code()
RETURNS VARCHAR(50) AS $$
DECLARE
    v_next_code VARCHAR(50);
    v_max_number INTEGER;
BEGIN
    -- Get the maximum import code number
    SELECT COALESCE(MAX(CAST(import_code AS INTEGER)), 0)
    INTO v_max_number
    FROM import_orders
    WHERE import_code ~ '^[0-9]+$';
    
    -- Generate next code with leading zeros
    v_next_code := LPAD((v_max_number + 1)::TEXT, 4, '0');
    
    RETURN v_next_code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total value of import order
CREATE OR REPLACE FUNCTION calculate_import_order_total(p_import_order_id INTEGER)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    v_total DECIMAL(15,2);
BEGIN
    SELECT COALESCE(SUM(total_price), 0)
    INTO v_total
    FROM import_order_items
    WHERE import_order_id = p_import_order_id;
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Function to get product variant by name and product
CREATE OR REPLACE FUNCTION get_product_variant_by_name(
    p_product_id INTEGER,
    p_variant_name VARCHAR(100)
)
RETURNS INTEGER AS $$
DECLARE
    v_variant_id INTEGER;
BEGIN
    SELECT id INTO v_variant_id
    FROM product_variants
    WHERE product_id = p_product_id 
    AND name = p_variant_name
    AND is_active = true;
    
    RETURN v_variant_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-calculate import order total
CREATE OR REPLACE FUNCTION update_import_order_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total value when items are added/updated/deleted
    UPDATE import_orders 
    SET total_value = calculate_import_order_total(NEW.import_order_id)
    WHERE id = NEW.import_order_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-calculating import order total
CREATE TRIGGER trigger_update_import_order_total
    AFTER INSERT OR UPDATE OR DELETE ON import_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_import_order_total();
