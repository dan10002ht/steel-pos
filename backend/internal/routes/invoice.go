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
		invoices.POST("", authMiddleware.RequireAccountant(), invoiceHandler.CreateInvoice)
		invoices.GET("", invoiceHandler.GetAllInvoices)
		invoices.GET("/:id", invoiceHandler.GetInvoiceByID)
		invoices.GET("/code/:code", invoiceHandler.GetInvoiceByCode)
		invoices.PUT("/:id", authMiddleware.RequireAccountant(), invoiceHandler.UpdateInvoice)
		invoices.DELETE("/:id", authMiddleware.RequireManager(), invoiceHandler.DeleteInvoice)

		// Search and filter
		invoices.GET("/search", invoiceHandler.SearchInvoices)

		// Finalize draft invoice
		invoices.POST("/:id/finalize", authMiddleware.RequireAccountant(), invoiceHandler.FinalizeInvoice)

		// Cancel invoice (admin only)
		invoices.PUT("/:id/cancel", authMiddleware.RequireAdmin(), invoiceHandler.CancelInvoice)

		// Export and print
		invoices.GET("/export", authMiddleware.RequireManager(), invoiceHandler.ExportInvoices)

		// Summary/Statistics
		invoices.GET("/summary", invoiceHandler.GetInvoiceSummary)
		
		// Audit logs for invoice
		invoices.GET("/:id/audit-logs", invoiceHandler.GetInvoiceAuditLogs)
		
		// Invoice payments
		invoices.GET("/:id/payments", invoiceHandler.GetInvoicePayments)
	}

	// Invoice Payment routes
	payments := api.Group("/invoice-payments")
	{
		payments.POST("/:invoiceId", authMiddleware.RequireAccountant(), invoiceHandler.CreateInvoicePayment)
		payments.PUT("/:paymentId", authMiddleware.RequireAccountant(), invoiceHandler.UpdateInvoicePayment)
		payments.DELETE("/:paymentId", authMiddleware.RequireAccountant(), invoiceHandler.DeleteInvoicePayment)
	}
}
