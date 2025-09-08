package services

import (
	"bytes"
	"fmt"
	"strconv"
	"time"

	"steel-pos-backend/internal/models"

	"github.com/jung-kurt/gofpdf"
)

type PDFService struct{}

func NewPDFService() *PDFService {
	return &PDFService{}
}

// GenerateInvoicePDF generates a PDF for the given invoice
func (s *PDFService) GenerateInvoicePDF(invoice *models.Invoice) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")

	// Add Noto Sans font that supports Vietnamese
	pdf.AddUTF8Font("NotoSans", "", "fonts/NotoSans-Regular.ttf")
	pdf.AddUTF8Font("NotoSans", "B", "fonts/NotoSans-Bold.ttf")

	pdf.AddPage()
	pdf.SetAutoPageBreak(true, 0)

	// Set font - using Noto Sans that supports Vietnamese
	pdf.SetFont("NotoSans", "B", 22)

	pdf.SetTextColor(0, 0, 0)
	pdf.CellFormat(0, 12, "ĐẠI LÝ SẮT THÉP KIÊN PHƯỚC", "", 0, "C", false, 0, "")
	pdf.Ln(10)

	pdf.SetFont("NotoSans", "", 14)
	pdf.SetTextColor(100, 100, 100)
	pdf.CellFormat(0, 6, "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "", 0, "C", false, 0, "")

	pdf.SetFont("NotoSans", "", 12)
	pdf.CellFormat(0, 6, "Địa chỉ: Trường Sơn Đức Thọ Hà Tĩnh", "", 0, "C", false, 0, "")
	pdf.Ln(6)
	pdf.CellFormat(0, 6, "Điện thoại: 0972851015 - 0974498918", "", 0, "C", false, 0, "")
	pdf.Ln(8)

	// Invoice title with better styling
	pdf.SetFont("NotoSans", "B", 22)
	pdf.SetTextColor(0, 0, 0)
	pdf.CellFormat(0, 12, "HOÁ ĐƠN BÁN HÀNG", "", 0, "C", false, 0, "")
	pdf.Ln(15)

	pdf.SetFont("NotoSans", "", 12)

	// Customer info in two columns (50% each)
	pdf.Cell(95, 6, fmt.Sprintf("Tên khách hàng: %s", invoice.CustomerName))
	pdf.Cell(95, 6, fmt.Sprintf("Số điện thoại: %s", invoice.CustomerPhone))
	pdf.Ln(6)

	if invoice.CustomerAddress != nil && *invoice.CustomerAddress != "" {
		pdf.Cell(40, 6, fmt.Sprintf("Địa chỉ: %s", *invoice.CustomerAddress))
		pdf.Ln(6)
	}
	pdf.Ln(3)

	pdf.Cell(95, 6, fmt.Sprintf("Mã hoá đơn: %s", invoice.InvoiceCode))
	pdf.Cell(95, 6, fmt.Sprintf("Ngày tạo: %s", invoice.CreatedAt.Format("02/01/2006")))
	pdf.Ln(6)

	pdf.SetFont("NotoSans", "B", 10)
	pdf.SetTextColor(0, 0, 0)
	pdf.Cell(0, 6, "Ghi chú:")
	pdf.Ln(6)
	hasNotes := false
	if invoice.Notes != nil && *invoice.Notes != "" {
		pdf.SetFont("NotoSans", "", 10)
		pdf.SetTextColor(100, 100, 100)
		pdf.Cell(0, 6, *invoice.Notes)
		pdf.Ln(10)
		hasNotes = true
	}
	if hasNotes {
		pdf.Ln(12)
	} else {
		pdf.Ln(6)
	}

	// Table header with better colors - centered
	pdf.SetFont("NotoSans", "B", 10)
	pdf.SetFillColor(52, 144, 220)  // Blue header
	pdf.SetTextColor(255, 255, 255) // White text

	// Column widths - first column takes remaining space
	w2 := 40.0 // Variant
	w3 := 20.0 // Quantity
	w4 := 30.0 // Unit price
	w5 := 30.0 // Total

	// Full width minus margins (210mm - 20mm margins = 190mm)
	fullWidth := 190.0
	w1 := fullWidth - w2 - w3 - w4 - w5 // Product name (remaining space)

	// Start from left margin (10mm)
	startX := 10.0
	pdf.SetX(startX)

	pdf.CellFormat(w1, 10, "Sản phẩm", "1", 0, "C", true, 0, "")
	pdf.CellFormat(w2, 10, "Phân loại", "1", 0, "C", true, 0, "")
	pdf.CellFormat(w3, 10, "Số lượng", "1", 0, "C", true, 0, "")
	pdf.CellFormat(w4, 10, "Đơn giá", "1", 0, "C", true, 0, "")
	pdf.CellFormat(w5, 10, "Thành tiền", "1", 1, "C", true, 0, "")

	// Table content with alternating row colors
	pdf.SetFont("NotoSans", "", 9)
	pdf.SetTextColor(0, 0, 0)

	for _, item := range invoice.Items {
		pdf.SetFillColor(255, 255, 255)
		pdf.SetX(startX) // Reset X position for each row

		// Product name (with word wrap)
		pdf.CellFormat(w1, 10, item.ProductName, "1", 0, "L", true, 0, "")
		pdf.CellFormat(w2, 10, item.VariantName, "1", 0, "L", true, 0, "")
		pdf.CellFormat(w3, 10, strconv.Itoa(int(item.Quantity)), "1", 0, "C", true, 0, "")
		pdf.CellFormat(w4, 10, formatCurrency(item.UnitPrice), "1", 0, "R", true, 0, "")
		pdf.CellFormat(w5, 10, formatCurrency(item.TotalPrice), "1", 1, "R", true, 0, "")
	}

	// Total row - single cell spanning all columns
	pdf.SetFont("NotoSans", "B", 10)
	pdf.SetTextColor(0, 0, 0)
	pdf.SetX(startX) // Reset X position for total row

	// Calculate total width of all columns
	totalWidth := w1 + w2 + w3 + w4 + w5
	pdf.CellFormat(totalWidth, 10, fmt.Sprintf("Thành tiền: %s", formatCurrency(invoice.TotalAmount)), "1", 1, "R", true, 0, "")

	pdf.Ln(8)

	// Summary section with better styling
	pdf.SetFont("NotoSans", "", 11)
	pdf.SetTextColor(0, 0, 0)

	// Summary table without borders - full width
	pdf.SetFont("NotoSans", "", 11)
	pdf.SetTextColor(0, 0, 0)

	// Use same full width as product table
	summaryW1 := w1                // First column takes remaining space
	summaryW2 := w2 + w3 + w4 + w5 // Second column takes fixed width columns

	pdf.SetX(startX)

	// Discount row
	if invoice.DiscountAmount > 0 {
		pdf.CellFormat(summaryW1, 6, "Giảm giá:", "", 0, "L", false, 0, "")
		pdf.CellFormat(summaryW2, 6, "-"+formatCurrency(invoice.DiscountAmount), "", 1, "R", false, 0, "")
		pdf.SetX(startX) // Reset X position for next row
	}

	// Total row with highlight
	pdf.SetFont("NotoSans", "B", 14)
	pdf.SetTextColor(220, 38, 38) // Red color for total
	pdf.CellFormat(summaryW1, 8, "TỔNG CỘNG:", "", 0, "L", false, 0, "")
	pdf.CellFormat(summaryW2, 8, formatCurrency(invoice.TotalAmount), "", 1, "R", false, 0, "")
	pdf.SetX(startX) // Reset X position for next row

	// Paid amount row
	if invoice.PaidAmount > 0 {
		pdf.SetFont("NotoSans", "", 11)
		pdf.SetTextColor(0, 0, 0)
		pdf.CellFormat(summaryW1, 6, "Đã thanh toán:", "", 0, "L", false, 0, "")
		pdf.CellFormat(summaryW2, 6, formatCurrency(invoice.PaidAmount), "", 1, "R", false, 0, "")
		pdf.SetX(startX) // Reset X position for next row
	}

	// Remaining amount row
	if invoice.PaymentStatus == "partial" {
		remaining := invoice.TotalAmount - invoice.PaidAmount
		pdf.SetFont("NotoSans", "B", 11)
		pdf.SetTextColor(220, 38, 38) // Red color for remaining
		pdf.CellFormat(summaryW1, 6, "Còn lại:", "", 0, "L", false, 0, "")
		pdf.CellFormat(summaryW2, 6, formatCurrency(remaining), "", 1, "R", false, 0, "")
	}
	pdf.Ln(15)

	pdf.SetY(230) // Position near bottom of A4 page

	pdf.SetFont("NotoSans", "", 12)
	pdf.SetTextColor(0, 0, 0)

	// Date row with space between
	pdf.CellFormat(0, 6, fmt.Sprintf("Ngày %s, Tháng %s, Năm %s", time.Now().Format("02"), time.Now().Format("01"), time.Now().Format("2006")), "", 0, "R", false, 0, "")

	pdf.Ln(6)

	// Signature section with space between
	pdf.SetTextColor(100, 100, 100)
	pdf.SetFont("NotoSans", "", 14)
	pdf.CellFormat(95, 6, "Khách hàng", "", 0, "C", false, 0, "")
	pdf.CellFormat(95, 6, "Người bán", "", 0, "C", false, 0, "")
	pdf.Ln(6)

	pdf.Ln(20)

	// Generate PDF bytes
	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// formatCurrency formats a float64 as Vietnamese currency
func formatCurrency(amount float64) string {
	return fmt.Sprintf("%.0f VNĐ", amount)
}

// getStatusText returns Vietnamese text for invoice status
func getStatusText(status string) string {
	switch status {
	case "confirmed":
		return "Đã xác nhận"
	case "draft":
		return "Nháp"
	case "cancelled":
		return "Đã hủy"
	default:
		return "Không xác định"
	}
}

// getPaymentStatusText returns Vietnamese text for payment status
func getPaymentStatusText(status string) string {
	switch status {
	case "paid":
		return "Đã thanh toán"
	case "pending":
		return "Chờ thanh toán"
	case "partial":
		return "Thanh toán một phần"
	case "refunded":
		return "Đã hoàn tiền"
	default:
		return "Không xác định"
	}
}
