# Import Orders API Documentation

## Overview

This document describes the API endpoints for managing import orders in the Steel POS system.

## Base URL

```
http://localhost:8080/api
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Create Import Order

**POST** `/import-orders`

**Description:** Creates a new import order with items.

**Required Role:** `admin`, `manager`

**Request Body:**

```json
{
  "supplier_name": "Công ty Thép ABC",
  "import_date": "2024-01-15T00:00:00Z",
  "notes": "Import order notes",
  "import_images": ["image1.jpg", "image2.jpg"],
  "items": [
    {
      "product_id": 1,
      "variant_id": 1,
      "product_name": "Ống phi",
      "variant_name": "Phi 12",
      "quantity": 100,
      "unit_price": 50000,
      "unit": "m",
      "notes": "Item notes"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "import_code": "0001",
    "supplier_name": "Công ty Thép ABC",
    "import_date": "2024-01-15T00:00:00Z",
    "total_amount": 5000000,
    "status": "pending",
    "notes": "Import order notes",
    "import_images": ["image1.jpg", "image2.jpg"],
    "created_by": 1,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  "message": "Import order created successfully"
}
```

### 2. Get All Import Orders

**GET** `/import-orders`

**Description:** Retrieves all import orders with pagination and filtering.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (`pending`, `approved`, `rejected`)
- `supplier_name` (optional): Filter by supplier name
- `search` (optional): Search in import code or supplier name

**Response:**

```json
{
  "success": true,
  "data": {
    "import_orders": [
      {
        "id": 1,
        "import_code": "0001",
        "supplier_name": "Công ty Thép ABC",
        "import_date": "2024-01-15T00:00:00Z",
        "total_amount": 5000000,
        "status": "pending",
        "notes": "Import order notes",
        "import_images": ["image1.jpg"],
        "approved_by": null,
        "approved_at": null,
        "approval_note": "",
        "created_by": 1,
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z",
        "items": [
          {
            "id": 1,
            "import_order_id": 1,
            "product_id": 1,
            "variant_id": 1,
            "product_name": "Ống phi",
            "variant_name": "Phi 12",
            "quantity": 100,
            "unit_price": 50000,
            "total_price": 5000000,
            "unit": "m",
            "notes": "Item notes",
            "created_by": 1,
            "created_at": "2024-01-15T10:00:00Z"
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "message": "Import orders retrieved successfully"
}
```

### 3. Get Import Order by ID

**GET** `/import-orders/{id}`

**Description:** Retrieves a specific import order by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "import_code": "0001",
    "supplier_name": "Công ty Thép ABC",
    "import_date": "2024-01-15T00:00:00Z",
    "total_amount": 5000000,
    "status": "pending",
    "notes": "Import order notes",
    "import_images": ["image1.jpg"],
    "approved_by": null,
    "approved_at": null,
    "approval_note": "",
    "created_by": 1,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "items": [
      {
        "id": 1,
        "import_order_id": 1,
        "product_id": 1,
        "variant_id": 1,
        "product_name": "Ống phi",
        "variant_name": "Phi 12",
        "quantity": 100,
        "unit_price": 50000,
        "total_price": 5000000,
        "unit": "m",
        "notes": "Item notes",
        "created_by": 1,
        "created_at": "2024-01-15T10:00:00Z"
      }
    ]
  },
  "message": "Import order retrieved successfully"
}
```

### 4. Update Import Order

**PUT** `/import-orders/{id}`

**Description:** Updates an existing import order.

**Required Role:** `admin`, `manager`

**Request Body:**

```json
{
  "supplier_name": "Công ty Thép XYZ",
  "import_date": "2024-01-16T00:00:00Z",
  "notes": "Updated notes",
  "import_images": ["image1.jpg", "image3.jpg"],
  "status": "pending"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "import_code": "0001",
    "supplier_name": "Công ty Thép XYZ",
    "import_date": "2024-01-16T00:00:00Z",
    "total_amount": 5000000,
    "status": "pending",
    "notes": "Updated notes",
    "import_images": ["image1.jpg", "image3.jpg"],
    "created_by": 1,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  },
  "message": "Import order updated successfully"
}
```

### 5. Approve Import Order

**POST** `/import-orders/{id}/approve`

**Description:** Approves an import order and updates inventory.

**Required Role:** `admin`, `manager`

**Request Body:**

```json
{
  "approval_note": "Approved after review"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Import order approved successfully"
  },
  "message": "Import order approved successfully"
}
```

### 6. Delete Import Order

**DELETE** `/import-orders/{id}`

**Description:** Deletes an import order (only if not approved).

**Required Role:** `admin`

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Import order deleted successfully"
  },
  "message": "Import order deleted successfully"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid import order ID",
  "message": "Bad request"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Insufficient permissions",
  "message": "Access denied"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Import order not found",
  "message": "Not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Database error",
  "message": "Internal server error"
}
```

## Data Models

### ImportOrder

```go
type ImportOrder struct {
    ID           int       `json:"id"`
    ImportCode   string    `json:"import_code"`
    SupplierName string    `json:"supplier_name"`
    ImportDate   time.Time `json:"import_date"`
    TotalAmount  float64   `json:"total_amount"`
    Status       string    `json:"status"`
    Notes        string    `json:"notes"`
    ImportImages []string  `json:"import_images"`
    ApprovedBy   *int      `json:"approved_by"`
    ApprovedAt   *time.Time `json:"approved_at"`
    ApprovalNote string    `json:"approval_note"`
    CreatedBy    int       `json:"created_by"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
    Items        []*ImportOrderItem `json:"items,omitempty"`
}
```

### ImportOrderItem

```go
type ImportOrderItem struct {
    ID            int       `json:"id"`
    ImportOrderID int       `json:"import_order_id"`
    ProductID     int       `json:"product_id"`
    VariantID     int       `json:"variant_id"`
    ProductName   string    `json:"product_name"`
    VariantName   string    `json:"variant_name"`
    Quantity      int       `json:"quantity"`
    UnitPrice     float64   `json:"unit_price"`
    TotalPrice    float64   `json:"total_price"`
    Unit          string    `json:"unit"`
    Notes         string    `json:"notes"`
    CreatedBy     int       `json:"created_by"`
    CreatedAt     time.Time `json:"created_at"`
}
```
