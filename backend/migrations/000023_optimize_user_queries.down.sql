-- Migration: Revert user query optimizations
-- Created: 2024-12-XX

DROP INDEX IF EXISTS idx_users_username_is_active;

