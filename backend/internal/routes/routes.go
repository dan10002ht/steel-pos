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
	importOrderHandler *handlers.ImportOrderHandler,
	invoiceHandler *handlers.InvoiceHandler,
	customerHandler *handlers.CustomerHandler,
	auditLogHandler *handlers.AuditLogHandler,
	authMiddleware *middleware.AuthMiddleware,
	tokenRefreshMiddleware *middleware.TokenRefreshMiddleware,
) {
	// API group
	api := router.Group("/api")

	// Public auth routes (no authentication required)
	publicAuth := api.Group("/auth")
	{
		publicAuth.POST("/login", authHandler.Login)
		publicAuth.POST("/refresh", authHandler.RefreshToken)
	}

	// PDF endpoints (custom authentication with query param support)
	api.GET("/invoices/:id/print", authMiddleware.AuthenticateWithQueryParam(), invoiceHandler.PrintInvoice)
	api.GET("/invoices/:id/pdf", authMiddleware.AuthenticateWithQueryParam(), invoiceHandler.PrintInvoice)

	// Apply token refresh middleware first, then authentication middleware
	api.Use(tokenRefreshMiddleware.TokenRefresh())
	api.Use(authMiddleware.Authenticate())

	// Setup individual route groups
	SetupAuthRoutes(api, authHandler, authMiddleware)
	SetupProductRoutes(api, productHandler, authMiddleware)
	SetupImportOrderRoutes(api, importOrderHandler, authMiddleware)
	SetupInvoiceRoutes(api, invoiceHandler, authMiddleware)
	SetupCustomerRoutes(api, customerHandler, authMiddleware)
	SetupAuditLogRoutes(api, auditLogHandler, authMiddleware)
}
