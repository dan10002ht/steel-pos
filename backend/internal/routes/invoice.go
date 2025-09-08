package routes

import (
	"steel-pos-backend/internal/handlers"
	"steel-pos-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupInvoiceRoutes(api *gin.RouterGroup, invoiceHandler *handlers.InvoiceHandler, authMiddleware *middleware.AuthMiddleware) {
	// Invoice routes
	invoices := api.Group("/invoices")
	{
		// Invoice CRUD operations
		invoices.POST("", authMiddleware.RequireManager(), invoiceHandler.CreateInvoice)
		invoices.GET("", invoiceHandler.GetAllInvoices)
		invoices.GET("/:id", invoiceHandler.GetInvoiceByID)
		invoices.GET("/code/:code", invoiceHandler.GetInvoiceByCode)
		invoices.PUT("/:id", authMiddleware.RequireManager(), invoiceHandler.UpdateInvoice)
		invoices.DELETE("/:id", authMiddleware.RequireManager(), invoiceHandler.DeleteInvoice)

		// Search and filter
		invoices.GET("/search", invoiceHandler.SearchInvoices)

		// Export and print
		invoices.GET("/export", authMiddleware.RequireManager(), invoiceHandler.ExportInvoices)

		// Summary/Statistics
		invoices.GET("/summary", invoiceHandler.GetInvoiceSummary)
	}

	// Invoice Payment routes
	payments := api.Group("/invoice-payments")
	{
		payments.POST("/:invoiceId", authMiddleware.RequireManager(), invoiceHandler.CreateInvoicePayment)
		payments.PUT("/:paymentId", authMiddleware.RequireManager(), invoiceHandler.UpdateInvoicePayment)
		payments.DELETE("/:paymentId", authMiddleware.RequireManager(), invoiceHandler.DeleteInvoicePayment)
	}
}
