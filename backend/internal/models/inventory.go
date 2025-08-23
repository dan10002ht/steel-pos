package models

import (
	"time"
)

// TransactionType định nghĩa các loại giao dịch kho
type TransactionType string

const (
	TransactionTypeImport     TransactionType = "import"     // Nhập kho
	TransactionTypeExport     TransactionType = "export"     // Xuất kho
	TransactionTypeAdjustment TransactionType = "adjustment" // Điều chỉnh kho
	TransactionTypeTransfer   TransactionType = "transfer"   // Chuyển kho
)

// TransactionStatus định nghĩa các trạng thái giao dịch
type TransactionStatus string

const (
	TransactionStatusPending   TransactionStatus = "pending"   // Chờ xử lý
	TransactionStatusCompleted TransactionStatus = "completed" // Hoàn thành
	TransactionStatusCancelled TransactionStatus = "cancelled" // Đã hủy
)

// InventoryTransaction model đại diện cho bảng inventory_transactions
type InventoryTransaction struct {
	ID              int64             `json:"id" db:"id"`
	TransactionCode string            `json:"transaction_code" db:"transaction_code"`
	TransactionType TransactionType   `json:"transaction_type" db:"transaction_type"`
	TransactionDate time.Time         `json:"transaction_date" db:"transaction_date"`
	ReferenceNumber *string           `json:"reference_number,omitempty" db:"reference_number"`
	ReferenceType   *string           `json:"reference_type,omitempty" db:"reference_type"`
	Notes           *string           `json:"notes,omitempty" db:"notes"`
	TotalAmount     float64           `json:"total_amount" db:"total_amount"`
	Status          TransactionStatus `json:"status" db:"status"`
	CreatedAt       time.Time         `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time         `json:"updated_at" db:"updated_at"`
	CreatedBy       *int64            `json:"created_by,omitempty" db:"created_by"`
	UpdatedBy       *int64            `json:"updated_by,omitempty" db:"updated_by"`
	
	// Related data
	Items []*InventoryTransactionItem `json:"items,omitempty" db:"-"`
}

// InventoryTransactionItem model đại diện cho bảng inventory_transaction_items
type InventoryTransactionItem struct {
	ID           int64     `json:"id" db:"id"`
	TransactionID int64     `json:"transaction_id" db:"transaction_id"`
	ProductID    int64     `json:"product_id" db:"product_id"`
	Quantity     float64   `json:"quantity" db:"quantity"`
	UnitPrice    float64   `json:"unit_price" db:"unit_price"`
	TotalPrice   float64   `json:"total_price" db:"total_price"`
	StockBefore  int       `json:"stock_before" db:"stock_before"`
	StockAfter   int       `json:"stock_after" db:"stock_after"`
	Notes        *string   `json:"notes,omitempty" db:"notes"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	CreatedBy    *int64    `json:"created_by,omitempty" db:"created_by"`
	
	// Related data
	Product *Product `json:"product,omitempty" db:"-"`
}

// CreateInventoryTransactionRequest request tạo giao dịch kho
type CreateInventoryTransactionRequest struct {
	TransactionType TransactionType `json:"transaction_type" validate:"required,oneof=import export adjustment transfer"`
	TransactionDate time.Time       `json:"transaction_date" validate:"required"`
	ReferenceNumber *string         `json:"reference_number,omitempty"`
	ReferenceType   *string         `json:"reference_type,omitempty"`
	Notes           *string         `json:"notes,omitempty"`
	Items           []CreateInventoryTransactionItemRequest `json:"items" validate:"required,min=1"`
}

// CreateInventoryTransactionItemRequest request tạo item giao dịch kho
type CreateInventoryTransactionItemRequest struct {
	ProductID  int64   `json:"product_id" validate:"required"`
	Quantity   float64 `json:"quantity" validate:"required,gt=0"`
	UnitPrice  float64 `json:"unit_price" validate:"required,gt=0"`
	Notes      *string `json:"notes,omitempty"`
}

// UpdateInventoryTransactionRequest request cập nhật giao dịch kho
type UpdateInventoryTransactionRequest struct {
	TransactionDate *time.Time        `json:"transaction_date,omitempty"`
	ReferenceNumber *string           `json:"reference_number,omitempty"`
	ReferenceType   *string           `json:"reference_type,omitempty"`
	Notes           *string           `json:"notes,omitempty"`
	Status          *TransactionStatus `json:"status,omitempty"`
}

// InventoryTransactionSearchRequest request tìm kiếm giao dịch kho
type InventoryTransactionSearchRequest struct {
	TransactionType *TransactionType   `json:"transaction_type,omitempty"`
	Status          *TransactionStatus `json:"status,omitempty"`
	DateFrom        *time.Time        `json:"date_from,omitempty"`
	DateTo          *time.Time        `json:"date_to,omitempty"`
	ProductID       *int64            `json:"product_id,omitempty"`
	Page            int               `json:"page"`
	Limit           int               `json:"limit"`
} 