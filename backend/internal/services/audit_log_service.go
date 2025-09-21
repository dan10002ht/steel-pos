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
	LogCustomerChange(entityID int, action string, oldData, newData interface{}, userID *int, userName *string, ipAddress, userAgent *string) error
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
	fmt.Printf("DEBUG: LogInvoiceChange called with entityID=%d, action=%s\n", entityID, action)
	
	// Convert interface{} to map[string]interface{}
	oldDataMap, err := s.interfaceToMap(oldData)
	if err != nil {
		fmt.Printf("ERROR: Failed to convert old data: %v\n", err)
		return fmt.Errorf("failed to convert old data: %w", err)
	}

	newDataMap, err := s.interfaceToMap(newData)
	if err != nil {
		fmt.Printf("ERROR: Failed to convert new data: %v\n", err)
		return fmt.Errorf("failed to convert new data: %w", err)
	}

	// Generate changes summary
	changesSummary := s.GenerateChangesSummary(oldDataMap, newDataMap)
	fmt.Printf("DEBUG: Changes summary: %s\n", changesSummary)

	// Convert to JSON for database function
	oldDataJSON, _ := json.Marshal(oldDataMap)
	newDataJSON, _ := json.Marshal(newDataMap)

	// Use log_business_event function for better display_text generation
	fmt.Printf("DEBUG: Calling log_business_event function\n")
	_, err = s.auditLogRepo.GetDB().Exec(`
		SELECT log_business_event(
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
		)
	`, 
		"invoice",           // entity_type
		entityID,            // entity_id
		action,              // action
		"invoice_" + action, // log_type
		string(oldDataJSON), // old_data
		string(newDataJSON), // new_data
		nil,                 // business_data
		changesSummary,      // changes_summary
		"",                  // notes
		userID,              // created_by
		userName,            // created_by_name
		ipAddress,           // ip_address
		userAgent,           // user_agent
	)
	
	if err != nil {
		fmt.Printf("ERROR: log_business_event failed: %v\n", err)
	} else {
		fmt.Printf("DEBUG: log_business_event completed successfully\n")
	}
	
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

// LogCustomerChange logs customer changes
func (s *auditLogService) LogCustomerChange(entityID int, action string, oldData, newData interface{}, userID *int, userName *string, ipAddress, userAgent *string) error {
	fmt.Printf("DEBUG: LogCustomerChange called with entityID=%d, action=%s\n", entityID, action)
	
	var err error
	var newDataMap map[string]interface{}
	var oldDataMap map[string]interface{}
	
	// Convert new data to map (may be nil for deletions)
	if newData != nil {
		newDataMap, err = s.interfaceToMap(newData)
		if err != nil {
			fmt.Printf("ERROR: Failed to convert new customer data: %v\n", err)
			return fmt.Errorf("failed to convert new customer data: %w", err)
		}
	}

	// Convert old data to map (may be nil for creations)
	if oldData != nil {
		oldDataMap, err = s.interfaceToMap(oldData)
		if err != nil {
			fmt.Printf("ERROR: Failed to convert old customer data: %v\n", err)
			return fmt.Errorf("failed to convert old customer data: %w", err)
		}
	}

	var description string
	var changes []string

	// Handle different actions
	if action == "created" {
		// For creation, show what was created
		customerName := s.getStringValue(newDataMap["name"])
		customerPhone := s.getStringValue(newDataMap["phone"])
		description = fmt.Sprintf("Customer created: %s (%s)", customerName, customerPhone)
	} else if action == "deleted" {
		// For deletion, show what was deleted
		if oldDataMap != nil {
			customerName := s.getStringValue(oldDataMap["name"])
			customerPhone := s.getStringValue(oldDataMap["phone"])
			description = fmt.Sprintf("Customer deleted: %s (%s)", customerName, customerPhone)
		} else {
			description = "Customer deleted"
		}
	} else {
		// For updates, compare old and new data
		changes = s.generateCustomerChanges(oldDataMap, newDataMap)
		description = fmt.Sprintf("Customer %s", action)
		if len(changes) > 0 {
			description += ": " + strings.Join(changes, ", ")
		}
	}

	// Create audit log
	auditLog := &models.AuditLog{
		Action:               action,
		EntityType:           "customer",
		EntityID:             entityID,
		UserID:               userID,
		UserName:             userName,
		IPAddress:            ipAddress,
		UserAgent:            userAgent,
		LogCategory:          stringPtr("business"),
		LogType:              stringPtr(action),
		BusinessData:         models.JSONB(newDataMap),
		ReferenceEntityType:  stringPtr("customer"),
		ReferenceEntityID:    &entityID,
		Severity:             stringPtr("info"),
		ChangesSummary:       stringPtr(description),
	}

	err = s.auditLogRepo.Create(auditLog)
	if err != nil {
		fmt.Printf("ERROR: Failed to create customer audit log: %v\n", err)
		return fmt.Errorf("failed to create customer audit log: %w", err)
	}

	fmt.Printf("DEBUG: Customer audit log created successfully for customer ID %d\n", entityID)
	return nil
}

// generateCustomerChanges generates a list of changes between old and new customer data
func (s *auditLogService) generateCustomerChanges(oldData, newData map[string]interface{}) []string {
	var changes []string

	// If oldData is nil, this is a creation, so no changes to track
	if oldData == nil {
		return changes
	}

	// Check name
	oldName := s.getStringValue(oldData["name"])
	newName := s.getStringValue(newData["name"])
	if oldName != newName {
		changes = append(changes, fmt.Sprintf("name: %s → %s", oldName, newName))
	}

	// Check phone
	oldPhone := s.getStringValue(oldData["phone"])
	newPhone := s.getStringValue(newData["phone"])
	if oldPhone != newPhone {
		changes = append(changes, fmt.Sprintf("phone: %s → %s", oldPhone, newPhone))
	}

	// Check address
	oldAddress := s.getStringValue(oldData["address"])
	newAddress := s.getStringValue(newData["address"])
	if oldAddress != newAddress {
		changes = append(changes, fmt.Sprintf("address: %s → %s", oldAddress, newAddress))
	}

	// Check is_active
	oldActive := s.getBoolValue(oldData, "is_active")
	newActive := s.getBoolValue(newData, "is_active")
	if oldActive != newActive {
		oldStatus := "inactive"
		newStatus := "inactive"
		if oldActive {
			oldStatus = "active"
		}
		if newActive {
			newStatus = "active"
		}
		changes = append(changes, fmt.Sprintf("status: %s → %s", oldStatus, newStatus))
	}

	return changes
}

// stringPtr returns a pointer to the string value
func stringPtr(s string) *string {
	return &s
}

// getBoolValue safely extracts boolean value from map
func (s *auditLogService) getBoolValue(data map[string]interface{}, key string) bool {
	if data == nil {
		return false
	}
	if val, ok := data[key]; ok {
		if boolVal, ok := val.(bool); ok {
			return boolVal
		}
	}
	return false
}
