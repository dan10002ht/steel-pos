package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/services"
)

type AuditLogHandler struct {
	auditLogService services.AuditLogService
}

func NewAuditLogHandler(auditLogService services.AuditLogService) *AuditLogHandler {
	return &AuditLogHandler{
		auditLogService: auditLogService,
	}
}

// GetAuditLogsByEntity godoc
// @Summary Get audit logs for a specific entity
// @Description Get paginated audit logs for a specific entity (e.g., invoice)
// @Tags audit-logs
// @Accept json
// @Produce json
// @Param entity_type path string true "Entity type (e.g., invoice)"
// @Param entity_id path int true "Entity ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} models.AuditLogListResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /audit-logs/{entity_type}/{entity_id} [get]
func (h *AuditLogHandler) GetAuditLogsByEntity(c *gin.Context) {
	entityType := c.Param("entity_type")
	entityIDStr := c.Param("entity_id")
	
	entityID, err := strconv.Atoi(entityIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entity ID"})
		return
	}

	// Get pagination parameters
	page := 1
	limit := 10
	
	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	// Get audit logs
	result, err := h.auditLogService.GetAuditLogsByEntityWithPagination(entityType, entityID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get audit logs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}

// GetAuditLogByID godoc
// @Summary Get audit log by ID
// @Description Get detailed audit log information including old and new data
// @Tags audit-logs
// @Accept json
// @Produce json
// @Param id path int true "Audit log ID"
// @Success 200 {object} models.AuditLogResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /audit-logs/{id} [get]
func (h *AuditLogHandler) GetAuditLogByID(c *gin.Context) {
	idStr := c.Param("id")
	
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid audit log ID"})
		return
	}

	// Get audit log
	auditLog, err := h.auditLogService.GetAuditLogByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get audit log"})
		return
	}

	if auditLog == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Audit log not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    auditLog.ToResponse(),
	})
}

// GetAuditLogsByFilter godoc
// @Summary Get audit logs with filters
// @Description Get paginated audit logs with various filters
// @Tags audit-logs
// @Accept json
// @Produce json
// @Param entity_type query string false "Entity type filter"
// @Param entity_id query int false "Entity ID filter"
// @Param action query string false "Action filter (created, updated, deleted)"
// @Param user_id query int false "User ID filter"
// @Param date_from query string false "Date from (YYYY-MM-DD)"
// @Param date_to query string false "Date to (YYYY-MM-DD)"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} models.AuditLogListResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /audit-logs [get]
func (h *AuditLogHandler) GetAuditLogsByFilter(c *gin.Context) {
	// Build filter from query parameters
	filter := models.AuditLogFilter{
		Page:  1,
		Limit: 10,
	}

	// Entity type filter
	if entityType := c.Query("entity_type"); entityType != "" {
		filter.EntityType = &entityType
	}

	// Entity ID filter
	if entityIDStr := c.Query("entity_id"); entityIDStr != "" {
		if entityID, err := strconv.Atoi(entityIDStr); err == nil {
			filter.EntityID = &entityID
		}
	}

	// Action filter
	if action := c.Query("action"); action != "" {
		filter.Action = &action
	}

	// User ID filter
	if userIDStr := c.Query("user_id"); userIDStr != "" {
		if userID, err := strconv.Atoi(userIDStr); err == nil {
			filter.UserID = &userID
		}
	}

	// Date filters
	if dateFrom := c.Query("date_from"); dateFrom != "" {
		filter.DateFrom = &dateFrom
	}
	if dateTo := c.Query("date_to"); dateTo != "" {
		filter.DateTo = &dateTo
	}

	// Pagination
	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			filter.Page = p
		}
	}
	
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			filter.Limit = l
		}
	}

	// Get audit logs
	result, err := h.auditLogService.GetAuditLogsByFilter(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get audit logs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}

// DeleteAuditLog godoc
// @Summary Delete audit log
// @Description Delete an audit log entry (admin only)
// @Tags audit-logs
// @Accept json
// @Produce json
// @Param id path int true "Audit log ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /audit-logs/{id} [delete]
func (h *AuditLogHandler) DeleteAuditLog(c *gin.Context) {
	idStr := c.Param("id")
	
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid audit log ID"})
		return
	}

	// Delete audit log
	err = h.auditLogService.DeleteAuditLog(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete audit log"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Audit log deleted successfully",
	})
}
