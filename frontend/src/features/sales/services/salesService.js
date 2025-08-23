// Mock API service for sales
class SalesService {
  constructor() {
    this.baseURL = "/api/sales";
  }

  // Create new invoice
  async createInvoice(invoiceData) {
    try {
      // Simulate API call
      const response = await fetch(`${this.baseURL}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  }

  // Get invoices list
  async getInvoices(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/invoices?${queryString}`);

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  }

  // Get invoice by ID
  async getInvoiceById(id) {
    try {
      const response = await fetch(`${this.baseURL}/invoices/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch invoice");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw error;
    }
  }

  // Update invoice
  async updateInvoice(id, updateData) {
    try {
      const response = await fetch(`${this.baseURL}/invoices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update invoice");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  }

  // Delete invoice
  async deleteInvoice(id) {
    try {
      const response = await fetch(`${this.baseURL}/invoices/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }

      return true;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  }

  // Get sales statistics
  async getSalesStats(dateRange) {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dateRange),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sales stats");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching sales stats:", error);
      throw error;
    }
  }

  // Mock data for development
  getMockInvoices() {
    return [
      {
        id: "INV-001",
        customerName: "Nguyễn Văn A",
        customerPhone: "0123456789",
        items: [
          {
            productId: 1,
            name: "Thép hộp 40x40",
            quantity: 10,
            price: 50000,
            total: 500000,
          },
          {
            productId: 2,
            name: "Thép tấm 3mm",
            quantity: 5,
            price: 80000,
            total: 400000,
          },
        ],
        subtotal: 900000,
        tax: 90000,
        total: 990000,
        status: "completed",
        paymentStatus: "paid",
        createdAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "INV-002",
        customerName: "Trần Thị B",
        customerPhone: "0987654321",
        items: [
          {
            productId: 3,
            name: "Thép ống 21",
            quantity: 8,
            price: 60000,
            total: 480000,
          },
        ],
        subtotal: 480000,
        tax: 48000,
        total: 528000,
        status: "pending",
        paymentStatus: "partial",
        createdAt: "2024-01-15T14:20:00Z",
      },
    ];
  }
}

export default new SalesService();
