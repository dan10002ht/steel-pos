package handlers

import (
	"strconv"

	"steel-pos-backend/internal/middleware"
	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/services"
	"steel-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type ImportOrderHandler struct {
	importOrderService *services.ImportOrderService
}

func NewImportOrderHandler(importOrderService *services.ImportOrderService) *ImportOrderHandler {
	return &ImportOrderHandler{
		importOrderService: importOrderService,
	}
}

// CreateImportOrder creates a new import order
func (h *ImportOrderHandler) CreateImportOrder(c *gin.Context) {
	var req models.CreateImportOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)
	importOrder, err := h.importOrderService.CreateImportOrder(&req, userID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Created(c, importOrder, "Import order created successfully")
}

// GetImportOrderByID gets an import order by ID
func (h *ImportOrderHandler) GetImportOrderByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid import order ID")
		return
	}

	importOrder, err := h.importOrderService.GetImportOrderByID(id)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	if importOrder == nil {
		response.NotFound(c, "Import order not found")
		return
	}

	response.Success(c, importOrder, "Import order retrieved successfully")
}

// GetAllImportOrders gets all import orders with pagination and filters
func (h *ImportOrderHandler) GetAllImportOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")
	supplierName := c.Query("supplier_name")
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := h.importOrderService.GetAllImportOrders(page, limit, status, supplierName, search)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, result, "Import orders retrieved successfully")
}

// UpdateImportOrder updates an import order
func (h *ImportOrderHandler) UpdateImportOrder(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid import order ID")
		return
	}

	var req models.UpdateImportOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	importOrder, err := h.importOrderService.UpdateImportOrder(id, &req)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, importOrder, "Import order updated successfully")
}

// ApproveImportOrder approves an import order
func (h *ImportOrderHandler) ApproveImportOrder(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid import order ID")
		return
	}

	var req models.ApproveImportOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)
	err = h.importOrderService.ApproveImportOrder(id, &req, userID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, gin.H{"message": "Import order approved successfully"}, "Import order approved successfully")
}

// DeleteImportOrder deletes an import order
func (h *ImportOrderHandler) DeleteImportOrder(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid import order ID")
		return
	}

	err = h.importOrderService.DeleteImportOrder(id)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, gin.H{"message": "Import order deleted successfully"}, "Import order deleted successfully")
}
