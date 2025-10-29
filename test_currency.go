package main

import (
	"fmt"
)

func formatCurrency(amount float64) string {
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

func main() {
	testCases := []float64{300000, 1500000, 50000, 1234567, 1000000}
	for _, amount := range testCases {
		fmt.Printf("%.0f -> %s\n", amount, formatCurrency(amount))
	}
}
