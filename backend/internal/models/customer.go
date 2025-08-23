package models

import (
	"time"
)

// CustomerType định nghĩa các loại khách hàng
type CustomerType string

const (
	CustomerTypeRetail     CustomerType = "retail"     // Khách lẻ
	CustomerTypeWholesale  CustomerType = "wholesale"  // Khách sỉ
	CustomerTypeContractor CustomerType = "contractor" // Nhà thầu
)

// Customer model đại diện cho bảng customers
type Customer struct {
	ID            int64        `json:"id" db:"id"`
	Code          string       `json:"code" db:"code"`
	Name          string       `json:"name" db:"name"`
	Phone         *string      `json:"phone,omitempty" db:"phone"`
	Email         *string      `json:"email,omitempty" db:"email"`
	Address       *string      `json:"address,omitempty" db:"address"`
	TaxCode       *string      `json:"tax_code,omitempty" db:"tax_code"`
	ContactPerson *string      `json:"contact_person,omitempty" db:"contact_person"`
	ContactPhone  *string      `json:"contact_phone,omitempty" db:"contact_phone"`
	CreditLimit   float64      `json:"credit_limit" db:"credit_limit"`
	CurrentDebt   float64      `json:"current_debt" db:"current_debt"`
	PaymentTerm   int          `json:"payment_term" db:"payment_term"`
	CustomerType  CustomerType `json:"customer_type" db:"customer_type"`
	IsActive      bool         `json:"is_active" db:"is_active"`
	Notes         *string      `json:"notes,omitempty" db:"notes"`
	CreatedAt     time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at" db:"updated_at"`
	CreatedBy     *int64       `json:"created_by,omitempty" db:"created_by"`
	UpdatedBy     *int64       `json:"updated_by,omitempty" db:"updated_by"`
	
	// Related data
	Orders []*Order `json:"orders,omitempty" db:"-"`
}

// CreateCustomerRequest request tạo customer mới
type CreateCustomerRequest struct {
	Code          string       `json:"code" validate:"required,min=2,max=50"`
	Name          string       `json:"name" validate:"required,min=2,max=200"`
	Phone         *string      `json:"phone,omitempty"`
	Email         *string      `json:"email,omitempty" validate:"omitempty,email"`
	Address       *string      `json:"address,omitempty"`
	TaxCode       *string      `json:"tax_code,omitempty"`
	ContactPerson *string      `json:"contact_person,omitempty"`
	ContactPhone  *string      `json:"contact_phone,omitempty"`
	CreditLimit   float64      `json:"credit_limit"`
	PaymentTerm   int          `json:"payment_term"`
	CustomerType  CustomerType `json:"customer_type" validate:"required,oneof=retail wholesale contractor"`
	Notes         *string      `json:"notes,omitempty"`
}

// UpdateCustomerRequest request cập nhật customer
type UpdateCustomerRequest struct {
	Name          *string      `json:"name,omitempty" validate:"omitempty,min=2,max=200"`
	Phone         *string      `json:"phone,omitempty"`
	Email         *string      `json:"email,omitempty" validate:"omitempty,email"`
	Address       *string      `json:"address,omitempty"`
	TaxCode       *string      `json:"tax_code,omitempty"`
	ContactPerson *string      `json:"contact_person,omitempty"`
	ContactPhone  *string      `json:"contact_phone,omitempty"`
	CreditLimit   *float64     `json:"credit_limit,omitempty"`
	PaymentTerm   *int         `json:"payment_term,omitempty"`
	CustomerType  *CustomerType `json:"customer_type,omitempty" validate:"omitempty,oneof=retail wholesale contractor"`
	IsActive      *bool        `json:"is_active,omitempty"`
	Notes         *string      `json:"notes,omitempty"`
}

// CustomerSearchRequest request tìm kiếm customer
type CustomerSearchRequest struct {
	Keyword      *string      `json:"keyword,omitempty"`
	CustomerType *CustomerType `json:"customer_type,omitempty"`
	IsActive     *bool        `json:"is_active,omitempty"`
	HasDebt      *bool        `json:"has_debt,omitempty"` // Khách hàng có nợ
	Page         int          `json:"page"`
	Limit        int          `json:"limit"`
} 