package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"steel-pos-backend/internal/models"
)

type CustomerRepository struct {
	db *sql.DB
}

func NewCustomerRepository(db *sql.DB) *CustomerRepository {
	return &CustomerRepository{
		db: db,
	}
}

// GetAllCustomers gets all customers with pagination
func (r *CustomerRepository) GetAllCustomers(page, limit int) ([]*models.Customer, int, error) {
	offset := (page - 1) * limit

	// Count total customers
	countQuery := `
		SELECT COUNT(*) 
		FROM customers 
		WHERE is_active = true
	`
	
	var total int
	err := r.db.QueryRow(countQuery).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count customers: %w", err)
	}

	// Get customers with pagination
	query := `
		SELECT 
			id, name, phone, address, is_active,
			created_by, created_at, updated_at
		FROM customers 
		WHERE is_active = true
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.Query(query, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get customers: %w", err)
	}
	defer rows.Close()

	var customers []*models.Customer
	for rows.Next() {
		customer := &models.Customer{}
		err := rows.Scan(
			&customer.ID,
			&customer.Name,
			&customer.Phone,
			&customer.Address,
			&customer.IsActive,
			&customer.CreatedBy,
			&customer.CreatedAt,
			&customer.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan customer: %w", err)
		}
		customers = append(customers, customer)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating customers: %w", err)
	}

	return customers, total, nil
}

// SearchCustomers searches customers by name or phone with pagination
func (r *CustomerRepository) SearchCustomers(query string, limit int) ([]*models.Customer, int, error) {
	// Clean query for SQL
	cleanQuery := strings.TrimSpace(query)
	searchPattern := "%" + cleanQuery + "%"

	// Count total results
	countQuery := `
		SELECT COUNT(*) 
		FROM customers 
		WHERE (name ILIKE $1 OR phone ILIKE $1)
		AND is_active = true
	`
	
	var total int
	err := r.db.QueryRow(countQuery, searchPattern).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count customers: %w", err)
	}

	// Search customers with pagination
	searchQuery := `
		SELECT 
			id, name, phone, address, is_active,
			created_by, created_at, updated_at
		FROM customers 
		WHERE (name ILIKE $1 OR phone ILIKE $1)
		AND is_active = true
		ORDER BY 
			CASE 
				WHEN phone ILIKE $1 THEN 1
				WHEN name ILIKE $1 THEN 2
				ELSE 3
			END,
			name ASC
		LIMIT $2
	`

	rows, err := r.db.Query(searchQuery, searchPattern, limit)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to search customers: %w", err)
	}
	defer rows.Close()

	var customers []*models.Customer
	for rows.Next() {
		customer := &models.Customer{}
		err := rows.Scan(
			&customer.ID,
			&customer.Name,
			&customer.Phone,
			&customer.Address,
			&customer.IsActive,
			&customer.CreatedBy,
			&customer.CreatedAt,
			&customer.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan customer: %w", err)
		}
		customers = append(customers, customer)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating customers: %w", err)
	}

	return customers, total, nil
}

// GetByID gets customer by ID
func (r *CustomerRepository) GetByID(id int) (*models.Customer, error) {
	query := `
		SELECT 
			id, name, phone, address, is_active,
			created_by, created_at, updated_at
		FROM customers 
		WHERE id = $1 AND is_active = true
	`

	customer := &models.Customer{}
	err := r.db.QueryRow(query, id).Scan(
		&customer.ID,
		&customer.Name,
		&customer.Phone,
		&customer.Address,
		&customer.IsActive,
		&customer.CreatedBy,
		&customer.CreatedAt,
		&customer.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("customer not found")
		}
		return nil, fmt.Errorf("failed to get customer by ID: %w", err)
	}

	return customer, nil
}

// GetByPhone gets customer by phone
func (r *CustomerRepository) GetByPhone(phone string) (*models.Customer, error) {
	query := `
		SELECT 
			id, name, phone, address, is_active,
			created_by, created_at, updated_at
		FROM customers 
		WHERE phone = $1 AND is_active = true
	`

	customer := &models.Customer{}
	err := r.db.QueryRow(query, phone).Scan(
		&customer.ID,
		&customer.Name,
		&customer.Phone,
		&customer.Address,
		&customer.IsActive,
		&customer.CreatedBy,
		&customer.CreatedAt,
		&customer.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("customer not found")
		}
		return nil, fmt.Errorf("failed to get customer by phone: %w", err)
	}

	return customer, nil
}

// Create creates a new customer
func (r *CustomerRepository) Create(customer *models.Customer) (*models.Customer, error) {
	query := `
		INSERT INTO customers (name, phone, address, is_active, created_by)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		query,
		customer.Name,
		customer.Phone,
		customer.Address,
		customer.IsActive,
		customer.CreatedBy,
	).Scan(&customer.ID, &customer.CreatedAt, &customer.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create customer: %w", err)
	}

	return customer, nil
}

