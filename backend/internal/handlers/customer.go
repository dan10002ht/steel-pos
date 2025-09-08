package handlers

import (
	"strconv"

	"steel-pos-backend/internal/middleware"
	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/services"
	"steel-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type CustomerHandler struct {
	customerService *services.CustomerService
}

func NewCustomerHandler(customerService *services.CustomerService) *CustomerHandler {
	return &CustomerHandler{
		customerService: customerService,
	}
}

// Customer endpoints
func (h *CustomerHandler) CreateCustomer(c *gin.Context) {
	var req models.CreateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)

	// Convert request to Customer model
	customer := &models.Customer{
		Name:      req.Name,
		Phone:     req.Phone,
		Address:   req.Address,
		IsActive:  true,
		CreatedBy: &userID,
	}
	
	customer, err := h.customerService.CreateCustomer(customer)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Created(c, customer, "Customer created successfully")
}

func (h *CustomerHandler) GetAllCustomers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	var result []*models.Customer
	var total int
	var err error

	// If search query is provided, use search; otherwise get all customers
	if search != "" {
		result, total, err = h.customerService.SearchCustomers(search, limit)
	} else {
		result, total, err = h.customerService.GetAllCustomers(page, limit)
	}

	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, gin.H{
		"customers": result,
		"total":     total,
		"page":      page,
		"limit":     limit,
	}, "Customers retrieved successfully")
}

func (h *CustomerHandler) GetCustomerByPhone(c *gin.Context) {
	phone := c.Param("phone")
	if phone == "" {
		response.BadRequest(c, "Phone number is required")
		return
	}

	customer, err := h.customerService.GetCustomerByPhone(phone)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	if customer == nil {
		response.NotFound(c, "Customer not found")
		return
	}

	response.Success(c, customer, "Customer retrieved successfully")
}

func (h *CustomerHandler) GetCustomerByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid customer ID")
		return
	}

	customer, err := h.customerService.GetCustomerByID(id)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	if customer == nil {
		response.NotFound(c, "Customer not found")
		return
	}

	response.Success(c, customer, "Customer retrieved successfully")
}

func (h *CustomerHandler) UpdateCustomer(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid customer ID")
		return
	}

	var req models.UpdateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)

	// Convert request to update data map
	updateData := map[string]interface{}{
		"name":    req.Name,
		"phone":   req.Phone,
		"address": req.Address,
	}
	
	customer, err := h.customerService.UpdateCustomer(id, updateData, userID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, customer, "Customer updated successfully")
}

func (h *CustomerHandler) DeleteCustomer(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid customer ID")
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)
	err = h.customerService.DeleteCustomer(id, userID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, nil, "Customer deleted successfully")
}



// Search endpoints
func (h *CustomerHandler) SearchCustomers(c *gin.Context) {
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

	result, total, err := h.customerService.SearchCustomers(query, limit)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, gin.H{
		"customers": result,
		"total":     total,
		"page":      page,
		"limit":     limit,
	}, "Customers found")
}


