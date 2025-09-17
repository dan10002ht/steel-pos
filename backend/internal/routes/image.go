package routes

import (
	"steel-pos-backend/internal/handlers"
	"steel-pos-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupImageRoutes(api *gin.RouterGroup, imageHandler *handlers.ImageHandler, authMiddleware *middleware.AuthMiddleware) {
	imageRoutes := api.Group("/images")
	// Note: Authentication is already applied at the API group level
	{
		// Image upload routes
		imageRoutes.POST("/upload", imageHandler.UploadImages)
		imageRoutes.DELETE("/:public_id", imageHandler.DeleteImage) // Assuming public_id is part of path for DELETE
	}
}
