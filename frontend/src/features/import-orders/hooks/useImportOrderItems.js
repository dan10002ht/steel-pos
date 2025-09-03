import { useState, useEffect } from 'react';
import { fetchApi } from '../../../shared/services/api';

export const useImportOrderItems = ({
  isEditing = false,
  initialData = null,
}) => {
  const defaultProducts = [
    {
      id: Date.now(),
      productName: '',
      variant: '',
      unit: '',
      quantity: 0,
      unitPrice: 0,
      total: 0,
      productId: null,
      variantId: null,
      notes: '',
    },
  ]
  const [doneSetInitialData, setDoneSetInitialData] = useState(false);
  const [products, setProducts] = useState(isEditing ? [] : defaultProducts);

  // Initialize products when editing
  useEffect(() => {
    if (isEditing && initialData) {
      if (initialData.items && initialData.items.length > 0) {
        const formattedProducts = initialData.items.map((item) => ({
          id: item.id,
          productName: item.product_name || '',
          variant: item.variant_name || '',
          unit: item.unit || '',
          quantity: item.quantity || 0,
          unitPrice: item.unit_price || 0,
          total: (item.quantity || 0) * (item.unit_price || 0),
          productId: item.product_id || null,
          variantId: item.variant_id || null,
          notes: item.notes || '',
          is_deleted: false,
          variants: [],
        }));
        
        setProducts(formattedProducts);
      } else {
        setProducts(
          defaultProducts
        );
      }
      setDoneSetInitialData(true);
    }
  }, [isEditing, initialData]);

  useEffect(() => {
    if(!doneSetInitialData) return;
    if (isEditing && initialData && initialData.items && initialData.items.length > 0) {
      const fetchVariantsForInitialProducts = async () => {
        const updatedProducts = [...products];
        
        for (let i = 0; i < updatedProducts.length; i++) {
          const product = updatedProducts[i];
          if (product.productId && (!product.variants || product.variants.length === 0)) {
            try {
              const variantsData = await fetchApi({
                url: `/products/${product.productId}/variants`,
                method: 'GET'
              });
              
              if (variantsData.success && variantsData.data) {
                updatedProducts[i] = {
                  ...updatedProducts[i],
                  variants: variantsData.data
                };
              } else {
                // Fallback: tạo variant từ dữ liệu có sẵn
                const fallbackVariant = {
                  id: product.variantId || 0,
                  name: product.variant || 'Default',
                  sku: `${product.productId}-${product.variantId || 0}`,
                  stock: 0,
                  price: product.unitPrice || 0,
                  unit: product.unit || 'pcs'
                };
                updatedProducts[i] = {
                  ...updatedProducts[i],
                  variants: [fallbackVariant]
                };
              }
            } catch (error) {
              console.error(`Error fetching variants for product ${product.productId}:`, error);
              // Fallback: tạo variant từ dữ liệu có sẵn khi có lỗi
              const fallbackVariant = {
                id: product.variantId || 0,
                name: product.variant || 'Default',
                sku: `${product.productId}-${product.variantId || 0}`,
                stock: 0,
                price: product.unitPrice || 0,
                unit: product.unit || 'pcs'
              };
              updatedProducts[i] = {
                ...updatedProducts[i],
                variants: [fallbackVariant]
              };
            }
          }
        }
        
        setProducts(updatedProducts);
      };
      
      fetchVariantsForInitialProducts();
    }
  }, [doneSetInitialData]);

  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + product.total, 0);
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };

    // Auto-calculate total for this product
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity =
        field === 'quantity' ? value : updatedProducts[index].quantity;
      const unitPrice =
        field === 'unitPrice' ? value : updatedProducts[index].unitPrice;
      updatedProducts[index].total = quantity * unitPrice;
    }

    setProducts(updatedProducts);
  };

  const handleProductSelect = (index, selectedProduct) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      productName: selectedProduct.name,
      variant: selectedProduct.variants?.[0]?.name || '',
      unit: selectedProduct.unit,
      productId: selectedProduct.id,
      variantId: selectedProduct.variants?.[0]?.id || null,
      variants: selectedProduct.variants || [],
    };

    // Auto-calculate total
    updatedProducts[index].total =
      updatedProducts[index].quantity * updatedProducts[index].unitPrice;

    setProducts(updatedProducts);
  };

  const handleVariantSelect = (index, selectedVariant) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      variant: selectedVariant.name,
      variantId: selectedVariant.id,
    };
    updatedProducts[index].total =
      updatedProducts[index].quantity * updatedProducts[index].unitPrice;
    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        id: `new_${Date.now()}`,
        productName: '',
        variant: '',
        unit: '',
        quantity: 0,
        unitPrice: 0,
        total: 0,
        productId: null,
        variantId: null,
        notes: '',
        is_deleted: false,
        variants: [],
      },
    ]);
  };

  const removeProduct = (index) => {
    if (products.length === 1) {
      return; // Không cho phép xóa item cuối cùng
    }
    
    const product = products[index];
    
    // Nếu là item mới (id bắt đầu bằng "new_"), xóa luôn khỏi danh sách
    if (typeof product.id === 'string' && product.id.startsWith('new_')) {
      const updatedProducts = products.filter((_, i) => i !== index);
      setProducts(updatedProducts);
    } else {
      // Nếu là item cũ (id là số), đánh dấu is_deleted
      const updatedProducts = [...products];
      updatedProducts[index] = { ...updatedProducts[index], is_deleted: true };
      setProducts(updatedProducts);
    }
  };

  return {
    products,
    calculateTotal,
    handleProductChange,
    handleProductSelect,
    handleVariantSelect,
    addProduct,
    removeProduct,
  };
};
