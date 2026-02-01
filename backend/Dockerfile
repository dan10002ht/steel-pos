# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build \
    -a -installsuffix cgo \
    -ldflags="-s -w -X main.version=${VERSION:-dev}" \
    -trimpath \
    -o main .

# Build migration binary with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build \
    -a -installsuffix cgo \
    -ldflags="-s -w" \
    -trimpath \
    -o migrate_db ./cmd/migrate

# Build seed binary with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build \
    -a -installsuffix cgo \
    -ldflags="-s -w" \
    -trimpath \
    -o seed_db ./cmd/seed

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates curl

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

WORKDIR /home/appuser/

# Copy the binaries from builder stage
COPY --from=builder --chown=appuser:appuser /app/main .
COPY --from=builder --chown=appuser:appuser /app/migrate_db .
COPY --from=builder --chown=appuser:appuser /app/seed_db .

# Copy migrations directory
COPY --from=builder --chown=appuser:appuser /app/migrations ./migrations

# Copy fonts directory for PDF generation
COPY --from=builder --chown=appuser:appuser /app/fonts ./fonts

# Make binaries executable
RUN chmod +x main migrate_db seed_db

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check (use 127.0.0.1 instead of localhost to avoid IPv6 issues)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:8080/health || exit 1

# Run the binary
CMD ["./main"]
