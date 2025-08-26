package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"steel-pos-backend/internal/models"
)

type SupplierRepository struct {
	db *sql.DB
}

func NewSupplierRepository(db *sql.DB) *SupplierRepository {
	return &SupplierRepository{db: db}
}

func (r *SupplierRepository) Create(supplier *models.Supplier) error {
	query := `
		INSERT INTO suppliers (name, code, phone, email, address, tax_code, contact_person, is_active, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at, updated_at
	`
	
	err := r.db.QueryRow(
		query,
		supplier.Name,
		supplier.Code,
		supplier.Phone,
		supplier.Email,
		supplier.Address,
		supplier.TaxCode,
		supplier.ContactPerson,
		supplier.IsActive,
		supplier.CreatedBy,
		supplier.CreatedAt,
		supplier.UpdatedAt,
	).Scan(&supplier.ID, &supplier.CreatedAt, &supplier.UpdatedAt)
	
	return err
}

func (r *SupplierRepository) GetByID(id int) (*models.Supplier, error) {
	query := `
		SELECT id, name, code, phone, email, address, tax_code, contact_person, is_active, created_by, created_at, updated_at
		FROM suppliers
		WHERE id = $1 AND is_active = true
	`
	
	supplier := &models.Supplier{}
	err := r.db.QueryRow(query, id).Scan(
		&supplier.ID,
		&supplier.Name,
		&supplier.Code,
		&supplier.Phone,
		&supplier.Email,
		&supplier.Address,
		&supplier.TaxCode,
		&supplier.ContactPerson,
		&supplier.IsActive,
		&supplier.CreatedBy,
		&supplier.CreatedAt,
		&supplier.UpdatedAt,
	)
	
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	
	return supplier, nil
}

func (r *SupplierRepository) GetByCode(code string) (*models.Supplier, error) {
	query := `
		SELECT id, name, code, phone, email, address, tax_code, contact_person, is_active, created_by, created_at, updated_at
		FROM suppliers
		WHERE code = $1 AND is_active = true
	`
	
	supplier := &models.Supplier{}
	err := r.db.QueryRow(query, code).Scan(
		&supplier.ID,
		&supplier.Name,
		&supplier.Code,
		&supplier.Phone,
		&supplier.Email,
		&supplier.Address,
		&supplier.TaxCode,
		&supplier.ContactPerson,
		&supplier.IsActive,
		&supplier.CreatedBy,
		&supplier.CreatedAt,
		&supplier.UpdatedAt,
	)
	
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	
	return supplier, nil
}

func (r *SupplierRepository) GetAll(limit, offset int, search string) ([]*models.Supplier, error) {
	query := `
		SELECT id, name, code, phone, email, address, tax_code, contact_person, is_active, created_by, created_at, updated_at
		FROM suppliers
		WHERE is_active = true
	`
	
	args := []interface{}{}
	argCount := 1
	
	if search != "" {
		query += fmt.Sprintf(" AND (name ILIKE $%d OR code ILIKE $%d OR phone ILIKE $%d OR email ILIKE $%d)", 
			argCount, argCount, argCount, argCount)
		args = append(args, "%"+search+"%")
		argCount++
	}
	
	query += " ORDER BY created_at DESC LIMIT $" + fmt.Sprint(argCount) + " OFFSET $" + fmt.Sprint(argCount+1)
	args = append(args, limit, offset)
	
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var suppliers []*models.Supplier
	for rows.Next() {
		supplier := &models.Supplier{}
		err := rows.Scan(
			&supplier.ID,
			&supplier.Name,
			&supplier.Code,
			&supplier.Phone,
			&supplier.Email,
			&supplier.Address,
			&supplier.TaxCode,
			&supplier.ContactPerson,
			&supplier.IsActive,
			&supplier.CreatedBy,
			&supplier.CreatedAt,
			&supplier.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		suppliers = append(suppliers, supplier)
	}
	
	return suppliers, nil
}

func (r *SupplierRepository) Update(supplier *models.Supplier) error {
	query := `
		UPDATE suppliers
		SET name = $1, code = $2, phone = $3, email = $4, address = $5, tax_code = $6, contact_person = $7, is_active = $8, updated_at = $9
		WHERE id = $10
	`
	
	result, err := r.db.Exec(
		query,
		supplier.Name,
		supplier.Code,
		supplier.Phone,
		supplier.Email,
		supplier.Address,
		supplier.TaxCode,
		supplier.ContactPerson,
		supplier.IsActive,
		supplier.UpdatedAt,
		supplier.ID,
	)
	
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return errors.New("supplier not found")
	}
	
	return nil
}

func (r *SupplierRepository) Delete(id int) error {
	query := `UPDATE suppliers SET is_active = false WHERE id = $1`
	
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return errors.New("supplier not found")
	}
	
	return nil
}

func (r *SupplierRepository) Count(search string) (int, error) {
	query := `SELECT COUNT(*) FROM suppliers WHERE is_active = true`
	
	args := []interface{}{}
	argCount := 1
	
	if search != "" {
		query += fmt.Sprintf(" AND (name ILIKE $%d OR code ILIKE $%d OR phone ILIKE $%d OR email ILIKE $%d)", 
			argCount, argCount, argCount, argCount)
		args = append(args, "%"+search+"%")
	}
	
	var count int
	err := r.db.QueryRow(query, args...).Scan(&count)
	return count, err
}

func (r *SupplierRepository) ExistsByCode(code string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM suppliers WHERE code = $1 AND is_active = true)`
	
	var exists bool
	err := r.db.QueryRow(query, code).Scan(&exists)
	return exists, err
}
