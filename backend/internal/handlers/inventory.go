package handlers

import (
	"steel-pos-backend/pkg/database"
	"steel-pos-backend/pkg/logger"

	"github.com/gin-gonic/gin"
)

type InventoryHandler struct {
	db  *database.Database
	log logger.Logger
}

func NewInventoryHandler(db *database.Database, log logger.Logger) *InventoryHandler {
	return &InventoryHandler{
		db:  db,
		log: log,
	}
}

func (h *InventoryHandler) GetAll(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Get all inventory - TODO: implement",
	})
}

func (h *InventoryHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	c.JSON(200, gin.H{
		"message": "Get inventory by ID: " + id + " - TODO: implement",
	})
}

func (h *InventoryHandler) StockIn(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Stock in - TODO: implement",
	})
}

func (h *InventoryHandler) StockOut(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Stock out - TODO: implement",
	})
} 