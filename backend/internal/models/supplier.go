package models

import "time"

// Supplier represents a supplier in the system
type Supplier struct {
	ID           int       `json:"id" db:"id"`
	Name         string    `json:"name" db:"name"`
	Code         string    `json:"code" db:"code"`
	Phone        string    `json:"phone" db:"phone"`
	Email        string    `json:"email" db:"email"`
	Address      string    `json:"address" db:"address"`
	TaxCode      string    `json:"tax_code" db:"tax_code"`
	ContactPerson string   `json:"contact_person" db:"contact_person"`
	IsActive     bool      `json:"is_active" db:"is_active"`
	CreatedBy    int       `json:"created_by" db:"created_by"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// Request/Response structs
type CreateSupplierRequest struct {
	Name          string `json:"name" binding:"required"`
	Code          string `json:"code" binding:"required"`
	Phone         string `json:"phone"`
	Email         string `json:"email"`
	Address       string `json:"address"`
	TaxCode       string `json:"tax_code"`
	ContactPerson string `json:"contact_person"`
}

type UpdateSupplierRequest struct {
	Name          string `json:"name"`
	Code          string `json:"code"`
	Phone         string `json:"phone"`
	Email         string `json:"email"`
	Address       string `json:"address"`
	TaxCode       string `json:"tax_code"`
	ContactPerson string `json:"contact_person"`
	IsActive      *bool  `json:"is_active"`
}

type SupplierListResponse struct {
	Suppliers []*Supplier `json:"suppliers"`
	Total     int         `json:"total"`
	Page      int         `json:"page"`
	Limit     int         `json:"limit"`
}