// Update updates customer information
func (r *CustomerRepository) Update(id int, updateData map[string]interface{}, updatedBy int) (*models.Customer, error) {
	// Build dynamic update query
	setParts := []string{}
	args := []interface{}{}
	argIndex := 1

	for field, value := range updateData {
		setParts = append(setParts, fmt.Sprintf("%s = $%d", field, argIndex))
		args = append(args, value)
		argIndex++
	}

	if len(setParts) == 0 {
		return nil, fmt.Errorf("no fields to update")
	}

	// Add updated_by and updated_at
	setParts = append(setParts, fmt.Sprintf("updated_by = $%d", argIndex))
	args = append(args, updatedBy)
	argIndex++

	// Add WHERE clause
	args = append(args, id)

	query := fmt.Sprintf(`
		UPDATE customers 
		SET %s
		WHERE id = $%d AND is_active = true
		RETURNING id, name, phone, address, is_active, created_by, created_at, updated_at
	`, strings.Join(setParts, ", "), argIndex)

	customer := &models.Customer{}
	err := r.db.QueryRow(query, args...).Scan(
		&customer.ID,
		&customer.Name,
		&customer.Phone,
		&customer.Address,
		&customer.IsActive,
		&customer.CreatedBy,
		&customer.CreatedAt,
		&customer.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("customer not found")
		}
		return nil, fmt.Errorf("failed to update customer: %w", err)
	}

	return customer, nil
}

// Delete soft deletes a customer
func (r *CustomerRepository) Delete(id int, deletedBy int) error {
	query := `
		UPDATE customers 
		SET is_active = false, updated_by = $1, updated_at = NOW()
		WHERE id = $2 AND is_active = true
	`

	result, err := r.db.Exec(query, deletedBy, id)
	if err != nil {
		return fmt.Errorf("failed to delete customer: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("customer not found")
	}

	return nil
}

// GetCustomerInvoicesCount gets the total number of invoices for a customer
func (r *CustomerRepository) GetCustomerInvoicesCount(customerID int) (int, error) {
	query := `
		SELECT COUNT(*) 
		FROM invoices 
		WHERE customer_id = $1 AND status != 'cancelled'
	`
	
	var count int
	err := r.db.QueryRow(query, customerID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get customer invoices count: %w", err)
	}

	return count, nil
}

// GetCustomerTotalSpent gets the total amount spent by a customer
func (r *CustomerRepository) GetCustomerTotalSpent(customerID int) (float64, error) {
	query := `
		SELECT COALESCE(SUM(total_amount), 0) 
		FROM invoices 
		WHERE customer_id = $1 AND status != 'cancelled'
	`
	
	var totalSpent float64
	err := r.db.QueryRow(query, customerID).Scan(&totalSpent)
	if err != nil {
		return 0, fmt.Errorf("failed to get customer total spent: %w", err)
	}

	return totalSpent, nil
}

// GetCustomerInvoices gets customer invoices with pagination
func (r *CustomerRepository) GetCustomerInvoices(customerID int, page, limit int) ([]*models.Invoice, int, error) {
	offset := (page - 1) * limit

	// Count total invoices for this customer
	countQuery := `
		SELECT COUNT(*) 
		FROM invoices 
		WHERE customer_id = $1 AND status != 'cancelled'
	`
	
	var total int
	err := r.db.QueryRow(countQuery, customerID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count customer invoices: %w", err)
	}

	// Get invoices with pagination
	query := `
		SELECT 
			id, invoice_code, customer_id, customer_phone, customer_name, customer_address,
			subtotal, discount_amount, discount_percentage, tax_amount, tax_percentage,
			total_amount, paid_amount, payment_status, status, notes,
			created_at, updated_at, created_by
		FROM invoices 
		WHERE customer_id = $1 AND status != 'cancelled'
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(query, customerID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get customer invoices: %w", err)
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
			return nil, 0, fmt.Errorf("failed to scan invoice: %w", err)
		}
		invoices = append(invoices, invoice)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating invoices: %w", err)
	}

	return invoices, total, nil
}