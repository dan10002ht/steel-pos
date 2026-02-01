import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
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
  const [reservationMap, setReservationMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.error('Failed to load reservations from localStorage:', error);
    }
    return {};
  });

  // Ref để getter functions luôn đọc giá trị mới nhất mà không cần re-create
  const reservationMapRef = useRef(reservationMap);
  reservationMapRef.current = reservationMap;

  // Debounce save to localStorage
  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reservationMap));
      } catch (error) {
        console.error('Failed to save reservations to localStorage:', error);
      }
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [reservationMap]);

  /**
   * Cập nhật actual stock cho một variant (từ API)
   */
  const updateActualStock = useCallback((variantId, stock) => {
    setReservationMap(prev => {
      // Skip nếu không thay đổi
      if (prev[variantId]?.actualStock === stock) return prev;
      return {
        ...prev,
        [variantId]: {
          actualStock: stock,
          reservations: prev[variantId]?.reservations || {},
        },
      };
    });
  }, []);

  /**
   * Batch update actual stocks cho nhiều variants (tránh multiple re-renders)
   */
  const batchUpdateActualStocks = useCallback(stocksMap => {
    setReservationMap(prev => {
      let changed = false;
      const next = { ...prev };
      Object.entries(stocksMap).forEach(([variantId, stock]) => {
        if (prev[variantId]?.actualStock !== stock) {
          changed = true;
          next[variantId] = {
            actualStock: stock,
            reservations: prev[variantId]?.reservations || {},
          };
        }
      });
      return changed ? next : prev;
    });
  }, []);

  /**
   * Thêm hoặc cập nhật reservation cho một invoice
   */
  const setReservation = useCallback((invoiceId, variantId, quantity) => {
    setReservationMap(prev => {
      const variant = prev[variantId] || { actualStock: 0, reservations: {} };
      // Skip nếu không thay đổi
      if (variant.reservations[invoiceId] === quantity) return prev;
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
   * Batch update reservations cho một invoice (tránh multiple re-renders)
   * variantQuantities: { [variantId]: quantity }
   */
  const batchSetReservations = useCallback((invoiceId, variantQuantities) => {
    setReservationMap(prev => {
      let changed = false;
      const next = { ...prev };

      Object.entries(variantQuantities).forEach(([variantId, quantity]) => {
        const variant = prev[variantId] || {
          actualStock: 0,
          reservations: {},
        };
        if (variant.reservations[invoiceId] !== quantity) {
          changed = true;
          next[variantId] = {
            ...variant,
            reservations: {
              ...variant.reservations,
              [invoiceId]: quantity,
            },
          };
        }
      });

      return changed ? next : prev;
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

      if (removed === undefined) return prev; // Không có gì để xóa

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
      let changed = false;

      Object.entries(prev).forEach(([variantId, variant]) => {
        if (variant.reservations[invoiceId] !== undefined) {
          changed = true;
          const { [invoiceId]: removed, ...remainingReservations } =
            variant.reservations;
          if (Object.keys(remainingReservations).length > 0) {
            newMap[variantId] = {
              ...variant,
              reservations: remainingReservations,
            };
          }
        } else {
          newMap[variantId] = variant;
        }
      });

      return changed ? newMap : prev;
    });
  }, []);

  /**
   * Getter functions dùng ref để không tạo lại khi reservationMap thay đổi
   * -> consumers không bị re-render chỉ vì getter reference thay đổi
   */
  const getTotalReserved = useCallback(
    (variantId, excludeInvoiceId = null) => {
      const map = reservationMapRef.current;
      const variant = map[variantId];
      if (!variant) return 0;

      return Object.entries(variant.reservations).reduce(
        (total, [invId, qty]) => {
          if (excludeInvoiceId && invId === excludeInvoiceId) {
            return total;
          }
          return total + (qty || 0);
        },
        0
      );
    },
    [] // Stable reference - dùng ref internally
  );

  const getReservedByInvoice = useCallback(
    (invoiceId, variantId) => {
      const map = reservationMapRef.current;
      const variant = map[variantId];
      if (!variant) return 0;
      return variant.reservations[invoiceId] || 0;
    },
    [] // Stable reference
  );

  const getAvailableStock = useCallback(
    (variantId, currentInvoiceId = null) => {
      const map = reservationMapRef.current;
      const variant = map[variantId];
      if (!variant) return 0;

      const actualStock = variant.actualStock || 0;
      const totalReserved = getTotalReserved(variantId, currentInvoiceId);
      const currentReserved = currentInvoiceId
        ? getReservedByInvoice(currentInvoiceId, variantId)
        : 0;

      return actualStock - totalReserved + currentReserved;
    },
    [getTotalReserved, getReservedByInvoice]
  );

  const getReservationDetails = useCallback(
    variantId => {
      const map = reservationMapRef.current;
      const variant = map[variantId];
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
    [getTotalReserved]
  );

  /**
   * Fetch và update actual stock từ API cho nhiều variants
   */
  const fetchAndUpdateStocks = useCallback(
    async variantIds => {
      if (!variantIds || variantIds.length === 0) return;

      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/variants/stocks?ids=${variantIds.join(',')}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch variant stocks');
        }

        const result = await response.json();
        const stocks = result.data || [];

        // Batch update thay vì gọi updateActualStock từng cái
        const stocksMap = {};
        stocks.forEach(({ id, stock }) => {
          stocksMap[id] = stock;
        });
        batchUpdateActualStocks(stocksMap);
      } catch (error) {
        console.error('Failed to fetch variant stocks:', error);
      }
    },
    [batchUpdateActualStocks]
  );

  /**
   * Clear toàn bộ reservations (dùng khi reset hoặc logout)
   */
  const clearAllReservations = useCallback(() => {
    setReservationMap({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Memoize context value - chỉ re-create khi reservationMap thay đổi
  const value = useMemo(
    () => ({
      reservationMap,
      updateActualStock,
      batchUpdateActualStocks,
      setReservation,
      batchSetReservations,
      removeReservation,
      clearInvoiceReservations,
      getTotalReserved,
      getReservedByInvoice,
      getAvailableStock,
      getReservationDetails,
      clearAllReservations,
      fetchAndUpdateStocks,
    }),
    [
      reservationMap,
      updateActualStock,
      batchUpdateActualStocks,
      setReservation,
      batchSetReservations,
      removeReservation,
      clearInvoiceReservations,
      getTotalReserved,
      getReservedByInvoice,
      getAvailableStock,
      getReservationDetails,
      clearAllReservations,
      fetchAndUpdateStocks,
    ]
  );

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
