-- Migration: Create triggers for invoice system
-- Created: 2024-01-25
-- Description: Auto-update invoice payment status when payments change

-- Create function to update invoice payment status
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
    total_paid DECIMAL(15,2);
    invoice_total DECIMAL(15,2);
    new_payment_status VARCHAR(20);
BEGIN
    -- Get total paid amount for the invoice
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM invoice_payments 
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id) 
    AND status = 'confirmed';
    
    -- Get invoice total amount
    SELECT total_amount INTO invoice_total
    FROM invoices 
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    -- Determine payment status
    IF total_paid >= invoice_total THEN
        new_payment_status := 'paid';
    ELSIF total_paid > 0 THEN
        new_payment_status := 'partial';
    ELSE
        new_payment_status := 'pending';
    END IF;
    
    -- Update invoice
    UPDATE invoices 
    SET 
        paid_amount = total_paid,
        payment_status = new_payment_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for invoice_payments
CREATE TRIGGER update_invoice_payment_after_insert
    AFTER INSERT ON invoice_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_payment_status();

CREATE TRIGGER update_invoice_payment_after_update
    AFTER UPDATE ON invoice_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_payment_status();

CREATE TRIGGER update_invoice_payment_after_delete
    AFTER DELETE ON invoice_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_payment_status();
