#!/bin/bash

echo "Running database migration..."

# Wait for database to be ready
sleep 10

# Run migration using Go script
docker-compose -f docker-compose.prod.yml exec -T backend go run cmd/migrate/main.go

echo "Migration completed!"
