package models

import (
	"time"
)

// Category model đại diện cho bảng categories
type Category struct {
	ID          int64     `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description *string   `json:"description,omitempty" db:"description"`
	ParentID    *int64    `json:"parent_id,omitempty" db:"parent_id"`
	IsActive    bool      `json:"is_active" db:"is_active"`
	SortOrder   int       `json:"sort_order" db:"sort_order"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	CreatedBy   *int64    `json:"created_by,omitempty" db:"created_by"`
	UpdatedBy   *int64    `json:"updated_by,omitempty" db:"updated_by"`
	
	// Related data
	Parent       *Category   `json:"parent,omitempty" db:"-"`
	Children     []*Category `json:"children,omitempty" db:"-"`
	Products     []*Product  `json:"products,omitempty" db:"-"`
	ProductsCount int        `json:"products_count,omitempty" db:"-"`
}

// CreateCategoryRequest request tạo category mới
type CreateCategoryRequest struct {
	Name        string  `json:"name" validate:"required,min=2,max=100"`
	Description *string `json:"description,omitempty"`
	ParentID    *int64  `json:"parent_id,omitempty"`
	SortOrder   int     `json:"sort_order,omitempty"`
}

// UpdateCategoryRequest request cập nhật category
type UpdateCategoryRequest struct {
	Name        *string `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Description *string `json:"description,omitempty"`
	ParentID    *int64  `json:"parent_id,omitempty"`
	SortOrder   *int    `json:"sort_order,omitempty"`
	IsActive    *bool   `json:"is_active,omitempty"`
} 