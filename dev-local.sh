#!/bin/bash

# STEEL POS Development Environment Setup Script
# This script sets up the complete development environment

set -e  # Exit on any error

# Global variables for process tracking
BACKEND_PID=""
FRONTEND_PID=""
TUNNEL_BE_PID=""
TUNNEL_FE_PID=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to kill process using a specific port
kill_port() {
    local port=$1
    local process_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_status "Port $port is in use. Killing existing $process_name process..."
        local pids=$(lsof -Pi :$port -sTCP:LISTEN -t)
        if [ ! -z "$pids" ]; then
            for pid in $pids; do
                if kill -0 $pid 2>/dev/null; then
                    kill -9 $pid 2>/dev/null || true
                    print_success "Killed $process_name process (PID: $pid) on port $port"
                fi
            done
        fi
    else
        print_status "Port $port is available for $process_name"
    fi
}

# Function to kill all development ports
kill_development_ports() {
    print_status "Checking and killing processes on development ports..."
    kill_port 8080 "Backend"
    kill_port 5173 "Frontend"
    kill_port 5434 "PostgreSQL"
    kill_port 6380 "Redis"
    kill_port 5051 "pgAdmin"
    print_success "Port cleanup completed"
}

# Function to kill all yarn and air processes
kill_yarn_air_processes() {
    print_status "Killing all yarn and air processes..."
    
    local yarn_pids=$(pgrep -f "yarn dev" 2>/dev/null || true)
    if [ ! -z "$yarn_pids" ]; then
        for pid in $yarn_pids; do
            if kill -0 $pid 2>/dev/null; then
                print_status "Killing yarn dev process (PID: $pid)..."
                kill -9 $pid 2>/dev/null || true
            fi
        done
    fi
    
    local air_pids=$(pgrep -f "air" 2>/dev/null || true)
    if [ ! -z "$air_pids" ]; then
        for pid in $air_pids; do
            if kill -0 $pid 2>/dev/null; then
                print_status "Killing air process (PID: $pid)..."
                kill -9 $pid 2>/dev/null || true
            fi
        done
    fi
    
    print_success "Yarn and air processes cleanup completed"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to check if Node.js is available
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js and try again."
        exit 1
    fi
    if ! command -v yarn &> /dev/null; then
        print_error "yarn is not installed. Please install yarn and try again."
        exit 1
    fi
    print_success "Node.js and yarn are available"
}

# Function to check if Go is available
check_go() {
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed. Please install Go and try again."
        exit 1
    fi
    print_success "Go is available"
}

# Function to create .env file if it doesn't exist
setup_env_file() {
    if [ ! -f "backend/.env" ]; then
        print_status "Creating .env file..."
        cat > backend/.env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=steel_pos
DB_SSL_MODE=disable

# Server Configuration
SERVER_PORT=8080
SERVER_HOST=0.0.0.0

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=
REDIS_DB=0
EOF
        print_success "Created backend/.env file"
    else
        print_status "Backend .env file already exists"
    fi
}

# Function to stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    print_success "Stopped existing containers"
}

# Function to start development environment
start_dev_environment() {
    print_status "Starting development environment in mode: $MODE"
    
    # Kill any processes using development ports
    kill_development_ports
    
    # Start PostgreSQL, Redis, and pgAdmin
    print_status "Starting database services (PostgreSQL, Redis, pgAdmin)..."
    docker-compose -f docker-compose.dev.yml up -d postgres redis pgadmin
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Check if PostgreSQL is ready
    until docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres; do
        print_status "Waiting for PostgreSQL to be ready..."
        sleep 2
    done
    print_success "PostgreSQL is ready"
    
    # Wait a bit more for PostgreSQL to be fully ready
    print_status "Waiting for PostgreSQL to be fully ready..."
    sleep 5
    
    # Run migrations only
    print_status "Setting up database schema..."
    run_migrations
    
    # Start backend với hot reload
    print_status "Starting backend with hot reload..."
    start_backend_yarn
    # Start frontend với yarn
    print_status "Starting frontend with yarn..."
    start_frontend_yarn
    
    print_success "Development environment started successfully!"
}

# Function to start backend with hot reload
start_backend_yarn() {
    # Check if backend dependencies are installed
    if [ ! -f "backend/go.sum" ]; then
        print_status "Installing backend dependencies..."
        cd backend
        go mod tidy
        cd ..
    fi
    
    # Start backend in background with air
    print_status "Starting backend development server..."
    cd backend
    air &
    local backend_pid=$!
    cd ..
    
    # Store PID in global variable and file
    BACKEND_PID=$backend_pid
    echo $backend_pid > .backend.pid
    
    print_success "Backend started via air (PID: $backend_pid)"
}

