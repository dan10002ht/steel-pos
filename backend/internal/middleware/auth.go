package middleware

import (
	"net/http"
	"strings"

	"steel-pos-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type AuthMiddleware struct {
	jwtService *services.JWTService
}

func NewAuthMiddleware(jwtService *services.JWTService) *AuthMiddleware {
	return &AuthMiddleware{
		jwtService: jwtService,
	}
}

// Authenticate middleware để verify JWT token
func (m *AuthMiddleware) Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Lấy token từ header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Authorization header is required",
				"message": "Token not provided",
			})
			c.Abort()
			return
		}

		// Kiểm tra format "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid authorization header format",
				"message": "Use 'Bearer <token>' format",
			})
			c.Abort()
			return
		}

		token := tokenParts[1]

		// Validate token
		claims, err := m.jwtService.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid token",
				"message": err.Error(),
			})
			c.Abort()
			return
		}

		// Lưu thông tin user vào context
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Set("claims", claims)

		c.Next()
	}
}

// RequireRole middleware để kiểm tra role cụ thể
func (m *AuthMiddleware) RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Đảm bảo đã authenticate trước
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Authentication required",
				"message": "User not authenticated",
			})
			c.Abort()
			return
		}

		role := userRole.(string)

		// Kiểm tra role có trong danh sách được phép không
		hasPermission := false
		for _, allowedRole := range roles {
			if role == allowedRole {
				hasPermission = true
				break
			}
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Insufficient permissions",
				"message": "You don't have permission to access this resource",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAdmin middleware để kiểm tra quyền admin
func (m *AuthMiddleware) RequireAdmin() gin.HandlerFunc {
	return m.RequireRole("admin")
}

// RequireManager middleware để kiểm tra quyền manager trở lên
func (m *AuthMiddleware) RequireManager() gin.HandlerFunc {
	return m.RequireRole("admin", "manager")
}

// RequireAccountant middleware để kiểm tra quyền accountant trở lên
func (m *AuthMiddleware) RequireAccountant() gin.HandlerFunc {
	return m.RequireRole("admin", "manager", "accountant")
}

// GetCurrentUserID helper function để lấy user ID từ context
func GetCurrentUserID(c *gin.Context) (int, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}
	return userID.(int), true
}

// GetCurrentUserRole helper function để lấy user role từ context
func GetCurrentUserRole(c *gin.Context) (string, bool) {
	role, exists := c.Get("role")
	if !exists {
		return "", false
	}
	return role.(string), true
}

// GetCurrentUsername helper function để lấy username từ context
func GetCurrentUsername(c *gin.Context) (string, bool) {
	username, exists := c.Get("username")
	if !exists {
		return "", false
	}
	return username.(string), true
}
