-- Migration: Create customers table
-- Created: 2024-01-25
-- Description: Customers are identified by phone number, but can have different names in invoices

-- Create customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,  -- Primary identifier for customer
    name VARCHAR(255) NOT NULL,         -- Default name for this phone number
    address TEXT,
        
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,  -- user_id who created (no FK constraint)
    created_by_username VARCHAR(100)  -- Username of user who created this record
);

-- Create indexes for better performance
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_customers_created_by ON customers(created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
