package models

import "time"

// Invoice represents an invoice in the system
type Invoice struct {
	ID                 int       `json:"id" db:"id"`
	InvoiceCode        string    `json:"invoice_code" db:"invoice_code"`
	CustomerID         *int      `json:"customer_id" db:"customer_id"`
	CustomerPhone      string    `json:"customer_phone" db:"customer_phone"`
	CustomerName       string    `json:"customer_name" db:"customer_name"`
	CustomerAddress    *string   `json:"customer_address" db:"customer_address"`
	Subtotal           float64   `json:"subtotal" db:"subtotal"`
	DiscountAmount     float64   `json:"discount_amount" db:"discount_amount"`
	DiscountPercentage float64   `json:"discount_percentage" db:"discount_percentage"`
	TaxAmount          float64   `json:"tax_amount" db:"tax_amount"`
	TaxPercentage      float64   `json:"tax_percentage" db:"tax_percentage"`
	TotalAmount        float64   `json:"total_amount" db:"total_amount"`
	PaidAmount         float64   `json:"paid_amount" db:"paid_amount"`
	PaymentStatus      string    `json:"payment_status" db:"payment_status"`
	Status             string    `json:"status" db:"status"`
	Notes              *string   `json:"notes" db:"notes"`
	CreatedAt          time.Time `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time `json:"updated_at" db:"updated_at"`
	CreatedBy          *int      `json:"created_by" db:"created_by"`

	// Relations
	Items         []*InvoiceItem   `json:"items,omitempty"`
	Payments      []*InvoicePayment `json:"payments,omitempty"`
}

// InvoiceItem represents an item in an invoice
type InvoiceItem struct {
	ID           int     `json:"id" db:"id"`
	InvoiceID    int     `json:"invoice_id" db:"invoice_id"`
	ProductID    *int    `json:"product_id" db:"product_id"`
	VariantID    *int    `json:"variant_id" db:"variant_id"`
	ProductName  string  `json:"product_name" db:"product_name"`
	VariantName  string  `json:"variant_name" db:"variant_name"`
	Unit         string  `json:"unit" db:"unit"`
	Quantity     float64 `json:"quantity" db:"quantity"`
	UnitPrice    float64 `json:"unit_price" db:"unit_price"`
	TotalPrice   float64 `json:"total_price" db:"total_price"`
	ProductNotes *string `json:"product_notes" db:"product_notes"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`

	// Relations
	Invoice *Invoice `json:"invoice,omitempty"`
}

// InvoicePayment represents a payment for an invoice
type InvoicePayment struct {
	ID                   int        `json:"id" db:"id"`
	InvoiceID            int        `json:"invoice_id" db:"invoice_id"`
	Amount               float64    `json:"amount" db:"amount"`
	PaymentMethod        string     `json:"payment_method" db:"payment_method"`
	PaymentDate          time.Time  `json:"payment_date" db:"payment_date"`
	TransactionReference *string    `json:"transaction_reference" db:"transaction_reference"`
	Notes                *string    `json:"notes" db:"notes"`
	CorrectionReason     *string    `json:"correction_reason" db:"correction_reason"`
	CorrectedBy          *int       `json:"corrected_by" db:"corrected_by"`
	CorrectedAt          *time.Time `json:"corrected_at" db:"corrected_at"`
	OriginalAmount       *float64   `json:"original_amount" db:"original_amount"`
	Status               string     `json:"status" db:"status"`
	CreatedAt            time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at" db:"updated_at"`
	CreatedBy            *int       `json:"created_by" db:"created_by"`

	// Relations
	Invoice *Invoice `json:"invoice,omitempty"`
}

