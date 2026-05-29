import { QDIIFund } from '../../../shared/types';
import { fetchQDIIFundList } from './rankCrawler';
import { enrichFundDetails } from './detailCrawler';
import { enrichFundHoldings } from './holdingsCrawler';
import { getCachedFunds, getCachedFundsIgnoreTTL, setCachedFunds, getCacheTimestamp } from './cacheService';

let crawlPromise: Promise<{ funds: QDIIFund[]; lastUpdated: string }> | null = null;

export async function getFunds(): Promise<{ funds: QDIIFund[]; lastUpdated: string }> {
  // Try fresh cache first
  const cached = getCachedFunds();
  if (cached) {
    return { funds: cached, lastUpdated: getCacheTimestamp()! };
  }

  // Cache expired — return stale data immediately, refresh in background
  const stale = getCachedFundsIgnoreTTL();
  if (stale) {
    // Kick off background refresh (reuse existing if already running)
    if (!crawlPromise) {
      crawlPromise = doRefresh();
      crawlPromise.catch((err) => console.error('[crawlerService] Background refresh failed:', err.message));
    }
    return { funds: stale, lastUpdated: getCacheTimestamp()! };
  }

  // No data at all — must wait for fresh crawl
  return refreshFunds();
}

export async function refreshFunds(): Promise<{ funds: QDIIFund[]; lastUpdated: string }> {
  // If a refresh is already running, wait for it instead of returning stale data
  if (crawlPromise) {
    return crawlPromise;
  }
  crawlPromise = doRefresh();
  return crawlPromise;
}

async function doRefresh(): Promise<{ funds: QDIIFund[]; lastUpdated: string }> {
  try {
    console.log('[crawlerService] Starting data refresh...');
    const funds = await fetchQDIIFundList();
    console.log(`[crawlerService] Fetched ${funds.length} funds, enriching...`);

    // Build a lookup from old cache so failed requests can fall back to previous values
    const oldFunds = getCachedFundsIgnoreTTL();
    const oldMap = new Map<string, QDIIFund>();
    if (oldFunds) {
      for (const f of oldFunds) oldMap.set(f.code, f);
    }

    const detailEnriched = await enrichFundDetails(funds);
    await enrichFundHoldings(funds);

    // For funds whose requests failed, carry over values from old cache
    for (const fund of funds) {
      const old = oldMap.get(fund.code);
      if (!old) continue;
      if (!detailEnriched.has(fund.code)) {
        fund.purchaseStatus = old.purchaseStatus;
        fund.purchaseLimit = old.purchaseLimit;
        fund.redemptionStatus = old.redemptionStatus;
      }
      if (fund.holdings.length === 0 && old.holdings.length > 0) {
        fund.holdings = old.holdings;
        fund.holdingsDate = old.holdingsDate;
      }
    }

    setCachedFunds(funds);
    console.log(`[crawlerService] Cached ${funds.length} funds (fully enriched)`);

    return { funds, lastUpdated: getCacheTimestamp()! };
  } finally {
    crawlPromise = null;
  }
}
