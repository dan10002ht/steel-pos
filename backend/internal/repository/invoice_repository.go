package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"steel-pos-backend/internal/models"
)

type InvoiceRepository struct {
	db *sql.DB
}

func NewInvoiceRepository(db *sql.DB) *InvoiceRepository {
	return &InvoiceRepository{db: db}
}


// Invoice methods
func (r *InvoiceRepository) CreateInvoice(invoice *models.Invoice) error {
	query := `
		INSERT INTO invoices (
			invoice_code, customer_id, customer_phone, customer_name, customer_address,
			subtotal, discount_amount, discount_percentage, tax_amount, tax_percentage,
			total_amount, paid_amount, payment_status, status, notes,
			created_by, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		query,
		invoice.InvoiceCode,
		invoice.CustomerID,
		invoice.CustomerPhone,
		invoice.CustomerName,
		invoice.CustomerAddress,
		invoice.Subtotal,
		invoice.DiscountAmount,
		invoice.DiscountPercentage,
		invoice.TaxAmount,
		invoice.TaxPercentage,
		invoice.TotalAmount,
		invoice.PaidAmount,
		invoice.PaymentStatus,
		invoice.Status,
		invoice.Notes,
		invoice.CreatedBy,
		invoice.CreatedAt,
		invoice.UpdatedAt,
	).Scan(&invoice.ID, &invoice.CreatedAt, &invoice.UpdatedAt)

	return err
}

func (r *InvoiceRepository) GetInvoiceByID(id int) (*models.Invoice, error) {
	query := `
		SELECT id, invoice_code, customer_id, customer_phone, customer_name, customer_address,
			   subtotal, discount_amount, discount_percentage, tax_amount, tax_percentage,
			   total_amount, paid_amount, payment_status, status, notes,
			   created_at, updated_at, created_by, cancelled_at, cancelled_by, cancellation_reason
		FROM invoices
		WHERE id = $1
	`

	invoice := &models.Invoice{}
	err := r.db.QueryRow(query, id).Scan(
		&invoice.ID,
		&invoice.InvoiceCode,
		&invoice.CustomerID,
		&invoice.CustomerPhone,
		&invoice.CustomerName,
		&invoice.CustomerAddress,
		&invoice.Subtotal,
		&invoice.DiscountAmount,
		&invoice.DiscountPercentage,
		&invoice.TaxAmount,
		&invoice.TaxPercentage,
		&invoice.TotalAmount,
		&invoice.PaidAmount,
		&invoice.PaymentStatus,
		&invoice.Status,
		&invoice.Notes,
		&invoice.CreatedAt,
		&invoice.UpdatedAt,
		&invoice.CreatedBy,
		&invoice.CancelledAt,
		&invoice.CancelledBy,
		&invoice.CancellationReason,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	// Load related data
	if err := r.loadInvoiceRelations(invoice); err != nil {
		return nil, err
	}

	return invoice, nil
}

func (r *InvoiceRepository) GetInvoiceByCode(code string) (*models.Invoice, error) {
	query := `
		SELECT id, invoice_code, customer_id, customer_phone, customer_name, customer_address,
			   subtotal, discount_amount, discount_percentage, tax_amount, tax_percentage,
			   total_amount, paid_amount, payment_status, status, notes,
			   created_at, updated_at, created_by
		FROM invoices
		WHERE invoice_code = $1
	`

	invoice := &models.Invoice{}
	err := r.db.QueryRow(query, code).Scan(
		&invoice.ID,
		&invoice.InvoiceCode,
		&invoice.CustomerID,
		&invoice.CustomerPhone,
		&invoice.CustomerName,
		&invoice.CustomerAddress,
		&invoice.Subtotal,
		&invoice.DiscountAmount,
		&invoice.DiscountPercentage,
		&invoice.TaxAmount,
		&invoice.TaxPercentage,
		&invoice.TotalAmount,
		&invoice.PaidAmount,
		&invoice.PaymentStatus,
		&invoice.Status,
		&invoice.Notes,
		&invoice.CreatedAt,
		&invoice.UpdatedAt,
		&invoice.CreatedBy,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	// Load related data
	if err := r.loadInvoiceRelations(invoice); err != nil {
		return nil, err
	}

	return invoice, nil
}

func (r *InvoiceRepository) GetAllInvoices(limit, offset int, search string, status string, paymentStatus string, dateFrom string, dateTo string) ([]*models.Invoice, error) {
	query := `
		SELECT id, invoice_code, customer_id, customer_phone, customer_name, customer_address,
			   subtotal, discount_amount, discount_percentage, tax_amount, tax_percentage,
			   total_amount, paid_amount, payment_status, status, notes,
			   created_at, updated_at, created_by
		FROM invoices
		WHERE 1=1
	`

	args := []interface{}{}
	argCount := 1

	if search != "" {
		query += fmt.Sprintf(" AND (invoice_code ILIKE $%d OR customer_name ILIKE $%d OR customer_phone ILIKE $%d)", argCount, argCount, argCount)
		args = append(args, "%"+search+"%")
		argCount++
	}

	if status != "" {
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, status)
		argCount++
	}

	if paymentStatus != "" {
		query += fmt.Sprintf(" AND payment_status = $%d", argCount)
		args = append(args, paymentStatus)
		argCount++
	}

	if dateFrom != "" {
		query += fmt.Sprintf(" AND created_at >= $%d", argCount)
		args = append(args, dateFrom)
		argCount++
	}

	if dateTo != "" {
		query += fmt.Sprintf(" AND created_at <= $%d", argCount)
		args = append(args, dateTo)
		argCount++
	}

	query += " ORDER BY created_at DESC LIMIT $" + fmt.Sprint(argCount) + " OFFSET $" + fmt.Sprint(argCount+1)
	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var invoices []*models.Invoice
	for rows.Next() {
		invoice := &models.Invoice{}
		err := rows.Scan(
			&invoice.ID,
			&invoice.InvoiceCode,
			&invoice.CustomerID,
			&invoice.CustomerPhone,
			&invoice.CustomerName,
			&invoice.CustomerAddress,
			&invoice.Subtotal,
			&invoice.DiscountAmount,
			&invoice.DiscountPercentage,
			&invoice.TaxAmount,
			&invoice.TaxPercentage,
			&invoice.TotalAmount,
			&invoice.PaidAmount,
			&invoice.PaymentStatus,
			&invoice.Status,
			&invoice.Notes,
			&invoice.CreatedAt,
			&invoice.UpdatedAt,
			&invoice.CreatedBy,
		)
		if err != nil {
			return nil, err
		}
		invoices = append(invoices, invoice)
	}

	return invoices, nil
}

func (r *InvoiceRepository) CountInvoices(search string, status string, paymentStatus string, dateFrom string, dateTo string) (int, error) {
	query := `SELECT COUNT(*) FROM invoices WHERE 1=1`

	args := []interface{}{}
	argCount := 1

	if search != "" {
		query += fmt.Sprintf(" AND (invoice_code ILIKE $%d OR customer_name ILIKE $%d OR customer_phone ILIKE $%d)", argCount, argCount, argCount)
		args = append(args, "%"+search+"%")
		argCount++
	}

	if status != "" {
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, status)
		argCount++
	}

	if paymentStatus != "" {
		query += fmt.Sprintf(" AND payment_status = $%d", argCount)
		args = append(args, paymentStatus)
		argCount++
	}

	if dateFrom != "" {
		query += fmt.Sprintf(" AND created_at >= $%d", argCount)
		args = append(args, dateFrom)
		argCount++
	}

	if dateTo != "" {
		query += fmt.Sprintf(" AND created_at <= $%d", argCount)
		args = append(args, dateTo)
		argCount++
	}

	var count int
	err := r.db.QueryRow(query, args...).Scan(&count)
	return count, err
}

// SearchInvoicesHybrid combines ILIKE and full-text search for better results
func (r *InvoiceRepository) SearchInvoicesHybrid(query string, limit int, offset int, paymentStatus string, dateFrom string, dateTo string) ([]*models.Invoice, error) {
	if query == "" {
		return r.GetAllInvoices(limit, offset, "", "", "", "", "")
	}

	// Normalize query for full-text search
	searchQuery := strings.ReplaceAll(query, " ", " & ")

	sqlQuery := `
		SELECT id, invoice_code, customer_id, customer_phone, customer_name, customer_address,
			   subtotal, discount_amount, discount_percentage, tax_amount, tax_percentage,
			   total_amount, paid_amount, payment_status, status, notes,
			   created_at, updated_at, created_by,
			   GREATEST(
				   CASE WHEN normalize_vietnamese(invoice_code) = normalize_vietnamese($1) THEN 1.0 ELSE 0 END,
				   CASE WHEN normalize_vietnamese(customer_name) = normalize_vietnamese($1) THEN 0.9 ELSE 0 END,
				   CASE WHEN normalize_vietnamese(invoice_code) LIKE normalize_vietnamese($2) THEN 0.8 ELSE 0 END,
				   CASE WHEN normalize_vietnamese(customer_name) LIKE normalize_vietnamese($2) THEN 0.7 ELSE 0 END,
				   CASE WHEN normalize_vietnamese(customer_phone) LIKE normalize_vietnamese($2) THEN 0.6 ELSE 0 END,
				   CASE WHEN normalize_vietnamese(invoice_code) LIKE normalize_vietnamese($3) THEN 0.5 ELSE 0 END,
				   CASE WHEN normalize_vietnamese(customer_name) LIKE normalize_vietnamese($3) THEN 0.4 ELSE 0 END,
				   CASE WHEN normalize_vietnamese(customer_phone) LIKE normalize_vietnamese($3) THEN 0.3 ELSE 0 END,
				   COALESCE(ts_rank(to_tsvector('simple', invoice_code || ' ' || customer_name || ' ' || customer_phone), to_tsquery('simple', $4)), 0) * 0.2
			   ) as relevance_score
		FROM invoices
		WHERE (
			normalize_vietnamese(invoice_code) LIKE normalize_vietnamese($3) 
			OR normalize_vietnamese(customer_name) LIKE normalize_vietnamese($3)
			OR normalize_vietnamese(customer_phone) LIKE normalize_vietnamese($3)
			OR to_tsvector('simple', invoice_code || ' ' || customer_name || ' ' || customer_phone) @@ to_tsquery('simple', $4)
		)
		AND ($5 = '' OR payment_status = $5)
		AND ($6 = '' OR created_at >= $6::timestamp)
		AND ($7 = '' OR created_at <= $7::timestamp)
		ORDER BY relevance_score DESC, created_at DESC
		LIMIT $8 OFFSET $9
	`

	// Prepare search parameters
	exactQuery := query
	startsWithQuery := query + "%"
	containsQuery := "%" + query + "%"

	// Debug logging
	fmt.Printf("\n=== DEBUG SearchInvoicesHybrid ===\n")
	fmt.Printf("Original query: '%s'\n", query)
	fmt.Printf("Contains query: '%s'\n", containsQuery)
	fmt.Printf("Search query: '%s'\n", searchQuery)
	
	// Test normalization
	var normalizedDB, normalizedQuery string
	err := r.db.QueryRow("SELECT normalize_vietnamese('Trần Thái Đan'), normalize_vietnamese($1)", query).Scan(&normalizedDB, &normalizedQuery)
	if err == nil {
		fmt.Printf("\n--- Normalization Test ---\n")
		fmt.Printf("'Trần Thái Đan' -> '%s'\n", normalizedDB)
		fmt.Printf("'tran thai dan' -> '%s'\n", normalizedQuery)
		fmt.Printf("Match test: '%s' LIKE '%s' = %t\n", normalizedDB, containsQuery, strings.Contains(normalizedDB, strings.Trim(containsQuery, "%")))
	} else {
		fmt.Printf("Error testing normalization: %v\n", err)
	}
	
	// Test actual database data
	fmt.Printf("\n--- Database Data Test ---\n")
	var actualCustomerName string
	err = r.db.QueryRow("SELECT customer_name FROM invoices WHERE id = 1").Scan(&actualCustomerName)
	if err == nil {
		var actualNormalized string
		err = r.db.QueryRow("SELECT normalize_vietnamese($1)", actualCustomerName).Scan(&actualNormalized)
		if err == nil {
			fmt.Printf("Actual customer_name: '%s'\n", actualCustomerName)
			fmt.Printf("Normalized: '%s'\n", actualNormalized)
			fmt.Printf("Match with query: '%s' LIKE '%s' = %t\n", actualNormalized, containsQuery, strings.Contains(actualNormalized, strings.Trim(containsQuery, "%")))
		}
	}
	
	// Test count query
	var count int
	err = r.db.QueryRow("SELECT COUNT(*) FROM invoices WHERE normalize_vietnamese(customer_name) LIKE normalize_vietnamese($1)", containsQuery).Scan(&count)
	if err == nil {
		fmt.Printf("Count with contains query: %d\n", count)
	} else {
		fmt.Printf("Error counting: %v\n", err)
	}
	
	fmt.Printf("=== END DEBUG ===\n\n")

	rows, err := r.db.Query(sqlQuery, exactQuery, startsWithQuery, containsQuery, searchQuery, paymentStatus, dateFrom, dateTo, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var invoices []*models.Invoice
	for rows.Next() {
		invoice := &models.Invoice{}
		var relevanceScore float64
		err := rows.Scan(
			&invoice.ID,
			&invoice.InvoiceCode,
			&invoice.CustomerID,
			&invoice.CustomerPhone,
			&invoice.CustomerName,
			&invoice.CustomerAddress,
			&invoice.Subtotal,
			&invoice.DiscountAmount,
			&invoice.DiscountPercentage,
			&invoice.TaxAmount,
			&invoice.TaxPercentage,
			&invoice.TotalAmount,
			&invoice.PaidAmount,
			&invoice.PaymentStatus,
			&invoice.Status,
			&invoice.Notes,
			&invoice.CreatedAt,
			&invoice.UpdatedAt,
			&invoice.CreatedBy,
			&relevanceScore,
		)
		if err != nil {
			return nil, err
		}
		invoices = append(invoices, invoice)
	}

	return invoices, nil
}

// CountSearchResults counts search results for hybrid search
func (r *InvoiceRepository) CountSearchResults(query string, paymentStatus string, dateFrom string, dateTo string) (int, error) {
	if query == "" {
		return r.CountInvoices("", "", "", "", "")
	}

	// Normalize query for full-text search
	searchQuery := strings.ReplaceAll(query, " ", " & ")

	sqlQuery := `
		SELECT COUNT(*)
		FROM invoices
		WHERE (
			normalize_vietnamese(invoice_code) LIKE normalize_vietnamese($1) 
			OR normalize_vietnamese(customer_name) LIKE normalize_vietnamese($1)
			OR normalize_vietnamese(customer_phone) LIKE normalize_vietnamese($1)
			OR to_tsvector('simple', invoice_code || ' ' || customer_name || ' ' || customer_phone) @@ to_tsquery('simple', $2)
		)
		AND ($3 = '' OR payment_status = $3)
		AND ($4 = '' OR created_at >= $4::timestamp)
		AND ($5 = '' OR created_at <= $5::timestamp)
	`

	containsQuery := "%" + query + "%"
	var count int
	err := r.db.QueryRow(sqlQuery, containsQuery, searchQuery, paymentStatus, dateFrom, dateTo).Scan(&count)
	return count, err
}

// CancelInvoice cancels an invoice and restores inventory
func (r *InvoiceRepository) CancelInvoice(invoiceID int, reason string, cancelledBy int) error {
	// Get invoice items to restore inventory
	itemsQuery := `
		SELECT variant_id, quantity 
		FROM invoice_items 
		WHERE invoice_id = $1 AND variant_id IS NOT NULL
	`
	
	rows, err := r.db.Query(itemsQuery, invoiceID)
	if err != nil {
		return err
	}
	defer rows.Close()

	// Restore inventory for each item
	for rows.Next() {
		var variantID int
		var quantity float64
		if err := rows.Scan(&variantID, &quantity); err != nil {
			return err
		}

		// Restore quantity to product_variants
		restoreQuery := `
			UPDATE product_variants 
			SET stock = stock + $1::INTEGER, updated_at = NOW()
			WHERE id = $2
		`
		
		_, err = r.db.Exec(restoreQuery, quantity, variantID)
		if err != nil {
			return err
		}
	}

	// Update invoice status to cancelled
	updateQuery := `
		UPDATE invoices 
		SET status = 'cancelled', 
		    cancelled_at = NOW(), 
		    cancelled_by = $1, 
		    cancellation_reason = $2,
		    updated_at = NOW()
		WHERE id = $3
	`
	
	_, err = r.db.Exec(updateQuery, cancelledBy, reason, invoiceID)
	if err != nil {
		return err
	}

	return nil
}

func (r *InvoiceRepository) UpdateInvoice(invoice *models.Invoice) error {
	query := `
		UPDATE invoices
		SET customer_phone = $1, customer_name = $2, customer_address = $3,
			subtotal = $4, discount_amount = $5, discount_percentage = $6,
			tax_amount = $7, tax_percentage = $8, total_amount = $9,
			paid_amount = $10, payment_status = $11, status = $12, notes = $13,
			updated_at = $14
		WHERE id = $15
	`

	result, err := r.db.Exec(
		query,
		invoice.CustomerPhone,
		invoice.CustomerName,
		invoice.CustomerAddress,
		invoice.Subtotal,
		invoice.DiscountAmount,
		invoice.DiscountPercentage,
		invoice.TaxAmount,
		invoice.TaxPercentage,
		invoice.TotalAmount,
		invoice.PaidAmount,
		invoice.PaymentStatus,
		invoice.Status,
		invoice.Notes,
		invoice.UpdatedAt,
		invoice.ID,
	)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("invoice not found")
	}

	return nil
}

func (r *InvoiceRepository) DeleteInvoice(id int) error {
	query := `UPDATE invoices SET status = 'cancelled' WHERE id = $1`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("invoice not found")
	}

	return nil
}

// InvoiceItem methods
func (r *InvoiceRepository) CreateInvoiceItem(item *models.InvoiceItem) error {
	query := `
		INSERT INTO invoice_items (
			invoice_id, product_id, variant_id, product_name, variant_name, unit,
			quantity, unit_price, total_price, product_notes, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		query,
		item.InvoiceID,
		item.ProductID,
		item.VariantID,
		item.ProductName,
		item.VariantName,
		item.Unit,
		item.Quantity,
		item.UnitPrice,
		item.TotalPrice,
		item.ProductNotes,
		item.CreatedAt,
		item.UpdatedAt,
	).Scan(&item.ID, &item.CreatedAt, &item.UpdatedAt)

	return err
}

