import fs from 'fs';
import path from 'path';
import { QDIIFund } from '../../../shared/types';
import { config } from '../config';

interface CacheEntry {
  data: QDIIFund[];
  timestamp: number;
}

const CACHE_FILE = path.resolve(__dirname, '../../data/cache.json');

let cache: CacheEntry | null = null;

function ensureDataDir(): void {
  const dir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeToDisk(): void {
  if (!cache) return;
  try {
    ensureDataDir();
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
    console.log(`[cache] Persisted ${cache.data.length} funds to disk`);
  } catch (err: any) {
    console.error('[cache] Failed to write cache file:', err.message);
  }
}

function loadFromDisk(): CacheEntry | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const entry: CacheEntry = JSON.parse(raw);
    if (!entry.data || !entry.timestamp) return null;
    console.log(`[cache] Loaded ${entry.data.length} funds from disk (age: ${Math.round((Date.now() - entry.timestamp) / 60000)}min)`);
    return entry;
  } catch (err: any) {
    console.error('[cache] Failed to read cache file:', err.message);
    return null;
  }
}

export function getCachedFunds(): QDIIFund[] | null {
  if (!cache) {
    cache = loadFromDisk();
  }
  if (!cache) return null;
  if (Date.now() - cache.timestamp > config.cacheTTL) return null;
  return cache.data;
}

export function getCachedFundsIgnoreTTL(): QDIIFund[] | null {
  if (!cache) {
    cache = loadFromDisk();
  }
  return cache ? cache.data : null;
}

export function setCachedFunds(funds: QDIIFund[]): void {
  cache = { data: funds, timestamp: Date.now() };
  writeToDisk();
}

export function updateFundInCache(code: string, updates: Partial<QDIIFund>): void {
  if (!cache) return;
  const fund = cache.data.find((f) => f.code === code);
  if (fund) Object.assign(fund, updates);
}

export function persistCache(): void {
  writeToDisk();
}

export function getCacheTimestamp(): string | null {
  return cache ? new Date(cache.timestamp).toISOString() : null;
}

export function invalidateCache(): void {
  cache = null;
}
