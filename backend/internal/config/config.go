package config

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"time"

	_ "github.com/lib/pq"
)

type Config struct {
	Database  DatabaseConfig
	Server    ServerConfig
	JWT       JWTConfig
	Redis     RedisConfig
	Cloudinary CloudinaryConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

type ServerConfig struct {
	Port string
	Host string
}

type JWTConfig struct {
	Secret             string
	AccessTokenExpiry  string
	RefreshTokenExpiry string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type CloudinaryConfig struct {
	CloudName string
	ApiKey    string
	ApiSecret string
}

func Load() *Config {
	return &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5434"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "password"),
			Name:     getEnv("DB_NAME", "steel_pos"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Host: getEnv("SERVER_HOST", "0.0.0.0"),
		},
		JWT: JWTConfig{
			Secret:             getEnv("JWT_SECRET", "your-secret-key-here"),
			AccessTokenExpiry:  getEnv("JWT_ACCESS_TOKEN_EXPIRY", "24h"),
			RefreshTokenExpiry: getEnv("JWT_REFRESH_TOKEN_EXPIRY", "720h"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
		},
		Cloudinary: CloudinaryConfig{
			CloudName: getEnv("CLOUDINARY_CLOUD_NAME", ""),
			ApiKey:    getEnv("CLOUDINARY_API_KEY", ""),
			ApiSecret: getEnv("CLOUDINARY_API_SECRET", ""),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func InitDB(cfg *Config) (*sql.DB, error) {
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
		return nil, fmt.Errorf("failed to open database: %v", err)
	}

	// Configure connection pool for better performance
	// SetMaxOpenConns: maximum number of open connections to the database
	db.SetMaxOpenConns(25) // Default is 0 (unlimited), but 25 is good for most apps
	
	// SetMaxIdleConns: maximum number of connections in the idle connection pool
	db.SetMaxIdleConns(5) // Keep 5 idle connections ready
	
	// SetConnMaxLifetime: maximum amount of time a connection may be reused
	// This helps prevent stale connections
	db.SetConnMaxLifetime(5 * time.Minute)
	
	// SetConnMaxIdleTime: maximum amount of time a connection may be idle before being closed
	db.SetConnMaxIdleTime(1 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}

	return db, nil
}
