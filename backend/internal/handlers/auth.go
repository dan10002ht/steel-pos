package handlers

import (
	"steel-pos-backend/pkg/database"
	"steel-pos-backend/pkg/logger"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	db  *database.Database
	log logger.Logger
}

func NewAuthHandler(db *database.Database, log logger.Logger) *AuthHandler {
	return &AuthHandler{
		db:  db,
		log: log,
	}
}

func (h *AuthHandler) Login(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Login endpoint - TODO: implement",
	})
}

func (h *AuthHandler) Register(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Register endpoint - TODO: implement",
	})
} 