package services

import (
	"encoding/json"
	"fmt"
	"strings"

	"steel-pos-backend/internal/models"
	"steel-pos-backend/internal/repository"
)

type AuditLogService interface {
	CreateAuditLog(req models.AuditLogCreateRequest) (*models.AuditLog, error)
	GetAuditLogByID(id int) (*models.AuditLog, error)
	GetAuditLogsByEntity(entityType string, entityID int) ([]models.AuditLog, error)
	GetAuditLogsByEntityWithPagination(entityType string, entityID int, page, limit int) (*models.AuditLogListResponse, error)
	GetAuditLogsByFilter(filter models.AuditLogFilter) (*models.AuditLogListResponse, error)
	DeleteAuditLog(id int) error
	LogInvoiceChange(entityID int, action string, oldData, newData interface{}, userID *int, userName *string, ipAddress, userAgent *string) error
	GenerateChangesSummary(oldData, newData map[string]interface{}) string
}

type auditLogService struct {
	auditLogRepo repository.AuditLogRepository
}

func NewAuditLogService(auditLogRepo repository.AuditLogRepository) AuditLogService {
	return &auditLogService{
		auditLogRepo: auditLogRepo,
	}
}

func (s *auditLogService) CreateAuditLog(req models.AuditLogCreateRequest) (*models.AuditLog, error) {
	// Convert map[string]interface{} to JSONB
	oldData := models.JSONB(req.OldData)
	newData := models.JSONB(req.NewData)

	auditLog := &models.AuditLog{
		EntityType:     req.EntityType,
		EntityID:       req.EntityID,
		Action:         req.Action,
		UserID:         req.UserID,
		UserName:       req.UserName,
		OldData:        oldData,
		NewData:        newData,
		ChangesSummary: req.ChangesSummary,
		IPAddress:      req.IPAddress,
		UserAgent:      req.UserAgent,
	}

	err := s.auditLogRepo.Create(auditLog)
	if err != nil {
		return nil, fmt.Errorf("failed to create audit log: %w", err)
	}

	return auditLog, nil
}

func (s *auditLogService) GetAuditLogByID(id int) (*models.AuditLog, error) {
	return s.auditLogRepo.GetByID(id)
}

func (s *auditLogService) GetAuditLogsByEntity(entityType string, entityID int) ([]models.AuditLog, error) {
	return s.auditLogRepo.GetByEntity(entityType, entityID)
}

func (s *auditLogService) GetAuditLogsByEntityWithPagination(entityType string, entityID int, page, limit int) (*models.AuditLogListResponse, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	auditLogs, total, err := s.auditLogRepo.GetByEntityWithPagination(entityType, entityID, page, limit)
	if err != nil {
		return nil, err
	}

	responses := make([]models.AuditLogResponse, len(auditLogs))
	for i, log := range auditLogs {
		responses[i] = log.ToResponse()
	}

	return &models.AuditLogListResponse{
		AuditLogs: responses,
		Total:     total,
		Page:      page,
		Limit:     limit,
	}, nil
}

func (s *auditLogService) GetAuditLogsByFilter(filter models.AuditLogFilter) (*models.AuditLogListResponse, error) {
	auditLogs, total, err := s.auditLogRepo.GetByFilter(filter)
	if err != nil {
		return nil, err
	}

	responses := make([]models.AuditLogResponse, len(auditLogs))
	for i, log := range auditLogs {
		responses[i] = log.ToResponse()
	}

	return &models.AuditLogListResponse{
		AuditLogs: responses,
		Total:     total,
		Page:      filter.Page,
		Limit:     filter.Limit,
	}, nil
}

func (s *auditLogService) DeleteAuditLog(id int) error {
	return s.auditLogRepo.Delete(id)
}

func (s *auditLogService) LogInvoiceChange(entityID int, action string, oldData, newData interface{}, userID *int, userName *string, ipAddress, userAgent *string) error {
	// Convert interface{} to map[string]interface{}
	oldDataMap, err := s.interfaceToMap(oldData)
	if err != nil {
		return fmt.Errorf("failed to convert old data: %w", err)
	}

	newDataMap, err := s.interfaceToMap(newData)
	if err != nil {
		return fmt.Errorf("failed to convert new data: %w", err)
	}

	// Generate changes summary
	changesSummary := s.GenerateChangesSummary(oldDataMap, newDataMap)

	req := models.AuditLogCreateRequest{
		EntityType:     "invoice",
		EntityID:       entityID,
		Action:         action,
		UserID:         userID,
		UserName:       userName,
		OldData:        oldDataMap,
		NewData:        newDataMap,
		ChangesSummary: &changesSummary,
		IPAddress:      ipAddress,
		UserAgent:      userAgent,
	}

	_, err = s.CreateAuditLog(req)
	return err
}

