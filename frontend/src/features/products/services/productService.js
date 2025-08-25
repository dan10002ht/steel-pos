import { mockProducts, getProductById } from "../data/mockProducts";

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class ProductService {
  constructor() {
    this.baseURL = "/api/products";
    this.products = [...mockProducts]; // Clone để có thể modify
  }

  // Get all products with pagination and filters
  async getProducts(params = {}) {
    await delay(500); // Simulate network delay

    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    let filteredProducts = [...this.products];

    // Apply search filter
    if (search) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.variants.some(
            (variant) =>
              variant.name.toLowerCase().includes(search.toLowerCase()) ||
              variant.sku.toLowerCase().includes(search.toLowerCase())
          )
      );
    }

    // Apply category filter
    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category
      );
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "category":
          aValue = a.category;
          bValue = b.category;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "updatedAt":
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit),
        hasNext: endIndex < filteredProducts.length,
        hasPrev: page > 1,
      },
    };
  }

  // Get single product by ID
  async getProduct(id) {
    await delay(300);

    const product = getProductById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    return { data: product };
  }

  // Create new product
  async createProduct(productData) {
    await delay(800);

    const newProduct = {
      id: Date.now().toString(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.products.push(newProduct);

    return { data: newProduct };
  }

  // Update product
  async updateProduct(id, productData) {
    await delay(600);

    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      throw new Error("Product not found");
    }

    const updatedProduct = {
      ...this.products[productIndex],
      ...productData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    this.products[productIndex] = updatedProduct;

    return { data: updatedProduct };
  }

  // Delete product
  async deleteProduct(id) {
    await delay(400);

    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      throw new Error("Product not found");
    }

    const deletedProduct = this.products[productIndex];
    this.products.splice(productIndex, 1);

    return { data: deletedProduct };
  }

  // Get product categories
  async getCategories() {
    await delay(200);

    const categories = [...new Set(this.products.map((p) => p.category))];
    return { data: categories };
  }

  // Search products
  async searchProducts(query) {
    await delay(400);

    const results = this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.variants.some(
          (variant) =>
            variant.name.toLowerCase().includes(query.toLowerCase()) ||
            variant.sku.toLowerCase().includes(query.toLowerCase())
        )
    );

    return { data: results };
  }

  // Get products by category
  async getProductsByCategory(category) {
    await delay(300);

    const results = this.products.filter(
      (product) => product.category === category
    );
    return { data: results };
  }

  // Update stock for variant
  async updateVariantStock(productId, variantId, newStock) {
    await delay(500);

    const product = this.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) {
      throw new Error("Variant not found");
    }

    variant.stock = newStock;
    product.updatedAt = new Date().toISOString();

    return { data: product };
  }

  // Get product statistics
  async getProductStats() {
    await delay(400);

    const totalProducts = this.products.length;
    const totalVariants = this.products.reduce(
      (sum, product) => sum + product.variants.length,
      0
    );
    const totalStock = this.products.reduce(
      (sum, product) =>
        sum +
        product.variants.reduce((vSum, variant) => vSum + variant.stock, 0),
      0
    );
    const totalSold = this.products.reduce(
      (sum, product) =>
        sum +
        product.variants.reduce((vSum, variant) => vSum + variant.sold, 0),
      0
    );

    return {
      data: {
        totalProducts,
        totalVariants,
        totalStock,
        totalSold,
        categories: [...new Set(this.products.map((p) => p.category))],
      },
    };
  }
}

// Create singleton instance
const productService = new ProductService();

export default productService;
