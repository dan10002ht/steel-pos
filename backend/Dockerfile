# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Build migration binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o migrate_db ./cmd/migrate

# Build seed binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o seed_db ./cmd/seed

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binaries from builder stage
COPY --from=builder /app/main .
COPY --from=builder /app/migrate_db .
COPY --from=builder /app/seed_db .

# Copy migrations directory
COPY --from=builder /app/migrations ./migrations

# Copy fonts directory for PDF generation
COPY --from=builder /app/fonts ./fonts

# Make binaries executable
RUN chmod +x main migrate_db seed_db

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the binary
CMD ["./main"]
