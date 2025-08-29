package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"steel-pos-backend/internal/config"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Load config
	cfg := config.Load()

	// Connect to database
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Name,
		cfg.Database.SSLMode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("Connected to database successfully!")

	// Seed data
	if err := seedData(db); err != nil {
		log.Fatalf("Failed to seed data: %v", err)
	}

	fmt.Println("Data seeded successfully!")
}

func seedData(db *sql.DB) error {
	// Hash password
	password := "admin123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %v", err)
	}

	// Check if admin user already exists
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM users WHERE username = 'admin'").Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check existing admin user: %v", err)
	}

	if count > 0 {
		fmt.Println("Admin user already exists, skipping...")
		return nil
	}

	// Insert admin user
	query := `
		INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err = db.Exec(query,
		"admin",
		"admin@steelpos.com",
		string(hashedPassword),
		"Administrator",
		"admin",
		true,
		time.Now(),
		time.Now(),
	)

	if err != nil {
		return fmt.Errorf("failed to insert admin user: %v", err)
	}

	fmt.Printf("Admin user created successfully!\n")
	fmt.Printf("Username: admin\n")
	fmt.Printf("Password: %s\n", password)
	fmt.Printf("Email: admin@steelpos.com\n")

	// Insert sample users
	sampleUsers := []struct {
		username string
		email    string
		password string
		fullName string
		role     string
	}{
		{
			username: "manager",
			email:    "manager@steelpos.com",
			password: "manager123",
			fullName: "Manager User",
			role:     "manager",
		},
		{
			username: "accountant",
			email:    "accountant@steelpos.com",
			password: "accountant123",
			fullName: "Accountant User",
			role:     "accountant",
		},
		{
			username: "user",
			email:    "user@steelpos.com",
			password: "user123",
			fullName: "Regular User",
			role:     "user",
		},
	}

	for _, user := range sampleUsers {
		// Check if user already exists
		err = db.QueryRow("SELECT COUNT(*) FROM users WHERE username = $1", user.username).Scan(&count)
		if err != nil {
			return fmt.Errorf("failed to check existing user %s: %v", user.username, err)
		}

		if count > 0 {
			fmt.Printf("User %s already exists, skipping...\n", user.username)
			continue
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.password), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash password for %s: %v", user.username, err)
		}

		// Insert user
		_, err = db.Exec(query,
			user.username,
			user.email,
			string(hashedPassword),
			user.fullName,
			user.role,
			true,
			time.Now(),
			time.Now(),
		)

		if err != nil {
			return fmt.Errorf("failed to insert user %s: %v", user.username, err)
		}

		fmt.Printf("User %s created successfully!\n", user.username)
	}

	// Insert sample product categories
	categories := []struct {
		name        string
		description string
	}{
		{"Vật liệu xây dựng", "Các loại vật liệu xây dựng cơ bản"},
		{"Vật liệu hoàn thiện", "Vật liệu hoàn thiện công trình"},
		{"Thiết bị điện", "Thiết bị điện và phụ kiện"},
		{"Thiết bị nước", "Thiết bị nước và phụ kiện"},
		{"Dụng cụ", "Dụng cụ và thiết bị"},
		{"Khác", "Các sản phẩm khác"},
	}

	for _, category := range categories {
		// Check if category already exists
		err = db.QueryRow("SELECT COUNT(*) FROM product_categories WHERE name = $1", category.name).Scan(&count)
		if err != nil {
			return fmt.Errorf("failed to check existing category %s: %v", category.name, err)
		}

		if count > 0 {
			fmt.Printf("Category %s already exists, skipping...\n", category.name)
			continue
		}

		// Insert category
		_, err = db.Exec(`
			INSERT INTO product_categories (name, description, is_active, created_by, created_by_name, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`,
			category.name,
			category.description,
			true,
			nil,      // created_by is NULL for seed data
			"System", // created_by_name for seed data
			time.Now(),
			time.Now(),
		)

		if err != nil {
			return fmt.Errorf("failed to insert category %s: %v", category.name, err)
		}

		fmt.Printf("Category %s created successfully!\n", category.name)
	}

	// Insert sample products
	products := []struct {
		name       string
		categoryID int
		unit       string
		notes      string
	}{
		{
			name:       "Ống phi",
			categoryID: 1, // Vật liệu xây dựng
			unit:       "m",
			notes:      "Ống phi các loại",
		},
		{
			name:       "Thép hộp",
			categoryID: 1, // Vật liệu xây dựng
			unit:       "m",
			notes:      "Thép hộp các loại",
		},
		{
			name:       "Thép tấm",
			categoryID: 1, // Vật liệu xây dựng
			unit:       "m²",
			notes:      "Thép tấm các loại",
		},
	}

	for _, product := range products {
		// Check if product already exists
		err = db.QueryRow("SELECT COUNT(*) FROM products WHERE name = $1", product.name).Scan(&count)
		if err != nil {
			return fmt.Errorf("failed to check existing product %s: %v", product.name, err)
		}

		if count > 0 {
			fmt.Printf("Product %s already exists, skipping...\n", product.name)
			continue
		}

		// Insert product
		_, err = db.Exec(`
			INSERT INTO products (name, category_id, unit, notes, is_active, created_by, created_by_name, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`,
			product.name,
			product.categoryID,
			product.unit,
			product.notes,
			true,
			nil,      // created_by is NULL for seed data
			"System", // created_by_name for seed data
			time.Now(),
			time.Now(),
		)

		if err != nil {
			return fmt.Errorf("failed to insert product %s: %v", product.name, err)
		}

		fmt.Printf("Product %s created successfully!\n", product.name)
	}

	return nil
}
