package services

import (
	"errors"
	"fmt"
	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/repository"
	"strings"
	"time"
)

type ImportOrderService struct {
	importOrderRepo *repository.ImportOrderRepository
}

func NewImportOrderService(importOrderRepo *repository.ImportOrderRepository) *ImportOrderService {
	return &ImportOrderService{
		importOrderRepo: importOrderRepo,
	}
}

// CreateImportOrder creates a new import order
func (s *ImportOrderService) CreateImportOrder(req *models.CreateImportOrderRequest, userID int) (*models.ImportOrder, error) {
	// Generate import code
	importCode, err := s.generateImportCode()
	if err != nil {
		return nil, err
	}

	// Create import order
	importOrder := &models.ImportOrder{
		ImportCode:   importCode,
		SupplierName: req.SupplierName,
		ImportDate:   req.ImportDate,
		TotalAmount:  0, // Will be calculated from items
		Status:       "pending",
		Notes:        req.Notes,
		ImportImages: req.ImportImages,
		CreatedBy:    &userID,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Save import order
	err = s.importOrderRepo.Create(importOrder)
	if err != nil {
		return nil, err
	}

	// Create items
	var totalAmount float64
	for _, itemReq := range req.Items {
		item := &models.ImportOrderItem{
			ImportOrderID: importOrder.ID,
			ProductID:     itemReq.ProductID,
			VariantID:     itemReq.VariantID,
			ProductName:   itemReq.ProductName,
			VariantName:   itemReq.VariantName,
			Quantity:      itemReq.Quantity,
			UnitPrice:     itemReq.UnitPrice,
			TotalPrice:    float64(itemReq.Quantity) * itemReq.UnitPrice,
			Unit:          itemReq.Unit,
			Notes:         itemReq.Notes,
			CreatedBy:     &userID,
			CreatedAt:     time.Now(),
		}

		err = s.importOrderRepo.CreateItem(item)
		if err != nil {
			return nil, err
		}

		totalAmount += item.TotalPrice
	}

	// Update total amount
	importOrder.TotalAmount = totalAmount
	err = s.importOrderRepo.Update(importOrder)
	if err != nil {
		return nil, err
	}

	return importOrder, nil
}

// GetImportOrderByID gets an import order by ID
func (s *ImportOrderService) GetImportOrderByID(id int) (*models.ImportOrder, error) {
	importOrder, err := s.importOrderRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if importOrder == nil {
		return nil, errors.New("import order not found")
	}

	// Get items with variants
	items, err := s.importOrderRepo.GetItemsWithVariantsByOrderID(id)
	if err != nil {
		return nil, err
	}

	importOrder.Items = items

	return importOrder, nil
}

// GetAllImportOrders gets all import orders with pagination and filters
func (s *ImportOrderService) GetAllImportOrders(page, limit int, status, supplierName, search string) (*models.ImportOrderListResponse, error) {
	// Calculate offset
	offset := (page - 1) * limit

	// Get orders
	orders, err := s.importOrderRepo.GetAll(limit, offset, status)
	if err != nil {
		return nil, err
	}

	// Get total count
	total, err := s.importOrderRepo.Count(status)
	if err != nil {
		return nil, err
	}

	// Get items for each order
	for _, order := range orders {
		items, err := s.importOrderRepo.GetItemsWithVariantsByOrderID(order.ID)
		if err != nil {
			return nil, err
		}
		order.Items = items
	}

	return &models.ImportOrderListResponse{
		ImportOrders: orders,
		Total:        total,
		Page:         page,
		Limit:        limit,
	}, nil
}

// UpdateImportOrder updates an import order
func (s *ImportOrderService) UpdateImportOrder(id int, req *models.UpdateImportOrderRequest) (*models.ImportOrder, error) {
	// Get existing order
	importOrder, err := s.importOrderRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if importOrder == nil {
		return nil, errors.New("import order not found")
	}

	// Update fields if provided
	if req.SupplierName != nil {
		importOrder.SupplierName = *req.SupplierName
	}
	if req.ImportDate != nil {
		importOrder.ImportDate = *req.ImportDate
	}
	if req.Notes != "" {
		importOrder.Notes = req.Notes
	}
	if req.ImportImages != nil {
		importOrder.ImportImages = req.ImportImages
	}
	if req.Status != "" {
		importOrder.Status = req.Status
	}

	importOrder.UpdatedAt = time.Now()

	// Save changes
	err = s.importOrderRepo.Update(importOrder)
	if err != nil {
		return nil, err
	}

	// Update items if provided
	if req.Items != nil {
		err = s.updateImportOrderItems(id, req.Items)
		if err != nil {
			return nil, err
		}
	}

	return importOrder, nil
}

// ApproveImportOrder approves an import order
func (s *ImportOrderService) ApproveImportOrder(id int, req *models.ApproveImportOrderRequest, userID int) error {
	// Get existing order
	importOrder, err := s.importOrderRepo.GetByID(id)
	if err != nil {
		return err
	}

	if importOrder == nil {
		return errors.New("import order not found")
	}

	if importOrder.Status != "pending" {
		return errors.New("import order is not in pending status")
	}

	// Approve the order and update inventory
	// The repository.Approve method will handle both status update and inventory update
	err = s.importOrderRepo.Approve(id, userID, req.ApprovalNote)
	if err != nil {
		return err
	}

	return nil
}

// updateImportOrderItems updates items for an import order
func (s *ImportOrderService) updateImportOrderItems(orderID int, items []models.UpdateImportOrderItemRequest) error {
	// Get existing items
	existingItems, err := s.importOrderRepo.GetItemsByOrderID(orderID)
	if err != nil {
		return err
	}

	// Create maps for easy lookup
	existingItemsMap := make(map[int]*models.ImportOrderItem)
	for _, item := range existingItems {
		existingItemsMap[item.ID] = item
	}

	// Process each item in the request
	for _, itemReq := range items {
		// Check if item is marked for deletion
		if itemReq.IsDeleted != nil && *itemReq.IsDeleted {
			// Item is marked for deletion, skip processing
			continue
		}

		// Check if this is a new item (ID has "new_" prefix) or existing item
		if itemReq.ID == nil || strings.HasPrefix(fmt.Sprint(*itemReq.ID), "new_") {
			// This is a new item, create it
			if err := s.createImportOrderItem(orderID, itemReq); err != nil {
				return err
			}
		} else {
			// This is an existing item, update it
			if err := s.updateImportOrderItem(*itemReq.ID, itemReq); err != nil {
				return err
			}
			// Remove from existing items map to track what's been processed
			delete(existingItemsMap, *itemReq.ID)
		}
	}

	// Any remaining items in existingItemsMap should be deleted
	for _, item := range existingItemsMap {
		if err := s.importOrderRepo.DeleteItem(item.ID); err != nil {
			return err
		}
	}

	return nil
}

// createImportOrderItem creates a new import order item
func (s *ImportOrderService) createImportOrderItem(orderID int, itemReq models.UpdateImportOrderItemRequest) error {
	item := &models.ImportOrderItem{
		ImportOrderID: orderID,
		ProductID:     *itemReq.ProductID,
		VariantID:     *itemReq.VariantID,
		ProductName:   *itemReq.ProductName,
		VariantName:   *itemReq.VariantName,
		Quantity:      *itemReq.Quantity,
		UnitPrice:     *itemReq.UnitPrice,
		TotalPrice:    float64(*itemReq.Quantity) * *itemReq.UnitPrice,
		Unit:          itemReq.Unit,
		Notes:         itemReq.Notes,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	return s.importOrderRepo.CreateItem(item)
}

// updateImportOrderItem updates an existing import order item
func (s *ImportOrderService) updateImportOrderItem(itemID int, itemReq models.UpdateImportOrderItemRequest) error {
	item := &models.ImportOrderItem{
		ID:          itemID,
		ProductID:   *itemReq.ProductID,
		VariantID:   *itemReq.VariantID,
		ProductName: *itemReq.ProductName,
		VariantName: *itemReq.VariantName,
		Quantity:    *itemReq.Quantity,
		UnitPrice:   *itemReq.UnitPrice,
		TotalPrice:  float64(*itemReq.Quantity) * *itemReq.UnitPrice,
		Unit:        itemReq.Unit,
		Notes:       itemReq.Notes,
		UpdatedAt:   time.Now(),
	}

	return s.importOrderRepo.UpdateItem(item)
}

// DeleteImportOrder deletes an import order
func (s *ImportOrderService) DeleteImportOrder(id int) error {
	// Get existing order
	importOrder, err := s.importOrderRepo.GetByID(id)
	if err != nil {
		return err
	}

	if importOrder == nil {
		return errors.New("import order not found")
	}

	if importOrder.Status == "approved" {
		return errors.New("cannot delete approved import order")
	}

	// TODO: Implement delete functionality
	// This would require deleting all items first, then the order
	// For now, we'll return an error

	return errors.New("delete functionality not implemented yet")
}

// generateImportCode generates the next import code
func (s *ImportOrderService) generateImportCode() (string, error) {
	// For now, we'll use a simple timestamp-based approach
	// In production, you might want to use the database function generate_next_import_code()
	timestamp := time.Now().Unix()
	return fmt.Sprintf("%04d", timestamp%10000), nil
}
