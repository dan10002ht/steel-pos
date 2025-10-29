package services

import (
	"bytes"
	"fmt"
	"strconv"

	"steel-pos-backend/internal/models"

	"github.com/jung-kurt/gofpdf"
)

type PDFService struct{}

func NewPDFService() *PDFService {
	return &PDFService{}
}

// setFont sets the appropriate font based on availability
func (s *PDFService) setFont(pdf *gofpdf.Fpdf, style string, size float64, fontAvailable bool) {
	if fontAvailable {
		pdf.SetFont("NotoSans", style, size)
	} else {
		pdf.SetFont("Arial", style, size)
	}
}

func (s *PDFService) FormatCurrency(amount float64) string {
	// Convert to int to remove decimal places
	intAmount := int64(amount)
	
	// Format with thousand separators (dots for Vietnamese format)
	str := fmt.Sprintf("%d", intAmount)
	
	// Add dots as thousand separators from right to left
	if len(str) > 3 {
		var result string
		for i, char := range str {
			// Add dot before every 3 digits from the right
			if i > 0 && (len(str)-i)%3 == 0 {
				result += "."
			}
			result += string(char)
		}
		return result + " VNĐ"
	}
	
	return str + " VNĐ"
}

// GenerateInvoicePDF generates a PDF for the given invoice
func (s *PDFService) GenerateInvoicePDF(invoice *models.Invoice) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")

	// Add NotoSans font that supports Vietnamese
	fontAvailable := true
	pdf.AddUTF8Font("NotoSans", "", "fonts/NotoSans-Regular.ttf")
	pdf.AddUTF8Font("NotoSans", "B", "fonts/NotoSans-Bold.ttf")

	pdf.AddPage()
	pdf.SetAutoPageBreak(true, 15)

	// Start from left margin (10mm)
	startX := 10.0
	pageWidth := 190.0 // 210mm - 20mm margins

	// =====================================================
	// HEADER SECTION - Logo, Title, Invoice Info
	// =====================================================
	
	// Logo placeholder box (left side)
	pdf.SetFillColor(220, 220, 220) // Light gray for logo placeholder
	pdf.Rect(startX, 10, 50, 25, "D") // Draw rectangle for LOGO
	s.setFont(pdf, "B", 12, fontAvailable)
	pdf.SetXY(startX, 18)
	pdf.SetTextColor(100, 100, 100)
	pdf.Cell(50, 10, "LOGO")
	
	// Title "HOÁ ĐƠN BÁN HÀNG" (center)
	pdf.SetXY(startX + 60, 10)
	s.setFont(pdf, "B", 16, fontAvailable)
	pdf.SetTextColor(0, 0, 0)
	pdf.Cell(80, 8, "HOÁ ĐƠN BÁN HÀNG")
	
	// Subtitle with date
	pdf.SetXY(startX + 60, 18)
	s.setFont(pdf, "", 9, fontAvailable)
	pdf.SetTextColor(100, 100, 100)
	invoiceDate := "Ngày dd tháng mm năm yyyy"
	if !invoice.CreatedAt.IsZero() {
		invoiceDate = fmt.Sprintf("Ngày %s tháng %s năm %s", 
			invoice.CreatedAt.Format("02"), 
			invoice.CreatedAt.Format("01"), 
			invoice.CreatedAt.Format("2006"))
	}
	pdf.Cell(80, 6, invoiceDate)
	
	// Invoice Code and Number (right side)
	pdf.SetXY(startX + 140, 10)
	s.setFont(pdf, "", 9, fontAvailable)
	pdf.SetTextColor(0, 0, 0)
	pdf.Cell(50, 6, fmt.Sprintf("Mã hóa đơn: %s", invoice.InvoiceCode))
	pdf.SetXY(startX + 140, 16)
	pdf.Cell(50, 6, "Số:")
	
	pdf.SetY(40)

	// =====================================================
	// COMPANY INFO SECTION
	// =====================================================
	
	// Horizontal line
	pdf.SetDrawColor(0, 0, 0)
	pdf.Line(startX, 40, startX + pageWidth, 40)
	
	pdf.SetY(45)
	s.setFont(pdf, "B", 11, fontAvailable)
	pdf.SetTextColor(0, 0, 0)
	pdf.Cell(0, 6, "NHÀ MÁY TÔN THÉP KIÊN PHƯỚC")
	pdf.Ln(5)
	
	s.setFont(pdf, "", 9, fontAvailable)
	pdf.Cell(0, 5, "Địa chỉ: Xã Đức Minh - Tỉnh Hà Tĩnh")
	pdf.Ln(4)
	pdf.Cell(0, 5, "Số điện thoại: 0972851015 - 0974498918")
	pdf.Ln(6)
	
	// Horizontal line
	pdf.Line(startX, pdf.GetY(), startX + pageWidth, pdf.GetY())
	pdf.Ln(6)

	// =====================================================
	// CUSTOMER INFO SECTION
	// =====================================================
	
	s.setFont(pdf, "", 10, fontAvailable)
	pdf.Cell(0, 5, fmt.Sprintf("Họ tên người mua: %s", invoice.CustomerName))
	pdf.Ln(5)
	
	customerPhone := ""
	if invoice.CustomerPhone != "" {
		customerPhone = invoice.CustomerPhone
	}
	pdf.Cell(0, 5, fmt.Sprintf("Số điện thoại: %s", customerPhone))
	pdf.Ln(5)
	
	customerAddress := "Địa chỉ"
	if invoice.CustomerAddress != nil && *invoice.CustomerAddress != "" {
		customerAddress = fmt.Sprintf("Địa chỉ: %s", *invoice.CustomerAddress)
	} else {
		customerAddress = "Địa chỉ: Địa chỉ"
	}
	pdf.Cell(0, 5, customerAddress)
	pdf.Ln(5)
	
	paymentMethod := "Chuyển khoản"
	if invoice.PaymentStatus == "paid" {
		paymentMethod = "Chuyển khoản"
	} else if invoice.PaymentStatus == "partial" {
		paymentMethod = "Chuyển khoản"
	}
	pdf.Cell(0, 5, fmt.Sprintf("Hình thức thanh toán: %s", paymentMethod))
	pdf.Ln(8)

	// =====================================================
	// PRODUCTS TABLE
	// =====================================================
	
	// Table header
	s.setFont(pdf, "B", 9, fontAvailable)
	pdf.SetFillColor(255, 255, 255)
	pdf.SetTextColor(0, 0, 0)
	pdf.SetDrawColor(0, 0, 0)
	
	// Column widths matching the image
	colSTT := 15.0      // STT
	colName := 65.0     // Tên hàng hoá
	colUnit := 25.0     // Đơn vị
	colQty := 20.0      // Số lượng
	colPrice := 30.0    // Đơn giá
	colTotal := 35.0    // Thành tiền
	
	pdf.SetX(startX)
	pdf.CellFormat(colSTT, 8, "STT", "1", 0, "C", true, 0, "")
	pdf.CellFormat(colName, 8, "Tên hàng hoá", "1", 0, "C", true, 0, "")
	pdf.CellFormat(colUnit, 8, "Đơn vị", "1", 0, "C", true, 0, "")
	pdf.CellFormat(colQty, 8, "Số lượng", "1", 0, "C", true, 0, "")
	pdf.CellFormat(colPrice, 8, "Đơn giá", "1", 0, "C", true, 0, "")
	pdf.CellFormat(colTotal, 8, "Thành tiền", "1", 1, "C", true, 0, "")
	
	// Table content rows - iterate through invoice items
	for i, item := range invoice.Items {
		pdf.SetX(startX)
		
		// STT
		pdf.CellFormat(colSTT, 8, strconv.Itoa(i+1), "1", 0, "C", true, 0, "")
		
		// Product name with variant
		productName := item.ProductName
		if item.VariantName != "" {
			productName = fmt.Sprintf("%s (%s)", item.ProductName, item.VariantName)
		}
		pdf.CellFormat(colName, 8, productName, "1", 0, "L", true, 0, "")
		
		// Unit (using variant name or default)
		unit := item.VariantName
		if unit == "" {
			unit = "Cai"
		}
		pdf.CellFormat(colUnit, 8, unit, "1", 0, "C", true, 0, "")
		
		// Quantity
		pdf.CellFormat(colQty, 8, strconv.Itoa(int(item.Quantity)), "1", 0, "C", true, 0, "")
		
		// Unit Price
		pdf.CellFormat(colPrice, 8, s.FormatCurrency(item.UnitPrice), "1", 0, "R", true, 0, "")
		
		// Total Price
		pdf.CellFormat(colTotal, 8, s.FormatCurrency(item.TotalPrice), "1", 1, "R", true, 0, "")
	}
	
	// Add empty rows to match the template (total 8 rows in the image)
	emptyRows := 6 - len(invoice.Items)
	if emptyRows < 0 {
		emptyRows = 0
	}
	for i := 0; i < emptyRows; i++ {
		pdf.SetX(startX)
		pdf.CellFormat(colSTT, 8, "", "1", 0, "C", true, 0, "")
		pdf.CellFormat(colName, 8, "", "1", 0, "L", true, 0, "")
		pdf.CellFormat(colUnit, 8, "", "1", 0, "C", true, 0, "")
		pdf.CellFormat(colQty, 8, "", "1", 0, "C", true, 0, "")
		pdf.CellFormat(colPrice, 8, "", "1", 0, "R", true, 0, "")
		pdf.CellFormat(colTotal, 8, "", "1", 1, "R", true, 0, "")
	}

	// =====================================================
	// SUMMARY SECTION
	// =====================================================
	
	s.setFont(pdf, "B", 10, fontAvailable)
	
	// Total amount row
	pdf.SetX(startX)
	summaryLabelWidth := colSTT + colName + colUnit + colQty + colPrice
	pdf.CellFormat(summaryLabelWidth, 8, "Tổng số tiền cần thanh toán", "1", 0, "L", true, 0, "")
	pdf.CellFormat(colTotal, 8, s.FormatCurrency(invoice.TotalAmount), "1", 1, "R", true, 0, "")
	
	// Paid amount row
	pdf.SetX(startX)
	pdf.CellFormat(summaryLabelWidth, 8, "Đã thanh toán", "1", 0, "L", true, 0, "")
	paidAmountStr := s.FormatCurrency(invoice.PaidAmount)
	pdf.CellFormat(colTotal, 8, paidAmountStr, "1", 1, "R", true, 0, "")
	
	// Remaining amount row
	pdf.SetX(startX)
	pdf.CellFormat(summaryLabelWidth, 8, "Còn lại", "1", 0, "L", true, 0, "")
	remaining := invoice.TotalAmount - invoice.PaidAmount
	remainingAmountStr := s.FormatCurrency(remaining)
	pdf.CellFormat(colTotal, 8, remainingAmountStr, "1", 1, "R", true, 0, "")
	
	pdf.Ln(15)

	// =====================================================
	// SIGNATURE SECTION
	// =====================================================
	
	// Position signature section at bottom of page
	currentY := pdf.GetY()
	if currentY < 240 {
		pdf.SetY(240)
	}
	
	s.setFont(pdf, "", 11, fontAvailable)
	pdf.SetTextColor(0, 0, 0)
	
	// Two columns for signatures
	signatureWidth := pageWidth / 2
	
	pdf.SetX(startX)
	pdf.CellFormat(signatureWidth, 6, "Người mua hàng", "", 0, "C", false, 0, "")
	pdf.CellFormat(signatureWidth, 6, "Người bán hàng", "", 1, "C", false, 0, "")

	// Generate PDF bytes
	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
