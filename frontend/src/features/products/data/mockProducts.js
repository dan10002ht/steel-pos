// Mock data cho products với variants
export const mockProducts = [
  {
    id: "1",
    name: "Sắt thép xây dựng",
    category: "Vật liệu xây dựng",
    unit: "kg",
    notes: "Sắt thép chất lượng cao, phù hợp cho các công trình xây dựng",
    variants: [
      {
        id: "1-1",
        name: "D6",
        sku: "ST-D6-001",
        stock: 5000,
        sold: 1200,
        price: 15000,
        unit: "kg",
      },
      {
        id: "1-2",
        name: "D8",
        sku: "ST-D8-001",
        stock: 3000,
        sold: 800,
        price: 16000,
        unit: "kg",
      },
      {
        id: "1-3",
        name: "D10",
        sku: "ST-D10-001",
        stock: 2000,
        sold: 600,
        price: 17000,
        unit: "kg",
      },
    ],
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    name: "Xi măng Hà Tiên",
    category: "Vật liệu xây dựng",
    unit: "bao",
    notes: "Xi măng chất lượng cao, độ bền tốt",
    variants: [
      {
        id: "2-1",
        name: "50kg",
        sku: "XM-HT-50KG",
        stock: 200,
        sold: 50,
        price: 85000,
        unit: "bao",
      },
      {
        id: "2-2",
        name: "25kg",
        sku: "XM-HT-25KG",
        stock: 150,
        sold: 30,
        price: 45000,
        unit: "bao",
      },
    ],
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "3",
    name: "Gạch ống",
    category: "Vật liệu xây dựng",
    unit: "viên",
    notes: "Gạch ống chất lượng cao, kích thước chuẩn",
    variants: [
      {
        id: "3-1",
        name: "6 lỗ",
        sku: "GO-6LO-001",
        stock: 10000,
        sold: 2500,
        price: 2500,
        unit: "viên",
      },
      {
        id: "3-2",
        name: "4 lỗ",
        sku: "GO-4LO-001",
        stock: 8000,
        sold: 1800,
        price: 2200,
        unit: "viên",
      },
    ],
    createdAt: "2024-01-12T10:30:00Z",
    updatedAt: "2024-01-19T11:20:00Z",
  },
  {
    id: "4",
    name: "Cát xây dựng",
    category: "Vật liệu xây dựng",
    unit: "m³",
    notes: "Cát sạch, phù hợp cho xây dựng",
    variants: [
      {
        id: "4-1",
        name: "Cát vàng",
        sku: "CAT-VANG-001",
        stock: 100,
        sold: 25,
        price: 350000,
        unit: "m³",
      },
      {
        id: "4-2",
        name: "Cát đen",
        sku: "CAT-DEN-001",
        stock: 80,
        sold: 20,
        price: 300000,
        unit: "m³",
      },
    ],
    createdAt: "2024-01-08T07:15:00Z",
    updatedAt: "2024-01-17T13:40:00Z",
  },
  {
    id: "5",
    name: "Đá xây dựng",
    category: "Vật liệu xây dựng",
    unit: "m³",
    notes: "Đá chất lượng cao cho các công trình",
    variants: [
      {
        id: "5-1",
        name: "1x2",
        sku: "DA-1X2-001",
        stock: 50,
        sold: 15,
        price: 450000,
        unit: "m³",
      },
      {
        id: "5-2",
        name: "4x6",
        sku: "DA-4X6-001",
        stock: 40,
        sold: 12,
        price: 400000,
        unit: "m³",
      },
      {
        id: "5-3",
        name: "5x7",
        sku: "DA-5X7-001",
        stock: 35,
        sold: 10,
        price: 380000,
        unit: "m³",
      },
    ],
    createdAt: "2024-01-05T06:45:00Z",
    updatedAt: "2024-01-16T15:10:00Z",
  },
  {
    id: "6",
    name: "Thép hình",
    category: "Vật liệu xây dựng",
    unit: "kg",
    notes: "Thép hình đa dạng kích thước",
    variants: [
      {
        id: "6-1",
        name: "I100",
        sku: "TH-I100-001",
        stock: 800,
        sold: 200,
        price: 25000,
        unit: "kg",
      },
      {
        id: "6-2",
        name: "I150",
        sku: "TH-I150-001",
        stock: 600,
        sold: 150,
        price: 28000,
        unit: "kg",
      },
      {
        id: "6-3",
        name: "H200",
        sku: "TH-H200-001",
        stock: 400,
        sold: 100,
        price: 32000,
        unit: "kg",
      },
    ],
    createdAt: "2024-01-03T08:30:00Z",
    updatedAt: "2024-01-14T12:25:00Z",
  },
  {
    id: "7",
    name: "Gạch ốp tường",
    category: "Vật liệu hoàn thiện",
    unit: "m²",
    notes: "Gạch ốp tường đẹp, chất lượng cao",
    variants: [
      {
        id: "7-1",
        name: "30x60cm",
        sku: "GOT-30X60-001",
        stock: 500,
        sold: 120,
        price: 180000,
        unit: "m²",
      },
      {
        id: "7-2",
        name: "25x40cm",
        sku: "GOT-25X40-001",
        stock: 400,
        sold: 100,
        price: 150000,
        unit: "m²",
      },
    ],
    createdAt: "2024-01-20T09:15:00Z",
    updatedAt: "2024-01-22T16:30:00Z",
  },
  {
    id: "8",
    name: "Sơn nước",
    category: "Vật liệu hoàn thiện",
    unit: "lít",
    notes: "Sơn nước chất lượng cao, nhiều màu sắc",
    variants: [
      {
        id: "8-1",
        name: "Trắng",
        sku: "SON-TRANG-001",
        stock: 200,
        sold: 60,
        price: 120000,
        unit: "lít",
      },
      {
        id: "8-2",
        name: "Xanh dương",
        sku: "SON-XANH-001",
        stock: 150,
        sold: 40,
        price: 130000,
        unit: "lít",
      },
      {
        id: "8-3",
        name: "Vàng",
        sku: "SON-VANG-001",
        stock: 120,
        sold: 35,
        price: 125000,
        unit: "lít",
      },
    ],
    createdAt: "2024-01-18T10:45:00Z",
    updatedAt: "2024-01-21T14:20:00Z",
  },
];

