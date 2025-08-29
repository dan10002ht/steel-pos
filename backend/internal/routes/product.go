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

		// Search endpoints
		products.GET("/search", productHandler.SearchProducts)
		products.GET("/search/variants", productHandler.SearchProductsWithVariants)
		products.GET("/search/import-order", productHandler.SearchProductsForImportOrder)
	}

	// Product variants routes - use a separate group to avoid conflicts
	productVariants := api.Group("/product-variants")
	{
		productVariants.POST("/:productId", authMiddleware.RequireManager(), productHandler.CreateVariant)
		productVariants.GET("/:productId", productHandler.GetVariantsByProductID)
	}

	// Variant-specific routes (separate group)
	variants := api.Group("/variants")
	{
		variants.GET("/:variantId", productHandler.GetVariantByID)
		variants.PUT("/:variantId", authMiddleware.RequireManager(), productHandler.UpdateVariant)
		variants.DELETE("/:variantId", authMiddleware.RequireManager(), productHandler.DeleteVariant)
	}
}
