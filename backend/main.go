package main

import (
	"log"
	"net/http"

	"steel-pos-backend/internal/config"
	"steel-pos-backend/internal/handlers"
	"steel-pos-backend/internal/middleware"
	"steel-pos-backend/internal/repository"
	"steel-pos-backend/internal/routes"
	"steel-pos-backend/internal/services"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database connection
	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	productRepo := repository.NewProductRepository(db)
	importOrderRepo := repository.NewImportOrderRepository(db)

	// Initialize services
	jwtService := services.NewJWTService(cfg)
	authService := services.NewAuthService(userRepo, jwtService, cfg)
	productService := services.NewProductService(productRepo)
	importOrderService := services.NewImportOrderService(importOrderRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	productHandler := handlers.NewProductHandler(productService)
	importOrderHandler := handlers.NewImportOrderHandler(importOrderService)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtService)
	tokenRefreshMiddleware := middleware.NewTokenRefreshMiddleware(jwtService)

	// Setup Gin router
	router := gin.Default()

	// Add CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Steel POS API is running",
		})
	})

	// Setup routes
	routes.SetupAllRoutes(router, authHandler, productHandler, importOrderHandler, authMiddleware, tokenRefreshMiddleware)

	// Start server
	log.Printf("Server starting on port %s", cfg.Server.Port)
	if err := router.Run(":" + cfg.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
