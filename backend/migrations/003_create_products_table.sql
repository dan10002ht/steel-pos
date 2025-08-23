-- Migration: Create products table
-- Description: Bảng sản phẩm sắt thép

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES categories(id),
    unit VARCHAR(20) NOT NULL, -- kg, cây, tấm, cuộn, mét, v.v.
    weight_per_unit DECIMAL(10,3), -- trọng lượng mỗi đơn vị (kg)
    length_per_unit DECIMAL(10,3), -- chiều dài mỗi đơn vị (m)
    width_per_unit DECIMAL(10,3), -- chiều rộng mỗi đơn vị (m)
    thickness_per_unit DECIMAL(10,3), -- độ dày mỗi đơn vị (mm)
    diameter_per_unit DECIMAL(10,3), -- đường kính mỗi đơn vị (mm)
    purchase_price DECIMAL(15,2), -- giá nhập
    selling_price DECIMAL(15,2), -- giá bán
    cost_price DECIMAL(15,2), -- giá vốn
    min_stock_level INTEGER DEFAULT 0, -- mức tồn kho tối thiểu
    max_stock_level INTEGER, -- mức tồn kho tối đa
    current_stock INTEGER DEFAULT 0, -- tồn kho hiện tại
    barcode VARCHAR(100), -- mã vạch
    brand VARCHAR(100), -- thương hiệu
    origin VARCHAR(100), -- xuất xứ
    specifications TEXT, -- quy cách, thông số kỹ thuật
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_current_stock ON products(current_stock);

-- Trigger to update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products
INSERT INTO products (code, name, description, category_id, unit, weight_per_unit, length_per_unit, 
                     purchase_price, selling_price, cost_price, min_stock_level, current_stock, 
                     brand, origin, specifications, created_by) VALUES 
('ST001', 'Thép hộp 40x40x2mm', 'Thép hộp vuông 40x40mm, độ dày 2mm', 2, 'cây', 3.2, 6.0, 
 85000, 95000, 85000, 10, 50, 'Hòa Phát', 'Việt Nam', '40x40x2mm, 6m/cây', 1),
('ST002', 'Thép hộp 50x50x2mm', 'Thép hộp vuông 50x50mm, độ dày 2mm', 2, 'cây', 4.5, 6.0, 
 105000, 120000, 105000, 10, 30, 'Hòa Phát', 'Việt Nam', '50x50x2mm, 6m/cây', 1),
('ST003', 'Thép tấm 3mm', 'Thép tấm dày 3mm', 3, 'tấm', 23.55, 6.0, 2.0, 
 850000, 950000, 850000, 5, 20, 'Hòa Phát', 'Việt Nam', '3mm x 6m x 2m', 1),
('ST004', 'Thép ống 114mm', 'Thép ống đường kính 114mm', 4, 'cây', 15.8, 6.0, 
 180000, 200000, 180000, 5, 15, 'Hòa Phát', 'Việt Nam', '114mm x 6m', 1); 