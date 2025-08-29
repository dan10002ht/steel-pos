package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"steel-pos-backend/internal/models"
	"strings"
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
		INSERT INTO products (name, category_id, unit, notes, is_active, created_by, created_by_name, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		query,
		product.Name,
		product.CategoryID,
		product.Unit,
		product.Notes,
		product.IsActive,
		product.CreatedBy,
		product.CreatedByName,
		product.CreatedAt,
		product.UpdatedAt,
	).Scan(&product.ID, &product.CreatedAt, &product.UpdatedAt)

	return err
}

func (r *ProductRepository) GetByID(id int) (*models.Product, error) {
	query := `
		SELECT id, name, category_id, unit, notes, is_active, created_by, created_at, updated_at
		FROM products
		WHERE id = $1 AND is_active = true
	`

	product := &models.Product{}
	err := r.db.QueryRow(query, id).Scan(
		&product.ID,
		&product.Name,
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

	// Load variants for this product
	variants, err := r.GetVariantsByProductID(product.ID)
	if err != nil {
		return nil, err
	}
	product.Variants = variants

	return product, nil
}

func (r *ProductRepository) GetAll(limit, offset int, search string) ([]*models.Product, error) {
	query := `
		SELECT id, name, category_id, unit, notes, is_active, created_by, created_at, updated_at
		FROM products
		WHERE is_active = true
	`

	args := []interface{}{}
	argCount := 1

	if search != "" {
		query += fmt.Sprintf(" AND normalize_vietnamese(name) ILIKE $%d", argCount)
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

		// Load variants for this product
		variants, err := r.GetVariantsByProductID(product.ID)
		if err != nil {
			return nil, err
		}
		product.Variants = variants

		products = append(products, product)
	}

	return products, nil
}

func (r *ProductRepository) Update(product *models.Product) error {
	query := `
		UPDATE products
		SET name = $1, category_id = $2, unit = $3, notes = $4, is_active = $5, updated_at = $6
		WHERE id = $7
	`

	result, err := r.db.Exec(
		query,
		product.Name,
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
		query += fmt.Sprintf(" AND normalize_vietnamese(name) ILIKE $%d", argCount)
		args = append(args, "%"+search+"%")
	}

	var count int
	err := r.db.QueryRow(query, args...).Scan(&count)
	return count, err
}

// SearchProductsHybrid combines ILIKE and full-text search for better results
func (r *ProductRepository) SearchProductsHybrid(query string, limit int, offset int) ([]*models.Product, error) {
	if query == "" {
		return r.GetAll(limit, offset, "")
	}

	// Normalize query for full-text search
	searchQuery := strings.ReplaceAll(query, " ", " & ")

	sqlQuery := `
		SELECT p.id, p.name, p.category_id, p.unit, p.notes,
			   p.is_active, p.created_by, p.created_at, p.updated_at,
			   GREATEST(
				   CASE WHEN normalize_vietnamese(p.name) = normalize_vietnamese($1) THEN 1.0 ELSE 0 END,
				   CASE WHEN normalize_vietnamese(p.name) LIKE normalize_vietnamese($2) THEN 0.8 ELSE 0 END,
				   CASE WHEN normalize_vietnamese(p.name) LIKE normalize_vietnamese($3) THEN 0.6 ELSE 0 END,
				   COALESCE(ts_rank(to_tsvector('simple', p.name), to_tsquery('simple', $4)), 0) * 0.5
			   ) as relevance_score
		FROM products p
		WHERE p.is_active = true 
		AND (
			normalize_vietnamese(p.name) LIKE normalize_vietnamese($3) 
			OR to_tsvector('simple', p.name) @@ to_tsquery('simple', $4)
		)
		ORDER BY relevance_score DESC, p.name
		LIMIT $5 OFFSET $6
	`

	// Prepare search parameters
	exactQuery := query
	startsWithQuery := query + "%"
	containsQuery := "%" + query + "%"

	rows, err := r.db.Query(sqlQuery, exactQuery, startsWithQuery, containsQuery, searchQuery, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []*models.Product
	for rows.Next() {
		product := &models.Product{}
		var relevanceScore float64
		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.CategoryID,
			&product.Unit,
			&product.Notes,
			&product.IsActive,
			&product.CreatedBy,
			&product.CreatedAt,
			&product.UpdatedAt,
			&relevanceScore,
		)
		if err != nil {
			return nil, err
		}

		// Load variants for this product
		variants, err := r.GetVariantsByProductID(product.ID)
		if err != nil {
			return nil, err
		}
		product.Variants = variants

		products = append(products, product)
	}

	return products, nil
}

// SearchProductsWithVariants searches products and includes variant information in search
func (r *ProductRepository) SearchProductsWithVariants(query string, limit int) ([]*models.Product, error) {
	if query == "" {
		return r.GetAll(limit, 0, "")
	}

	// Normalize query for full-text search
	searchQuery := strings.ReplaceAll(query, " ", " & ")

	sqlQuery := `
		SELECT DISTINCT p.id, p.name, p.category_id, p.unit, p.notes,
			   p.is_active, p.created_by, p.created_at, p.updated_at,
			   GREATEST(
				   CASE WHEN normalize_vietnamese(p.name) = normalize_vietnamese($1) THEN 1.0 ELSE 0 END,
				   CASE WHEN normalize_vietnamese(p.name) LIKE normalize_vietnamese($2) THEN 0.8 ELSE 0 END,
				   CASE WHEN normalize_vietnamese(p.name) LIKE normalize_vietnamese($3) THEN 0.6 ELSE 0 END,
				   CASE WHEN normalize_vietnamese(pv.name) LIKE normalize_vietnamese($3) THEN 0.5 ELSE 0 END,
				   CASE WHEN normalize_vietnamese(pv.sku) LIKE normalize_vietnamese($3) THEN 0.7 ELSE 0 END,
				   COALESCE(ts_rank(to_tsvector('simple', p.name), to_tsquery('simple', $4)), 0) * 0.5,
				   COALESCE(ts_rank(to_tsvector('simple', pv.name), to_tsquery('simple', $4)), 0) * 0.4,
				   COALESCE(ts_rank(to_tsvector('simple', pv.sku), to_tsquery('simple', $4)), 0) * 0.6
			   ) as relevance_score
		FROM products p
		LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
		WHERE p.is_active = true 
		AND (
			normalize_vietnamese(p.name) LIKE normalize_vietnamese($3) 
			OR normalize_vietnamese(COALESCE(pv.name, '')) LIKE normalize_vietnamese($3)
			OR normalize_vietnamese(COALESCE(pv.sku, '')) LIKE normalize_vietnamese($3)
			OR to_tsvector('simple', p.name) @@ to_tsquery('simple', $4)
			OR to_tsvector('simple', COALESCE(pv.name, '')) @@ to_tsquery('simple', $4)
			OR to_tsvector('simple', COALESCE(pv.sku, '')) @@ to_tsquery('simple', $4)
		)
		ORDER BY relevance_score DESC, p.name
		LIMIT $5
	`

	// Prepare search parameters
	exactQuery := query
	startsWithQuery := query + "%"
	containsQuery := "%" + query + "%"

	rows, err := r.db.Query(sqlQuery, exactQuery, startsWithQuery, containsQuery, searchQuery, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []*models.Product
	productMap := make(map[int]*models.Product)

	for rows.Next() {
		product := &models.Product{}
		var relevanceScore float64
		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.CategoryID,
			&product.Unit,
			&product.Notes,
			&product.IsActive,
			&product.CreatedBy,
			&product.CreatedAt,
			&product.UpdatedAt,
			&relevanceScore,
		)
		if err != nil {
			return nil, err
		}

		// Check if product already exists in map
		if existingProduct, exists := productMap[product.ID]; exists {
			// Product already exists, just load variants
			variants, err := r.GetVariantsByProductID(product.ID)
			if err != nil {
				return nil, err
			}
			existingProduct.Variants = variants
		} else {
			// New product, load variants and add to map
			variants, err := r.GetVariantsByProductID(product.ID)
			if err != nil {
				return nil, err
			}
			product.Variants = variants
			productMap[product.ID] = product
			products = append(products, product)
		}
	}

	return products, nil
}

// Count search results
func (r *ProductRepository) CountSearchResults(query string) (int, error) {
	if query == "" {
		return r.Count("")
	}

	searchQuery := strings.ReplaceAll(query, " ", " & ")

	sqlQuery := `
		SELECT COUNT(DISTINCT p.id)
		FROM products p
		LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
		WHERE p.is_active = true 
		AND (
			normalize_vietnamese(p.name) LIKE normalize_vietnamese($1) 
			OR normalize_vietnamese(COALESCE(pv.name, '')) LIKE normalize_vietnamese($1)
			OR normalize_vietnamese(COALESCE(pv.sku, '')) LIKE normalize_vietnamese($1)
			OR to_tsvector('simple', p.name) @@ to_tsquery('simple', $2)
			OR to_tsvector('simple', COALESCE(pv.name, '')) @@ to_tsquery('simple', $2)
			OR to_tsvector('simple', COALESCE(pv.sku, '')) @@ to_tsquery('simple', $2)
		)
	`

	containsQuery := "%" + query + "%"
	var count int
	err := r.db.QueryRow(sqlQuery, containsQuery, searchQuery).Scan(&count)
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
