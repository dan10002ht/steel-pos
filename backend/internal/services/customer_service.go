package services

import (
	"fmt"
	"strings"

	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/repository"
)

type CustomerService struct {
	customerRepo *repository.CustomerRepository
}

func NewCustomerService(customerRepo *repository.CustomerRepository) *CustomerService {
	return &CustomerService{
		customerRepo: customerRepo,
	}
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

	return createdCustomer, nil
}

// UpdateCustomer updates customer information
func (s *CustomerService) UpdateCustomer(id int, updateData map[string]interface{}, updatedBy int) (*models.Customer, error) {
	// Check if customer exists
	_, err := s.customerRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("customer not found: %w", err)
	}

	// Update customer
	updatedCustomer, err := s.customerRepo.Update(id, updateData, updatedBy)
	if err != nil {
		return nil, fmt.Errorf("failed to update customer: %w", err)
	}

	return updatedCustomer, nil
}

// DeleteCustomer deletes a customer
func (s *CustomerService) DeleteCustomer(id int, deletedBy int) error {
	// Check if customer exists
	_, err := s.customerRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("customer not found: %w", err)
	}

	// Delete customer
	err = s.customerRepo.Delete(id, deletedBy)
	if err != nil {
		return fmt.Errorf("failed to delete customer: %w", err)
	}

	return nil
}