# Function to start frontend with yarn
start_frontend_yarn() {
    # Check if frontend dependencies are installed
    if [ ! -d "frontend/node_modules" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        yarn install
        cd ..
    fi
    
    # Start frontend in background
    print_status "Starting frontend development server..."
    cd frontend
    yarn dev &
    local frontend_pid=$!
    cd ..
    
    # Store PID in global variable and file
    FRONTEND_PID=$frontend_pid
    echo $frontend_pid > .frontend.pid
    
    print_success "Frontend started via yarn (PID: $frontend_pid)"
}

# Function to stop backend air process
stop_backend_yarn() {
    if [ -f ".backend.pid" ]; then
        local pid=$(cat .backend.pid)
        if kill -0 $pid 2>/dev/null; then
            print_status "Stopping backend air process..."
            kill $pid
            rm .backend.pid
            print_success "Backend air process stopped"
        fi
    fi
}

# Function to stop frontend yarn process
stop_frontend_yarn() {
    if [ -f ".frontend.pid" ]; then
        local pid=$(cat .frontend.pid)
        if kill -0 $pid 2>/dev/null; then
            print_status "Stopping frontend yarn process..."
            kill $pid
            rm .frontend.pid
            print_success "Frontend yarn process stopped"
        fi
    fi
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    echo ""
    echo "📊 PostgreSQL: http://localhost:5434"
    echo "   - Database: steel_pos"
    echo "   - Username: postgres"
    echo "   - Password: password"
    echo ""
    echo "🔴 Redis: http://localhost:6380"
    echo ""
    echo "🗄️  pgAdmin: http://localhost:5051"
    echo "   - Email: admin@steelpos.com"
    echo "   - Password: admin123"
    echo ""
    echo "🚀 Backend API: http://localhost:8080"
    echo "   - Health check: http://localhost:8080/health"
    echo ""
    echo "⚛️  Frontend: http://localhost:5173 (yarn)"
    echo ""
}

# Function to show logs
show_logs() {
    print_status "Showing logs (Press Ctrl+C to exit)..."
    docker-compose -f docker-compose.dev.yml logs -f
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."

    # Check if PostgreSQL is running
    if ! docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_error "PostgreSQL is not running. Please start the development environment first."
        return 1
    fi

    # Check if migrations directory exists
    if [ ! -d "backend/migrations" ]; then
        print_error "Migrations directory not found: backend/migrations"
        return 1
    fi

    # Find all up migration files and sort them numerically
    print_status "Discovering migration files..."
    local migration_files=($(find backend/migrations -name "*_*.up.sql" -type f | sort -V))
    
    if [ ${#migration_files[@]} -eq 0 ]; then
        print_warning "No migration files found in backend/migrations/"
        return 0
    fi

    print_status "Found ${#migration_files[@]} migration files"

    # Copy all migration files to container
    print_status "Copying migration files to PostgreSQL container..."
    for file in "${migration_files[@]}"; do
        local filename=$(basename "$file")
        print_status "Copying: $filename"
        docker cp "$file" steel_pos_postgres_dev:/tmp/
    done

    # Run migrations in order
    print_status "Executing migrations in order..."
    for file in "${migration_files[@]}"; do
        local filename=$(basename "$file")
        print_status "Running migration: $filename"
        
        if docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d steel_pos -f "/tmp/$filename"; then
            print_success "✓ Migration $filename completed successfully"
        else
            print_error "✗ Migration $filename failed"
            return 1
        fi
    done

    print_success "All database migrations completed successfully!"
}

# Function to seed database
seed_database() {
    print_status "Seeding database..."

    # Check if PostgreSQL is running
    if ! docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_error "PostgreSQL is not running. Please start the development environment first."
        return 1
    fi

    # Check if migrations have been run
    local table_count=$(docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d steel_pos -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

    if [ "$table_count" -eq "0" ]; then
        print_warning "No tables found. Running migrations first..."
        run_migrations
    fi

    # Run seed script with environment variables
    print_status "Running seed script..."
    cd backend
    # Set DATABASE_URL for seeding
    export DATABASE_URL="postgres://postgres:password@localhost:5434/steel_pos?sslmode=disable"
    go run cmd/seed/main.go
    cd ..

    print_success "Database seeding completed successfully!"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    stop_backend_yarn
    stop_frontend_yarn
    kill_development_ports
    kill_yarn_air_processes
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    rm -f .backend.pid .frontend.pid
    print_success "Cleanup completed"
}

# Main script
MODE="${1:-local}"

main() {
    echo ""
    echo "🏗️  STEEL POS Development Environment Setup"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_docker
    check_docker_compose
    check_node
    check_go
    
    # Setup environment
    setup_env_file
    
    # Stop existing containers and processes
    stop_containers
    stop_backend_yarn
    stop_frontend_yarn
    
    # Start development environment
    start_dev_environment
    
    # Show status
    show_status
    
    print_success "Development environment is ready!"
    echo ""
    print_status "Useful commands:"
    echo "  ./dev-local.sh logs     - Show logs"
    echo "  ./dev-local.sh stop     - Stop all services"
    echo "  ./dev-local.sh restart  - Restart all services"
    echo "  ./dev-local.sh status   - Show service status"
    echo "  ./dev-local.sh cleanup  - Clean up everything"
    echo ""
    print_warning "Frontend is running via yarn. Use 'pkill -f \"yarn dev\"' to stop it manually."
}

# Handle command line arguments
case "${1:-}" in
    "logs")
        show_logs
        ;;
    "stop")
        print_status "Stopping all services..."
        stop_backend_yarn
        stop_frontend_yarn
        docker-compose -f docker-compose.dev.yml down
        print_success "All services stopped"
        ;;
    "restart")
        print_status "Restarting all services..."
        docker-compose -f docker-compose.dev.yml restart
        print_success "All services restarted"
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "migrate")
        run_migrations
        ;;
    "seed")
        seed_database
        ;;
    "killports")
        kill_development_ports
        ;;
    "force-kill")
        print_status "Force killing all development processes..."
        kill_development_ports
        kill_yarn_air_processes
        rm -f .backend.pid .frontend.pid
        print_success "Force kill completed"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: ./dev-local.sh [local|command]"
        echo ""
        echo "Commands:"
        echo "  local     - Start dev environment (default)"
        echo "  logs      - Show logs"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  status    - Show service status"
        echo "  cleanup   - Clean up everything"
        echo "  migrate   - Run all database migrations"
        echo "  seed      - Seed database"
        echo "  killports - Kill processes on development ports"
        echo "  force-kill - Force kill all development processes"
        echo "  help      - Show this help"
        echo ""
        echo "Note: Frontend runs with yarn dev, backend runs with air"
        ;;
    ""|"local")
        main
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use './dev-local.sh help' for usage information"
        exit 1
        ;;
esac
