package routes

import (
	"steel-pos-backend/internal/handlers"
	"steel-pos-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupProductRoutes(api *gin.RouterGroup, productHandler *handlers.ProductHandler, authMiddleware *middleware.AuthMiddleware) {
	// Product routes
	products := api.Group("/products")
	{
		// Product CRUD operations
		products.POST("", authMiddleware.RequireManager(), productHandler.CreateProduct)
		products.GET("", productHandler.GetAllProducts)
		products.GET("/:id", productHandler.GetProductByID)
		products.PUT("/:id", authMiddleware.RequireManager(), productHandler.UpdateProduct)
		products.DELETE("/:id", authMiddleware.RequireManager(), productHandler.DeleteProduct)

		// Product variants
		products.POST("/:productId/variants", authMiddleware.RequireManager(), productHandler.CreateVariant)
		products.GET("/:productId/variants", productHandler.GetVariantsByProductID)
		products.GET("/variants/:variantId", productHandler.GetVariantByID)
		products.PUT("/variants/:variantId", authMiddleware.RequireManager(), productHandler.UpdateVariant)
		products.DELETE("/variants/:variantId", authMiddleware.RequireManager(), productHandler.DeleteVariant)
	}
}
