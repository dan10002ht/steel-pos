-- Drop audit_logs table and related objects
DROP TRIGGER IF EXISTS trigger_audit_logs_updated_at ON audit_logs;
DROP FUNCTION IF EXISTS update_audit_logs_updated_at();
DROP TABLE IF EXISTS audit_logs;
