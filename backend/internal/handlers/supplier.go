package handlers

import (
	"strconv"

	"steel-pos-backend/internal/middleware"
	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/services"
	"steel-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type SupplierHandler struct {
	supplierService *services.SupplierService
}

func NewSupplierHandler(supplierService *services.SupplierService) *SupplierHandler {
	return &SupplierHandler{
		supplierService: supplierService,
	}
}

// CreateSupplier creates a new supplier
func (h *SupplierHandler) CreateSupplier(c *gin.Context) {
	var req models.CreateSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)
	supplier, err := h.supplierService.CreateSupplier(&req, userID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Created(c, supplier, "Supplier created successfully")
}

// GetSupplierByID gets a supplier by ID
func (h *SupplierHandler) GetSupplierByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid supplier ID")
		return
	}

	supplier, err := h.supplierService.GetSupplierByID(id)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, supplier, "Supplier retrieved successfully")
}

// GetAllSuppliers gets all suppliers with pagination and search
func (h *SupplierHandler) GetAllSuppliers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := h.supplierService.GetAllSuppliers(page, limit, search)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, result, "Suppliers retrieved successfully")
}

// UpdateSupplier updates a supplier
func (h *SupplierHandler) UpdateSupplier(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid supplier ID")
		return
	}

	var req models.UpdateSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)
	supplier, err := h.supplierService.UpdateSupplier(id, &req, userID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, supplier, "Supplier updated successfully")
}

// DeleteSupplier deletes a supplier (soft delete)
func (h *SupplierHandler) DeleteSupplier(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid supplier ID")
		return
	}

	err = h.supplierService.DeleteSupplier(id)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, nil, "Supplier deleted successfully")
}
