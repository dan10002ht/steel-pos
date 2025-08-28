package models

import "time"

// Product represents a product in the system
type Product struct {
	ID         int       `json:"id" db:"id"`
	Name       string    `json:"name" db:"name"`
	CategoryID *int      `json:"category_id" db:"category_id"`
	Unit       string    `json:"unit" db:"unit"`
	Notes      string    `json:"notes" db:"notes"`
	IsActive   bool      `json:"is_active" db:"is_active"`
	CreatedBy  int       `json:"created_by" db:"created_by"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`

	// Relations
	Category *ProductCategory  `json:"category,omitempty"`
	Variants []*ProductVariant `json:"variants,omitempty"`
}

// ProductVariant represents a product variant
type ProductVariant struct {
	ID        int       `json:"id" db:"id"`
	ProductID int       `json:"product_id" db:"product_id"`
	Name      string    `json:"name" db:"name"`
	SKU       string    `json:"sku" db:"sku"`
	Stock     int       `json:"stock" db:"stock"`
	Sold      int       `json:"sold" db:"sold"`
	Price     float64   `json:"price" db:"price"`
	Unit      string    `json:"unit" db:"unit"`
	IsActive  bool      `json:"is_active" db:"is_active"`
	CreatedBy int       `json:"created_by" db:"created_by"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`

	// Relations
	Product *Product `json:"product,omitempty"`
}

// ProductCategory represents a product category
type ProductCategory struct {
	ID          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	IsActive    bool      `json:"is_active" db:"is_active"`
	CreatedBy   int       `json:"created_by" db:"created_by"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// Request/Response structs
type CreateProductRequest struct {
	Name       string                        `json:"name" binding:"required"`
	CategoryID *int                          `json:"category_id"`
	Unit       string                        `json:"unit" binding:"required"`
	Notes      string                        `json:"notes"`
	Variants   []CreateProductVariantRequest `json:"variants"`
}

type UpdateProductRequest struct {
	Name       string                        `json:"name"`
	CategoryID *int                          `json:"category_id"`
	Unit       string                        `json:"unit"`
	Notes      string                        `json:"notes"`
	IsActive   *bool                         `json:"is_active"`
	Variants   []UpdateProductVariantRequest `json:"variants"`
}

type CreateProductVariantRequest struct {
	Name  string  `json:"name" binding:"required"`
	SKU   string  `json:"sku" binding:"required"`
	Stock int     `json:"stock"`
	Price float64 `json:"price" binding:"required"`
	Unit  string  `json:"unit"`
}

type UpdateProductVariantRequest struct {
	ID        *int     `json:"id"` // nil = create new, not nil = update existing
	Name      string   `json:"name"`
	SKU       string   `json:"sku"`
	Stock     *int     `json:"stock"`
	Price     *float64 `json:"price"`
	Unit      string   `json:"unit"`
	IsActive  *bool    `json:"is_active"`
	IsDeleted *bool    `json:"is_deleted"` // true = mark for deletion
}

type CreateProductCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type UpdateProductCategoryRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	IsActive    *bool  `json:"is_active"`
}

type ProductListResponse struct {
	Products []*Product `json:"products"`
	Total    int        `json:"total"`
	Page     int        `json:"page"`
	Limit    int        `json:"limit"`
}

type ProductVariantListResponse struct {
	Variants []*ProductVariant `json:"variants"`
	Total    int               `json:"total"`
	Page     int               `json:"page"`
	Limit    int               `json:"limit"`
}
