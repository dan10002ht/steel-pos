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
	fmt.Println("🌱 Starting Steel POS database seeding...")

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

	fmt.Println("✅ Connected to database successfully!")

	// Check if already seeded
	if isAlreadySeeded(db) {
		fmt.Println("📋 Database already seeded, skipping...")
		return
	}

	// Seed data
	if err := seedData(db); err != nil {
		log.Fatalf("Failed to seed data: %v", err)
	}

	// Mark as seeded
	markAsSeeded(db)

	fmt.Println("🎉 Steel POS database seeding completed!")
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
		"dantt1002@gmail.com",
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
	fmt.Printf("Email: dantt1002@gmail.com\n")
	return nil
}

func isAlreadySeeded(db *sql.DB) bool {
	// Check if admin user exists (main indicator)
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users WHERE username = 'admin'").Scan(&count)
	if err != nil {
		return false
	}
	return count > 0
}

func markAsSeeded(db *sql.DB) {
	// Create seeds table if not exists
	query := `CREATE TABLE IF NOT EXISTS seeds (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE, seeded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`
	_, err := db.Exec(query)
	if err != nil {
		fmt.Printf("⚠️ Warning: Failed to create seeds table: %v\n", err)
		return
	}

	// Mark as seeded
	_, err = db.Exec("INSERT INTO seeds (name) VALUES ('initial_users') ON CONFLICT (name) DO NOTHING")
	if err != nil {
		fmt.Printf("⚠️ Warning: Failed to mark as seeded: %v\n", err)
	}
}
