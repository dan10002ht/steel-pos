package models

import "time"

// Customer represents a customer in the system
type Customer struct {
	ID        int       `json:"id" db:"id"`
	Phone     string    `json:"phone" db:"phone"`
	Name      string    `json:"name" db:"name"`
	Address   *string   `json:"address" db:"address"`
	IsActive  bool      `json:"is_active" db:"is_active"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	CreatedBy *int      `json:"created_by" db:"created_by"`

	// Relations
	Invoices []*Invoice `json:"invoices,omitempty"`
}

// Request/Response structs
type CreateCustomerRequest struct {
	Phone   string  `json:"phone" binding:"required"`
	Name    string  `json:"name" binding:"required"`
	Address *string `json:"address"`
}

type UpdateCustomerRequest struct {
	Phone   *string `json:"phone"`
	Name    *string `json:"name"`
	Address *string `json:"address"`
	IsActive *bool  `json:"is_active"`
}

type CustomerListResponse struct {
	Customers []*Customer `json:"customers"`
	Total     int         `json:"total"`
	Page      int         `json:"page"`
	Limit     int         `json:"limit"`
}

type CustomerSummary struct {
	TotalCustomers int     `json:"total_customers"`
	ActiveCustomers int    `json:"active_customers"`
	TotalInvoices  int     `json:"total_invoices"`
	TotalSpent     float64 `json:"total_spent"`
}

