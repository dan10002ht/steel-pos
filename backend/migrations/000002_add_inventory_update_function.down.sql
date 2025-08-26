-- Migration: Remove inventory update functions and triggers
-- Created: 2024-01-25

-- Drop trigger first
DROP TRIGGER IF EXISTS trigger_update_import_order_total ON import_order_items;

-- Drop functions
DROP FUNCTION IF EXISTS update_inventory_on_import_approval(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS generate_next_import_code();
DROP FUNCTION IF EXISTS calculate_import_order_total(INTEGER);
DROP FUNCTION IF EXISTS get_product_variant_by_name(INTEGER, VARCHAR);
DROP FUNCTION IF EXISTS update_import_order_total();
