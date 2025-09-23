package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	_ "github.com/lib/pq"
)

type Migration struct {
	Version string
	Up      string
}

func main() {
	fmt.Println("🚀 Starting Steel POS database migrations...")

	// Get database connection string from environment
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Use individual environment variables
		dbHost := os.Getenv("DB_HOST")
		dbPort := os.Getenv("DB_PORT")
		dbUser := os.Getenv("DB_USER")
		dbPassword := os.Getenv("DB_PASSWORD")
		dbName := os.Getenv("DB_NAME")

		if dbHost == "" || dbPort == "" || dbUser == "" || dbPassword == "" || dbName == "" {
			log.Fatal("❌ Database configuration not found in environment variables")
		}

		dbURL = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
			dbUser, dbPassword, dbHost, dbPort, dbName)
		fmt.Printf("🔗 Using database: %s:%s/%s\n", dbHost, dbPort, dbName)
	} else {
		fmt.Println("🔗 Using DATABASE_URL from environment")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatal("❌ Failed to ping database:", err)
	}

	fmt.Println("✅ Connected to database successfully")

	createMigrationsTable(db)
	migrations := loadMigrations()
	fmt.Printf("📋 Found %d migration files\n", len(migrations))
	runMigrationsUp(db, migrations)

	fmt.Println("🎉 Steel POS database migrations completed!")
}

func createMigrationsTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS migrations (version VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`
	_, err := db.Exec(query)
	if err != nil {
		log.Fatal("Failed to create migrations table:", err)
	}
}

func loadMigrations() []Migration {
	var migrations []Migration

	// Try migration paths for Steel POS
	migrationPaths := []string{
		"migrations/*.sql",
		"./migrations/*.sql",
		"/root/migrations/*.sql",
	}

	var files []string
	var err error

	for _, path := range migrationPaths {
		files, err = filepath.Glob(path)
		if err == nil && len(files) > 0 {
			fmt.Printf("📁 Found migrations at: %s\n", path)
			break
		}
	}

	if err != nil || len(files) == 0 {
		log.Fatal("Failed to read migrations directory. Tried paths:", migrationPaths)
	}
	migrationFiles := make(map[string]map[string]string)
	for _, file := range files {
		baseName := filepath.Base(file)
		parts := strings.Split(baseName, ".")
		if len(parts) >= 3 {
			version := parts[0]
			fileType := parts[len(parts)-2]
			if migrationFiles[version] == nil {
				migrationFiles[version] = make(map[string]string)
			}
			content, err := os.ReadFile(file)
			if err != nil {
				log.Printf("Failed to read file %s: %v", file, err)
				continue
			}
			migrationFiles[version][fileType] = string(content)
		}
	}
	for version, files := range migrationFiles {
		migration := Migration{Version: version}
		if up, exists := files["up"]; exists {
			migration.Up = up
		}
		migrations = append(migrations, migration)
	}
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})
	return migrations
}

func runMigrationsUp(db *sql.DB, migrations []Migration) {
	fmt.Println("🔄 Running migrations up...")
	appliedCount := 0
	skippedCount := 0

	for _, migration := range migrations {
		var count int
		err := db.QueryRow("SELECT COUNT(*) FROM migrations WHERE version = $1", migration.Version).Scan(&count)
		if err != nil {
			log.Printf("❌ Failed to check migration %s: %v", migration.Version, err)
			continue
		}
		if count > 0 {
			fmt.Printf("⏭️  Migration %s already applied, skipping\n", migration.Version)
			skippedCount++
			continue
		}
		if migration.Up == "" {
			fmt.Printf("⚠️  No up migration for %s, skipping\n", migration.Version)
			skippedCount++
			continue
		}
		fmt.Printf("📄 Applying migration %s...\n", migration.Version)
		_, err = db.Exec(migration.Up)
		if err != nil {
			log.Printf("❌ Failed to apply migration %s: %v", migration.Version, err)
			continue
		}
		_, err = db.Exec("INSERT INTO migrations (version) VALUES ($1)", migration.Version)
		if err != nil {
			log.Printf("❌ Failed to record migration %s: %v", migration.Version, err)
			continue
		}
		fmt.Printf("✅ Migration %s applied successfully\n", migration.Version)
		appliedCount++
	}

	fmt.Printf("📊 Migration Summary: %d applied, %d skipped\n", appliedCount, skippedCount)
	fmt.Println("✅ Migrations up completed")
}
