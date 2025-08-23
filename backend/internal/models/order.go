package models

import (
	"time"
)

// OrderStatus định nghĩa các trạng thái đơn hàng
type OrderStatus string

const (
	OrderStatusNew        OrderStatus = "new"        // Mới
	OrderStatusProcessing OrderStatus = "processing" // Đang xử lý
	OrderStatusCompleted  OrderStatus = "completed"  // Hoàn thành
	OrderStatusCancelled  OrderStatus = "cancelled"  // Đã hủy
)

// PaymentStatus định nghĩa các trạng thái thanh toán
type PaymentStatus string

const (
	PaymentStatusUnpaid  PaymentStatus = "unpaid"  // Chưa thanh toán
	PaymentStatusPartial PaymentStatus = "partial" // Thanh toán một phần
	PaymentStatusPaid    PaymentStatus = "paid"    // Đã thanh toán
)

// Order model đại diện cho bảng orders
type Order struct {
	ID              int64         `json:"id" db:"id"`
	OrderCode       string        `json:"order_code" db:"order_code"`
	CustomerID      *int64        `json:"customer_id,omitempty" db:"customer_id"`
	OrderDate       time.Time     `json:"order_date" db:"order_date"`
	DeliveryDate    *time.Time    `json:"delivery_date,omitempty" db:"delivery_date"`
	DeliveryAddress *string       `json:"delivery_address,omitempty" db:"delivery_address"`
	ContactPerson   *string       `json:"contact_person,omitempty" db:"contact_person"`
	ContactPhone    *string       `json:"contact_phone,omitempty" db:"contact_phone"`
	Subtotal        float64       `json:"subtotal" db:"subtotal"`
	TaxAmount       float64       `json:"tax_amount" db:"tax_amount"`
	DiscountAmount  float64       `json:"discount_amount" db:"discount_amount"`
	TotalAmount     float64       `json:"total_amount" db:"total_amount"`
	PaidAmount      float64       `json:"paid_amount" db:"paid_amount"`
	RemainingAmount float64       `json:"remaining_amount" db:"remaining_amount"`
	OrderStatus     OrderStatus   `json:"order_status" db:"order_status"`
	PaymentStatus   PaymentStatus `json:"payment_status" db:"payment_status"`
	PaymentMethod   *string       `json:"payment_method,omitempty" db:"payment_method"`
	Notes           *string       `json:"notes,omitempty" db:"notes"`
	CreatedAt       time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at" db:"updated_at"`
	CreatedBy       *int64        `json:"created_by,omitempty" db:"created_by"`
	UpdatedBy       *int64        `json:"updated_by,omitempty" db:"updated_by"`
	
	// Related data
	Customer       *Customer       `json:"customer,omitempty" db:"-"`
	OrderItems     []*OrderItem    `json:"order_items,omitempty" db:"-"`
	PaymentHistory []*PaymentHistory `json:"payment_history,omitempty" db:"-"`
}

// OrderItem model đại diện cho bảng order_items
type OrderItem struct {
	ID             int64     `json:"id" db:"id"`
	OrderID        int64     `json:"order_id" db:"order_id"`
	ProductID      int64     `json:"product_id" db:"product_id"`
	Quantity       float64   `json:"quantity" db:"quantity"`
	UnitPrice      float64   `json:"unit_price" db:"unit_price"`
	DiscountPercent float64  `json:"discount_percent" db:"discount_percent"`
	DiscountAmount float64   `json:"discount_amount" db:"discount_amount"`
	TotalPrice     float64   `json:"total_price" db:"total_price"`
	Notes          *string   `json:"notes,omitempty" db:"notes"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	CreatedBy      *int64    `json:"created_by,omitempty" db:"created_by"`
	
	// Related data
	Product *Product `json:"product,omitempty" db:"-"`
}

// PaymentHistory model đại diện cho bảng payment_history
type PaymentHistory struct {
	ID             int64     `json:"id" db:"id"`
	OrderID        int64     `json:"order_id" db:"order_id"`
	PaymentDate    time.Time `json:"payment_date" db:"payment_date"`
	PaymentAmount  float64   `json:"payment_amount" db:"payment_amount"`
	PaymentMethod  *string   `json:"payment_method,omitempty" db:"payment_method"`
	ReferenceNumber *string  `json:"reference_number,omitempty" db:"reference_number"`
	Notes          *string   `json:"notes,omitempty" db:"notes"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	CreatedBy      *int64    `json:"created_by,omitempty" db:"created_by"`
}

// CreateOrderRequest request tạo order mới
type CreateOrderRequest struct {
	CustomerID      *int64     `json:"customer_id,omitempty"`
	OrderDate       time.Time  `json:"order_date"`
	DeliveryDate    *time.Time `json:"delivery_date,omitempty"`
	DeliveryAddress *string    `json:"delivery_address,omitempty"`
	ContactPerson   *string    `json:"contact_person,omitempty"`
	ContactPhone    *string    `json:"contact_phone,omitempty"`
	TaxAmount       float64    `json:"tax_amount"`
	DiscountAmount  float64    `json:"discount_amount"`
	PaymentMethod   *string    `json:"payment_method,omitempty"`
	Notes           *string    `json:"notes,omitempty"`
	OrderItems      []CreateOrderItemRequest `json:"order_items" validate:"required,min=1"`
}

// CreateOrderItemRequest request tạo order item
type CreateOrderItemRequest struct {
	ProductID       int64   `json:"product_id" validate:"required"`
	Quantity        float64 `json:"quantity" validate:"required,gt=0"`
	UnitPrice       float64 `json:"unit_price" validate:"required,gt=0"`
	DiscountPercent float64 `json:"discount_percent"`
	Notes           *string `json:"notes,omitempty"`
}

// UpdateOrderRequest request cập nhật order
type UpdateOrderRequest struct {
	DeliveryDate    *time.Time `json:"delivery_date,omitempty"`
	DeliveryAddress *string    `json:"delivery_address,omitempty"`
	ContactPerson   *string    `json:"contact_person,omitempty"`
	ContactPhone    *string    `json:"contact_phone,omitempty"`
	TaxAmount       *float64   `json:"tax_amount,omitempty"`
	DiscountAmount  *float64   `json:"discount_amount,omitempty"`
	OrderStatus     *OrderStatus `json:"order_status,omitempty"`
	PaymentMethod   *string    `json:"payment_method,omitempty"`
	Notes           *string    `json:"notes,omitempty"`
}

// CreatePaymentRequest request tạo payment
type CreatePaymentRequest struct {
	PaymentDate     time.Time `json:"payment_date" validate:"required"`
	PaymentAmount   float64   `json:"payment_amount" validate:"required,gt=0"`
	PaymentMethod   *string   `json:"payment_method,omitempty"`
	ReferenceNumber *string   `json:"reference_number,omitempty"`
	Notes           *string   `json:"notes,omitempty"`
}

// OrderSearchRequest request tìm kiếm order
type OrderSearchRequest struct {
	OrderCode     *string      `json:"order_code,omitempty"`
	CustomerID    *int64       `json:"customer_id,omitempty"`
	OrderStatus   *OrderStatus `json:"order_status,omitempty"`
	PaymentStatus *PaymentStatus `json:"payment_status,omitempty"`
	DateFrom      *time.Time   `json:"date_from,omitempty"`
	DateTo        *time.Time   `json:"date_to,omitempty"`
	Page          int          `json:"page"`
	Limit         int          `json:"limit"`
} 