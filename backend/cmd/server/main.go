package main

import (
	"log"
	"os"

	"steel-pos-backend/internal/config"
	"steel-pos-backend/internal/handlers"
	"steel-pos-backend/internal/middleware"
	"steel-pos-backend/pkg/database"
	"steel-pos-backend/pkg/logger"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize logger
	logger := logger.NewLogger()

	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.NewConnection(cfg.Database)
	if err != nil {
		logger.Fatal("Failed to connect to database", err)
	}
	defer db.Close()

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize router
	router := gin.Default()

	// Add middleware
	router.Use(middleware.CORS())
	router.Use(middleware.Logger(logger))
	router.Use(middleware.Recovery(logger))

	// Initialize handlers
	handlers := handlers.NewHandlers(db, logger)

	// Setup routes
	setupRoutes(router, handlers)

	// Start server
	port := cfg.Server.Port
	if port == "" {
		port = "8080"
	}

	logger.Info("Server starting on port " + port)
	if err := router.Run(":" + port); err != nil {
		logger.Fatal("Failed to start server", err)
	}
}

func setupRoutes(router *gin.Engine, handlers *handlers.Handlers) {
	// Health check
	router.GET("/health", handlers.HealthCheck)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Auth routes
		auth := v1.Group("/auth")
		{
			auth.POST("/login", handlers.Auth.Login)
			auth.POST("/register", handlers.Auth.Register)
		}

		// Protected routes
		protected := v1.Group("/")
		protected.Use(middleware.Auth())
		{
			// Products
			products := protected.Group("/products")
			{
				products.GET("/", handlers.Products.GetAll)
				products.GET("/:id", handlers.Products.GetByID)
				products.POST("/", handlers.Products.Create)
				products.PUT("/:id", handlers.Products.Update)
				products.DELETE("/:id", handlers.Products.Delete)
			}

			// Orders
			orders := protected.Group("/orders")
			{
				orders.GET("/", handlers.Orders.GetAll)
				orders.GET("/:id", handlers.Orders.GetByID)
				orders.POST("/", handlers.Orders.Create)
				orders.PUT("/:id", handlers.Orders.Update)
				orders.DELETE("/:id", handlers.Orders.Delete)
			}

			// Customers
			customers := protected.Group("/customers")
			{
				customers.GET("/", handlers.Customers.GetAll)
				customers.GET("/:id", handlers.Customers.GetByID)
				customers.POST("/", handlers.Customers.Create)
				customers.PUT("/:id", handlers.Customers.Update)
				customers.DELETE("/:id", handlers.Customers.Delete)
			}

			// Inventory
			inventory := protected.Group("/inventory")
			{
				inventory.GET("/", handlers.Inventory.GetAll)
				inventory.GET("/:id", handlers.Inventory.GetByID)
				inventory.POST("/in", handlers.Inventory.StockIn)
				inventory.POST("/out", handlers.Inventory.StockOut)
			}
		}
	}
} 