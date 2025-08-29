package services

import (
	"errors"
	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/repository"
	"strings"
	"time"
)

type ProductService struct {
	productRepo *repository.ProductRepository
}

func NewProductService(productRepo *repository.ProductRepository) *ProductService {
	return &ProductService{
		productRepo: productRepo,
	}
}

// Product methods
func (s *ProductService) CreateProduct(req *models.CreateProductRequest, createdBy int, createdByName string) (*models.Product, error) {
	// Create product
	product := &models.Product{
		Name:          req.Name,
		CategoryID:    req.CategoryID,
		Unit:          req.Unit,
		Notes:         req.Notes,
		IsActive:      true,
		CreatedBy:     &createdBy,
		CreatedByName: &createdByName,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	err := s.productRepo.Create(product)
	if err != nil {
		return nil, err
	}

	// Create variants if provided
	if len(req.Variants) > 0 {
		for _, variantReq := range req.Variants {
			variant := &models.ProductVariant{
				ProductID:     product.ID,
				Name:          variantReq.Name,
				SKU:           variantReq.SKU,
				Stock:         variantReq.Stock,
				Price:         variantReq.Price,
				Unit:          variantReq.Unit,
				IsActive:      true,
				CreatedBy:     &createdBy,
				CreatedByName: &createdByName,
				CreatedAt:     time.Now(),
				UpdatedAt:     time.Now(),
			}

			err := s.productRepo.CreateVariant(variant)
			if err != nil {
				return nil, err
			}
		}
	}

	return product, nil
}

func (s *ProductService) GetProductByID(id int) (*models.Product, error) {
	product, err := s.productRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if product == nil {
		return nil, errors.New("product not found")
	}

	// Get variants
	variants, err := s.productRepo.GetVariantsByProductID(id)
	if err != nil {
		return nil, err
	}

	product.Variants = variants
	return product, nil
}

func (s *ProductService) GetAllProducts(page, limit int, search string) (*models.ProductListResponse, error) {
	offset := (page - 1) * limit

	products, err := s.productRepo.GetAll(limit, offset, search)
	if err != nil {
		return nil, err
	}

	total, err := s.productRepo.Count(search)
	if err != nil {
		return nil, err
	}

	return &models.ProductListResponse{
		Products: products,
		Total:    total,
		Page:     page,
		Limit:    limit,
	}, nil
}

func (s *ProductService) UpdateProduct(id int, req *models.UpdateProductRequest, updatedBy int) (*models.Product, error) {
	product, err := s.productRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if product == nil {
		return nil, errors.New("product not found")
	}

	// Update fields if provided
	if req.Name != "" {
		product.Name = req.Name
	}
	if req.CategoryID != nil {
		product.CategoryID = req.CategoryID
	}
	if req.Unit != "" {
		product.Unit = req.Unit
	}
	if req.Notes != "" {
		product.Notes = req.Notes
	}
	if req.IsActive != nil {
		product.IsActive = *req.IsActive
	}

	product.UpdatedAt = time.Now()

	err = s.productRepo.Update(product)
	if err != nil {
		return nil, err
	}

	// Handle variants if provided
	if len(req.Variants) > 0 {
		for _, variantReq := range req.Variants {
			if variantReq.IsDeleted != nil && *variantReq.IsDeleted {
				// Delete variant
				if variantReq.ID != nil {
					err = s.productRepo.DeleteVariant(*variantReq.ID)
					if err != nil {
						return nil, err
					}
				}
			} else if variantReq.ID != nil {
				// Update existing variant
				existingVariant, err := s.productRepo.GetVariantByID(*variantReq.ID)
				if err != nil {
					return nil, err
				}
				if existingVariant == nil {
					return nil, errors.New("variant not found")
				}

				// Update fields if provided
				if variantReq.Name != "" {
					existingVariant.Name = variantReq.Name
				}
				if variantReq.SKU != "" {
					existingVariant.SKU = variantReq.SKU
				}
				if variantReq.Stock != nil {
					existingVariant.Stock = *variantReq.Stock
				}
				if variantReq.Price != nil {
					existingVariant.Price = *variantReq.Price
				}
				if variantReq.Unit != "" {
					existingVariant.Unit = variantReq.Unit
				}
				if variantReq.IsActive != nil {
					existingVariant.IsActive = *variantReq.IsActive
				}

				existingVariant.UpdatedAt = time.Now()

				err = s.productRepo.UpdateVariant(existingVariant)
				if err != nil {
					return nil, err
				}
			} else {
				// Create new variant
				variant := &models.ProductVariant{
					ProductID: id,
					Name:      variantReq.Name,
					SKU:       variantReq.SKU,
					Stock:     *variantReq.Stock,
					Price:     *variantReq.Price,
					Unit:      variantReq.Unit,
					IsActive:  true,
					CreatedBy: &updatedBy,
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
				}

				err = s.productRepo.CreateVariant(variant)
				if err != nil {
					return nil, err
				}
			}
		}
	}

	// Get updated product with variants
	return s.GetProductByID(id)
}

func (s *ProductService) DeleteProduct(id int) error {
	return s.productRepo.Delete(id)
}

// ProductVariant methods
func (s *ProductService) CreateVariant(productID int, req *models.CreateProductVariantRequest, createdBy int) (*models.ProductVariant, error) {
	// Check if product exists
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return nil, err
	}

	if product == nil {
		return nil, errors.New("product not found")
	}

	variant := &models.ProductVariant{
		ProductID: productID,
		Name:      req.Name,
		SKU:       req.SKU,
		Stock:     req.Stock,
		Price:     req.Price,
		Unit:      req.Unit,
		IsActive:  true,
		CreatedBy: &createdBy,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err = s.productRepo.CreateVariant(variant)
	if err != nil {
		return nil, err
	}

	return variant, nil
}

func (s *ProductService) GetVariantByID(id int) (*models.ProductVariant, error) {
	variant, err := s.productRepo.GetVariantByID(id)
	if err != nil {
		return nil, err
	}

	if variant == nil {
		return nil, errors.New("variant not found")
	}

	return variant, nil
}

func (s *ProductService) GetVariantsByProductID(productID int) ([]*models.ProductVariant, error) {
	// Check if product exists
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return nil, err
	}

	if product == nil {
		return nil, errors.New("product not found")
	}

	return s.productRepo.GetVariantsByProductID(productID)
}

