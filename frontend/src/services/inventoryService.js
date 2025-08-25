// Mock data cho inventory
let inventoryData = {
  product_1: {
    "Phi 12": { quantity: 100, unit: "m" },
    "Phi 16": { quantity: 150, unit: "m" },
    "Phi 20": { quantity: 80, unit: "m" },
  },
  product_2: {
    "Tấm 3mm": { quantity: 50, unit: "tấm" },
    "Tấm 5mm": { quantity: 30, unit: "tấm" },
  },
};

// Mock data cho import orders
let importOrders = [
  {
    id: "IO001",
    supplier: "Công ty Thép ABC",
    importDate: "2024-01-15",
    totalValue: 50000000,
    status: "pending",
    products: [
      {
        productId: "product_1",
        variant: "Phi 12",
        quantity: 20,
        unitPrice: 50000,
      },
      {
        productId: "product_1",
        variant: "Phi 16",
        quantity: 15,
        unitPrice: 60000,
      },
    ],
  },
];

class InventoryService {
  // Tính toán tồn kho mới
  calculateNewInventory(productId, variant, importQuantity) {
    const currentInventory = inventoryData[productId]?.[variant]?.quantity || 0;
    const newInventory = currentInventory + importQuantity;

    return {
      oldQuantity: currentInventory,
      newQuantity: newInventory,
      importQuantity: importQuantity,
    };
  }

  // Cập nhật inventory sau khi phê duyệt
  updateInventoryAfterApproval(importOrderId) {
    const order = importOrders.find((o) => o.id === importOrderId);
    if (!order || order.status !== "pending") {
      throw new Error("Order không tồn tại hoặc đã được phê duyệt");
    }

    // Cập nhật inventory cho từng sản phẩm
    order.products.forEach((product) => {
      const { productId, variant, quantity } = product;

      if (!inventoryData[productId]) {
        inventoryData[productId] = {};
      }

      if (!inventoryData[productId][variant]) {
        inventoryData[productId][variant] = {
          quantity: 0,
          unit: product.unit || "m",
        };
      }

      inventoryData[productId][variant].quantity += quantity;
    });

    // Cập nhật status của order
    order.status = "approved";

    return {
      success: true,
      message: "Cập nhật inventory thành công",
      updatedInventory: inventoryData,
    };
  }

  // Lấy thông tin inventory hiện tại
  getCurrentInventory(productId, variant) {
    return inventoryData[productId]?.[variant] || { quantity: 0, unit: "m" };
  }

  // Lấy tất cả inventory
  getAllInventory() {
    return inventoryData;
  }

  // Kiểm tra inventory có đủ không
  checkInventoryAvailability(productId, variant, requiredQuantity) {
    const currentQuantity = this.getCurrentInventory(
      productId,
      variant
    ).quantity;
    return {
      available: currentQuantity >= requiredQuantity,
      currentQuantity: currentQuantity,
      requiredQuantity: requiredQuantity,
      shortage: Math.max(0, requiredQuantity - currentQuantity),
    };
  }

  // Tạo import order mới
  createImportOrder(orderData) {
    const newOrder = {
      id: `IO${String(importOrders.length + 1).padStart(3, "0")}`,
      ...orderData,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    importOrders.push(newOrder);
    return newOrder;
  }

  // Lấy danh sách import orders
  getImportOrders(filters = {}) {
    let filteredOrders = [...importOrders];

    // Filter by status
    if (filters.status) {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === filters.status
      );
    }

    // Filter by supplier
    if (filters.supplier) {
      filteredOrders = filteredOrders.filter((order) =>
        order.supplier.toLowerCase().includes(filters.supplier.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      filteredOrders = filteredOrders.filter((order) => {
        const orderDate = new Date(order.importDate);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Search
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.supplier.toLowerCase().includes(searchTerm) ||
          order.id.toLowerCase().includes(searchTerm)
      );
    }

    return filteredOrders;
  }

  // Phê duyệt import order
  approveImportOrder(orderId, approvalNote = "") {
    try {
      const result = this.updateInventoryAfterApproval(orderId);
      return {
        success: true,
        message: "Phê duyệt thành công",
        orderId: orderId,
        approvalNote: approvalNote,
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Xóa import order
  deleteImportOrder(orderId) {
    const orderIndex = importOrders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error("Order không tồn tại");
    }

    const order = importOrders[orderIndex];
    if (order.status === "approved") {
      throw new Error("Không thể xóa đơn đã phê duyệt");
    }

    importOrders.splice(orderIndex, 1);
    return {
      success: true,
      message: "Xóa đơn nhập hàng thành công",
    };
  }

  // Sửa import order
  updateImportOrder(orderId, updatedData) {
    const orderIndex = importOrders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error("Order không tồn tại");
    }

    const order = importOrders[orderIndex];
    if (order.status === "approved") {
      throw new Error("Không thể sửa đơn đã phê duyệt");
    }

    importOrders[orderIndex] = {
      ...order,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: "Cập nhật đơn nhập hàng thành công",
      order: importOrders[orderIndex],
    };
  }
}

export default new InventoryService();