func (r *InvoiceRepository) GetInvoiceItemsByInvoiceID(invoiceID int) ([]*models.InvoiceItem, error) {
	query := `
		SELECT id, invoice_id, product_id, variant_id, product_name, variant_name, unit,
			   quantity, unit_price, total_price, product_notes, created_at, updated_at
		FROM invoice_items
		WHERE invoice_id = $1
		ORDER BY created_at ASC
	`

	rows, err := r.db.Query(query, invoiceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*models.InvoiceItem
	for rows.Next() {
		item := &models.InvoiceItem{}
		err := rows.Scan(
			&item.ID,
			&item.InvoiceID,
			&item.ProductID,
			&item.VariantID,
			&item.ProductName,
			&item.VariantName,
			&item.Unit,
			&item.Quantity,
			&item.UnitPrice,
			&item.TotalPrice,
			&item.ProductNotes,
			&item.CreatedAt,
			&item.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}

func (r *InvoiceRepository) UpdateInvoiceItem(item *models.InvoiceItem) error {
	query := `
		UPDATE invoice_items
		SET product_name = $1, variant_name = $2, unit = $3,
			quantity = $4, unit_price = $5, total_price = $6,
			product_notes = $7, updated_at = $8
		WHERE id = $9
	`

	result, err := r.db.Exec(
		query,
		item.ProductName,
		item.VariantName,
		item.Unit,
		item.Quantity,
		item.UnitPrice,
		item.TotalPrice,
		item.ProductNotes,
		item.UpdatedAt,
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
		return errors.New("invoice item not found")
	}

	return nil
}

func (r *InvoiceRepository) DeleteInvoiceItem(id int) error {
	query := `DELETE FROM invoice_items WHERE id = $1`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("invoice item not found")
	}

	return nil
}

func (r *InvoiceRepository) DeleteInvoiceItemsByInvoiceID(invoiceID int) error {
	query := `DELETE FROM invoice_items WHERE invoice_id = $1`

	_, err := r.db.Exec(query, invoiceID)
	return err
}

// InvoicePayment methods
func (r *InvoiceRepository) CreateInvoicePayment(payment *models.InvoicePayment) error {
	query := `
		INSERT INTO invoice_payments (
			invoice_id, amount, payment_method, payment_date, transaction_reference,
			notes, status, created_by, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		query,
		payment.InvoiceID,
		payment.Amount,
		payment.PaymentMethod,
		payment.PaymentDate,
		payment.TransactionReference,
		payment.Notes,
		payment.Status,
		payment.CreatedBy,
		payment.CreatedAt,
		payment.UpdatedAt,
	).Scan(&payment.ID, &payment.CreatedAt, &payment.UpdatedAt)

	return err
}

func (r *InvoiceRepository) GetInvoicePaymentsByInvoiceID(invoiceID int) ([]*models.InvoicePayment, error) {
	query := `
		SELECT id, invoice_id, amount, payment_method, payment_date, transaction_reference,
			   notes, correction_reason, corrected_by, corrected_at, original_amount,
			   status, created_at, updated_at, created_by
		FROM invoice_payments
		WHERE invoice_id = $1
		ORDER BY created_at ASC
	`

	rows, err := r.db.Query(query, invoiceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []*models.InvoicePayment
	for rows.Next() {
		payment := &models.InvoicePayment{}
		err := rows.Scan(
			&payment.ID,
			&payment.InvoiceID,
			&payment.Amount,
			&payment.PaymentMethod,
			&payment.PaymentDate,
			&payment.TransactionReference,
			&payment.Notes,
			&payment.CorrectionReason,
			&payment.CorrectedBy,
			&payment.CorrectedAt,
			&payment.OriginalAmount,
			&payment.Status,
			&payment.CreatedAt,
			&payment.UpdatedAt,
			&payment.CreatedBy,
		)
		if err != nil {
			return nil, err
		}
		payments = append(payments, payment)
	}

	return payments, nil
}

func (r *InvoiceRepository) UpdateInvoicePayment(payment *models.InvoicePayment) error {
	query := `
		UPDATE invoice_payments
		SET amount = $1, payment_method = $2, payment_date = $3,
			transaction_reference = $4, notes = $5, correction_reason = $6,
			corrected_by = $7, corrected_at = $8, original_amount = $9,
			status = $10, updated_at = $11
		WHERE id = $12
	`

	result, err := r.db.Exec(
		query,
		payment.Amount,
		payment.PaymentMethod,
		payment.PaymentDate,
		payment.TransactionReference,
		payment.Notes,
		payment.CorrectionReason,
		payment.CorrectedBy,
		payment.CorrectedAt,
		payment.OriginalAmount,
		payment.Status,
		payment.UpdatedAt,
		payment.ID,
	)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("invoice payment not found")
	}

	return nil
}

func (r *InvoiceRepository) DeleteInvoicePayment(id int) error {
	query := `DELETE FROM invoice_payments WHERE id = $1`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("invoice payment not found")
	}

	return nil
}

// InventoryLog methods
func (r *InvoiceRepository) CreateInventoryLog(log *models.InventoryLog) error {
	query := `
		INSERT INTO inventory_logs (
			product_id, variant_id, movement_type, quantity_change,
			previous_stock, new_stock, reference_type, reference_id,
			notes, created_by, created_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at
	`

	err := r.db.QueryRow(
		query,
		log.ProductID,
		log.VariantID,
		log.MovementType,
		log.QuantityChange,
		log.PreviousStock,
		log.NewStock,
		log.ReferenceType,
		log.ReferenceID,
		log.Notes,
		log.CreatedBy,
		log.CreatedAt,
	).Scan(&log.ID, &log.CreatedAt)

	return err
}

// Helper methods
func (r *InvoiceRepository) loadInvoiceRelations(invoice *models.Invoice) error {
	// Load items
	items, err := r.GetInvoiceItemsByInvoiceID(invoice.ID)
	if err != nil {
		return err
	}
	invoice.Items = items

	// Load payments
	payments, err := r.GetInvoicePaymentsByInvoiceID(invoice.ID)
	if err != nil {
		return err
	}
	invoice.Payments = payments

	return nil
}

// Generate next invoice code using database sequence for atomic operation
func (r *InvoiceRepository) GenerateInvoiceCode() (string, error) {
	query := `SELECT get_next_invoice_code()`
	
	var invoiceCode string
	err := r.db.QueryRow(query).Scan(&invoiceCode)
	if err != nil {
		return "", err
	}

	return invoiceCode, nil
}

// Get invoice summary statistics
func (r *InvoiceRepository) GetInvoiceSummary() (*models.InvoiceSummary, error) {
	query := `
		SELECT 
			COUNT(*) as total_invoices,
			COALESCE(SUM(total_amount), 0) as total_amount,
			COALESCE(SUM(paid_amount), 0) as paid_amount,
			COALESCE(SUM(total_amount - paid_amount), 0) as pending_amount,
			COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_invoices,
			COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total_amount ELSE 0 END), 0) as today_amount
		FROM invoices
		WHERE status != 'cancelled'
	`

	summary := &models.InvoiceSummary{}
	err := r.db.QueryRow(query).Scan(
		&summary.TotalInvoices,
		&summary.TotalAmount,
		&summary.PaidAmount,
		&summary.PendingAmount,
		&summary.TodayInvoices,
		&summary.TodayAmount,
	)

	return summary, err
}
