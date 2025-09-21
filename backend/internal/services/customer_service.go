package services

import (
	"fmt"
	"strings"

	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/repository"
)

type CustomerService struct {
	customerRepo    *repository.CustomerRepository
	auditLogService AuditLogService
}

func NewCustomerService(customerRepo *repository.CustomerRepository, auditLogService AuditLogService) *CustomerService {
	return &CustomerService{
		customerRepo:    customerRepo,
		auditLogService: auditLogService,
	}
}

// GetAllCustomers gets all customers with pagination
func (s *CustomerService) GetAllCustomers(page, limit int) ([]*models.Customer, int, error) {
	customers, total, err := s.customerRepo.GetAllCustomers(page, limit)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get all customers: %w", err)
	}

	return customers, total, nil
}

// SearchCustomers searches customers by name or phone
func (s *CustomerService) SearchCustomers(query string, limit int) ([]*models.Customer, int, error) {
	// Clean and prepare search query
	cleanQuery := strings.TrimSpace(query)
	if cleanQuery == "" {
		return []*models.Customer{}, 0, nil
	}

	// Search customers
	customers, total, err := s.customerRepo.SearchCustomers(cleanQuery, limit)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to search customers: %w", err)
	}

	return customers, total, nil
}

// GetCustomerByID gets customer by ID
func (s *CustomerService) GetCustomerByID(id int) (*models.Customer, error) {
	customer, err := s.customerRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get customer by ID: %w", err)
	}

	return customer, nil
}

// GetCustomerByPhone gets customer by phone
func (s *CustomerService) GetCustomerByPhone(phone string) (*models.Customer, error) {
	customer, err := s.customerRepo.GetByPhone(phone)
	if err != nil {
		return nil, fmt.Errorf("failed to get customer by phone: %w", err)
	}

	return customer, nil
}

// CreateCustomer creates a new customer
func (s *CustomerService) CreateCustomer(customer *models.Customer) (*models.Customer, error) {
	// Validate required fields
	if customer.Name == "" {
		return nil, fmt.Errorf("customer name is required")
	}
	if customer.Phone == "" {
		return nil, fmt.Errorf("customer phone is required")
	}

	// Check if customer with same phone already exists
	existingCustomer, err := s.customerRepo.GetByPhone(customer.Phone)
	if err == nil && existingCustomer != nil {
		return existingCustomer, nil // Return existing customer
	}

	// Create new customer
	createdCustomer, err := s.customerRepo.Create(customer)
	if err != nil {
		return nil, fmt.Errorf("failed to create customer: %w", err)
	}

	// Log audit trail for customer creation
	if s.auditLogService != nil {
		err = s.auditLogService.LogCustomerChange(
			createdCustomer.ID,
			"created",
			nil, // No old data for creation
			createdCustomer,
			customer.CreatedBy,
			nil, // userName
			nil, // ipAddress
			nil, // userAgent
		)
		if err != nil {
			// Log error but don't fail the creation
			fmt.Printf("ERROR: Failed to create customer audit log: %v\n", err)
		}
	}

	return createdCustomer, nil
}

// CreateOrGetCustomer creates a new customer or returns existing one by phone
func (s *CustomerService) CreateOrGetCustomer(phone, name, address string, createdBy int) (*models.Customer, error) {
	// First, try to find existing customer by phone
	existingCustomer, err := s.customerRepo.GetByPhone(phone)
	if err == nil {
		// Customer exists, return it
		return existingCustomer, nil
	}

	// Customer doesn't exist, create new one
	customer := &models.Customer{
		Name:      name,
		Phone:     phone,
		Address:   &address,
		IsActive:  true,
		CreatedBy: &createdBy,
	}

	createdCustomer, err := s.customerRepo.Create(customer)
	if err != nil {
		return nil, fmt.Errorf("failed to create customer: %w", err)
	}

	// Log audit trail for customer creation
	if s.auditLogService != nil {
		err = s.auditLogService.LogCustomerChange(
			createdCustomer.ID,
			"created",
			nil, // No old data for creation
			createdCustomer,
			&createdBy,
			nil, // userName
			nil, // ipAddress
			nil, // userAgent
		)
		if err != nil {
			// Log error but don't fail the creation
			fmt.Printf("ERROR: Failed to create customer audit log: %v\n", err)
		}
	}

	return createdCustomer, nil
}

// UpdateCustomer updates customer information
func (s *CustomerService) UpdateCustomer(id int, updateData map[string]interface{}, updatedBy int) (*models.Customer, error) {
	// Get existing customer for audit log
	oldCustomer, err := s.customerRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("customer not found: %w", err)
	}

	// Update customer
	updatedCustomer, err := s.customerRepo.Update(id, updateData, updatedBy)
	if err != nil {
		return nil, fmt.Errorf("failed to update customer: %w", err)
	}

	// Log audit trail for customer update
	if s.auditLogService != nil {
		err = s.auditLogService.LogCustomerChange(
			id,
			"updated",
			oldCustomer,
			updatedCustomer,
			&updatedBy,
			nil, // userName
			nil, // ipAddress
			nil, // userAgent
		)
		if err != nil {
			// Log error but don't fail the update
			fmt.Printf("ERROR: Failed to create customer audit log: %v\n", err)
		}
	}

	return updatedCustomer, nil
}

// DeleteCustomer deletes a customer
func (s *CustomerService) DeleteCustomer(id int, deletedBy int) error {
	// Get existing customer for audit log
	oldCustomer, err := s.customerRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("customer not found: %w", err)
	}

	// Delete customer
	err = s.customerRepo.Delete(id, deletedBy)
	if err != nil {
		return fmt.Errorf("failed to delete customer: %w", err)
	}

	// Log audit trail for customer deletion
	if s.auditLogService != nil {
		err = s.auditLogService.LogCustomerChange(
			id,
			"deleted",
			oldCustomer,
			nil, // No new data for deletion
			&deletedBy,
			nil, // userName
			nil, // ipAddress
			nil, // userAgent
		)
		if err != nil {
			// Log error but don't fail the deletion
			fmt.Printf("ERROR: Failed to create customer deletion audit log: %v\n", err)
		}
	}

	return nil
}

// GetCustomerAnalytics gets customer analytics data
func (s *CustomerService) GetCustomerAnalytics(customerID int) (map[string]interface{}, error) {
	// Get total invoices count
	totalInvoices, err := s.customerRepo.GetCustomerInvoicesCount(customerID)
	if err != nil {
		return nil, fmt.Errorf("failed to get customer invoices count: %w", err)
	}

	// Get total spent amount
	totalSpent, err := s.customerRepo.GetCustomerTotalSpent(customerID)
	if err != nil {
		return nil, fmt.Errorf("failed to get customer total spent: %w", err)
	}

	analytics := map[string]interface{}{
		"total_invoices": totalInvoices,
		"total_spent":    totalSpent,
	}

	return analytics, nil
}

// GetCustomerInvoices gets customer invoices with pagination
func (s *CustomerService) GetCustomerInvoices(customerID int, page, limit int) ([]*models.Invoice, int, error) {
	invoices, total, err := s.customerRepo.GetCustomerInvoices(customerID, page, limit)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get customer invoices: %w", err)
	}

	return invoices, total, nil
}

// GetCustomerAuditLogs gets audit logs for a specific customer
func (s *CustomerService) GetCustomerAuditLogs(customerID int) ([]models.AuditLog, error) {
	if s.auditLogService == nil {
		return []models.AuditLog{}, nil
	}

	return s.auditLogService.GetAuditLogsByEntity("customer", customerID)
}