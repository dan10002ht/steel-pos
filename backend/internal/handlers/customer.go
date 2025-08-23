package handlers

import (
	"steel-pos-backend/pkg/database"
	"steel-pos-backend/pkg/logger"

	"github.com/gin-gonic/gin"
)

type CustomerHandler struct {
	db  *database.Database
	log logger.Logger
}

func NewCustomerHandler(db *database.Database, log logger.Logger) *CustomerHandler {
	return &CustomerHandler{
		db:  db,
		log: log,
	}
}

func (h *CustomerHandler) GetAll(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Get all customers - TODO: implement",
	})
}

func (h *CustomerHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	c.JSON(200, gin.H{
		"message": "Get customer by ID: " + id + " - TODO: implement",
	})
}

func (h *CustomerHandler) Create(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Create customer - TODO: implement",
	})
}

func (h *CustomerHandler) Update(c *gin.Context) {
	id := c.Param("id")
	c.JSON(200, gin.H{
		"message": "Update customer: " + id + " - TODO: implement",
	})
}

func (h *CustomerHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	c.JSON(200, gin.H{
		"message": "Delete customer: " + id + " - TODO: implement",
	})
} 