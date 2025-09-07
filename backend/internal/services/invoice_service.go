package services

import (
	"errors"
	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/repository"
	"time"
)

type InvoiceService struct {
	invoiceRepo   *repository.InvoiceRepository
	customerService *CustomerService
}

func NewInvoiceService(invoiceRepo *repository.InvoiceRepository, customerService *CustomerService) *InvoiceService {
	return &InvoiceService{
		invoiceRepo:     invoiceRepo,
		customerService: customerService,
	}
}


// Invoice methods
func (s *InvoiceService) CreateInvoice(req *models.CreateInvoiceRequest, createdBy int) (*models.Invoice, error) {
	// Validate request
	if len(req.Items) == 0 {
		return nil, errors.New("invoice must have at least one item")
	}

	// Handle customer - either use existing ID or create/get by phone
	var customer *models.Customer
	var err error
	
	if req.CustomerID != nil {
		// Use existing customer ID
		customer, err = s.customerService.GetCustomerByID(*req.CustomerID)
		if err != nil {
			return nil, err
		}
	} else {
		// Create or get customer by phone
		var customerAddress string
		if req.CustomerAddress != nil {
			customerAddress = *req.CustomerAddress
		}
		customer, err = s.customerService.CreateOrGetCustomer(req.CustomerPhone, req.CustomerName, customerAddress, createdBy)
		if err != nil {
			return nil, err
		}
	}

	// Generate invoice code
	invoiceCode, err := s.invoiceRepo.GenerateInvoiceCode()
	if err != nil {
		return nil, err
	}

	// Calculate totals
	subtotal := 0.0
	for _, item := range req.Items {
		subtotal += item.Quantity * item.UnitPrice
	}

	// Apply discount
	discountAmount := 0.0
	if req.DiscountAmount != nil {
		discountAmount = *req.DiscountAmount
	} else if req.DiscountPercentage != nil {
		discountAmount = subtotal * (*req.DiscountPercentage / 100)
	}

	// Apply tax
	taxAmount := 0.0
	if req.TaxAmount != nil {
		taxAmount = *req.TaxAmount
	} else if req.TaxPercentage != nil {
		taxAmount = (subtotal - discountAmount) * (*req.TaxPercentage / 100)
	}

	totalAmount := subtotal - discountAmount + taxAmount

	// Determine payment status
	paidAmount := 0.0
	if req.PaidAmount != nil {
		paidAmount = *req.PaidAmount
	}

	paymentStatus := "pending"
	if paidAmount > 0 {
		if paidAmount >= totalAmount {
			paymentStatus = "paid"
		} else {
			paymentStatus = "partial"
		}
	}

	// Create invoice
	invoice := &models.Invoice{
		InvoiceCode:        invoiceCode,
		CustomerID:         &customer.ID,
		CustomerPhone:      req.CustomerPhone,
		CustomerName:       req.CustomerName,
		CustomerAddress:    req.CustomerAddress,
		Subtotal:           subtotal,
		DiscountAmount:     discountAmount,
		DiscountPercentage: 0,
		TaxAmount:          taxAmount,
		TaxPercentage:      0,
		TotalAmount:        totalAmount,
		PaidAmount:         paidAmount,
		PaymentStatus:      paymentStatus,
		Status:             "confirmed",
		Notes:              req.Notes,
		CreatedBy:          &createdBy,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	// Set discount percentage if provided
	if req.DiscountPercentage != nil {
		invoice.DiscountPercentage = *req.DiscountPercentage
	}

	// Set tax percentage if provided
	if req.TaxPercentage != nil {
		invoice.TaxPercentage = *req.TaxPercentage
	}

	err = s.invoiceRepo.CreateInvoice(invoice)
	if err != nil {
		return nil, err
	}

	// Create invoice items
	for _, itemReq := range req.Items {
		item := &models.InvoiceItem{
			InvoiceID:    invoice.ID,
			ProductID:    itemReq.ProductID,
			VariantID:    itemReq.VariantID,
			ProductName:  itemReq.ProductName,
			VariantName:  itemReq.VariantName,
			Unit:         itemReq.Unit,
			Quantity:     itemReq.Quantity,
			UnitPrice:    itemReq.UnitPrice,
			TotalPrice:   itemReq.Quantity * itemReq.UnitPrice,
			ProductNotes: itemReq.ProductNotes,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		err = s.invoiceRepo.CreateInvoiceItem(item)
		if err != nil {
			return nil, err
		}

		// Create inventory log for sale
		if itemReq.VariantID != nil {
			err = s.createInventoryLogForSale(*itemReq.VariantID, itemReq.Quantity, invoice.ID, createdBy)
			if err != nil {
				return nil, err
			}
		}
	}

	// Create payment if paid amount > 0
	if paidAmount > 0 && req.PaymentMethod != nil {
		payment := &models.InvoicePayment{
			InvoiceID:     invoice.ID,
			Amount:        paidAmount,
			PaymentMethod: *req.PaymentMethod,
			PaymentDate:   time.Now(),
			Status:        "confirmed",
			CreatedBy:     &createdBy,
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		}

		err = s.invoiceRepo.CreateInvoicePayment(payment)
		if err != nil {
			return nil, err
		}
	}

	// Load full invoice with relations
	return s.invoiceRepo.GetInvoiceByID(invoice.ID)
}

func (s *InvoiceService) GetInvoiceByID(id int) (*models.Invoice, error) {
	return s.invoiceRepo.GetInvoiceByID(id)
}

func (s *InvoiceService) GetInvoiceByCode(code string) (*models.Invoice, error) {
	return s.invoiceRepo.GetInvoiceByCode(code)
}

func (s *InvoiceService) GetAllInvoices(page, limit int, search string, status string, paymentStatus string) (*models.InvoiceListResponse, error) {
	offset := (page - 1) * limit

	invoices, err := s.invoiceRepo.GetAllInvoices(limit, offset, search, status, paymentStatus)
	if err != nil {
		return nil, err
	}

	total, err := s.invoiceRepo.CountInvoices(search, status, paymentStatus)
	if err != nil {
		return nil, err
	}

	return &models.InvoiceListResponse{
		Invoices: invoices,
		Total:    total,
		Page:     page,
		Limit:    limit,
	}, nil
}

func (s *InvoiceService) UpdateInvoice(id int, req *models.UpdateInvoiceRequest, updatedBy int) (*models.Invoice, error) {
	// Get existing invoice
	invoice, err := s.invoiceRepo.GetInvoiceByID(id)
	if err != nil {
		return nil, err
	}

	if invoice == nil {
		return nil, errors.New("invoice not found")
	}

	// Update customer info if provided
	if req.CustomerPhone != nil {
		invoice.CustomerPhone = *req.CustomerPhone
	}
	if req.CustomerName != nil {
		invoice.CustomerName = *req.CustomerName
	}
	if req.CustomerAddress != nil {
		invoice.CustomerAddress = req.CustomerAddress
	}

	// Update status if provided
	if req.Status != nil {
		invoice.Status = *req.Status
	}

	// Update notes if provided
	if req.Notes != nil {
		invoice.Notes = req.Notes
	}

	// Update items if provided
	if len(req.Items) > 0 {
		// Delete existing items
		err = s.invoiceRepo.DeleteInvoiceItemsByInvoiceID(id)
		if err != nil {
			return nil, err
		}

		// Create new items
		subtotal := 0.0
		for _, itemReq := range req.Items {
			if itemReq.IsDeleted != nil && *itemReq.IsDeleted {
				continue // Skip deleted items
			}

			item := &models.InvoiceItem{
				InvoiceID:    id,
				ProductID:    itemReq.ProductID,
				VariantID:    itemReq.VariantID,
				ProductName:  *itemReq.ProductName,
				VariantName:  *itemReq.VariantName,
				Unit:         *itemReq.Unit,
				Quantity:     *itemReq.Quantity,
				UnitPrice:    *itemReq.UnitPrice,
				TotalPrice:   *itemReq.Quantity * *itemReq.UnitPrice,
				ProductNotes: itemReq.ProductNotes,
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			}

			err = s.invoiceRepo.CreateInvoiceItem(item)
			if err != nil {
				return nil, err
			}

			subtotal += item.TotalPrice
		}

		// Recalculate totals
		invoice.Subtotal = subtotal

		// Apply discount
		if req.DiscountAmount != nil {
			invoice.DiscountAmount = *req.DiscountAmount
		} else if req.DiscountPercentage != nil {
			invoice.DiscountAmount = subtotal * (*req.DiscountPercentage / 100)
		}

		// Apply tax
		if req.TaxAmount != nil {
			invoice.TaxAmount = *req.TaxAmount
		} else if req.TaxPercentage != nil {
			invoice.TaxAmount = (subtotal - invoice.DiscountAmount) * (*req.TaxPercentage / 100)
		}

		invoice.TotalAmount = subtotal - invoice.DiscountAmount + invoice.TaxAmount
	}

	// Update paid amount if provided
	if req.PaidAmount != nil {
		invoice.PaidAmount = *req.PaidAmount

		// Update payment status
		if invoice.PaidAmount >= invoice.TotalAmount {
			invoice.PaymentStatus = "paid"
		} else if invoice.PaidAmount > 0 {
			invoice.PaymentStatus = "partial"
		} else {
			invoice.PaymentStatus = "pending"
		}
	}

	invoice.UpdatedAt = time.Now()

	err = s.invoiceRepo.UpdateInvoice(invoice)
	if err != nil {
		return nil, err
	}

	return s.invoiceRepo.GetInvoiceByID(id)
}

func (s *InvoiceService) DeleteInvoice(id int) error {
	return s.invoiceRepo.DeleteInvoice(id)
}

// InvoicePayment methods
func (s *InvoiceService) CreateInvoicePayment(invoiceID int, req *models.CreateInvoicePaymentRequest, createdBy int) (*models.InvoicePayment, error) {
	// Get invoice
	invoice, err := s.invoiceRepo.GetInvoiceByID(invoiceID)
	if err != nil {
		return nil, err
	}

	if invoice == nil {
		return nil, errors.New("invoice not found")
	}

	// Create payment
	payment := &models.InvoicePayment{
		InvoiceID:     invoiceID,
		Amount:        req.Amount,
		PaymentMethod: req.PaymentMethod,
		PaymentDate:   time.Now(),
		Status:        "confirmed",
		CreatedBy:     &createdBy,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if req.PaymentDate != nil {
		payment.PaymentDate = *req.PaymentDate
	}
	if req.TransactionReference != nil {
		payment.TransactionReference = req.TransactionReference
	}
	if req.Notes != nil {
		payment.Notes = req.Notes
	}

	err = s.invoiceRepo.CreateInvoicePayment(payment)
	if err != nil {
		return nil, err
	}

	// Update invoice paid amount and payment status
	newPaidAmount := invoice.PaidAmount + req.Amount
	invoice.PaidAmount = newPaidAmount

	if newPaidAmount >= invoice.TotalAmount {
		invoice.PaymentStatus = "paid"
	} else {
		invoice.PaymentStatus = "partial"
	}

	invoice.UpdatedAt = time.Now()

	err = s.invoiceRepo.UpdateInvoice(invoice)
	if err != nil {
		return nil, err
	}

	return payment, nil
}

func (s *InvoiceService) UpdateInvoicePayment(paymentID int, req *models.UpdateInvoicePaymentRequest, updatedBy int) (*models.InvoicePayment, error) {
	// Get existing payment
	payments, err := s.invoiceRepo.GetInvoicePaymentsByInvoiceID(0) // We need to find by payment ID
	if err != nil {
		return nil, err
	}

	var existingPayment *models.InvoicePayment
	for _, payment := range payments {
		if payment.ID == paymentID {
			existingPayment = payment
			break
		}
	}

	if existingPayment == nil {
		return nil, errors.New("payment not found")
	}

	// Store original amount for correction tracking
	originalAmount := existingPayment.Amount

	// Update payment fields
	if req.Amount != nil {
		existingPayment.Amount = *req.Amount
	}
	if req.PaymentMethod != nil {
		existingPayment.PaymentMethod = *req.PaymentMethod
	}
	if req.PaymentDate != nil {
		existingPayment.PaymentDate = *req.PaymentDate
	}
	if req.TransactionReference != nil {
		existingPayment.TransactionReference = req.TransactionReference
	}
	if req.Notes != nil {
		existingPayment.Notes = req.Notes
	}
	if req.CorrectionReason != nil {
		existingPayment.CorrectionReason = req.CorrectionReason
		existingPayment.CorrectedBy = &updatedBy
		correctedAt := time.Now()
		existingPayment.CorrectedAt = &correctedAt
		existingPayment.OriginalAmount = &originalAmount
	}
	if req.Status != nil {
		existingPayment.Status = *req.Status
	}

	existingPayment.UpdatedAt = time.Now()

	err = s.invoiceRepo.UpdateInvoicePayment(existingPayment)
	if err != nil {
		return nil, err
	}

	// Update invoice paid amount if amount changed
	if req.Amount != nil && *req.Amount != originalAmount {
		invoice, err := s.invoiceRepo.GetInvoiceByID(existingPayment.InvoiceID)
		if err != nil {
			return nil, err
		}

		// Recalculate total paid amount
		payments, err := s.invoiceRepo.GetInvoicePaymentsByInvoiceID(existingPayment.InvoiceID)
		if err != nil {
			return nil, err
		}

		totalPaid := 0.0
		for _, payment := range payments {
			if payment.Status == "confirmed" {
				totalPaid += payment.Amount
			}
		}

		invoice.PaidAmount = totalPaid

		if totalPaid >= invoice.TotalAmount {
			invoice.PaymentStatus = "paid"
		} else if totalPaid > 0 {
			invoice.PaymentStatus = "partial"
		} else {
			invoice.PaymentStatus = "pending"
		}

		invoice.UpdatedAt = time.Now()

		err = s.invoiceRepo.UpdateInvoice(invoice)
		if err != nil {
			return nil, err
		}
	}

	return existingPayment, nil
}

func (s *InvoiceService) DeleteInvoicePayment(paymentID int) error {
	// Get payment to find invoice ID
	// Note: This is a simplified approach. In a real implementation,
	// you might want to add a GetPaymentByID method to the repository
	return s.invoiceRepo.DeleteInvoicePayment(paymentID)
}

// Helper methods
func (s *InvoiceService) createInventoryLogForSale(variantID int, quantity float64, invoiceID int, createdBy int) error {
	// This is a simplified implementation
	// In a real system, you would need to:
	// 1. Get current stock from product_variants table
	// 2. Update stock (decrease by quantity)
	// 3. Create inventory log

	log := &models.InventoryLog{
		ProductID:      nil, // Will be filled from variant
		VariantID:      &variantID,
		MovementType:   "sale",
		QuantityChange: -quantity, // Negative for sale
		PreviousStock:  0,         // Would need to fetch from DB
		NewStock:       0,         // Would need to calculate
		ReferenceType:  "invoice",
		ReferenceID:    invoiceID,
		Notes:          nil,
		CreatedBy:      &createdBy,
		CreatedAt:      time.Now(),
	}

	return s.invoiceRepo.CreateInventoryLog(log)
}

func (s *InvoiceService) GetInvoiceSummary() (*models.InvoiceSummary, error) {
	return s.invoiceRepo.GetInvoiceSummary()
}
