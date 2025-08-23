package handlers

import (
	"steel-pos-backend/pkg/database"
	"steel-pos-backend/pkg/logger"

	"github.com/gin-gonic/gin"
)

type Handlers struct {
	Auth      *AuthHandler
	Products  *ProductHandler
	Orders    *OrderHandler
	Customers *CustomerHandler
	Inventory *InventoryHandler
}

func NewHandlers(db *database.Database, log logger.Logger) *Handlers {
	return &Handlers{
		Auth:      NewAuthHandler(db, log),
		Products:  NewProductHandler(db, log),
		Orders:    NewOrderHandler(db, log),
		Customers: NewCustomerHandler(db, log),
		Inventory: NewInventoryHandler(db, log),
	}
}

func (h *Handlers) HealthCheck(c *gin.Context) {
	c.JSON(200, gin.H{
		"status": "ok",
		"message": "Server is running",
	})
} 