package models

import (
	"time"
)

type User struct {
	ID           int       `json:"id" db:"id"`
	Username     string    `json:"username" db:"username"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	FullName     string    `json:"full_name" db:"full_name"`
	Role         string    `json:"role" db:"role"`
	IsActive     bool      `json:"is_active" db:"is_active"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type CreateUserRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	FullName string `json:"full_name" validate:"required,min=2,max=100"`
	Role     string `json:"role" validate:"required,oneof=admin manager accountant user"`
}

type UpdateUserRequest struct {
	FullName string `json:"full_name" validate:"required,min=2,max=100"`
	Role     string `json:"role" validate:"required,oneof=admin manager accountant user"`
	IsActive *bool  `json:"is_active"`
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	User         *User  `json:"user"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int64  `json:"expires_in"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=6"`
}

type UserRole string

const (
	RoleAdmin      UserRole = "admin"
	RoleManager    UserRole = "manager"
	RoleAccountant UserRole = "accountant"
	RoleUser       UserRole = "user"
)

func (r UserRole) String() string {
	return string(r)
}

func (r UserRole) IsValid() bool {
	switch r {
	case RoleAdmin, RoleManager, RoleAccountant, RoleUser:
		return true
	default:
		return false
	}
}

func (r UserRole) CanCreateUser() bool {
	return r == RoleAdmin
}

func (r UserRole) CanManageUsers() bool {
	return r == RoleAdmin || r == RoleManager
}

func (r UserRole) CanApproveImport() bool {
	return r == RoleAdmin || r == RoleManager
}

func (r UserRole) CanCreateImport() bool {
	return r == RoleAccountant || r == RoleAdmin || r == RoleManager
}
