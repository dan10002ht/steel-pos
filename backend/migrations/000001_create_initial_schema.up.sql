-- Migration: Create initial schema for Steel POS system
-- Created: 2024-01-25

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'accountant', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create product_categories table
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER, -- No foreign key constraint to avoid cascade delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES product_categories(id) NULL,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER, -- No foreign key constraint to avoid cascade delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create product_variants table
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    sold INTEGER DEFAULT 0 CHECK (sold >= 0),
    price DECIMAL(15,2) NOT NULL CHECK (price >= 0),
    unit VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER, -- No foreign key constraint to avoid cascade delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, name)
);

-- Create import_orders table
CREATE TABLE import_orders (
    id SERIAL PRIMARY KEY,
    import_code VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(200) NOT NULL,
    import_date DATE NOT NULL,
    total_value DECIMAL(15,2) DEFAULT 0,
    import_images TEXT[], -- Array of image URLs
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approval_note TEXT,
    approved_by INTEGER, -- No foreign key constraint to avoid cascade delete
    approved_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER NOT NULL, -- No foreign key constraint to avoid cascade delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create import_order_items table
CREATE TABLE import_order_items (
    id SERIAL PRIMARY KEY,
    import_order_id INTEGER NOT NULL REFERENCES import_orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    product_variant_id INTEGER REFERENCES product_variants(id),
    product_name VARCHAR(200) NOT NULL,
    variant_name VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(15,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(15,2) NOT NULL CHECK (total_price >= 0),
    unit VARCHAR(20) NOT NULL,
    created_by INTEGER, -- No foreign key constraint to avoid cascade delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_history table
CREATE TABLE inventory_history (
    id SERIAL PRIMARY KEY,
    product_variant_id INTEGER NOT NULL REFERENCES product_variants(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('import', 'sale', 'adjustment', 'return')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_id INTEGER, -- import_order_id, sale_id, etc.
    reference_type VARCHAR(50), -- 'import_order', 'sale', etc.
    notes TEXT,
    created_by INTEGER NOT NULL, -- No foreign key constraint to avoid cascade delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_import_orders_supplier_name ON import_orders(supplier_name);
CREATE INDEX idx_import_orders_status ON import_orders(status);
CREATE INDEX idx_import_orders_created_by ON import_orders(created_by);
CREATE INDEX idx_import_order_items_import_order_id ON import_order_items(import_order_id);
CREATE INDEX idx_import_order_items_product_id ON import_order_items(product_id);
CREATE INDEX idx_inventory_history_product_variant_id ON inventory_history(product_variant_id);
CREATE INDEX idx_inventory_history_type ON inventory_history(type);
CREATE INDEX idx_inventory_history_created_at ON inventory_history(created_at);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_import_orders_updated_at BEFORE UPDATE ON import_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
