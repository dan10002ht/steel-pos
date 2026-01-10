import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

/**
 * Context để quản lý inventory reservations giữa các invoice tabs
 * Giải quyết vấn đề: nhiều tabs có thể chọn cùng sản phẩm, cần track tồn kho available
 */

const InvoiceReservationContext = createContext(null);

const STORAGE_KEY = 'invoice_reservations';

/**
 * Structure của reservationMap:
 * {
 *   'variantId-123': {
 *     actualStock: 10,           // Stock thực tế từ API
 *     reservations: {
 *       'invoice-temp-1': 5,     // Invoice 1 đang giữ 5
 *       'invoice-temp-2': 3      // Invoice 2 đang giữ 3
 *     }
 *   }
 * }
 */

export const InvoiceReservationProvider = ({ children }) => {
  const [reservationMap, setReservationMap] = useState({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setReservationMap(parsed);
      }
    } catch (error) {
      console.error('Failed to load reservations from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever reservationMap changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservationMap));
    } catch (error) {
      console.error('Failed to save reservations to localStorage:', error);
    }
  }, [reservationMap]);

  /**
   * Cập nhật actual stock cho một variant (từ API)
   */
  const updateActualStock = useCallback((variantId, stock) => {
    setReservationMap(prev => ({
      ...prev,
      [variantId]: {
        actualStock: stock,
        reservations: prev[variantId]?.reservations || {},
      },
    }));
  }, []);

  /**
   * Thêm hoặc cập nhật reservation cho một invoice
   */
  const setReservation = useCallback((invoiceId, variantId, quantity) => {
    setReservationMap(prev => {
      const variant = prev[variantId] || { actualStock: 0, reservations: {} };

      return {
        ...prev,
        [variantId]: {
          ...variant,
          reservations: {
            ...variant.reservations,
            [invoiceId]: quantity,
          },
        },
      };
    });
  }, []);

  /**
   * Xóa reservation của một variant trong invoice
   */
  const removeReservation = useCallback((invoiceId, variantId) => {
    setReservationMap(prev => {
      const variant = prev[variantId];
      if (!variant) return prev;

      const { [invoiceId]: removed, ...remainingReservations } =
        variant.reservations;

      // Nếu không còn reservation nào, xóa variant khỏi map
      if (Object.keys(remainingReservations).length === 0) {
        const { [variantId]: removedVariant, ...remainingVariants } = prev;
        return remainingVariants;
      }

      return {
        ...prev,
        [variantId]: {
          ...variant,
          reservations: remainingReservations,
        },
      };
    });
  }, []);

  /**
   * Xóa tất cả reservations của một invoice
   */
  const clearInvoiceReservations = useCallback(invoiceId => {
    setReservationMap(prev => {
      const newMap = {};

      Object.entries(prev).forEach(([variantId, variant]) => {
        const { [invoiceId]: removed, ...remainingReservations } =
          variant.reservations;

        // Chỉ giữ lại variant nếu còn reservations từ invoices khác
        if (Object.keys(remainingReservations).length > 0) {
          newMap[variantId] = {
            ...variant,
            reservations: remainingReservations,
          };
        }
      });

      return newMap;
    });
  }, []);

  /**
   * Lấy tổng số lượng đã reserved cho một variant (trừ invoice hiện tại)
   */
  const getTotalReserved = useCallback(
    (variantId, excludeInvoiceId = null) => {
      const variant = reservationMap[variantId];
      if (!variant) return 0;

      return Object.entries(variant.reservations).reduce(
        (total, [invId, qty]) => {
          if (excludeInvoiceId && invId === excludeInvoiceId) {
            return total; // Không tính invoice hiện tại
          }
          return total + qty || 0;
        },
        0
      );
    },
    [reservationMap]
  );

  /**
   * Lấy số lượng đã reserved bởi một invoice cụ thể
   */
  const getReservedByInvoice = useCallback(
    (invoiceId, variantId) => {
      const variant = reservationMap[variantId];
      if (!variant) return 0;
      return variant.reservations[invoiceId] || 0;
    },
    [reservationMap]
  );

  /**
   * Tính available stock cho một variant (xét đến invoice hiện tại)
   * Formula: actualStock - totalReserved + currentInvoiceReserved
   */
  const getAvailableStock = useCallback(
    (variantId, currentInvoiceId = null) => {
      const variant = reservationMap[variantId];
      if (!variant) return 0;

      const actualStock = variant.actualStock || 0;
      const totalReserved = getTotalReserved(variantId, currentInvoiceId);
      const currentReserved = currentInvoiceId
        ? getReservedByInvoice(currentInvoiceId, variantId)
        : 0;


      return actualStock - totalReserved + currentReserved;
    },
    [reservationMap, getTotalReserved, getReservedByInvoice]
  );

  /**
   * Lấy thông tin chi tiết về reservations của một variant
   */
  const getReservationDetails = useCallback(
    variantId => {
      const variant = reservationMap[variantId];
      if (!variant) {
        return {
          actualStock: 0,
          totalReserved: 0,
          reservations: {},
          availableStock: 0,
        };
      }

      const totalReserved = getTotalReserved(variantId);

      return {
        actualStock: variant.actualStock || 0,
        totalReserved,
        reservations: variant.reservations,
        availableStock: (variant.actualStock || 0) - totalReserved,
      };
    },
    [reservationMap, getTotalReserved]
  );

  /**
   * Clear toàn bộ reservations (dùng khi reset hoặc logout)
   */
  const clearAllReservations = useCallback(() => {
    setReservationMap({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = {
    reservationMap,
    updateActualStock,
    setReservation,
    removeReservation,
    clearInvoiceReservations,
    getTotalReserved,
    getReservedByInvoice,
    getAvailableStock,
    getReservationDetails,
    clearAllReservations,
  };

  return (
    <InvoiceReservationContext.Provider value={value}>
      {children}
    </InvoiceReservationContext.Provider>
  );
};

/**
 * Hook để sử dụng InvoiceReservationContext
 */
export const useInvoiceReservation = () => {
  const context = useContext(InvoiceReservationContext);
  if (!context) {
    throw new Error(
      'useInvoiceReservation must be used within InvoiceReservationProvider'
    );
  }
  return context;
};

export default InvoiceReservationContext;
