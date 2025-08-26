package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

func Success(c *gin.Context, data any, message string) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func SuccessWithStatus(c *gin.Context, statusCode int, message string, data any) {
	c.JSON(statusCode, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func Error(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, Response{
		Success: false,
		Error:   message,
		Message: message,
	})
}

func BadRequest(c *gin.Context, message string) {
	Error(c, http.StatusBadRequest, message)
}

func InternalServerError(c *gin.Context, message string) {
	Error(c, http.StatusInternalServerError, message)
}

func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, message)
}

func Unauthorized(c *gin.Context, message string) {
	Error(c, http.StatusUnauthorized, message)
}

// Helper functions for common response patterns
func Created(c *gin.Context, data any, message string) {
	SuccessWithStatus(c, http.StatusCreated, message, data)
}

func ValidationError(c *gin.Context, message string) {
	BadRequest(c, message)
}

func ServiceError(c *gin.Context, err error) {
	InternalServerError(c, err.Error())
}

func BindingError(c *gin.Context, err error) {
	BadRequest(c, "Invalid request data: "+err.Error())
}

func DatabaseError(c *gin.Context, err error) {
	InternalServerError(c, "Database operation failed: "+err.Error())
}

func AuthenticationError(c *gin.Context, message string) {
	Unauthorized(c, message)
}

func AuthorizationError(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, message)
}