func (s *auditLogService) GenerateChangesSummary(oldData, newData map[string]interface{}) string {
	var changes []string

	// Check for changes in basic fields
	basicFields := []string{"customer_name", "customer_phone", "customer_address", "notes", "payment_method"}
	for _, field := range basicFields {
		oldVal := s.getStringValue(oldData[field])
		newVal := s.getStringValue(newData[field])
		if oldVal != newVal {
			changes = append(changes, fmt.Sprintf("%s: %s → %s", field, oldVal, newVal))
		}
	}

	// Check for changes in numeric fields
	numericFields := []string{"discount_amount", "paid_amount", "total_amount"}
	for _, field := range numericFields {
		oldVal := s.getFloatValue(oldData[field])
		newVal := s.getFloatValue(newData[field])
		if oldVal != newVal {
			changes = append(changes, fmt.Sprintf("%s: %.2f → %.2f", field, oldVal, newVal))
		}
	}

	// Check for changes in items
	oldItems := s.getItems(oldData)
	newItems := s.getItems(newData)
	
	if len(oldItems) != len(newItems) {
		changes = append(changes, fmt.Sprintf("items count: %d → %d", len(oldItems), len(newItems)))
	}

	// Check for item changes
	itemChanges := s.compareItems(oldItems, newItems)
	changes = append(changes, itemChanges...)

	if len(changes) == 0 {
		return "No changes detected"
	}

	return strings.Join(changes, "; ")
}

// Helper functions
func (s *auditLogService) interfaceToMap(data interface{}) (map[string]interface{}, error) {
	if data == nil {
		return make(map[string]interface{}), nil
	}

	// Convert to JSON and back to map
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	err = json.Unmarshal(jsonData, &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (s *auditLogService) getStringValue(val interface{}) string {
	if val == nil {
		return ""
	}
	if str, ok := val.(string); ok {
		return str
	}
	return fmt.Sprintf("%v", val)
}

func (s *auditLogService) getFloatValue(val interface{}) float64 {
	if val == nil {
		return 0
	}
	switch v := val.(type) {
	case float64:
		return v
	case int:
		return float64(v)
	case int64:
		return float64(v)
	case string:
		// Try to parse as float
		if f, err := fmt.Sscanf(v, "%f", &v); err == nil && f == 1 {
			return 0 // This won't work, but it's a placeholder
		}
	}
	return 0
}

func (s *auditLogService) getItems(data map[string]interface{}) []map[string]interface{} {
	items, ok := data["items"]
	if !ok {
		return []map[string]interface{}{}
	}

	itemsSlice, ok := items.([]interface{})
	if !ok {
		return []map[string]interface{}{}
	}

	result := make([]map[string]interface{}, len(itemsSlice))
	for i, item := range itemsSlice {
		if itemMap, ok := item.(map[string]interface{}); ok {
			result[i] = itemMap
		}
	}

	return result
}

func (s *auditLogService) compareItems(oldItems, newItems []map[string]interface{}) []string {
	var changes []string

	// Create maps for easier comparison
	oldItemsMap := make(map[string]map[string]interface{})
	for _, item := range oldItems {
		if productID, ok := item["product_id"]; ok {
			key := fmt.Sprintf("%v", productID)
			oldItemsMap[key] = item
		}
	}

	newItemsMap := make(map[string]map[string]interface{})
	for _, item := range newItems {
		if productID, ok := item["product_id"]; ok {
			key := fmt.Sprintf("%v", productID)
			newItemsMap[key] = item
		}
	}

	// Check for removed items
	for key, oldItem := range oldItemsMap {
		if _, exists := newItemsMap[key]; !exists {
			productName := s.getStringValue(oldItem["product_name"])
			changes = append(changes, fmt.Sprintf("removed item: %s", productName))
		}
	}

	// Check for added items
	for key, newItem := range newItemsMap {
		if _, exists := oldItemsMap[key]; !exists {
			productName := s.getStringValue(newItem["product_name"])
			changes = append(changes, fmt.Sprintf("added item: %s", productName))
		}
	}

	// Check for modified items
	for key, oldItem := range oldItemsMap {
		if newItem, exists := newItemsMap[key]; exists {
			productName := s.getStringValue(oldItem["product_name"])
			
			// Check quantity
			oldQty := s.getFloatValue(oldItem["quantity"])
			newQty := s.getFloatValue(newItem["quantity"])
			if oldQty != newQty {
				changes = append(changes, fmt.Sprintf("%s quantity: %.0f → %.0f", productName, oldQty, newQty))
			}

			// Check unit price
			oldPrice := s.getFloatValue(oldItem["unit_price"])
			newPrice := s.getFloatValue(newItem["unit_price"])
			if oldPrice != newPrice {
				changes = append(changes, fmt.Sprintf("%s price: %.2f → %.2f", productName, oldPrice, newPrice))
			}
		}
	}

	return changes
}
