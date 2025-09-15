package routes

import (
	"steel-pos-backend/internal/handlers"
	"steel-pos-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupImageRoutes(router *gin.Engine, imageHandler *handlers.ImageHandler, authMiddleware *middleware.AuthMiddleware) {
	imageRoutes := router.Group("/api/images")
	imageRoutes.Use(authMiddleware.Authenticate()) // Protect image routes
	{
		// Image upload routes
		imageRoutes.POST("/upload", imageHandler.UploadImages)
		imageRoutes.DELETE("/:public_id", imageHandler.DeleteImage) // Assuming public_id is part of path for DELETE
	}
}
