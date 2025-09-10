package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"steel-pos-backend/internal/models"
)

type AuditLogRepository interface {
	Create(auditLog *models.AuditLog) error
	GetByID(id int) (*models.AuditLog, error)
	GetByEntity(entityType string, entityID int) ([]models.AuditLog, error)
	GetByFilter(filter models.AuditLogFilter) ([]models.AuditLog, int, error)
	GetByEntityWithPagination(entityType string, entityID int, page, limit int) ([]models.AuditLog, int, error)
	Delete(id int) error
}

type auditLogRepository struct {
	db *sqlx.DB
}

func NewAuditLogRepository(db *sqlx.DB) AuditLogRepository {
	return &auditLogRepository{db: db}
}

func (r *auditLogRepository) Create(auditLog *models.AuditLog) error {
	query := `
		INSERT INTO audit_logs (
			entity_type, entity_id, action, user_id, user_name,
			old_data, new_data, changes_summary, ip_address, user_agent
		) VALUES (
			:entity_type, :entity_id, :action, :user_id, :user_name,
			:old_data, :new_data, :changes_summary, :ip_address, :user_agent
		) RETURNING id, created_at, updated_at`

	rows, err := r.db.NamedQuery(query, auditLog)
	if err != nil {
		return fmt.Errorf("failed to create audit log: %w", err)
	}
	defer rows.Close()

	if rows.Next() {
		err = rows.Scan(&auditLog.ID, &auditLog.CreatedAt, &auditLog.UpdatedAt)
		if err != nil {
			return fmt.Errorf("failed to scan audit log result: %w", err)
		}
	}

	return nil
}

func (r *auditLogRepository) GetByID(id int) (*models.AuditLog, error) {
	query := `
		SELECT id, entity_type, entity_id, action, user_id, user_name,
			   old_data, new_data, changes_summary, ip_address, user_agent,
			   created_at, updated_at
		FROM audit_logs
		WHERE id = $1`

	var auditLog models.AuditLog
	err := r.db.Get(&auditLog, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get audit log by ID: %w", err)
	}

	return &auditLog, nil
}

func (r *auditLogRepository) GetByEntity(entityType string, entityID int) ([]models.AuditLog, error) {
	query := `
		SELECT id, entity_type, entity_id, action, user_id, user_name,
			   old_data, new_data, changes_summary, ip_address, user_agent,
			   created_at, updated_at
		FROM audit_logs
		WHERE entity_type = $1 AND entity_id = $2
		ORDER BY created_at DESC`

	var auditLogs []models.AuditLog
	err := r.db.Select(&auditLogs, query, entityType, entityID)
	if err != nil {
		return nil, fmt.Errorf("failed to get audit logs by entity: %w", err)
	}

	return auditLogs, nil
}

func (r *auditLogRepository) GetByEntityWithPagination(entityType string, entityID int, page, limit int) ([]models.AuditLog, int, error) {
	// Get total count
	countQuery := `
		SELECT COUNT(*)
		FROM audit_logs
		WHERE entity_type = $1 AND entity_id = $2`

	var total int
	err := r.db.Get(&total, countQuery, entityType, entityID)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count audit logs: %w", err)
	}

	// Get paginated results
	offset := (page - 1) * limit
	query := `
		SELECT id, entity_type, entity_id, action, user_id, user_name,
			   old_data, new_data, changes_summary, ip_address, user_agent,
			   created_at, updated_at
		FROM audit_logs
		WHERE entity_type = $1 AND entity_id = $2
		ORDER BY created_at DESC
		LIMIT $3 OFFSET $4`

	var auditLogs []models.AuditLog
	err = r.db.Select(&auditLogs, query, entityType, entityID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get paginated audit logs: %w", err)
	}

	return auditLogs, total, nil
}

func (r *auditLogRepository) GetByFilter(filter models.AuditLogFilter) ([]models.AuditLog, int, error) {
	// Build WHERE clause
	whereConditions := []string{}
	args := []interface{}{}
	argIndex := 1

	if filter.EntityType != nil {
		whereConditions = append(whereConditions, fmt.Sprintf("entity_type = $%d", argIndex))
		args = append(args, *filter.EntityType)
		argIndex++
	}

	if filter.EntityID != nil {
		whereConditions = append(whereConditions, fmt.Sprintf("entity_id = $%d", argIndex))
		args = append(args, *filter.EntityID)
		argIndex++
	}

	if filter.Action != nil {
		whereConditions = append(whereConditions, fmt.Sprintf("action = $%d", argIndex))
		args = append(args, *filter.Action)
		argIndex++
	}

	if filter.UserID != nil {
		whereConditions = append(whereConditions, fmt.Sprintf("user_id = $%d", argIndex))
		args = append(args, *filter.UserID)
		argIndex++
	}

	if filter.DateFrom != nil {
		whereConditions = append(whereConditions, fmt.Sprintf("created_at >= $%d", argIndex))
		args = append(args, *filter.DateFrom)
		argIndex++
	}

	if filter.DateTo != nil {
		whereConditions = append(whereConditions, fmt.Sprintf("created_at <= $%d", argIndex))
		args = append(args, *filter.DateTo)
		argIndex++
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	// Get total count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM audit_logs %s", whereClause)
	var total int
	err := r.db.Get(&total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count audit logs: %w", err)
	}

	// Get paginated results
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Limit <= 0 {
		filter.Limit = 10
	}

	offset := (filter.Page - 1) * filter.Limit
	query := fmt.Sprintf(`
		SELECT id, entity_type, entity_id, action, user_id, user_name,
			   old_data, new_data, changes_summary, ip_address, user_agent,
			   created_at, updated_at
		FROM audit_logs
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d`, whereClause, argIndex, argIndex+1)

	args = append(args, filter.Limit, offset)

	var auditLogs []models.AuditLog
	err = r.db.Select(&auditLogs, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get filtered audit logs: %w", err)
	}

	return auditLogs, total, nil
}

func (r *auditLogRepository) Delete(id int) error {
	query := `DELETE FROM audit_logs WHERE id = $1`
	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete audit log: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("audit log with ID %d not found", id)
	}

	return nil
}
