package models

import "time"

// ImportOrder represents an import order
type ImportOrder struct {
	ID           int       `json:"id" db:"id"`
	ImportCode   string    `json:"import_code" db:"import_code"`
	SupplierID   int       `json:"supplier_id" db:"supplier_id"`
	ImportDate   time.Time `json:"import_date" db:"import_date"`
	TotalAmount  float64   `json:"total_amount" db:"total_amount"`
	Status       string    `json:"status" db:"status"`
	Notes        string    `json:"notes" db:"notes"`
	ImportImages []string  `json:"import_images" db:"import_images"`
	ApprovedBy   *int      `json:"approved_by" db:"approved_by"`
	ApprovedAt   *time.Time `json:"approved_at" db:"approved_at"`
	ApprovalNote string    `json:"approval_note" db:"approval_note"`
	CreatedBy    int       `json:"created_by" db:"created_by"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
	
	// Relations
	Supplier *Supplier          `json:"supplier,omitempty"`
	Items    []*ImportOrderItem `json:"items,omitempty"`
}

// ImportOrderItem represents an item in an import order
type ImportOrderItem struct {
	ID            int       `json:"id" db:"id"`
	ImportOrderID int       `json:"import_order_id" db:"import_order_id"`
	ProductID     int       `json:"product_id" db:"product_id"`
	VariantID     int       `json:"variant_id" db:"variant_id"`
	Quantity      int       `json:"quantity" db:"quantity"`
	UnitPrice     float64   `json:"unit_price" db:"unit_price"`
	TotalPrice    float64   `json:"total_price" db:"total_price"`
	Unit          string    `json:"unit" db:"unit"`
	Notes         string    `json:"notes" db:"notes"`
	CreatedBy     int       `json:"created_by" db:"created_by"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
	
	// Relations
	Product *Product       `json:"product,omitempty"`
	Variant *ProductVariant `json:"variant,omitempty"`
}

// Request/Response structs
type CreateImportOrderRequest struct {
	SupplierID   int                        `json:"supplier_id" binding:"required"`
	ImportDate   time.Time                  `json:"import_date" binding:"required"`
	Notes        string                     `json:"notes"`
	ImportImages []string                   `json:"import_images"`
	Items        []CreateImportOrderItemRequest `json:"items" binding:"required"`
}

type UpdateImportOrderRequest struct {
	SupplierID   *int       `json:"supplier_id"`
	ImportDate   *time.Time `json:"import_date"`
	Notes        string     `json:"notes"`
	ImportImages []string   `json:"import_images"`
	Status       string     `json:"status"`
}

type CreateImportOrderItemRequest struct {
	ProductID int     `json:"product_id" binding:"required"`
	VariantID int     `json:"variant_id" binding:"required"`
	Quantity  int     `json:"quantity" binding:"required"`
	UnitPrice float64 `json:"unit_price" binding:"required"`
	Unit      string  `json:"unit"`
	Notes     string  `json:"notes"`
}

type UpdateImportOrderItemRequest struct {
	ProductID *int     `json:"product_id"`
	VariantID *int     `json:"variant_id"`
	Quantity  *int     `json:"quantity"`
	UnitPrice *float64 `json:"unit_price"`
	Unit      string   `json:"unit"`
	Notes     string   `json:"notes"`
}

type ApproveImportOrderRequest struct {
	ApprovalNote string `json:"approval_note"`
}

type ImportOrderListResponse struct {
	ImportOrders []*ImportOrder `json:"import_orders"`
	Total        int            `json:"total"`
	Page         int            `json:"page"`
	Limit        int            `json:"limit"`
}

type ImportOrderDetailResponse struct {
	ImportOrder *ImportOrder       `json:"import_order"`
	Items       []*ImportOrderItem `json:"items"`
}
