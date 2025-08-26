#!/bin/bash

# STEEL POS Database Seeding Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if PostgreSQL container is running
check_postgres() {
    if ! docker ps | grep -q "steel_pos_postgres_dev"; then
        print_error "PostgreSQL container is not running. Please start the development environment first with ./dev-local.sh"
        exit 1
    fi
    print_success "PostgreSQL container is running"
}

# Seed database
seed_database() {
    print_status "Seeding database..."
    
    # Check if backend directory exists
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found"
        exit 1
    fi
    
    # Check if seed script exists
    if [ ! -f "backend/cmd/seed/main.go" ]; then
        print_error "Seed script not found at backend/cmd/seed/main.go"
        exit 1
    fi
    
    # Set DATABASE_URL for seeding
    export DATABASE_URL="postgres://postgres:password@localhost:5434/steel_pos?sslmode=disable"
    
    cd backend
    print_status "Running seed script..."
    go run cmd/seed/main.go
    cd ..
    
    print_success "Database seeding completed successfully!"
}

# Main execution
main() {
    echo ""
    echo "🌱 STEEL POS Database Seeding"
    echo "=============================="
    echo ""
    
    check_postgres
    seed_database
    
    echo ""
    print_success "Seeding completed! You can now start the application."
    echo ""
}

# Run main function
main "$@"
