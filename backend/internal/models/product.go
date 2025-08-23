package models

import (
	"time"
)

// Product model đại diện cho bảng products
type Product struct {
	ID                int64     `json:"id" db:"id"`
	Code              string    `json:"code" db:"code"`
	Name              string    `json:"name" db:"name"`
	Description       *string   `json:"description,omitempty" db:"description"`
	CategoryID        *int64    `json:"category_id,omitempty" db:"category_id"`
	Unit              string    `json:"unit" db:"unit"`
	WeightPerUnit     *float64  `json:"weight_per_unit,omitempty" db:"weight_per_unit"`
	LengthPerUnit     *float64  `json:"length_per_unit,omitempty" db:"length_per_unit"`
	WidthPerUnit      *float64  `json:"width_per_unit,omitempty" db:"width_per_unit"`
	ThicknessPerUnit  *float64  `json:"thickness_per_unit,omitempty" db:"thickness_per_unit"`
	DiameterPerUnit   *float64  `json:"diameter_per_unit,omitempty" db:"diameter_per_unit"`
	PurchasePrice     *float64  `json:"purchase_price,omitempty" db:"purchase_price"`
	SellingPrice      *float64  `json:"selling_price,omitempty" db:"selling_price"`
	CostPrice         *float64  `json:"cost_price,omitempty" db:"cost_price"`
	MinStockLevel     int       `json:"min_stock_level" db:"min_stock_level"`
	MaxStockLevel     *int      `json:"max_stock_level,omitempty" db:"max_stock_level"`
	CurrentStock      int       `json:"current_stock" db:"current_stock"`
	Barcode           *string   `json:"barcode,omitempty" db:"barcode"`
	Brand             *string   `json:"brand,omitempty" db:"brand"`
	Origin            *string   `json:"origin,omitempty" db:"origin"`
	Specifications    *string   `json:"specifications,omitempty" db:"specifications"`
	IsActive          bool      `json:"is_active" db:"is_active"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
	CreatedBy         *int64    `json:"created_by,omitempty" db:"created_by"`
	UpdatedBy         *int64    `json:"updated_by,omitempty" db:"updated_by"`
	
	// Related data
	Category *Category `json:"category,omitempty" db:"-"`
}

// CreateProductRequest request tạo product mới
type CreateProductRequest struct {
	Code              string   `json:"code" validate:"required,min=2,max=50"`
	Name              string   `json:"name" validate:"required,min=2,max=200"`
	Description       *string  `json:"description,omitempty"`
	CategoryID        *int64   `json:"category_id,omitempty"`
	Unit              string   `json:"unit" validate:"required,max=20"`
	WeightPerUnit     *float64 `json:"weight_per_unit,omitempty"`
	LengthPerUnit     *float64 `json:"length_per_unit,omitempty"`
	WidthPerUnit      *float64 `json:"width_per_unit,omitempty"`
	ThicknessPerUnit  *float64 `json:"thickness_per_unit,omitempty"`
	DiameterPerUnit   *float64 `json:"diameter_per_unit,omitempty"`
	PurchasePrice     *float64 `json:"purchase_price,omitempty"`
	SellingPrice      *float64 `json:"selling_price,omitempty"`
	CostPrice         *float64 `json:"cost_price,omitempty"`
	MinStockLevel     int      `json:"min_stock_level"`
	MaxStockLevel     *int     `json:"max_stock_level,omitempty"`
	Barcode           *string  `json:"barcode,omitempty"`
	Brand             *string  `json:"brand,omitempty"`
	Origin            *string  `json:"origin,omitempty"`
	Specifications    *string  `json:"specifications,omitempty"`
}

// UpdateProductRequest request cập nhật product
type UpdateProductRequest struct {
	Name              *string  `json:"name,omitempty" validate:"omitempty,min=2,max=200"`
	Description       *string  `json:"description,omitempty"`
	CategoryID        *int64   `json:"category_id,omitempty"`
	Unit              *string  `json:"unit,omitempty" validate:"omitempty,max=20"`
	WeightPerUnit     *float64 `json:"weight_per_unit,omitempty"`
	LengthPerUnit     *float64 `json:"length_per_unit,omitempty"`
	WidthPerUnit      *float64 `json:"width_per_unit,omitempty"`
	ThicknessPerUnit  *float64 `json:"thickness_per_unit,omitempty"`
	DiameterPerUnit   *float64 `json:"diameter_per_unit,omitempty"`
	PurchasePrice     *float64 `json:"purchase_price,omitempty"`
	SellingPrice      *float64 `json:"selling_price,omitempty"`
	CostPrice         *float64 `json:"cost_price,omitempty"`
	MinStockLevel     *int     `json:"min_stock_level,omitempty"`
	MaxStockLevel     *int     `json:"max_stock_level,omitempty"`
	Barcode           *string  `json:"barcode,omitempty"`
	Brand             *string  `json:"brand,omitempty"`
	Origin            *string  `json:"origin,omitempty"`
	Specifications    *string  `json:"specifications,omitempty"`
	IsActive          *bool    `json:"is_active,omitempty"`
}

// ProductSearchRequest request tìm kiếm product
type ProductSearchRequest struct {
	Keyword     *string `json:"keyword,omitempty"`
	CategoryID  *int64  `json:"category_id,omitempty"`
	Brand       *string `json:"brand,omitempty"`
	IsActive    *bool   `json:"is_active,omitempty"`
	LowStock    *bool   `json:"low_stock,omitempty"` // Sản phẩm tồn kho thấp
	Page        int     `json:"page"`
	Limit       int     `json:"limit"`
} 