// InventoryLog represents an inventory movement log
type InventoryLog struct {
	ID             int       `json:"id" db:"id"`
	ProductID      *int      `json:"product_id" db:"product_id"`
	VariantID      *int      `json:"variant_id" db:"variant_id"`
	MovementType   string    `json:"movement_type" db:"movement_type"`
	QuantityChange float64   `json:"quantity_change" db:"quantity_change"`
	PreviousStock  float64   `json:"previous_stock" db:"previous_stock"`
	NewStock       float64   `json:"new_stock" db:"new_stock"`
	ReferenceType  string    `json:"reference_type" db:"reference_type"`
	ReferenceID    int       `json:"reference_id" db:"reference_id"`
	Notes          *string   `json:"notes" db:"notes"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	CreatedBy      *int      `json:"created_by" db:"created_by"`
}

// Request/Response structs

// CreateInvoiceRequest represents a request to create an invoice
type CreateInvoiceRequest struct {
	CustomerID         *int                      `json:"customer_id"`
	CustomerPhone      string                    `json:"customer_phone" binding:"required"`
	CustomerName       string                    `json:"customer_name" binding:"required"`
	CustomerAddress    *string                   `json:"customer_address"`
	Items              []CreateInvoiceItemRequest `json:"items" binding:"required,min=1"`
	DiscountAmount     *float64                  `json:"discount_amount"`
	DiscountPercentage *float64                  `json:"discount_percentage"`
	TaxAmount          *float64                  `json:"tax_amount"`
	TaxPercentage      *float64                  `json:"tax_percentage"`
	PaymentMethod      *string                   `json:"payment_method"`
	PaidAmount         *float64                  `json:"paid_amount"`
	Notes              *string                   `json:"notes"`
}

// CreateInvoiceItemRequest represents a request to create an invoice item
type CreateInvoiceItemRequest struct {
	ProductID    *int    `json:"product_id"`
	VariantID    *int    `json:"variant_id"`
	ProductName  string  `json:"product_name" binding:"required"`
	VariantName  string  `json:"variant_name" binding:"required"`
	Unit         string  `json:"unit" binding:"required"`
	Quantity     float64 `json:"quantity" binding:"required,gt=0"`
	UnitPrice    float64 `json:"unit_price" binding:"required,gte=0"`
	ProductNotes *string `json:"product_notes"`
}

// UpdateInvoiceRequest represents a request to update an invoice
type UpdateInvoiceRequest struct {
	CustomerPhone      *string                   `json:"customer_phone"`
	CustomerName       *string                   `json:"customer_name"`
	CustomerAddress    *string                   `json:"customer_address"`
	Items              []UpdateInvoiceItemRequest `json:"items"`
	DiscountAmount     *float64                  `json:"discount_amount"`
	DiscountPercentage *float64                  `json:"discount_percentage"`
	TaxAmount          *float64                  `json:"tax_amount"`
	TaxPercentage      *float64                  `json:"tax_percentage"`
	PaymentMethod      *string                   `json:"payment_method"`
	PaidAmount         *float64                  `json:"paid_amount"`
	Status             *string                   `json:"status"`
	Notes              *string                   `json:"notes"`
}

// UpdateInvoiceItemRequest represents a request to update an invoice item
type UpdateInvoiceItemRequest struct {
	ID           *int     `json:"id"` // nil = create new, not nil = update existing
	ProductID    *int     `json:"product_id"`
	VariantID    *int     `json:"variant_id"`
	ProductName  *string  `json:"product_name"`
	VariantName  *string  `json:"variant_name"`
	Unit         *string  `json:"unit"`
	Quantity     *float64 `json:"quantity"`
	UnitPrice    *float64 `json:"unit_price"`
	ProductNotes *string  `json:"product_notes"`
	IsDeleted    *bool    `json:"is_deleted"` // true = mark for deletion
}

// CreateInvoicePaymentRequest represents a request to create an invoice payment
type CreateInvoicePaymentRequest struct {
	Amount               float64  `json:"amount" binding:"required,gt=0"`
	PaymentMethod        string   `json:"payment_method" binding:"required"`
	PaymentDate          *time.Time `json:"payment_date"`
	TransactionReference *string  `json:"transaction_reference"`
	Notes                *string  `json:"notes"`
}

// UpdateInvoicePaymentRequest represents a request to update an invoice payment
type UpdateInvoicePaymentRequest struct {
	Amount               *float64   `json:"amount"`
	PaymentMethod        *string    `json:"payment_method"`
	PaymentDate          *time.Time `json:"payment_date"`
	TransactionReference *string    `json:"transaction_reference"`
	Notes                *string    `json:"notes"`
	CorrectionReason     *string    `json:"correction_reason"`
	Status               *string    `json:"status"`
}

// InvoiceListResponse represents a paginated list of invoices
type InvoiceListResponse struct {
	Invoices []*Invoice `json:"invoices"`
	Total    int        `json:"total"`
	Page     int        `json:"page"`
	Limit    int        `json:"limit"`
}

// CustomerListResponse represents a paginated list of customers

// InvoiceSummary represents a summary of invoice statistics
type InvoiceSummary struct {
	TotalInvoices    int     `json:"total_invoices"`
	TotalAmount      float64 `json:"total_amount"`
	PaidAmount       float64 `json:"paid_amount"`
	PendingAmount    float64 `json:"pending_amount"`
	TodayInvoices    int     `json:"today_invoices"`
	TodayAmount      float64 `json:"today_amount"`
}
