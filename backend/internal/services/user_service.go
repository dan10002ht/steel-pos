package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"

	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepo *repository.UserRepository
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// CreateUser tạo user mới
func (s *UserService) CreateUser(ctx context.Context, req *models.CreateUserRequest) (*models.User, error) {
	// Kiểm tra username đã tồn tại chưa
	exists, err := s.userRepo.ExistsByUsername(ctx, req.Username)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("username already exists")
	}

	// Kiểm tra email đã tồn tại chưa
	exists, err = s.userRepo.ExistsByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("email already exists")
	}

	// Hash password
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(passwordHash),
		FullName:     req.FullName,
		Phone:        req.Phone,
		Role:         req.Role,
		IsActive:     true,
	}

	err = s.userRepo.Create(ctx, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserByID lấy user theo ID
func (s *UserService) GetUserByID(ctx context.Context, id int64) (*models.User, error) {
	return s.userRepo.GetByID(ctx, id)
}

// GetUserByUsername lấy user theo username
func (s *UserService) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	return s.userRepo.GetByUsername(ctx, username)
}

// ListUsers lấy danh sách users với pagination
func (s *UserService) ListUsers(ctx context.Context, page, limit int) ([]*models.User, int64, error) {
	offset := (page - 1) * limit
	
	users, err := s.userRepo.List(ctx, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.userRepo.Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// UpdateUser cập nhật thông tin user
func (s *UserService) UpdateUser(ctx context.Context, id int64, req *models.UpdateUserRequest) (*models.User, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Cập nhật các trường được cung cấp
	if req.Email != nil {
		// Kiểm tra email mới có trùng với user khác không
		if *req.Email != user.Email {
			exists, err := s.userRepo.ExistsByEmail(ctx, *req.Email)
			if err != nil {
				return nil, err
			}
			if exists {
				return nil, errors.New("email already exists")
			}
		}
		user.Email = *req.Email
	}

	if req.FullName != nil {
		user.FullName = *req.FullName
	}

	if req.Phone != nil {
		user.Phone = req.Phone
	}

	if req.Role != nil {
		user.Role = *req.Role
	}

	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	err = s.userRepo.Update(ctx, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// ChangePassword đổi mật khẩu user
func (s *UserService) ChangePassword(ctx context.Context, id int64, req *models.ChangePasswordRequest) error {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Kiểm tra mật khẩu hiện tại
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword))
	if err != nil {
		return errors.New("current password is incorrect")
	}

	// Hash mật khẩu mới
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.userRepo.UpdatePassword(ctx, id, string(passwordHash))
}

// Login đăng nhập user
func (s *UserService) Login(ctx context.Context, req *models.LoginRequest) (*models.LoginResponse, error) {
	user, err := s.userRepo.GetByUsername(ctx, req.Username)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Kiểm tra user có active không
	if !user.IsActive {
		return nil, errors.New("user account is disabled")
	}

	// Kiểm tra mật khẩu
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Cập nhật thời gian đăng nhập cuối
	err = s.userRepo.UpdateLastLogin(ctx, user.ID)
	if err != nil {
		// Log error nhưng không return error vì login vẫn thành công
		// TODO: Add logger
	}

	// Tạo access token và refresh token
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

// DeleteUser xóa user (soft delete)
func (s *UserService) DeleteUser(ctx context.Context, id int64) error {
	return s.userRepo.Delete(ctx, id)
}

// HardDeleteUser xóa hoàn toàn user
func (s *UserService) HardDeleteUser(ctx context.Context, id int64) error {
	return s.userRepo.HardDelete(ctx, id)
}

// generateAccessToken tạo access token
func (s *UserService) generateAccessToken(user *models.User) (string, error) {
	// TODO: Implement JWT token generation
	// Tạm thời tạo token đơn giản
	token := make([]byte, 32)
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(token), nil
}

// generateRefreshToken tạo refresh token
func (s *UserService) generateRefreshToken(userID int64) (string, error) {
	// TODO: Implement refresh token generation
	// Tạm thời tạo token đơn giản
	token := make([]byte, 32)
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(token), nil
}

// ValidateUserPermissions kiểm tra quyền của user
func (s *UserService) ValidateUserPermissions(user *models.User, requiredPermissions ...string) bool {
	// TODO: Implement permission validation logic
	// Tạm thời cho phép tất cả super_admin
	if user.IsSuperAdmin() {
		return true
	}

	// Kiểm tra các quyền cụ thể cho accountant
	for _, permission := range requiredPermissions {
		switch permission {
		case "manage_products":
			if !user.CanManageProducts() {
				return false
			}
		case "manage_inventory":
			if !user.CanManageInventory() {
				return false
			}
		case "manage_orders":
			if !user.CanManageOrders() {
				return false
			}
		case "manage_customers":
			if !user.CanManageCustomers() {
				return false
			}
		case "view_reports":
			if !user.CanViewReports() {
				return false
			}
		case "manage_users":
			if !user.CanManageUsers() {
				return false
			}
		}
	}

	return true
} 