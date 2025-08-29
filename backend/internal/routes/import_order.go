package routes

import (
	"steel-pos-backend/internal/handlers"
	"steel-pos-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupImportOrderRoutes configures import order routes
func SetupImportOrderRoutes(api *gin.RouterGroup, importOrderHandler *handlers.ImportOrderHandler, authMiddleware *middleware.AuthMiddleware) {
	importOrders := api.Group("/import-orders")
	{
		// Create import order
		importOrders.POST("", authMiddleware.RequireRole("admin", "manager"), importOrderHandler.CreateImportOrder)

		// Get all import orders
		importOrders.GET("", importOrderHandler.GetAllImportOrders)

		// Get import order by ID
		importOrders.GET("/:id", importOrderHandler.GetImportOrderByID)

		// Update import order
		importOrders.PUT("/:id", authMiddleware.RequireRole("admin", "manager"), importOrderHandler.UpdateImportOrder)

		// Approve import order
		importOrders.POST("/:id/approve", authMiddleware.RequireRole("admin", "manager"), importOrderHandler.ApproveImportOrder)

		// Delete import order
		importOrders.DELETE("/:id", authMiddleware.RequireRole("admin"), importOrderHandler.DeleteImportOrder)
	}
}
