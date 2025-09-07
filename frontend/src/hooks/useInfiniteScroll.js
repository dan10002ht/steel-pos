import { useRef, useCallback } from 'react';

export const useInfiniteScroll = (callback, hasMore, isLoading) => {
  const observerRef = useRef();

  const lastElementObserver = useCallback((node) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        callback();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [callback, hasMore, isLoading]);

  return lastElementObserver;
};
