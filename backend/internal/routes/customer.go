package routes

import (
	"steel-pos-backend/internal/handlers"
	"steel-pos-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupCustomerRoutes(api *gin.RouterGroup, customerHandler *handlers.CustomerHandler, authMiddleware *middleware.AuthMiddleware) {
	// Customer routes
	customers := api.Group("/customers")
	{
		// Customer CRUD operations
		customers.POST("", authMiddleware.RequireManager(), customerHandler.CreateCustomer)
		customers.GET("", customerHandler.GetAllCustomers)
		customers.GET("/:id", customerHandler.GetCustomerByID)
		customers.GET("/phone/:phone", customerHandler.GetCustomerByPhone)
		customers.PUT("/:id", authMiddleware.RequireManager(), customerHandler.UpdateCustomer)
		customers.DELETE("/:id", authMiddleware.RequireManager(), customerHandler.DeleteCustomer)

		// Search and filter
		customers.GET("/search", customerHandler.SearchCustomers)

		// Customer analytics and invoices
		customers.GET("/:id/analytics", customerHandler.GetCustomerAnalytics)
		customers.GET("/:id/invoices", customerHandler.GetCustomerInvoices)

	}
}


