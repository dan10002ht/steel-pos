-- Migration: Create invoice_payments table
-- Created: 2024-01-25
-- Description: Track individual payments for invoices (supports partial payments)

-- Create invoice_payments table
CREATE TABLE invoice_payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Payment details
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(20) NOT NULL 
        CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'credit')),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Reference info
    transaction_reference VARCHAR(255),  -- bank transaction ID, card reference
    notes TEXT,
    
    -- Correction tracking
    correction_reason TEXT,
    corrected_by INTEGER,  -- user_id who made correction
    corrected_at TIMESTAMP WITH TIME ZONE,
    original_amount DECIMAL(15,2),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' 
        CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER  -- user_id who created
);

-- Create indexes
CREATE INDEX idx_invoice_payments_invoice_id ON invoice_payments (invoice_id);
CREATE INDEX idx_invoice_payments_payment_date ON invoice_payments (payment_date);
CREATE INDEX idx_invoice_payments_status ON invoice_payments (status);
CREATE INDEX idx_invoice_payments_created_by ON invoice_payments (created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_invoice_payments_updated_at 
    BEFORE UPDATE ON invoice_payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
