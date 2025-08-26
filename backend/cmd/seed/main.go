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
			INSERT INTO product_categories (name, description, is_active, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5)
		`,
			category.name,
			category.description,
			true,
			time.Now(),
			time.Now(),
		)

		if err != nil {
			return fmt.Errorf("failed to insert category %s: %v", category.name, err)
		}

		fmt.Printf("Category %s created successfully!\n", category.name)
	}

	// Insert sample suppliers
	suppliers := []struct {
		name           string
		code           string
		phone          string
		email          string
		address        string
		taxCode        string
		contactPerson  string
	}{
		{
			name:          "Công ty Thép ABC",
			code:          "SUP001",
			phone:         "0123456789",
			email:         "info@thepabc.com",
			address:       "123 Đường ABC, Quận 1, TP.HCM",
			taxCode:       "0123456789",
			contactPerson: "Nguyễn Văn A",
		},
		{
			name:          "Công ty Thép XYZ",
			code:          "SUP002",
			phone:         "0987654321",
			email:         "contact@thepxyz.com",
			address:       "456 Đường XYZ, Quận 2, TP.HCM",
			taxCode:       "0987654321",
			contactPerson: "Trần Thị B",
		},
		{
			name:          "Công ty Vật liệu DEF",
			code:          "SUP003",
			phone:         "0369852147",
			email:         "sales@vatlieudef.com",
			address:       "789 Đường DEF, Quận 3, TP.HCM",
			taxCode:       "0369852147",
			contactPerson: "Lê Văn C",
		},
	}

	for _, supplier := range suppliers {
		// Check if supplier already exists
		err = db.QueryRow("SELECT COUNT(*) FROM suppliers WHERE code = $1", supplier.code).Scan(&count)
		if err != nil {
			return fmt.Errorf("failed to check existing supplier %s: %v", supplier.code, err)
		}

		if count > 0 {
			fmt.Printf("Supplier %s already exists, skipping...\n", supplier.code)
			continue
		}

		// Insert supplier
		_, err = db.Exec(`
			INSERT INTO suppliers (name, code, phone, email, address, tax_code, contact_person, is_active, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		`,
			supplier.name,
			supplier.code,
			supplier.phone,
			supplier.email,
			supplier.address,
			supplier.taxCode,
			supplier.contactPerson,
			true,
			time.Now(),
			time.Now(),
		)

		if err != nil {
			return fmt.Errorf("failed to insert supplier %s: %v", supplier.code, err)
		}

		fmt.Printf("Supplier %s created successfully!\n", supplier.code)
	}

	return nil
}
