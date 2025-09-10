package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// AuditLog represents an audit log entry
type AuditLog struct {
	ID             int       `json:"id" db:"id"`
	EntityType     string    `json:"entity_type" db:"entity_type"`
	EntityID       int       `json:"entity_id" db:"entity_id"`
	Action         string    `json:"action" db:"action"`
	UserID         *int      `json:"user_id" db:"user_id"`
	UserName       *string   `json:"user_name" db:"user_name"`
	OldData        JSONB     `json:"old_data" db:"old_data"`
	NewData        JSONB     `json:"new_data" db:"new_data"`
	ChangesSummary *string   `json:"changes_summary" db:"changes_summary"`
	IPAddress      *string   `json:"ip_address" db:"ip_address"`
	UserAgent      *string   `json:"user_agent" db:"user_agent"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}

// JSONB is a custom type for PostgreSQL JSONB columns
type JSONB map[string]interface{}

// Value implements the driver.Valuer interface for JSONB
func (j JSONB) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface for JSONB
func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, j)
}

// AuditLogCreateRequest represents the request to create an audit log
type AuditLogCreateRequest struct {
	EntityType     string                 `json:"entity_type" validate:"required"`
	EntityID       int                    `json:"entity_id" validate:"required"`
	Action         string                 `json:"action" validate:"required,oneof=created updated deleted"`
	UserID         *int                   `json:"user_id"`
	UserName       *string                `json:"user_name"`
	OldData        map[string]interface{} `json:"old_data,omitempty"`
	NewData        map[string]interface{} `json:"new_data,omitempty"`
	ChangesSummary *string                `json:"changes_summary,omitempty"`
	IPAddress      *string                `json:"ip_address,omitempty"`
	UserAgent      *string                `json:"user_agent,omitempty"`
}

// AuditLogResponse represents the response for audit log queries
type AuditLogResponse struct {
	ID             int                    `json:"id"`
	EntityType     string                 `json:"entity_type"`
	EntityID       int                    `json:"entity_id"`
	Action         string                 `json:"action"`
	UserID         *int                   `json:"user_id"`
	UserName       *string                `json:"user_name"`
	OldData        map[string]interface{} `json:"old_data"`
	NewData        map[string]interface{} `json:"new_data"`
	ChangesSummary *string                `json:"changes_summary"`
	IPAddress      *string                `json:"ip_address"`
	UserAgent      *string                `json:"user_agent"`
	CreatedAt      time.Time              `json:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at"`
}

// AuditLogListResponse represents the response for audit log list queries
type AuditLogListResponse struct {
	AuditLogs []AuditLogResponse `json:"audit_logs"`
	Total     int                `json:"total"`
	Page      int                `json:"page"`
	Limit     int                `json:"limit"`
}

// ToResponse converts AuditLog to AuditLogResponse
func (a *AuditLog) ToResponse() AuditLogResponse {
	oldData := make(map[string]interface{})
	if a.OldData != nil {
		oldData = map[string]interface{}(a.OldData)
	}

	newData := make(map[string]interface{})
	if a.NewData != nil {
		newData = map[string]interface{}(a.NewData)
	}

	return AuditLogResponse{
		ID:             a.ID,
		EntityType:     a.EntityType,
		EntityID:       a.EntityID,
		Action:         a.Action,
		UserID:         a.UserID,
		UserName:       a.UserName,
		OldData:        oldData,
		NewData:        newData,
		ChangesSummary: a.ChangesSummary,
		IPAddress:      a.IPAddress,
		UserAgent:      a.UserAgent,
		CreatedAt:      a.CreatedAt,
		UpdatedAt:      a.UpdatedAt,
	}
}

// AuditLogFilter represents filters for audit log queries
type AuditLogFilter struct {
	EntityType *string `json:"entity_type,omitempty"`
	EntityID   *int    `json:"entity_id,omitempty"`
	Action     *string `json:"action,omitempty"`
	UserID     *int    `json:"user_id,omitempty"`
	DateFrom   *string `json:"date_from,omitempty"`
	DateTo     *string `json:"date_to,omitempty"`
	Page       int     `json:"page"`
	Limit      int     `json:"limit"`
}
