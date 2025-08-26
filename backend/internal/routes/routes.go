package routes

import (
	"steel-pos-backend/internal/handlers"
	"steel-pos-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAllRoutes configures all application routes
func SetupAllRoutes(
	router *gin.Engine,
	authHandler *handlers.AuthHandler,
	productHandler *handlers.ProductHandler,
	supplierHandler *handlers.SupplierHandler,
	authMiddleware *middleware.AuthMiddleware,
) {
	// API group
	api := router.Group("/api")
	
	// Public auth routes (no authentication required)
	publicAuth := api.Group("/auth")
	{
		publicAuth.POST("/login", authHandler.Login)
		publicAuth.POST("/refresh", authHandler.RefreshToken)
	}

	// Apply authentication middleware to all other routes
	api.Use(authMiddleware.Authenticate())

	// Setup individual route groups
	SetupAuthRoutes(api, authHandler, authMiddleware)
	SetupProductRoutes(api, productHandler, authMiddleware)
	SetupSupplierRoutes(api, supplierHandler, authMiddleware)
}
