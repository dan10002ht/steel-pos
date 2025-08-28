package routes

import (
	"steel-pos-backend/internal/handlers"
	"steel-pos-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupAuthRoutes(api *gin.RouterGroup, authHandler *handlers.AuthHandler, authMiddleware *middleware.AuthMiddleware) {
	// Protected routes (authentication required)
	auth := api.Group("/auth")
	{
		auth.GET("/whoami", authHandler.WhoAmI)
	}
	users := api.Group("/users")
	{
		users.POST("", authMiddleware.RequireAdmin(), authHandler.CreateUser)
		users.GET("", authMiddleware.RequireManager(), authHandler.GetAllUsers)
		users.GET("/:id", authMiddleware.RequireManager(), authHandler.GetUserByID)
		users.PUT("/:id", authMiddleware.RequireManager(), authHandler.UpdateUser)
		users.DELETE("/:id", authMiddleware.RequireAdmin(), authHandler.DeleteUser)
	}
}
