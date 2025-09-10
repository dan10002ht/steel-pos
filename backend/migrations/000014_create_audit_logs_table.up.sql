-- Create audit_logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'invoice', 'customer', 'product', etc.
    entity_id INTEGER NOT NULL,       -- ID of the entity being audited
    action VARCHAR(20) NOT NULL,      -- 'created', 'updated', 'deleted'
    user_id INTEGER,                  -- ID of user who performed the action
    user_name VARCHAR(255),           -- Name of user (for display purposes)
    created_by INTEGER,               -- ID of user who created this audit log
    created_by_name VARCHAR(255),     -- Name of user who created this audit log
    old_data JSONB,                   -- Previous state of the entity
    new_data JSONB,                   -- New state of the entity
    changes_summary TEXT,             -- Human-readable summary of changes
    ip_address INET,                  -- IP address of the user
    user_agent TEXT,                  -- User agent string
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Create GIN index for JSONB columns for better query performance
CREATE INDEX idx_audit_logs_old_data ON audit_logs USING GIN(old_data);
CREATE INDEX idx_audit_logs_new_data ON audit_logs USING GIN(new_data);

-- Add foreign key constraint to users table (if exists)
-- ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_user_id 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_audit_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_audit_logs_updated_at
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_logs_updated_at();

-- Add comments for documentation
COMMENT ON TABLE audit_logs IS 'Audit trail for tracking changes to entities';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity being audited (invoice, customer, product, etc.)';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the entity being audited';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (created, updated, deleted)';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of user who performed the action';
COMMENT ON COLUMN audit_logs.user_name IS 'Name of user for display purposes';
COMMENT ON COLUMN audit_logs.old_data IS 'Previous state of the entity (JSON)';
COMMENT ON COLUMN audit_logs.new_data IS 'New state of the entity (JSON)';
COMMENT ON COLUMN audit_logs.changes_summary IS 'Human-readable summary of changes';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the user';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string';
