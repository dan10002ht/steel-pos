package services

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"

	"steel-pos-backend/internal/models"

	"github.com/jung-kurt/gofpdf"
)

// Bank account constants for VietQR
const (
	bankBIN   = "970436"          // Vietcombank BIN
	accountNo = "YOUR_ACCOUNT_NO" // TODO: Thay bằng số tài khoản thực
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
	pdf := gofpdf.New("P", "mm", "A5", "")

	// Add NotoSans font that supports Vietnamese
	fontAvailable := true
	pdf.AddUTF8Font("NotoSans", "", "fonts/NotoSans-Regular.ttf")
	pdf.AddUTF8Font("NotoSans", "B", "fonts/NotoSans-Bold.ttf")

	pdf.AddPage()
	pdf.SetAutoPageBreak(true, 10)

	// Start from left margin (8mm for A5)
	startX := 8.0
	pageWidth := 132.0 // A5: 148mm - 16mm margins

	// =====================================================
	// HEADER SECTION - Logo, Title, Invoice Info
	// =====================================================
	
	// Logo placeholder box (left side) - scaled for A5
	pdf.SetFillColor(220, 220, 220) // Light gray for logo placeholder
	pdf.Rect(startX, 8, 35, 18, "D") // Draw rectangle for LOGO
	s.setFont(pdf, "B", 10, fontAvailable)
	pdf.SetXY(startX, 14)
	pdf.SetTextColor(100, 100, 100)
	pdf.Cell(35, 8, "LOGO")

	// Title "HOÁ ĐƠN BÁN HÀNG" (center)
	pdf.SetXY(startX + 40, 8)
	s.setFont(pdf, "B", 12, fontAvailable)
	pdf.SetTextColor(0, 0, 0)
	pdf.Cell(55, 7, "HOÁ ĐƠN BÁN HÀNG")

	// Subtitle with date
	pdf.SetXY(startX + 40, 15)
	s.setFont(pdf, "", 7, fontAvailable)
	pdf.SetTextColor(100, 100, 100)
	invoiceDate := "Ngày dd tháng mm năm yyyy"
	if !invoice.CreatedAt.IsZero() {
		invoiceDate = fmt.Sprintf("Ngày %s tháng %s năm %s",
			invoice.CreatedAt.Format("02"),
			invoice.CreatedAt.Format("01"),
			invoice.CreatedAt.Format("2006"))
	}
	pdf.Cell(55, 5, invoiceDate)

	// QR Code payment (top-right corner)
	remaining := invoice.TotalAmount - invoice.PaidAmount
	if remaining > 0 {
		qrSize := 22.0
		addInfo := fmt.Sprintf("Thanh toan %s", invoice.InvoiceCode)
		qrURL := fmt.Sprintf("https://img.vietqr.io/image/%s-%s-compact.png?amount=%d&addInfo=%s",
			bankBIN, accountNo, int64(remaining), url.QueryEscape(addInfo))

		resp, err := http.Get(qrURL)
		if err == nil && resp.StatusCode == http.StatusOK {
			defer resp.Body.Close()
			qrData, readErr := io.ReadAll(resp.Body)
			if readErr == nil && len(qrData) > 0 {
				qrReader := bytes.NewReader(qrData)
				imgName := fmt.Sprintf("qr_%s", invoice.InvoiceCode)
				pdf.RegisterImageOptionsReader(imgName, gofpdf.ImageOptions{ImageType: "PNG"}, qrReader)
				qrX := startX + pageWidth - qrSize
				pdf.ImageOptions(imgName, qrX, 6, qrSize, qrSize, false, gofpdf.ImageOptions{ImageType: "PNG"}, 0, "")
			}
		}
	}

	pdf.SetY(30)

	// =====================================================
	// COMPANY INFO SECTION
	// =====================================================

	// Horizontal line
	pdf.SetDrawColor(0, 0, 0)
	pdf.Line(startX, 30, startX+pageWidth, 30)

	pdf.SetY(33)
	s.setFont(pdf, "B", 9, fontAvailable)
	pdf.SetTextColor(0, 0, 0)
	pdf.Cell(0, 5, "NHÀ MÁY TÔN THÉP KIÊN PHƯỚC")
	pdf.Ln(4)

	s.setFont(pdf, "", 7, fontAvailable)
	pdf.Cell(0, 4, "Địa chỉ: Xã Đức Minh - Tỉnh Hà Tĩnh")
	pdf.Ln(3)
	pdf.Cell(0, 4, "SĐT: 0972851015 - 0974498918")
	pdf.Ln(5)

	// Horizontal line
	pdf.Line(startX, pdf.GetY(), startX+pageWidth, pdf.GetY())
	pdf.Ln(4)

	// =====================================================
	// CUSTOMER INFO SECTION
	// =====================================================

	s.setFont(pdf, "", 8, fontAvailable)
	pdf.Cell(0, 4, fmt.Sprintf("Họ tên người mua: %s", invoice.CustomerName))
	pdf.Ln(4)

	customerPhone := ""
	if invoice.CustomerPhone != "" {
		customerPhone = invoice.CustomerPhone
	}
	pdf.Cell(0, 4, fmt.Sprintf("Số điện thoại: %s", customerPhone))
	pdf.Ln(4)

	customerAddress := "Địa chỉ"
	if invoice.CustomerAddress != nil && *invoice.CustomerAddress != "" {
		customerAddress = fmt.Sprintf("Địa chỉ: %s", *invoice.CustomerAddress)
	} else {
		customerAddress = "Địa chỉ: Địa chỉ"
	}
	pdf.Cell(0, 4, customerAddress)
	pdf.Ln(4)

	paymentMethod := "Chuyển khoản"
	if invoice.PaymentStatus == "paid" {
		paymentMethod = "Chuyển khoản"
	} else if invoice.PaymentStatus == "partial" {
		paymentMethod = "Chuyển khoản"
	}
	pdf.Cell(0, 4, fmt.Sprintf("Hình thức thanh toán: %s", paymentMethod))
	pdf.Ln(5)

	// =====================================================
	// PRODUCTS TABLE
	// =====================================================

	// Table header
	s.setFont(pdf, "B", 7, fontAvailable)
	pdf.SetFillColor(255, 255, 255)
	pdf.SetTextColor(0, 0, 0)
	pdf.SetDrawColor(0, 0, 0)

	// Column widths for A5
	colSTT := 10.0   // STT
	colName := 45.0  // Tên hàng hoá
	colUnit := 18.0  // Đơn vị
	colQty := 15.0   // Số lượng
	colPrice := 22.0 // Đơn giá
	colTotal := 22.0 // Thành tiền

	pdf.SetX(startX)
	pdf.CellFormat(colSTT, 6, "STT", "1", 0, "C", true, 0, "")
	pdf.CellFormat(colName, 6, "Tên hàng hoá", "1", 0, "C", true, 0, "")
	pdf.CellFormat(colUnit, 6, "Đơn vị", "1", 0, "C", true, 0, "")
	pdf.CellFormat(colQty, 6, "SL", "1", 0, "C", true, 0, "")
	pdf.CellFormat(colPrice, 6, "Đơn giá", "1", 0, "C", true, 0, "")
	pdf.CellFormat(colTotal, 6, "Thành tiền", "1", 1, "C", true, 0, "")

	// Table content rows - iterate through invoice items
	s.setFont(pdf, "", 7, fontAvailable)
	for i, item := range invoice.Items {
		pdf.SetX(startX)

		// STT
		pdf.CellFormat(colSTT, 6, strconv.Itoa(i+1), "1", 0, "C", true, 0, "")

		// Product name with variant and notes
		productName := item.ProductName
		if item.VariantName != "" {
			productName = fmt.Sprintf("%s (%s)", item.ProductName, item.VariantName)
		}
		if item.ProductNotes != nil && *item.ProductNotes != "" {
			productName = fmt.Sprintf("%s - %s", productName, *item.ProductNotes)
		}
		pdf.CellFormat(colName, 6, productName, "1", 0, "L", true, 0, "")

		// Unit (using variant name or default)
		unit := item.VariantName
		if unit == "" {
			unit = "Cai"
		}
		pdf.CellFormat(colUnit, 6, unit, "1", 0, "C", true, 0, "")

		// Quantity
		pdf.CellFormat(colQty, 6, strconv.Itoa(int(item.Quantity)), "1", 0, "C", true, 0, "")

		// Unit Price
		pdf.CellFormat(colPrice, 6, s.FormatCurrency(item.UnitPrice), "1", 0, "R", true, 0, "")

		// Total Price
		pdf.CellFormat(colTotal, 6, s.FormatCurrency(item.TotalPrice), "1", 1, "R", true, 0, "")
	}

	// Add empty rows to match the template (reduced for A5)
	emptyRows := 4 - len(invoice.Items)
	if emptyRows < 0 {
		emptyRows = 0
	}
	for i := 0; i < emptyRows; i++ {
		pdf.SetX(startX)
		pdf.CellFormat(colSTT, 6, "", "1", 0, "C", true, 0, "")
		pdf.CellFormat(colName, 6, "", "1", 0, "L", true, 0, "")
		pdf.CellFormat(colUnit, 6, "", "1", 0, "C", true, 0, "")
		pdf.CellFormat(colQty, 6, "", "1", 0, "C", true, 0, "")
		pdf.CellFormat(colPrice, 6, "", "1", 0, "R", true, 0, "")
		pdf.CellFormat(colTotal, 6, "", "1", 1, "R", true, 0, "")
	}

	// =====================================================
	// SUMMARY SECTION
	// =====================================================

	s.setFont(pdf, "B", 7, fontAvailable)

	// Total amount row
	pdf.SetX(startX)
	summaryLabelWidth := colSTT + colName + colUnit + colQty + colPrice
	pdf.CellFormat(summaryLabelWidth, 6, "Tổng số tiền cần thanh toán", "1", 0, "L", true, 0, "")
	pdf.CellFormat(colTotal, 6, s.FormatCurrency(invoice.TotalAmount), "1", 1, "R", true, 0, "")

	// Paid amount row
	pdf.SetX(startX)
	pdf.CellFormat(summaryLabelWidth, 6, "Đã thanh toán", "1", 0, "L", true, 0, "")
	paidAmountStr := s.FormatCurrency(invoice.PaidAmount)
	pdf.CellFormat(colTotal, 6, paidAmountStr, "1", 1, "R", true, 0, "")

	// Remaining amount row
	pdf.SetX(startX)
	pdf.CellFormat(summaryLabelWidth, 6, "Còn lại", "1", 0, "L", true, 0, "")
	remainingAmount := invoice.TotalAmount - invoice.PaidAmount
	remainingAmountStr := s.FormatCurrency(remainingAmount)
	pdf.CellFormat(colTotal, 6, remainingAmountStr, "1", 1, "R", true, 0, "")

	pdf.Ln(10)

	// =====================================================
	// SIGNATURE SECTION
	// =====================================================

	// Position signature section at bottom of page (A5 height is ~210mm)
	currentY := pdf.GetY()
	if currentY < 170 {
		pdf.SetY(170)
	}

	s.setFont(pdf, "", 9, fontAvailable)
	pdf.SetTextColor(0, 0, 0)

	// Two columns for signatures
	signatureWidth := pageWidth / 2

	pdf.SetX(startX)
	pdf.CellFormat(signatureWidth, 5, "Người mua hàng", "", 0, "C", false, 0, "")
	pdf.CellFormat(signatureWidth, 5, "Người bán hàng", "", 1, "C", false, 0, "")

	// Generate PDF bytes
	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
