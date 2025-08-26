package middleware

import (
	"strings"

	"steel-pos-backend/internal/services"
	"steel-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type TokenRefreshMiddleware struct {
	jwtService *services.JWTService
}

func NewTokenRefreshMiddleware(jwtService *services.JWTService) *TokenRefreshMiddleware {
	return &TokenRefreshMiddleware{
		jwtService: jwtService,
	}
}

// TokenRefreshMiddleware middleware để handle token refresh
func (m *TokenRefreshMiddleware) TokenRefresh() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Chỉ áp dụng cho các routes cần authentication
		if !requiresAuth(c.Request.URL.Path) {
			c.Next()
			return
		}

		// Lấy access token từ header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "Authorization header required")
			c.Abort()
			return
		}

		// Parse Bearer token
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			response.Unauthorized(c, "Invalid authorization header format")
			c.Abort()
			return
		}

		accessToken := tokenParts[1]

		// Validate access token
		claims, err := m.jwtService.ValidateToken(accessToken)
		if err == nil {
			// Token hợp lệ, tiếp tục
			c.Set("user_id", claims.UserID)
			c.Set("username", claims.Username)
			c.Set("role", claims.Role)
			c.Next()
			return
		}

		// Token không hợp lệ, kiểm tra xem có phải expired không
		if !strings.Contains(err.Error(), "token expired") {
			response.Unauthorized(c, "Invalid token")
			c.Abort()
			return
		}

		// Token expired, thử refresh
		refreshToken := c.GetHeader("X-Refresh-Token")
		if refreshToken == "" {
			response.Unauthorized(c, "Access token expired, refresh token required")
			c.Abort()
			return
		}

		// Validate và refresh token
		loginResponse, err := m.jwtService.RefreshToken(refreshToken)
		if err != nil {
			response.Unauthorized(c, "Invalid refresh token")
			c.Abort()
			return
		}

		// Set new tokens trong response headers
		c.Header("X-New-Access-Token", loginResponse.AccessToken)
		c.Header("X-New-Refresh-Token", loginResponse.RefreshToken)
		c.Header("X-Token-Expires-In", string(rune(loginResponse.ExpiresIn)))

		// Set user info trong context
		c.Set("user_id", loginResponse.User.ID)
		c.Set("username", loginResponse.User.Username)
		c.Set("role", loginResponse.User.Role)

		c.Next()
	}
}

// requiresAuth kiểm tra xem route có cần authentication không
func requiresAuth(path string) bool {
	// Danh sách các routes không cần authentication
	publicRoutes := []string{
		"/api/auth/login",
		"/api/auth/refresh",
		"/health",
		"/docs",
	}

	for _, route := range publicRoutes {
		if strings.HasPrefix(path, route) {
			return false
		}
	}

	// Tất cả routes khác cần authentication
	return true
}
