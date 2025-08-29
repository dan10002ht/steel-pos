package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"steel-pos-backend/internal/models"

	"github.com/lib/pq"
)

type ImportOrderRepository struct {
	db *sql.DB
}

func NewImportOrderRepository(db *sql.DB) *ImportOrderRepository {
	return &ImportOrderRepository{db: db}
}

// ImportOrder methods
func (r *ImportOrderRepository) Create(order *models.ImportOrder) error {
	query := `
		INSERT INTO import_orders (import_code, supplier_name, import_date, total_value, status, approval_note, import_images, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		query,
		order.ImportCode,
		order.SupplierName,
		order.ImportDate,
		order.TotalAmount,
		order.Status,
		order.Notes,
		pq.Array(order.ImportImages),
		order.CreatedBy,
		order.CreatedAt,
		order.UpdatedAt,
	).Scan(&order.ID, &order.CreatedAt, &order.UpdatedAt)

	return err
}

func (r *ImportOrderRepository) GetByID(id int) (*models.ImportOrder, error) {
	query := `
		SELECT id, import_code, supplier_name, import_date, total_value, status, approval_note, import_images, approved_by, approved_at, approval_note, created_by, created_at, updated_at
		FROM import_orders
		WHERE id = $1
	`

	order := &models.ImportOrder{}
	var importImages pq.StringArray
	err := r.db.QueryRow(query, id).Scan(
		&order.ID,
		&order.ImportCode,
		&order.SupplierName,
		&order.ImportDate,
		&order.TotalAmount,
		&order.Status,
		&order.Notes,
		&importImages,
		&order.ApprovedBy,
		&order.ApprovedAt,
		&order.ApprovalNote,
		&order.CreatedBy,
		&order.CreatedAt,
		&order.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	// Convert pq.StringArray to []string
	order.ImportImages = []string(importImages)

	return order, nil
}

func (r *ImportOrderRepository) GetAll(limit, offset int, status string) ([]*models.ImportOrder, error) {
	query := `
		SELECT id, import_code, supplier_name, import_date, total_value, status, approval_note, import_images, approved_by, approved_at, approval_note, created_by, created_at, updated_at
		FROM import_orders
		WHERE 1=1
	`

	args := []interface{}{}
	argCount := 1

	if status != "" {
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, status)
		argCount++
	}

	query += " ORDER BY created_at DESC LIMIT $" + fmt.Sprint(argCount) + " OFFSET $" + fmt.Sprint(argCount+1)
	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []*models.ImportOrder
	for rows.Next() {
		order := &models.ImportOrder{}
		var importImages pq.StringArray
		err := rows.Scan(
			&order.ID,
			&order.ImportCode,
			&order.SupplierName,
			&order.ImportDate,
			&order.TotalAmount,
			&order.Status,
			&order.Notes,
			&importImages,
			&order.ApprovedBy,
			&order.ApprovedAt,
			&order.ApprovalNote,
			&order.CreatedBy,
			&order.CreatedAt,
			&order.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		// Convert pq.StringArray to []string
		order.ImportImages = []string(importImages)
		orders = append(orders, order)
	}

	return orders, nil
}

func (r *ImportOrderRepository) Update(order *models.ImportOrder) error {
	query := `
		UPDATE import_orders
		SET supplier_name = $1, import_date = $2, total_value = $3, status = $4, approval_note = $5, import_images = $6, updated_at = $7
		WHERE id = $8
	`

	result, err := r.db.Exec(
		query,
		order.SupplierName,
		order.ImportDate,
		order.TotalAmount,
		order.Status,
		order.Notes,
		pq.Array(order.ImportImages),
		order.UpdatedAt,
		order.ID,
	)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("import order not found")
	}

	return nil
}

func (r *ImportOrderRepository) Approve(id int, approvedBy int, approvalNote string) error {
	// Start transaction
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Update import order status
	updateQuery := `
		UPDATE import_orders
		SET status = 'approved', approved_by = $1, approved_at = NOW(), approval_note = $2, updated_at = NOW()
		WHERE id = $3
	`

	result, err := tx.Exec(updateQuery, approvedBy, approvalNote, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("import order not found")
	}

	// Call function to update inventory
	inventoryQuery := `SELECT update_inventory_on_import_approval($1, $2)`
	_, err = tx.Exec(inventoryQuery, id, approvedBy)
	if err != nil {
		return err
	}

	// Commit transaction
	return tx.Commit()
}

func (r *ImportOrderRepository) Count(status string) (int, error) {
	query := `SELECT COUNT(*) FROM import_orders WHERE 1=1`

	args := []interface{}{}
	argCount := 1

	if status != "" {
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, status)
	}

	var count int
	err := r.db.QueryRow(query, args...).Scan(&count)
	return count, err
}

// ImportOrderItem methods
func (r *ImportOrderRepository) CreateItem(item *models.ImportOrderItem) error {
	query := `
		INSERT INTO import_order_items (import_order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, total_price, unit, created_by, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at
	`

	err := r.db.QueryRow(
		query,
		item.ImportOrderID,
		item.ProductID,
		item.VariantID,
		item.ProductName,
		item.VariantName,
		item.Quantity,
		item.UnitPrice,
		item.TotalPrice,
		item.Unit,
		item.CreatedBy,
		item.CreatedAt,
	).Scan(&item.ID, &item.CreatedAt)

	return err
}

func (r *ImportOrderRepository) GetItemsByOrderID(orderID int) ([]*models.ImportOrderItem, error) {
	query := `
		SELECT id, import_order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, total_price, unit, created_by, created_at
		FROM import_order_items
		WHERE import_order_id = $1
		ORDER BY created_at ASC
	`

	rows, err := r.db.Query(query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*models.ImportOrderItem
	for rows.Next() {
		item := &models.ImportOrderItem{}
		err := rows.Scan(
			&item.ID,
			&item.ImportOrderID,
			&item.ProductID,
			&item.VariantID,
			&item.ProductName,
			&item.VariantName,
			&item.Quantity,
			&item.UnitPrice,
			&item.TotalPrice,
			&item.Unit,
			&item.CreatedBy,
			&item.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}

func (r *ImportOrderRepository) UpdateItem(item *models.ImportOrderItem) error {
	query := `
		UPDATE import_order_items
		SET product_id = $1, product_variant_id = $2, product_name = $3, variant_name = $4, quantity = $5, unit_price = $6, total_price = $7, unit = $8
		WHERE id = $9
	`

	result, err := r.db.Exec(
		query,
		item.ProductID,
		item.VariantID,
		item.ProductName,
		item.VariantName,
		item.Quantity,
		item.UnitPrice,
		item.TotalPrice,
		item.Unit,
		item.ID,
	)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("import order item not found")
	}

	return nil
}

func (r *ImportOrderRepository) DeleteItem(id int) error {
	query := `DELETE FROM import_order_items WHERE id = $1`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("import order item not found")
	}

	return nil
}
