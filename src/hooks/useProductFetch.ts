import { useState, useRef, useCallback } from 'react';
import type { ApiResponse } from '../types';

interface FetchParams {
  query: string;
  sortBy: string;
  order: 'asc' | 'desc';
  category: string;
  skip: number;
  limit: number;
}

const CACHE_LIMIT = 10;

export function useProductFetch() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cacheRef = useRef<Map<string, ApiResponse>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async (params: FetchParams) => {
    // Generate unique cache key based on all API parameters
    const cacheKey = JSON.stringify(params);

    if (cacheRef.current.has(cacheKey)) {
      setData(cacheRef.current.get(cacheKey)!);
      setError(null);
      return;
    }

    // Cancel in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const { query, sortBy, order, category, skip, limit } = params;
      let url = `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`;
      
      if (category) {
        url = `https://dummyjson.com/products/category/${category}?limit=${limit}&skip=${skip}`;
      }
      if (sortBy) {
        url += `&sortBy=${sortBy}&order=${order}`;
      }

      // Injecting sample delay to test race conditions
      url += `&delay=500`;

      const response = await fetch(url, { signal: abortControllerRef.current.signal });
      if (!response.ok) throw new Error('Network response was not ok');
      
      const result: ApiResponse = await response.json();

      // Manage 10 entry cache size
      if (cacheRef.current.size >= CACHE_LIMIT) {
        const firstKey = cacheRef.current.keys().next().value;
        if (firstKey) cacheRef.current.delete(firstKey);
      }
      cacheRef.current.set(cacheKey, result);
      
      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchProducts, setData };
}