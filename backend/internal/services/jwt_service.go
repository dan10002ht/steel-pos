package services

import (
	"errors"
	"fmt"
	"time"

	"steel-pos-backend/internal/config"
	"steel-pos-backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
)

type JWTService struct {
	config            *config.Config
	refreshTokenSvc   *RefreshTokenService
}

type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func NewJWTService(config *config.Config, refreshTokenSvc *RefreshTokenService) *JWTService {
	return &JWTService{
		config:          config,
		refreshTokenSvc: refreshTokenSvc,
	}
}

func (s *JWTService) GenerateAccessToken(user *models.User) (string, error) {
	expiration, err := time.ParseDuration(s.config.JWT.AccessTokenExpiry)
	if err != nil {
		return "", fmt.Errorf("invalid expiration time: %w", err)
	}

	claims := &Claims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "steel-pos-backend",
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWT.Secret))
}

func (s *JWTService) GenerateRefreshToken(user *models.User) (string, error) {
	// Refresh token có thời hạn dài hơn từ config
	expiration, err := time.ParseDuration(s.config.JWT.RefreshTokenExpiry)
	if err != nil {
		return "", fmt.Errorf("invalid refresh token expiration time: %w", err)
	}

	claims := &Claims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "steel-pos-backend",
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWT.Secret))
}

func (s *JWTService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.config.JWT.Secret), nil
	})

	if err != nil {
		// Check specific JWT errors
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, fmt.Errorf("token expired: %w", err)
		}
		if errors.Is(err, jwt.ErrTokenNotValidYet) {
			return nil, fmt.Errorf("token not valid yet: %w", err)
		}
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token claims")
}

func (s *JWTService) RefreshToken(refreshToken string) (*models.LoginResponse, error) {
	claims, err := s.ValidateToken(refreshToken)
	if err != nil {
		return nil, err
	}

	// Tạo user object từ claims
	user := &models.User{
		ID:       claims.UserID,
		Username: claims.Username,
		Role:     claims.Role,
	}

	// Generate new tokens
	accessToken, err := s.GenerateAccessToken(user)
	if err != nil {
		return nil, err
	}

	newRefreshToken, err := s.GenerateRefreshToken(user)
	if err != nil {
		return nil, err
	}

	expiration, _ := time.ParseDuration(s.config.JWT.AccessTokenExpiry)

	return &models.LoginResponse{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    int64(expiration.Seconds()),
	}, nil
}
