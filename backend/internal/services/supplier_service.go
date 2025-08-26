package services

import (
	"errors"
	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/repository"
	"time"
)

type SupplierService struct {
	supplierRepo *repository.SupplierRepository
}

func NewSupplierService(supplierRepo *repository.SupplierRepository) *SupplierService {
	return &SupplierService{
		supplierRepo: supplierRepo,
	}
}

func (s *SupplierService) CreateSupplier(req *models.CreateSupplierRequest, createdBy int) (*models.Supplier, error) {
	// Check if supplier code already exists
	exists, err := s.supplierRepo.ExistsByCode(req.Code)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("supplier code already exists")
	}

	supplier := &models.Supplier{
		Name:          req.Name,
		Code:          req.Code,
		Phone:         req.Phone,
		Email:         req.Email,
		Address:       req.Address,
		TaxCode:       req.TaxCode,
		ContactPerson: req.ContactPerson,
		IsActive:      true,
		CreatedBy:     createdBy,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	err = s.supplierRepo.Create(supplier)
	if err != nil {
		return nil, err
	}

	return supplier, nil
}

func (s *SupplierService) GetSupplierByID(id int) (*models.Supplier, error) {
	supplier, err := s.supplierRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if supplier == nil {
		return nil, errors.New("supplier not found")
	}

	return supplier, nil
}

func (s *SupplierService) GetAllSuppliers(page, limit int, search string) (*models.SupplierListResponse, error) {
	offset := (page - 1) * limit

	suppliers, err := s.supplierRepo.GetAll(limit, offset, search)
	if err != nil {
		return nil, err
	}

	total, err := s.supplierRepo.Count(search)
	if err != nil {
		return nil, err
	}

	return &models.SupplierListResponse{
		Suppliers: suppliers,
		Total:     total,
		Page:      page,
		Limit:     limit,
	}, nil
}

func (s *SupplierService) UpdateSupplier(id int, req *models.UpdateSupplierRequest, updatedBy int) (*models.Supplier, error) {
	supplier, err := s.supplierRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if supplier == nil {
		return nil, errors.New("supplier not found")
	}

	// Update fields if provided
	if req.Name != "" {
		supplier.Name = req.Name
	}
	if req.Code != "" {
		// Check if new code already exists (excluding current supplier)
		if req.Code != supplier.Code {
			exists, err := s.supplierRepo.ExistsByCode(req.Code)
			if err != nil {
				return nil, err
			}
			if exists {
				return nil, errors.New("supplier code already exists")
			}
		}
		supplier.Code = req.Code
	}
	if req.Phone != "" {
		supplier.Phone = req.Phone
	}
	if req.Email != "" {
		supplier.Email = req.Email
	}
	if req.Address != "" {
		supplier.Address = req.Address
	}
	if req.TaxCode != "" {
		supplier.TaxCode = req.TaxCode
	}
	if req.ContactPerson != "" {
		supplier.ContactPerson = req.ContactPerson
	}
	if req.IsActive != nil {
		supplier.IsActive = *req.IsActive
	}

	supplier.UpdatedAt = time.Now()

	err = s.supplierRepo.Update(supplier)
	if err != nil {
		return nil, err
	}

	return supplier, nil
}

func (s *SupplierService) DeleteSupplier(id int) error {
	return s.supplierRepo.Delete(id)
}
