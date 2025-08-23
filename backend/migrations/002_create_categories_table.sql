-- Migration: Create categories table
-- Description: Bảng phân loại sản phẩm

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- Trigger to update updated_at
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, description, sort_order, created_by) VALUES 
('Sắt thép xây dựng', 'Các loại sắt thép dùng trong xây dựng', 1, 1),
('Thép hình', 'Thép hình các loại', 2, 1),
('Thép tấm', 'Thép tấm các loại', 3, 1),
('Thép ống', 'Thép ống các loại', 4, 1),
('Phụ kiện', 'Các loại phụ kiện sắt thép', 5, 1); 