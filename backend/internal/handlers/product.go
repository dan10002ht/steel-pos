package handlers

import (
	"steel-pos-backend/pkg/database"
	"steel-pos-backend/pkg/logger"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	db  *database.Database
	log logger.Logger
}

func NewProductHandler(db *database.Database, log logger.Logger) *ProductHandler {
	return &ProductHandler{
		db:  db,
		log: log,
	}
}

func (h *ProductHandler) GetAll(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Get all products - TODO: implement",
	})
}

func (h *ProductHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	c.JSON(200, gin.H{
		"message": "Get product by ID: " + id + " - TODO: implement",
	})
}

func (h *ProductHandler) Create(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Create product - TODO: implement",
	})
}

func (h *ProductHandler) Update(c *gin.Context) {
	id := c.Param("id")
	c.JSON(200, gin.H{
		"message": "Update product: " + id + " - TODO: implement",
	})
}

func (h *ProductHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	c.JSON(200, gin.H{
		"message": "Delete product: " + id + " - TODO: implement",
	})
} 