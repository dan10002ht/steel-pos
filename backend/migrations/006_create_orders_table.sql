-- Migration: Create orders table
-- Description: Bảng đơn hàng

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT REFERENCES customers(id),
    order_date TIMESTAMP NOT NULL,
    delivery_date TIMESTAMP, -- ngày giao hàng
    delivery_address TEXT, -- địa chỉ giao hàng
    contact_person VARCHAR(100), -- người liên hệ giao hàng
    contact_phone VARCHAR(20), -- số điện thoại liên hệ
    subtotal DECIMAL(15,2) DEFAULT 0, -- tổng tiền hàng
    tax_amount DECIMAL(15,2) DEFAULT 0, -- thuế
    discount_amount DECIMAL(15,2) DEFAULT 0, -- giảm giá
    total_amount DECIMAL(15,2) DEFAULT 0, -- tổng cộng
    paid_amount DECIMAL(15,2) DEFAULT 0, -- đã thanh toán
    remaining_amount DECIMAL(15,2) DEFAULT 0, -- còn lại
    order_status VARCHAR(20) DEFAULT 'new' CHECK (order_status IN ('new', 'processing', 'completed', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    payment_method VARCHAR(50), -- phương thức thanh toán
    notes TEXT, -- ghi chú đơn hàng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

-- Bảng chi tiết đơn hàng
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    quantity DECIMAL(10,3) NOT NULL, -- số lượng
    unit_price DECIMAL(15,2) NOT NULL, -- đơn giá
    discount_percent DECIMAL(5,2) DEFAULT 0, -- phần trăm giảm giá
    discount_amount DECIMAL(15,2) DEFAULT 0, -- số tiền giảm giá
    total_price DECIMAL(15,2) NOT NULL, -- thành tiền
    notes TEXT, -- ghi chú cho từng item
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);

-- Bảng lịch sử thanh toán
CREATE TABLE payment_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    payment_date TIMESTAMP NOT NULL,
    payment_amount DECIMAL(15,2) NOT NULL, -- số tiền thanh toán
    payment_method VARCHAR(50), -- phương thức thanh toán
    reference_number VARCHAR(100), -- số chứng từ thanh toán
    notes TEXT, -- ghi chú
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);

-- Indexes for orders
CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_by ON orders(created_by);

-- Indexes for order_items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Indexes for payment_history
CREATE INDEX idx_payment_history_order_id ON payment_history(order_id);
CREATE INDEX idx_payment_history_payment_date ON payment_history(payment_date);
CREATE INDEX idx_payment_history_created_by ON payment_history(created_by);

-- Trigger to update updated_at
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update order totals
CREATE OR REPLACE FUNCTION update_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update order totals when order_items change
    UPDATE orders 
    SET subtotal = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM order_items 
        WHERE order_id = NEW.order_id
    ),
    total_amount = subtotal + tax_amount - discount_amount,
    remaining_amount = total_amount - paid_amount,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.order_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update order totals
CREATE TRIGGER update_order_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_totals();

-- Function to update payment status
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update payment status based on paid_amount vs total_amount
    UPDATE orders 
    SET payment_status = CASE 
        WHEN paid_amount = 0 THEN 'unpaid'
        WHEN paid_amount >= total_amount THEN 'paid'
        ELSE 'partial'
    END,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.order_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update payment status
CREATE TRIGGER update_payment_status_trigger
    AFTER INSERT OR UPDATE ON payment_history
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_status(); 