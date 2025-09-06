#!/bin/bash

# Development Docker management script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if .env file exists
check_env_file() {
    if [[ ! -f .env ]]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_info "Please update the .env file with your configuration."
    fi
}

# Function to build images
build_images() {
    print_info "Building Docker images for development..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
    print_success "Images built successfully!"
}

# Function to start services
start_services() {
    print_info "Starting development services..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    print_success "Services started successfully!"
    
    print_info "Waiting for services to be healthy..."
    sleep 10
    
    # Check service health
    check_services
}

# Function to stop services
stop_services() {
    print_info "Stopping development services..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    print_success "Services stopped successfully!"
}

# Function to restart services
restart_services() {
    print_info "Restarting development services..."
    stop_services
    start_services
}

# Function to check service health
check_services() {
    print_info "Checking service health..."
    
    # Check MongoDB
    if docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_success "MongoDB is healthy"
    else
        print_warning "MongoDB might not be ready yet"
    fi
    
    # Check Redis
    if docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is healthy"
    else
        print_warning "Redis might not be ready yet"
    fi
    
    # Check Backend
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_success "Backend API is healthy"
    else
        print_warning "Backend API might not be ready yet"
    fi
    
    # Check Frontend
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend might not be ready yet"
    fi
}

# Function to view logs
view_logs() {
    local service=$1
    if [[ -z "$service" ]]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
    else
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f "$service"
    fi
}

# Function to clean up
cleanup() {
    print_info "Cleaning up Docker resources..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed!"
}

# Function to show service URLs
show_urls() {
    print_info "Service URLs:"
    echo -e "  ${GREEN}Frontend:${NC}     http://localhost:3000"
    echo -e "  ${GREEN}Backend API:${NC}  http://localhost:5000"
    echo -e "  ${GREEN}API Docs:${NC}     http://localhost:5000/api/docs"
    echo -e "  ${GREEN}MongoDB:${NC}      mongodb://localhost:27017"
    echo -e "  ${GREEN}Redis:${NC}        redis://localhost:6379"
}

# Function to seed database
seed_database() {
    print_info "Seeding database with sample data..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npm run seed
    print_success "Database seeded successfully!"
}

# Function to run tests
run_tests() {
    local service=$1
    if [[ "$service" == "backend" ]]; then
        print_info "Running backend tests..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npm test
    elif [[ "$service" == "frontend" ]]; then
        print_info "Running frontend tests..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec frontend npm test
    else
        print_info "Running all tests..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npm test
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec frontend npm test
    fi
}

# Main script logic
case "$1" in
    "build")
        check_docker
        check_env_file
        build_images
        ;;
    "start"|"up")
        check_docker
        check_env_file
        start_services
        show_urls
        ;;
    "stop"|"down")
        check_docker
        stop_services
        ;;
    "restart")
        check_docker
        restart_services
        show_urls
        ;;
    "logs")
        check_docker
        view_logs $2
        ;;
    "status"|"ps")
        check_docker
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
        ;;
    "health")
        check_services
        ;;
    "urls")
        show_urls
        ;;
    "seed")
        check_docker
        seed_database
        ;;
    "test")
        check_docker
        run_tests $2
        ;;
    "cleanup")
        check_docker
        cleanup
        ;;
    "shell")
        if [[ -z "$2" ]]; then
            print_error "Please specify a service (backend, frontend, mongodb, redis)"
            exit 1
        fi
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec "$2" sh
        ;;
    *)
        echo "Usage: $0 {build|start|stop|restart|logs|status|health|urls|seed|test|cleanup|shell}"
        echo ""
        echo "Commands:"
        echo "  build     - Build all Docker images"
        echo "  start     - Start all services"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  logs      - View logs (optionally specify service)"
        echo "  status    - Show service status"
        echo "  health    - Check service health"
        echo "  urls      - Show service URLs"
        echo "  seed      - Seed database with sample data"
        echo "  test      - Run tests (optionally specify backend/frontend)"
        echo "  cleanup   - Clean up Docker resources"
        echo "  shell     - Open shell in service container"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 logs backend"
        echo "  $0 test frontend"
        echo "  $0 shell mongodb"
        exit 1
        ;;
esac