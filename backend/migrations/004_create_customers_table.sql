-- Migration: Create customers table
-- Description: Bảng khách hàng

CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    tax_code VARCHAR(50), -- mã số thuế
    contact_person VARCHAR(100), -- người liên hệ
    contact_phone VARCHAR(20), -- số điện thoại liên hệ
    credit_limit DECIMAL(15,2) DEFAULT 0, -- hạn mức tín dụng
    current_debt DECIMAL(15,2) DEFAULT 0, -- nợ hiện tại
    payment_term INTEGER DEFAULT 0, -- kỳ hạn thanh toán (ngày)
    customer_type VARCHAR(20) DEFAULT 'retail' CHECK (customer_type IN ('retail', 'wholesale', 'contractor')), -- loại khách hàng
    is_active BOOLEAN DEFAULT true,
    notes TEXT, -- ghi chú
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_customers_code ON customers(code);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_tax_code ON customers(tax_code);
CREATE INDEX idx_customers_customer_type ON customers(customer_type);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_customers_current_debt ON customers(current_debt);

-- Trigger to update updated_at
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample customers
INSERT INTO customers (code, name, phone, email, address, tax_code, contact_person, 
                      contact_phone, credit_limit, customer_type, created_by) VALUES 
('KH001', 'Công ty TNHH ABC', '02412345678', 'info@abc.com', '123 Đường ABC, Hà Nội', 
 '0123456789', 'Nguyễn Văn A', '0901234567', 50000000, 'wholesale', 1),
('KH002', 'Công ty CP XYZ', '02487654321', 'contact@xyz.com', '456 Đường XYZ, Hà Nội', 
 '0987654321', 'Trần Thị B', '0909876543', 100000000, 'contractor', 1),
('KH003', 'Anh Nguyễn Văn C', '0901111111', 'nguyenc@gmail.com', '789 Đường DEF, Hà Nội', 
 NULL, 'Nguyễn Văn C', '0901111111', 10000000, 'retail', 1); 