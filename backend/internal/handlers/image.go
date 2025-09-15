package handlers

import (
	"context"
	"fmt"
	"strings"

	"steel-pos-backend/internal/response"
	"steel-pos-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type ImageHandler struct {
	imageService *services.ImageService
}

func NewImageHandler(imageService *services.ImageService) *ImageHandler {
	return &ImageHandler{imageService: imageService}
}

// UploadImages handles the upload of multiple images to Cloudinary
// @Summary Upload multiple images
// @Description Uploads multiple image files to Cloudinary and returns their URLs
// @Tags Images
// @Accept multipart/form-data
// @Produce json
// @Param images formData file true "Image files to upload"
// @Success 200 {object} response.SuccessResponse{data=gin.H} "Images uploaded successfully"
// @Failure 400 {object} response.ErrorResponse "Bad request"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /images/upload [post]
func (h *ImageHandler) UploadImages(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		response.BadRequest(c, fmt.Sprintf("Failed to parse multipart form: %v", err))
		return
	}

	files := form.File["images"]
	if len(files) == 0 {
		response.BadRequest(c, "No image files provided")
		return
	}

	// Limit the number of files to prevent abuse
	if len(files) > 10 {
		response.BadRequest(c, "Cannot upload more than 10 images at once")
		return
	}

	results, err := h.imageService.UploadImages(c.Request.Context(), files)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, gin.H{
		"images": results,
	}, "Images uploaded successfully")
}

// DeleteImage handles the deletion of a single image from Cloudinary
// @Summary Delete an image
// @Description Deletes an image from Cloudinary using its public ID
// @Tags Images
// @Accept json
// @Produce json
// @Param public_id query string true "Public ID of the image to delete"
// @Success 200 {object} response.SuccessResponse "Image deleted successfully"
// @Failure 400 {object} response.ErrorResponse "Bad request"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /images/{public_id} [delete]
func (h *ImageHandler) DeleteImage(c *gin.Context) {
	publicID := c.Query("public_id")
	if strings.TrimSpace(publicID) == "" {
		response.BadRequest(c, "Public ID is required")
		return
	}

	err := h.imageService.DeleteImage(c.Request.Context(), publicID)
	if err != nil {
		response.ServiceError(c, err)
		return
	}

	response.Success(c, nil, "Image deleted successfully")
}
