package routes

import (
	"steel-pos-backend/internal/handlers"
	"steel-pos-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAuditLogRoutes configures audit log routes
func SetupAuditLogRoutes(api *gin.RouterGroup, auditLogHandler *handlers.AuditLogHandler, authMiddleware *middleware.AuthMiddleware) {
	auditLogs := api.Group("/audit-logs")
	{
		// Get specific audit log by ID (must come before entity routes to avoid conflict)
		auditLogs.GET("/id/:id", auditLogHandler.GetAuditLogByID)
		
		// Get audit logs for a specific entity (e.g., invoice)
		auditLogs.GET("/entity/:entity_type/:entity_id", auditLogHandler.GetAuditLogsByEntity)
		
		// Get audit logs with filters
		auditLogs.GET("", auditLogHandler.GetAuditLogsByFilter)
		
		// Delete audit log (admin only - you might want to add admin middleware here)
		auditLogs.DELETE("/id/:id", auditLogHandler.DeleteAuditLog)
	}
}
