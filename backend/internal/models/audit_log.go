package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
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
	LogCategory    *string   `json:"log_category" db:"log_category"`
	LogType        *string   `json:"log_type" db:"log_type"`
	InventoryData  JSONB     `json:"inventory_data" db:"inventory_data"`
	BusinessData   JSONB     `json:"business_data" db:"business_data"`
	SystemData     JSONB     `json:"system_data" db:"system_data"`
	QuantityChange *float64  `json:"quantity_change" db:"quantity_change"`
	PreviousValue  *float64  `json:"previous_value" db:"previous_value"`
	NewValue       *float64  `json:"new_value" db:"new_value"`
	ReferenceEntityType *string `json:"reference_entity_type" db:"reference_entity_type"`
	ReferenceEntityID   *int    `json:"reference_entity_id" db:"reference_entity_id"`
	Notes          *string   `json:"notes" db:"notes"`
	Severity       *string   `json:"severity" db:"severity"`
	CreatedBy      *int      `json:"created_by" db:"created_by"`
	CreatedByName  *string   `json:"created_by_name" db:"created_by_name"`
	DisplayText    *string   `json:"display_text" db:"display_text"`
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
	LogCategory    *string                `json:"log_category"`
	LogType        *string                `json:"log_type"`
	InventoryData  map[string]interface{} `json:"inventory_data"`
	BusinessData   map[string]interface{} `json:"business_data"`
	SystemData     map[string]interface{} `json:"system_data"`
	QuantityChange *float64               `json:"quantity_change"`
	PreviousValue  *float64               `json:"previous_value"`
	NewValue       *float64               `json:"new_value"`
	ReferenceEntityType *string           `json:"reference_entity_type"`
	ReferenceEntityID   *int              `json:"reference_entity_id"`
	Notes          *string                `json:"notes"`
	Severity       *string                `json:"severity"`
	CreatedBy      *int                   `json:"created_by"`
	CreatedByName  *string                `json:"created_by_name"`
	DisplayText    *string                `json:"display_text"`
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

	inventoryData := make(map[string]interface{})
	if a.InventoryData != nil {
		inventoryData = map[string]interface{}(a.InventoryData)
	}

	businessData := make(map[string]interface{})
	if a.BusinessData != nil {
		businessData = map[string]interface{}(a.BusinessData)
	}

	systemData := make(map[string]interface{})
	if a.SystemData != nil {
		systemData = map[string]interface{}(a.SystemData)
	}

	return AuditLogResponse{
		ID:                   a.ID,
		EntityType:           a.EntityType,
		EntityID:             a.EntityID,
		Action:               a.Action,
		UserID:               a.UserID,
		UserName:             a.UserName,
		OldData:              oldData,
		NewData:              newData,
		ChangesSummary:       a.ChangesSummary,
		IPAddress:            a.IPAddress,
		UserAgent:            a.UserAgent,
		LogCategory:          a.LogCategory,
		LogType:              a.LogType,
		InventoryData:        inventoryData,
		BusinessData:         businessData,
		SystemData:           systemData,
		QuantityChange:       a.QuantityChange,
		PreviousValue:        a.PreviousValue,
		NewValue:             a.NewValue,
		ReferenceEntityType:  a.ReferenceEntityType,
		ReferenceEntityID:    a.ReferenceEntityID,
		Notes:                a.Notes,
		Severity:             a.Severity,
		CreatedBy:            a.CreatedBy,
		CreatedByName:        a.CreatedByName,
		DisplayText:          a.DisplayText,
		CreatedAt:            a.CreatedAt,
		UpdatedAt:            a.UpdatedAt,
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

// GenerateDisplayText generates human-readable display text for audit log
func (a *AuditLog) GenerateDisplayText() string {
	userName := "Hệ thống"
	if a.UserName != nil && *a.UserName != "" {
		userName = *a.UserName
	}
	
	date := a.CreatedAt.Format("02/01/2006 15:04:05")
	
	switch a.EntityType {
	case "invoice":
		switch a.Action {
		case "created":
			return fmt.Sprintf("%s tạo hoá đơn vào %s", userName, date)
		case "updated":
			return fmt.Sprintf("%s cập nhật hoá đơn vào %s", userName, date)
		case "cancelled":
			return fmt.Sprintf("%s hủy hoá đơn vào %s", userName, date)
		case "payment_created":
			if a.NewData != nil {
				amount := "0 VNĐ"
				if amt, ok := a.NewData["amount"].(float64); ok {
					amount = fmt.Sprintf("%.0f VNĐ", amt)
				}
				method := "không xác định"
				if m, ok := a.NewData["payment_method"].(string); ok {
					switch m {
					case "cash":
						method = "tiền mặt"
					case "card":
						method = "thẻ"
					case "bank_transfer":
						method = "chuyển khoản"
					case "credit":
						method = "ghi nợ"
					}
				}
				return fmt.Sprintf("%s thanh toán %s bằng %s vào %s", userName, amount, method, date)
			}
			return fmt.Sprintf("%s thêm thanh toán vào %s", userName, date)
		case "payment_updated":
			return fmt.Sprintf("%s cập nhật thanh toán vào %s", userName, date)
		case "payment_deleted":
			return fmt.Sprintf("%s xóa thanh toán vào %s", userName, date)
		default:
			return fmt.Sprintf("%s thực hiện %s vào %s", userName, a.Action, date)
		}
	case "customer":
		switch a.Action {
		case "created":
			return fmt.Sprintf("%s tạo khách hàng vào %s", userName, date)
		case "updated":
			return fmt.Sprintf("%s cập nhật khách hàng vào %s", userName, date)
		case "deleted":
			return fmt.Sprintf("%s xóa khách hàng vào %s", userName, date)
		default:
			return fmt.Sprintf("%s thực hiện %s khách hàng vào %s", userName, a.Action, date)
		}
	case "product":
		switch a.Action {
		case "created":
			return fmt.Sprintf("%s tạo sản phẩm vào %s", userName, date)
		case "updated":
			return fmt.Sprintf("%s cập nhật sản phẩm vào %s", userName, date)
		case "deleted":
			return fmt.Sprintf("%s xóa sản phẩm vào %s", userName, date)
		default:
			return fmt.Sprintf("%s thực hiện %s sản phẩm vào %s", userName, a.Action, date)
		}
	case "product_variant":
		switch a.Action {
		case "created":
			return fmt.Sprintf("%s tạo biến thể sản phẩm vào %s", userName, date)
		case "updated":
			return fmt.Sprintf("%s cập nhật biến thể sản phẩm vào %s", userName, date)
		case "deleted":
			return fmt.Sprintf("%s xóa biến thể sản phẩm vào %s", userName, date)
		case "cancellation":
			return fmt.Sprintf("%s khôi phục tồn kho vào %s", userName, date)
		default:
			return fmt.Sprintf("%s thực hiện %s biến thể sản phẩm vào %s", userName, a.Action, date)
		}
	default:
		return fmt.Sprintf("%s thực hiện %s %s vào %s", userName, a.Action, a.EntityType, date)
	}
}