func (s *ProductService) UpdateVariant(id int, req *models.UpdateProductVariantRequest, updatedBy int) (*models.ProductVariant, error) {
	variant, err := s.productRepo.GetVariantByID(id)
	if err != nil {
		return nil, err
	}

	if variant == nil {
		return nil, errors.New("variant not found")
	}

	// Update fields if provided
	if req.Name != "" {
		variant.Name = req.Name
	}
	if req.SKU != "" {
		variant.SKU = req.SKU
	}
	if req.Stock != nil {
		variant.Stock = *req.Stock
	}
	if req.Price != nil {
		variant.Price = *req.Price
	}
	if req.Unit != "" {
		variant.Unit = req.Unit
	}
	if req.IsActive != nil {
		variant.IsActive = *req.IsActive
	}

	variant.UpdatedAt = time.Now()

	err = s.productRepo.UpdateVariant(variant)
	if err != nil {
		return nil, err
	}

	return variant, nil
}

func (s *ProductService) DeleteVariant(id int) error {
	return s.productRepo.DeleteVariant(id)
}

func (s *ProductService) UpdateStock(variantID int, quantity int) error {
	return s.productRepo.UpdateStock(variantID, quantity)
}

// SearchProductsHybrid searches products using hybrid approach (ILIKE + full-text search)
func (s *ProductService) SearchProductsHybrid(query string, limit int, page int) (*models.ProductListResponse, error) {
	// Validate query
	if len(strings.TrimSpace(query)) < 1 {
		return nil, errors.New("search query is required")
	}

	// Calculate offset
	offset := (page - 1) * limit

	products, err := s.productRepo.SearchProductsHybrid(query, limit, offset)
	if err != nil {
		return nil, err
	}

	total, err := s.productRepo.CountSearchResults(query)
	if err != nil {
		return nil, err
	}

	return &models.ProductListResponse{
		Products: products,
		Total:    total,
		Page:     page,
		Limit:    limit,
	}, nil
}

// SearchProductsWithVariants searches products including variant information
func (s *ProductService) SearchProductsWithVariants(query string, limit int) (*models.ProductListResponse, error) {
	// Validate query
	if len(strings.TrimSpace(query)) < 1 {
		return nil, errors.New("search query is required")
	}

	products, err := s.productRepo.SearchProductsWithVariants(query, limit)
	if err != nil {
		return nil, err
	}

	total, err := s.productRepo.CountSearchResults(query)
	if err != nil {
		return nil, err
	}

	return &models.ProductListResponse{
		Products: products,
		Total:    total,
		Page:     1,
		Limit:    limit,
	}, nil
}

// SearchProductsForImportOrder searches products specifically for import order selection
func (s *ProductService) SearchProductsForImportOrder(query string, limit int) ([]*models.ProductSearchResult, error) {
	// Validate query
	if len(strings.TrimSpace(query)) < 1 {
		return nil, errors.New("search query is required")
	}

	products, err := s.productRepo.SearchProductsWithVariants(query, limit)
	if err != nil {
		return nil, err
	}

	// Transform to search result format
	var results []*models.ProductSearchResult
	for _, product := range products {
		result := &models.ProductSearchResult{
			ID:       product.ID,
			Name:     product.Name,
			Unit:     product.Unit,
			Notes:    product.Notes,
			Variants: make([]*models.VariantSearchResult, 0),
		}

		// Add variants
		for _, variant := range product.Variants {
			variantResult := &models.VariantSearchResult{
				ID:    variant.ID,
				Name:  variant.Name,
				SKU:   variant.SKU,
				Price: variant.Price,
				Unit:  variant.Unit,
			}
			result.Variants = append(result.Variants, variantResult)
		}

		// If no variants, create a default one
		if len(result.Variants) == 0 {
			result.Variants = append(result.Variants, &models.VariantSearchResult{
				ID:    0,
				Name:  "Default",
				SKU:   "",
				Price: 0,
				Unit:  product.Unit,
			})
		}

		results = append(results, result)
	}

	return results, nil
}
