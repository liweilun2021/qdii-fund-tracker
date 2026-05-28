import axios from 'axios';
import type { FundListResponse, CategoriesResponse } from '../../../shared/types';

const api = axios.create({ baseURL: '/api' });

export interface HoldingStockItem {
  code: string;
  name: string;
  fundCount: number;
}

export async function fetchHoldingStocks(): Promise<HoldingStockItem[]> {
  const { data } = await api.get<{ stocks: HoldingStockItem[] }>('/holdings/stocks');
  return data.stocks;
}

export async function fetchFunds(params?: {
  region?: string;
  assetType?: string;
  search?: string;
  status?: string;
  holdingStock?: string;
}): Promise<FundListResponse> {
  const { data } = await api.get<FundListResponse>('/funds', { params });
  return data;
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  const { data } = await api.get<CategoriesResponse>('/funds/categories');
  return data;
}

export async function refreshData(): Promise<void> {
  await api.post('/funds/refresh');
}
