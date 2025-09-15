package services

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
)

type ImageService struct {
	cld *cloudinary.Cloudinary
}

type ImageUploadResult struct {
	PublicID  string `json:"public_id"`
	URL       string `json:"url"`
	SecureURL string `json:"secure_url"`
	Width     int    `json:"width"`
	Height    int    `json:"height"`
	Format    string `json:"format"`
	Size      int    `json:"size"`
}

func NewImageService(cloudName, apiKey, apiSecret string) (*ImageService, error) {
	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Cloudinary: %w", err)
	}

	return &ImageService{
		cld: cld,
	}, nil
}

// UploadImage uploads a single image to Cloudinary
func (s *ImageService) UploadImage(ctx context.Context, file multipart.File, filename string) (*ImageUploadResult, error) {
	// Generate a unique public ID
	publicID := fmt.Sprintf("steel-pos/%d/%s", time.Now().Unix(), strings.TrimSuffix(filename, filepath.Ext(filename)))

	// Upload the image
	result, err := s.cld.Upload.Upload(ctx, file, map[string]interface{}{
		"public_id":     publicID,
		"folder":        "steel-pos/payments",
		"resource_type": "image",
		"transformation": "f_auto,q_auto",
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload image to Cloudinary: %w", err)
	}

	return &ImageUploadResult{
		PublicID:  result.PublicID,
		URL:       result.URL,
		SecureURL: result.SecureURL,
		Width:     result.Width,
		Height:    result.Height,
		Format:    result.Format,
		Size:      int(result.Bytes),
	}, nil
}

// UploadImages uploads multiple images to Cloudinary
func (s *ImageService) UploadImages(ctx context.Context, files []*multipart.FileHeader) ([]*ImageUploadResult, error) {
	var results []*ImageUploadResult
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			return nil, fmt.Errorf("failed to open file %s: %w", fileHeader.Filename, err)
		}
		defer file.Close()

		result, err := s.UploadImage(ctx, file, fileHeader.Filename)
		if err != nil {
			return nil, fmt.Errorf("failed to upload image %s: %w", fileHeader.Filename, err)
		}
		results = append(results, result)
	}

	return results, nil
}

// DeleteImage deletes an image from Cloudinary
func (s *ImageService) DeleteImage(ctx context.Context, publicID string) error {
	_, err := s.cld.Upload.Destroy(ctx, map[string]interface{}{
		"public_id":     publicID,
		"resource_type": "image",
	})
	if err != nil {
		return fmt.Errorf("failed to delete image from Cloudinary: %w", err)
	}

	return nil
}

// DeleteImages deletes multiple images from Cloudinary
func (s *ImageService) DeleteImages(ctx context.Context, publicIDs []string) error {
	for _, publicID := range publicIDs {
		if err := s.DeleteImage(ctx, publicID); err != nil {
			return err // Or log and continue
		}
	}

	return nil
}