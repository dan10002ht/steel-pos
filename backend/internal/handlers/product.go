package handlers

import (
	"strconv"
	"time"

	"steel-pos-backend/internal/middleware"
	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/services"
	"steel-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	productService *services.ProductService
}

func NewProductHandler(productService *services.ProductService) *ProductHandler {
	return &ProductHandler{
		productService: productService,
	}
}

// CreateProduct creates a new product
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req models.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)
	userName, _ := middleware.GetCurrentUsername(c)

	product, err := h.productService.CreateProduct(&req, userID, userName)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Created(c, product, "Product created successfully")
}

// GetProductByID gets a product by ID
func (h *ProductHandler) GetProductByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid product ID")
		return
	}

	product, err := h.productService.GetProductByID(id)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	if product == nil {
		response.NotFound(c, "Product not found")
		return
	}

	response.Success(c, product, "Product retrieved successfully")
}

// GetAllProducts gets all products with pagination and search
func (h *ProductHandler) GetAllProducts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := h.productService.GetAllProducts(page, limit, search)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, result, "Products retrieved successfully")
}

// UpdateProduct updates a product
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid product ID")
		return
	}

	var req models.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)
	product, err := h.productService.UpdateProduct(id, &req, userID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, product, "Product updated successfully")
}

// DeleteProduct deletes a product (soft delete)
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid product ID")
		return
	}

	err = h.productService.DeleteProduct(id)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, nil, "Product deleted successfully")
}

// CreateVariant creates a new product variant
func (h *ProductHandler) CreateVariant(c *gin.Context) {
	productIDStr := c.Param("productId")
	productID, err := strconv.Atoi(productIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid product ID")
		return
	}

	var req models.CreateProductVariantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)
	variant, err := h.productService.CreateVariant(productID, &req, userID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Created(c, variant, "Product variant created successfully")
}

// GetVariantByID gets a product variant by ID
func (h *ProductHandler) GetVariantByID(c *gin.Context) {
	idStr := c.Param("variantId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid variant ID")
		return
	}

	variant, err := h.productService.GetVariantByID(id)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	if variant == nil {
		response.NotFound(c, "Product variant not found")
		return
	}

	response.Success(c, variant, "Product variant retrieved successfully")
}

// GetVariantsByProductID gets all variants of a product
func (h *ProductHandler) GetVariantsByProductID(c *gin.Context) {
	productIDStr := c.Param("productId")
	productID, err := strconv.Atoi(productIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid product ID")
		return
	}

	variants, err := h.productService.GetVariantsByProductID(productID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, variants, "Product variants retrieved successfully")
}

// UpdateVariant updates a product variant
func (h *ProductHandler) UpdateVariant(c *gin.Context) {
	idStr := c.Param("variantId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid variant ID")
		return
	}

	var req models.UpdateProductVariantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BindingError(c, err)
		return
	}

	userID, _ := middleware.GetCurrentUserID(c)
	variant, err := h.productService.UpdateVariant(id, &req, userID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, variant, "Product variant updated successfully")
}

// DeleteVariant deletes a product variant (soft delete)
func (h *ProductHandler) DeleteVariant(c *gin.Context) {
	idStr := c.Param("variantId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid variant ID")
		return
	}

	err = h.productService.DeleteVariant(id)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, nil, "Product variant deleted successfully")
}

// SearchProducts searches products using hybrid approach
func (h *ProductHandler) SearchProducts(c *gin.Context) {
	query := c.Query("q")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))

	if query == "" {
		response.BadRequest(c, "Search query is required")
		return
	}

	start := time.Now()
	result, err := h.productService.SearchProductsHybrid(query, limit, page)
	searchTime := time.Since(start).Milliseconds()

	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, gin.H{
		"products": result.Products,
		"total":    result.Total,
		"query":    query,
		"took_ms":  searchTime,
	}, "Products found")
}

// SearchProductsForImportOrder searches products specifically for import order selection
func (h *ProductHandler) SearchProductsForImportOrder(c *gin.Context) {
	query := c.Query("q")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if query == "" {
		response.BadRequest(c, "Search query is required")
		return
	}

	start := time.Now()
	results, err := h.productService.SearchProductsForImportOrder(query, limit)
	searchTime := time.Since(start).Milliseconds()

	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, gin.H{
		"products": results,
		"total":    len(results),
		"query":    query,
		"took_ms":  searchTime,
	}, "Products found for import order")
}

// SearchProductsWithVariants searches products including variant information
func (h *ProductHandler) SearchProductsWithVariants(c *gin.Context) {
	query := c.Query("q")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if query == "" {
		response.BadRequest(c, "Search query is required")
		return
	}

	start := time.Now()
	result, err := h.productService.SearchProductsWithVariants(query, limit)
	searchTime := time.Since(start).Milliseconds()

	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, gin.H{
		"products": result.Products,
		"total":    result.Total,
		"query":    query,
		"took_ms":  searchTime,
	}, "Products with variants found")
}
