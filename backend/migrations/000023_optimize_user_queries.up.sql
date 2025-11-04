-- Migration: Optimize user queries with composite index
-- Created: 2024-12-XX

-- Add composite index for username + is_active lookup (used in login)
-- This will significantly speed up the GetByUsername query
CREATE INDEX IF NOT EXISTS idx_users_username_is_active ON users(username, is_active);

-- Add index for email lookup (if not already exists from UNIQUE constraint)
-- Note: UNIQUE constraint automatically creates an index, but this ensures it's optimized
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