// Categories data
export const productCategories = [
  "Vật liệu xây dựng",
  "Vật liệu hoàn thiện",
  "Thiết bị điện",
  "Thiết bị nước",
  "Dụng cụ",
  "Khác",
];

// Units data
export const productUnits = [
  "kg",
  "tấn",
  "m",
  "m²",
  "m³",
  "bao",
  "viên",
  "lít",
  "cái",
  "bộ",
  "cuộn",
  "thùng",
];

// Helper functions
export const getProductById = (id) => {
  return mockProducts.find((product) => product.id === id);
};

export const getProductsByCategory = (category) => {
  return mockProducts.filter((product) => product.category === category);
};

export const calculateTotalStock = (product) => {
  if (!product || !product.variants || !Array.isArray(product.variants)) {
    return 0;
  }
  return product.variants.reduce(
    (total, variant) => total + (variant.stock || 0),
    0
  );
};

export const calculateTotalSold = (product) => {
  if (!product || !product.variants || !Array.isArray(product.variants)) {
    return 0;
  }
  return product.variants.reduce(
    (total, variant) => total + (variant.sold || 0),
    0
  );
};

export const getPriceRange = (product) => {
  if (
    !product ||
    !product.variants ||
    !Array.isArray(product.variants) ||
    product.variants.length === 0
  ) {
    return { min: 0, max: 0 };
  }
  const prices = product.variants.map((variant) => variant.price || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  return { min: minPrice, max: maxPrice };
};

export const formatCurrency = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export const formatCurrencyRange = (product) => {
  const { min, max } = getPriceRange(product);
  if (min === max) {
    return formatCurrency(min);
  }
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};
