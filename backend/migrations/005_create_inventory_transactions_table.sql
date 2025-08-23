-- Migration: Create inventory_transactions table
-- Description: Bảng giao dịch kho (nhập, xuất, điều chỉnh, chuyển kho)

CREATE TABLE inventory_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('import', 'export', 'adjustment', 'transfer')),
    transaction_date TIMESTAMP NOT NULL,
    reference_number VARCHAR(100), -- số chứng từ gốc
    reference_type VARCHAR(50), -- loại chứng từ (PO, SO, etc.)
    notes TEXT, -- ghi chú
    total_amount DECIMAL(15,2) DEFAULT 0, -- tổng giá trị giao dịch
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

-- Bảng chi tiết giao dịch kho
CREATE TABLE inventory_transaction_items (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT REFERENCES inventory_transactions(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    quantity DECIMAL(10,3) NOT NULL, -- số lượng
    unit_price DECIMAL(15,2) NOT NULL, -- đơn giá
    total_price DECIMAL(15,2) NOT NULL, -- thành tiền
    stock_before INTEGER NOT NULL, -- tồn kho trước giao dịch
    stock_after INTEGER NOT NULL, -- tồn kho sau giao dịch
    notes TEXT, -- ghi chú cho từng item
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);

-- Indexes for inventory_transactions
CREATE INDEX idx_inventory_transactions_code ON inventory_transactions(transaction_code);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_inventory_transactions_status ON inventory_transactions(status);
CREATE INDEX idx_inventory_transactions_created_by ON inventory_transactions(created_by);

-- Indexes for inventory_transaction_items
CREATE INDEX idx_inventory_transaction_items_transaction_id ON inventory_transaction_items(transaction_id);
CREATE INDEX idx_inventory_transaction_items_product_id ON inventory_transaction_items(product_id);

-- Trigger to update updated_at
CREATE TRIGGER update_inventory_transactions_updated_at 
    BEFORE UPDATE ON inventory_transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update product stock after inventory transaction
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Update product current_stock based on transaction type
    IF NEW.transaction_type = 'import' THEN
        UPDATE products 
        SET current_stock = current_stock + NEW.quantity,
            updated_at = CURRENT_TIMESTAMP,
            updated_by = NEW.created_by
        WHERE id = NEW.product_id;
    ELSIF NEW.transaction_type = 'export' THEN
        UPDATE products 
        SET current_stock = current_stock - NEW.quantity,
            updated_at = CURRENT_TIMESTAMP,
            updated_by = NEW.created_by
        WHERE id = NEW.product_id;
    ELSIF NEW.transaction_type = 'adjustment' THEN
        UPDATE products 
        SET current_stock = NEW.stock_after,
            updated_at = CURRENT_TIMESTAMP,
            updated_by = NEW.created_by
        WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product stock
CREATE TRIGGER update_product_stock_trigger
    AFTER INSERT ON inventory_transaction_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock(); 