package services

import (
	"errors"
	"time"

	"steel-pos-backend/internal/config"
	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo  *repository.UserRepository
	jwtService *JWTService
	config    *config.Config
}

func NewAuthService(userRepo *repository.UserRepository, jwtService *JWTService, config *config.Config) *AuthService {
	return &AuthService{
		userRepo:   userRepo,
		jwtService: jwtService,
		config:     config,
	}
}

func (s *AuthService) Login(req *models.LoginRequest) (*models.LoginResponse, error) {
	// Tìm user theo username
	user, err := s.userRepo.GetByUsername(req.Username)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Kiểm tra password
	if !s.checkPassword(req.Password, user.PasswordHash) {
		return nil, errors.New("invalid credentials")
	}

	// Kiểm tra user có active không
	if !user.IsActive {
		return nil, errors.New("account is deactivated")
	}

	// Generate tokens
	accessToken, err := s.jwtService.GenerateAccessToken(user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.jwtService.GenerateRefreshToken(user)
	if err != nil {
		return nil, err
	}

	expiration, _ := time.ParseDuration(s.config.JWT.AccessTokenExpiry)

	return &models.LoginResponse{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    int64(expiration.Seconds()),
	}, nil
}

func (s *AuthService) RefreshToken(refreshToken string) (*models.LoginResponse, error) {
	return s.jwtService.RefreshToken(refreshToken)
}

func (s *AuthService) ChangePassword(userID int, req *models.ChangePasswordRequest) error {
	// Lấy thông tin user
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return err
	}

	// Kiểm tra password hiện tại
	if !s.checkPassword(req.CurrentPassword, user.PasswordHash) {
		return errors.New("current password is incorrect")
	}

	// Hash password mới
	hashedPassword, err := s.hashPassword(req.NewPassword)
	if err != nil {
		return err
	}

	// Cập nhật password
	return s.userRepo.UpdatePassword(userID, hashedPassword)
}

func (s *AuthService) CreateUser(req *models.CreateUserRequest, createdBy int) (*models.User, error) {
	// Kiểm tra quyền tạo user (chỉ admin mới được tạo user)
	creator, err := s.userRepo.GetByID(createdBy)
	if err != nil {
		return nil, err
	}

	if creator.Role != "admin" {
		return nil, errors.New("only admin can create users")
	}

	// Kiểm tra username đã tồn tại chưa
	exists, err := s.userRepo.ExistsByUsername(req.Username)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("username already exists")
	}

	// Kiểm tra email đã tồn tại chưa
	exists, err = s.userRepo.ExistsByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("email already exists")
	}

	// Hash password
	hashedPassword, err := s.hashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Tạo user mới
	user := &models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FullName:     req.FullName,
		Role:         req.Role,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	err = s.userRepo.Create(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) GetUserByID(userID int) (*models.User, error) {
	return s.userRepo.GetByID(userID)
}

func (s *AuthService) GetAllUsers(limit, offset int) ([]*models.User, error) {
	return s.userRepo.GetAll(limit, offset)
}

func (s *AuthService) UpdateUser(userID int, req *models.UpdateUserRequest, updatedBy int) (*models.User, error) {
	// Kiểm tra quyền update user
	updater, err := s.userRepo.GetByID(updatedBy)
	if err != nil {
		return nil, err
	}

	// Chỉ admin và manager mới được update user
	if updater.Role != "admin" && updater.Role != "manager" {
		return nil, errors.New("insufficient permissions")
	}

	// Lấy user cần update
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	// Cập nhật thông tin
	user.FullName = req.FullName
	user.Role = req.Role
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}
	user.UpdatedAt = time.Now()

	// Update trong database
	err = s.userRepo.Update(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) DeleteUser(userID int, deletedBy int) error {
	// Kiểm tra quyền delete user
	deleter, err := s.userRepo.GetByID(deletedBy)
	if err != nil {
		return err
	}

	// Chỉ admin mới được delete user
	if deleter.Role != "admin" {
		return errors.New("only admin can delete users")
	}

	// Không cho phép delete chính mình
	if userID == deletedBy {
		return errors.New("cannot delete yourself")
	}

	return s.userRepo.Delete(userID)
}

// Helper functions
func (s *AuthService) hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func (s *AuthService) checkPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
