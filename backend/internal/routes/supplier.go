package routes

import (
	"steel-pos-backend/internal/handlers"
	"steel-pos-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupSupplierRoutes(api *gin.RouterGroup, supplierHandler *handlers.SupplierHandler, authMiddleware *middleware.AuthMiddleware) {
	// Supplier routes
	suppliers := api.Group("/suppliers")
	{
		// Supplier CRUD operations
		suppliers.POST("", authMiddleware.RequireManager(), supplierHandler.CreateSupplier)
		suppliers.GET("", supplierHandler.GetAllSuppliers)
		suppliers.GET("/:id", supplierHandler.GetSupplierByID)
		suppliers.PUT("/:id", authMiddleware.RequireManager(), supplierHandler.UpdateSupplier)
		suppliers.DELETE("/:id", authMiddleware.RequireManager(), supplierHandler.DeleteSupplier)
	}
}
