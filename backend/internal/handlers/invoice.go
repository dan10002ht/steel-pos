package handlers

import (
	"strconv"

	"steel-pos-backend/internal/middleware"
	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/services"
	"steel-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type InvoiceHandler struct {
	invoiceService *services.InvoiceService
	pdfService     *services.PDFService
}

func NewInvoiceHandler(invoiceService *services.InvoiceService, pdfService *services.PDFService) *InvoiceHandler {
	return &InvoiceHandler{
		invoiceService: invoiceService,
		pdfService:     pdfService,
	}
}

// Invoice endpoints
func (h *InvoiceHandler) CreateInvoice(c *gin.Context) {
	var req models.CreateInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)

	invoice, err := h.invoiceService.CreateInvoice(&req, userID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Created(c, invoice, "Invoice created successfully")
}

func (h *InvoiceHandler) GetInvoiceByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid invoice ID")
		return
	}

	invoice, err := h.invoiceService.GetInvoiceByID(id)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	if invoice == nil {
		response.NotFound(c, "Invoice not found")
		return
	}

	response.Success(c, invoice, "Invoice retrieved successfully")
}

func (h *InvoiceHandler) GetInvoiceByCode(c *gin.Context) {
	code := c.Param("code")
	if code == "" {
		response.BadRequest(c, "Invoice code is required")
		return
	}

	invoice, err := h.invoiceService.GetInvoiceByCode(code)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	if invoice == nil {
		response.NotFound(c, "Invoice not found")
		return
	}

	response.Success(c, invoice, "Invoice retrieved successfully")
}

func (h *InvoiceHandler) GetAllInvoices(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	status := c.Query("status")
	paymentStatus := c.Query("payment_status")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := h.invoiceService.GetAllInvoices(page, limit, search, status, paymentStatus)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, result, "Invoices retrieved successfully")
}

func (h *InvoiceHandler) UpdateInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid invoice ID")
		return
	}

	var req models.UpdateInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)

	invoice, err := h.invoiceService.UpdateInvoice(id, &req, userID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, invoice, "Invoice updated successfully")
}

func (h *InvoiceHandler) DeleteInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid invoice ID")
		return
	}

	err = h.invoiceService.DeleteInvoice(id)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, nil, "Invoice deleted successfully")
}

// Invoice Payment endpoints
func (h *InvoiceHandler) CreateInvoicePayment(c *gin.Context) {
	invoiceIDStr := c.Param("invoiceId")
	invoiceID, err := strconv.Atoi(invoiceIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid invoice ID")
		return
	}

	var req models.CreateInvoicePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)

	payment, err := h.invoiceService.CreateInvoicePayment(invoiceID, &req, userID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Created(c, payment, "Payment created successfully")
}

func (h *InvoiceHandler) UpdateInvoicePayment(c *gin.Context) {
	paymentIDStr := c.Param("paymentId")
	paymentID, err := strconv.Atoi(paymentIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid payment ID")
		return
	}

	var req models.UpdateInvoicePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)

	payment, err := h.invoiceService.UpdateInvoicePayment(paymentID, &req, userID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, payment, "Payment updated successfully")
}

func (h *InvoiceHandler) DeleteInvoicePayment(c *gin.Context) {
	paymentIDStr := c.Param("paymentId")
	paymentID, err := strconv.Atoi(paymentIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid payment ID")
		return
	}

	err = h.invoiceService.DeleteInvoicePayment(paymentID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, nil, "Payment deleted successfully")
}

// Dashboard/Summary endpoints
func (h *InvoiceHandler) GetInvoiceSummary(c *gin.Context) {
	summary, err := h.invoiceService.GetInvoiceSummary()
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, summary, "Invoice summary retrieved successfully")
}

// Search endpoints
func (h *InvoiceHandler) SearchInvoices(c *gin.Context) {
	query := c.Query("q")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))

	if query == "" {
		response.BadRequest(c, "Search query is required")
		return
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := h.invoiceService.GetAllInvoices(page, limit, query, "", "")
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, result, "Invoices found")
}

// Export endpoints
func (h *InvoiceHandler) ExportInvoices(c *gin.Context) {
	// This would implement invoice export functionality
	// For now, return a placeholder response
	response.Success(c, gin.H{
		"message": "Export functionality will be implemented",
		"format":  "PDF/Excel",
	}, "Export endpoint ready")
}

// Print endpoints
func (h *InvoiceHandler) PrintInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid invoice ID")
		return
	}

	invoice, err := h.invoiceService.GetInvoiceByID(id)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	if invoice == nil {
		response.NotFound(c, "Invoice not found")
		return
	}

	// Generate PDF
	pdfBytes, err := h.pdfService.GenerateInvoicePDF(invoice)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	// Set headers for PDF response
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "inline; filename=invoice-"+invoice.InvoiceCode+".pdf")
	c.Header("Content-Length", strconv.Itoa(len(pdfBytes)))

	// Add CORS headers for iframe access
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

	// Write PDF bytes to response
	c.Data(200, "application/pdf", pdfBytes)
}
