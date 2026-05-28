import { useState, useEffect, useCallback, useRef } from 'react';
import type { QDIIFund, CategoriesResponse } from '../../../shared/types';
import { fetchFunds, fetchCategories } from '../api/fundApi';

export interface Filters {
  region?: string;
  assetType?: string;
  search?: string;
  status?: string;
  holdingStock?: string;
}

export function useFunds() {
  const [funds, setFunds] = useState<QDIIFund[]>([]);
  const [categories, setCategories] = useState<CategoriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const prevSearchRef = useRef<string | undefined>(undefined);

  const loadFunds = useCallback(async (currentFilters: Filters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFunds(currentFilters);
      setFunds(data.funds);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      setError('加载数据失败，请稍后重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Load funds when filters change (debounce only when search text is being typed)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const searchChanged = filters.search !== prevSearchRef.current;
    prevSearchRef.current = filters.search;

    if (searchChanged && filters.search) {
      debounceRef.current = setTimeout(() => loadFunds(filters), 300);
    } else {
      loadFunds(filters);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, loadFunds]);

  const updateFilter = useCallback((updates: Partial<Filters>) => {
    setFilters((prev) => {
      const next = { ...prev };
      for (const [key, value] of Object.entries(updates)) {
        (next as any)[key] = value;
      }
      return next;
    });
  }, []);

  const retry = useCallback(() => loadFunds(filters), [filters, loadFunds]);

  return { funds, categories, loading, error, lastUpdated, filters, updateFilter, retry };
}
