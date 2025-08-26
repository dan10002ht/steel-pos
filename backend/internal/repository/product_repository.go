package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"steel-pos-backend/internal/models"
)

type ProductRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

// Product methods
func (r *ProductRepository) Create(product *models.Product) error {
	query := `
		INSERT INTO products (name, description, category_id, unit, notes, is_active, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`
	
	err := r.db.QueryRow(
		query,
		product.Name,
		product.Description,
		product.CategoryID,
		product.Unit,
		product.Notes,
		product.IsActive,
		product.CreatedBy,
		product.CreatedAt,
		product.UpdatedAt,
	).Scan(&product.ID, &product.CreatedAt, &product.UpdatedAt)
	
	return err
}

func (r *ProductRepository) GetByID(id int) (*models.Product, error) {
	query := `
		SELECT id, name, description, category_id, unit, notes, is_active, created_by, created_at, updated_at
		FROM products
		WHERE id = $1 AND is_active = true
	`
	
	product := &models.Product{}
	err := r.db.QueryRow(query, id).Scan(
		&product.ID,
		&product.Name,
		&product.Description,
		&product.CategoryID,
		&product.Unit,
		&product.Notes,
		&product.IsActive,
		&product.CreatedBy,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	
	return product, nil
}

func (r *ProductRepository) GetAll(limit, offset int, search string) ([]*models.Product, error) {
	query := `
		SELECT id, name, description, category_id, unit, notes, is_active, created_by, created_at, updated_at
		FROM products
		WHERE is_active = true
	`
	
	args := []interface{}{}
	argCount := 1
	
	if search != "" {
		query += fmt.Sprintf(" AND (name ILIKE $%d OR description ILIKE $%d)", argCount, argCount)
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
	
	var products []*models.Product
	for rows.Next() {
		product := &models.Product{}
		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Description,
			&product.CategoryID,
			&product.Unit,
			&product.Notes,
			&product.IsActive,
			&product.CreatedBy,
			&product.CreatedAt,
			&product.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		products = append(products, product)
	}
	
	return products, nil
}

func (r *ProductRepository) Update(product *models.Product) error {
	query := `
		UPDATE products
		SET name = $1, description = $2, category_id = $3, unit = $4, notes = $5, is_active = $6, updated_at = $7
		WHERE id = $8
	`
	
	result, err := r.db.Exec(
		query,
		product.Name,
		product.Description,
		product.CategoryID,
		product.Unit,
		product.Notes,
		product.IsActive,
		product.UpdatedAt,
		product.ID,
	)
	
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return errors.New("product not found")
	}
	
	return nil
}

func (r *ProductRepository) Delete(id int) error {
	query := `UPDATE products SET is_active = false WHERE id = $1`
	
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return errors.New("product not found")
	}
	
	return nil
}

func (r *ProductRepository) Count(search string) (int, error) {
	query := `SELECT COUNT(*) FROM products WHERE is_active = true`
	
	args := []interface{}{}
	argCount := 1
	
	if search != "" {
		query += fmt.Sprintf(" AND (name ILIKE $%d OR description ILIKE $%d)", argCount, argCount)
		args = append(args, "%"+search+"%")
	}
	
	var count int
	err := r.db.QueryRow(query, args...).Scan(&count)
	return count, err
}

// ProductVariant methods
func (r *ProductRepository) CreateVariant(variant *models.ProductVariant) error {
	query := `
		INSERT INTO product_variants (product_id, name, sku, stock, sold, price, unit, is_active, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at, updated_at
	`
	
	err := r.db.QueryRow(
		query,
		variant.ProductID,
		variant.Name,
		variant.SKU,
		variant.Stock,
		variant.Sold,
		variant.Price,
		variant.Unit,
		variant.IsActive,
		variant.CreatedBy,
		variant.CreatedAt,
		variant.UpdatedAt,
	).Scan(&variant.ID, &variant.CreatedAt, &variant.UpdatedAt)
	
	return err
}

func (r *ProductRepository) GetVariantByID(id int) (*models.ProductVariant, error) {
	query := `
		SELECT id, product_id, name, sku, stock, sold, price, unit, is_active, created_by, created_at, updated_at
		FROM product_variants
		WHERE id = $1 AND is_active = true
	`
	
	variant := &models.ProductVariant{}
	err := r.db.QueryRow(query, id).Scan(
		&variant.ID,
		&variant.ProductID,
		&variant.Name,
		&variant.SKU,
		&variant.Stock,
		&variant.Sold,
		&variant.Price,
		&variant.Unit,
		&variant.IsActive,
		&variant.CreatedBy,
		&variant.CreatedAt,
		&variant.UpdatedAt,
	)
	
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	
	return variant, nil
}

func (r *ProductRepository) GetVariantsByProductID(productID int) ([]*models.ProductVariant, error) {
	query := `
		SELECT id, product_id, name, sku, stock, sold, price, unit, is_active, created_by, created_at, updated_at
		FROM product_variants
		WHERE product_id = $1 AND is_active = true
		ORDER BY created_at DESC
	`
	
	rows, err := r.db.Query(query, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var variants []*models.ProductVariant
	for rows.Next() {
		variant := &models.ProductVariant{}
		err := rows.Scan(
			&variant.ID,
			&variant.ProductID,
			&variant.Name,
			&variant.SKU,
			&variant.Stock,
			&variant.Sold,
			&variant.Price,
			&variant.Unit,
			&variant.IsActive,
			&variant.CreatedBy,
			&variant.CreatedAt,
			&variant.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		variants = append(variants, variant)
	}
	
	return variants, nil
}

func (r *ProductRepository) UpdateVariant(variant *models.ProductVariant) error {
	query := `
		UPDATE product_variants
		SET name = $1, sku = $2, stock = $3, sold = $4, price = $5, unit = $6, is_active = $7, updated_at = $8
		WHERE id = $9
	`
	
	result, err := r.db.Exec(
		query,
		variant.Name,
		variant.SKU,
		variant.Stock,
		variant.Sold,
		variant.Price,
		variant.Unit,
		variant.IsActive,
		variant.UpdatedAt,
		variant.ID,
	)
	
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return errors.New("variant not found")
	}
	
	return nil
}

func (r *ProductRepository) DeleteVariant(id int) error {
	query := `UPDATE product_variants SET is_active = false WHERE id = $1`
	
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return errors.New("variant not found")
	}
	
	return nil
}

func (r *ProductRepository) UpdateStock(variantID int, quantity int) error {
	query := `UPDATE product_variants SET stock = stock + $1 WHERE id = $2`
	
	result, err := r.db.Exec(query, quantity, variantID)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return errors.New("variant not found")
	}
	
	return nil
}
