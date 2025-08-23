package models

import (
	"time"
)

// UserRole định nghĩa các vai trò người dùng
type UserRole string

const (
	SuperAdmin UserRole = "super_admin"
	Accountant UserRole = "accountant"
)

// User model đại diện cho bảng users
type User struct {
	ID           int64     `json:"id" db:"id"`
	Username     string    `json:"username" db:"username"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"` // Không trả về trong JSON
	FullName     string    `json:"full_name" db:"full_name"`
	Phone        *string   `json:"phone,omitempty" db:"phone"`
	Role         UserRole  `json:"role" db:"role"`
	IsActive     bool      `json:"is_active" db:"is_active"`
	LastLoginAt  *time.Time `json:"last_login_at,omitempty" db:"last_login_at"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
	CreatedBy    *int64    `json:"created_by,omitempty" db:"created_by"`
	UpdatedBy    *int64    `json:"updated_by,omitempty" db:"updated_by"`
}

// CreateUserRequest request tạo user mới
type CreateUserRequest struct {
	Username string   `json:"username" validate:"required,min=3,max=50"`
	Email    string   `json:"email" validate:"required,email"`
	Password string   `json:"password" validate:"required,min=6"`
	FullName string   `json:"full_name" validate:"required,min=2,max=100"`
	Phone    *string  `json:"phone,omitempty"`
	Role     UserRole `json:"role" validate:"required,oneof=super_admin accountant"`
}

// UpdateUserRequest request cập nhật user
type UpdateUserRequest struct {
	Email    *string   `json:"email,omitempty" validate:"omitempty,email"`
	FullName *string   `json:"full_name,omitempty" validate:"omitempty,min=2,max=100"`
	Phone    *string   `json:"phone,omitempty"`
	Role     *UserRole `json:"role,omitempty" validate:"omitempty,oneof=super_admin accountant"`
	IsActive *bool     `json:"is_active,omitempty"`
}

// ChangePasswordRequest request đổi mật khẩu
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=6"`
}

// LoginRequest request đăng nhập
type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// LoginResponse response đăng nhập
type LoginResponse struct {
	User         *User  `json:"user"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// IsSuperAdmin kiểm tra user có phải super admin không
func (u *User) IsSuperAdmin() bool {
	return u.Role == SuperAdmin
}

// IsAccountant kiểm tra user có phải kế toán không
func (u *User) IsAccountant() bool {
	return u.Role == Accountant
}

// CanManageUsers kiểm tra user có quyền quản lý users không
func (u *User) CanManageUsers() bool {
	return u.IsSuperAdmin()
}

// CanManageProducts kiểm tra user có quyền quản lý sản phẩm không
func (u *User) CanManageProducts() bool {
	return u.IsSuperAdmin() || u.IsAccountant()
}

// CanManageInventory kiểm tra user có quyền quản lý kho không
func (u *User) CanManageInventory() bool {
	return u.IsSuperAdmin() || u.IsAccountant()
}

// CanManageOrders kiểm tra user có quyền quản lý đơn hàng không
func (u *User) CanManageOrders() bool {
	return u.IsSuperAdmin() || u.IsAccountant()
}

// CanManageCustomers kiểm tra user có quyền quản lý khách hàng không
func (u *User) CanManageCustomers() bool {
	return u.IsSuperAdmin() || u.IsAccountant()
}

// CanViewReports kiểm tra user có quyền xem báo cáo không
func (u *User) CanViewReports() bool {
	return u.IsSuperAdmin() || u.IsAccountant()
} 