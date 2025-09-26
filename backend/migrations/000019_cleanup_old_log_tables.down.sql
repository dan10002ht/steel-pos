-- Rollback cleanup of old log tables

-- Recreate inventory_history table (simplified version)
CREATE TABLE inventory_history (
    id SERIAL PRIMARY KEY,
    product_variant_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('import', 'sale', 'adjustment', 'return')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_id INTEGER,
    reference_type VARCHAR(50),
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_by_username VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_name VARCHAR(100)
);

-- Recreate inventory_logs table (simplified version)
CREATE TABLE inventory_logs (
    id SERIAL PRIMARY KEY,
    product_id INTEGER,
    variant_id INTEGER,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('sale', 'import', 'adjustment', 'return', 'transfer')),
    quantity_change DECIMAL(10,3) NOT NULL,
    previous_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    new_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop helper functions
DROP FUNCTION IF EXISTS log_inventory_change;
DROP FUNCTION IF EXISTS log_business_event;
DROP FUNCTION IF EXISTS log_system_event;














