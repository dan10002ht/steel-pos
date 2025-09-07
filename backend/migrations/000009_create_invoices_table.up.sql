-- Migration: Create invoices table
-- Created: 2024-01-25
-- Description: Main invoices table with customer info and payment tracking

-- Create invoices table
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_code VARCHAR(50) UNIQUE NOT NULL,  -- "INV-2024-001"
    
    -- Customer info (can be different from customers table)
    customer_id INTEGER REFERENCES customers(id),  -- For analytics and reporting
    customer_phone VARCHAR(20) NOT NULL,       -- Links to customers.phone
    customer_name VARCHAR(255) NOT NULL,       -- Can be different from customers.name
    customer_address TEXT,
    
    -- Invoice details
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    -- Payment tracking
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    
    -- Status & metadata
    status VARCHAR(20) NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'confirmed', 'cancelled')),
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,  -- user_id who created (no FK constraint)
    
    -- Indexes
    INDEX idx_invoices_invoice_code (invoice_code),
    INDEX idx_invoices_customer_id (customer_id),
    INDEX idx_invoices_customer_phone (customer_phone),
    INDEX idx_invoices_created_at (created_at),
    INDEX idx_invoices_status (status),
    INDEX idx_invoices_payment_status (payment_status),
    INDEX idx_invoices_created_by (created_by)
);

-- Create trigger for updated_at
CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
