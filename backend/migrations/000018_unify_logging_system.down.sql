-- Rollback unified logging system
-- Remove added columns from audit_logs

ALTER TABLE audit_logs DROP COLUMN IF EXISTS log_category;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS log_type;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS inventory_data;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS business_data;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS system_data;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS quantity_change;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS previous_value;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS new_value;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS reference_entity_type;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS reference_entity_id;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS notes;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS severity;

-- Drop indexes
DROP INDEX IF EXISTS idx_audit_logs_category;
DROP INDEX IF EXISTS idx_audit_logs_log_type;
DROP INDEX IF EXISTS idx_audit_logs_reference;
DROP INDEX IF EXISTS idx_audit_logs_severity;
DROP INDEX IF EXISTS idx_audit_logs_inventory_data;
DROP INDEX IF EXISTS idx_audit_logs_business_data;
DROP INDEX IF EXISTS idx_audit_logs_system_data;




























