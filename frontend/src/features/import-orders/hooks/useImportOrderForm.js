import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useCreateApi } from '../../../hooks/useCreateApi';
import { fetchApi } from '../../../shared/services/api';

export const useImportOrderForm = ({
  isEditing = false,
  initialData = null,
  onNavigateToList,
}) => {
  const [formData, setFormData] = useState({
    importCode: `IMP${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Date.now()).slice(-4)}`,
    supplier: '',
    importDate: new Date().toISOString().split('T')[0],
    notes: '',
    documents: [],
  });

  const [errors, setErrors] = useState({});
  const toast = useToast();

  // Initialize form data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        importCode: initialData.import_code || formData.importCode,
        supplier: initialData.supplier_name || '',
        importDate: initialData.import_date
          ? new Date(initialData.import_date).toISOString().split('T')[0]
          : formData.importDate,
        notes: initialData.notes || '',
        documents: initialData.import_images || [],
      });
    }
  }, [isEditing, initialData]);

  // Create import order mutation
  const createMutation = useCreateApi('/import-orders', {
    invalidateQueries: [['import-orders']],
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đơn nhập hàng đã được tạo và gửi phê duyệt',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onNavigateToList) {
        onNavigateToList();
      }
    },
    onError: error => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tạo đơn nhập hàng',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (products) => {
    const newErrors = {};

    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Không được bỏ trống nhà cung cấp';
    }

    if (!formData.importDate) {
      newErrors.importDate = 'Không được bỏ trống ngày nhập kho';
    }

    // Check if at least one product is selected
    const hasProduct = products.some(
      product => product.productName && product.quantity > 0
    );
    if (!hasProduct) {
      newErrors.products = 'Không được bỏ trống sản phẩm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (products, onSubmit) => {
    if (!validateForm(products)) {
      return;
    }

    // Lọc và xử lý items trước khi gửi
    const processedItems = products
      .filter(product => !product.is_deleted) // Loại bỏ items đã đánh dấu xóa
      .map(product => {
        // Nếu là item mới (id bắt đầu bằng "new_"), không gửi id
        if (typeof product.id === 'string' && product.id.startsWith('new_')) {
          return {
            product_id: product.productId || 1,
            variant_id: product.variantId || 1,
            product_name: product.productName,
            variant_name: product.variant,
            quantity: product.quantity,
            unit_price: product.unitPrice,
            unit: product.unit,
            notes: product.notes,
          };
        } else {
          // Nếu là item cũ, gửi id để backend biết cập nhật item nào
          return {
            id: product.id,
            product_id: product.productId || 1,
            variant_id: product.variantId || 1,
            product_name: product.productName,
            variant_name: product.variant,
            quantity: product.quantity,
            unit_price: product.unitPrice,
            unit: product.unit,
            notes: product.notes,
          };
        }
      });

    const orderData = {
      supplier_name: formData.supplier,
      import_date: formData.importDate,
      notes: formData.notes,
      import_images: formData.documents,
      items: processedItems,
    };

    if (isEditing && onSubmit) {
      onSubmit(orderData);
    } else {
      createMutation.mutate(orderData);
    }
  };

  return {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
    isLoading: createMutation.isPending,
  };
};
