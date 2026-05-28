import { QDIIFund } from '../../../shared/types';
import { fetchQDIIFundList } from './rankCrawler';
import { enrichFundDetails } from './detailCrawler';
import { enrichFundHoldings } from './holdingsCrawler';
import { getCachedFunds, getCachedFundsIgnoreTTL, setCachedFunds, getCacheTimestamp, persistCache } from './cacheService';

let crawling = false;

export async function getFunds(): Promise<{ funds: QDIIFund[]; lastUpdated: string }> {
  // Try fresh cache first
  const cached = getCachedFunds();
  if (cached) {
    return { funds: cached, lastUpdated: getCacheTimestamp()! };
  }

  // Cache expired — return stale data immediately, refresh in background
  const stale = getCachedFundsIgnoreTTL();
  if (stale) {
    // Kick off background refresh
    refreshFunds().catch((err) => console.error('[crawlerService] Background refresh failed:', err.message));
    return { funds: stale, lastUpdated: getCacheTimestamp()! };
  }

  // No data at all — must wait for fresh crawl
  return refreshFunds();
}

export async function refreshFunds(): Promise<{ funds: QDIIFund[]; lastUpdated: string }> {
  if (crawling) {
    const cached = getCachedFundsIgnoreTTL();
    if (cached) return { funds: cached, lastUpdated: getCacheTimestamp()! };
    return { funds: [], lastUpdated: new Date().toISOString() };
  }

  crawling = true;
  try {
    console.log('[crawlerService] Starting data refresh...');
    const funds = await fetchQDIIFundList();
    setCachedFunds(funds);
    console.log(`[crawlerService] Cached ${funds.length} funds`);

    // Enrich details and holdings in background, persist after each phase
    enrichFundDetails(funds)
      .then(() => {
        persistCache();
        return enrichFundHoldings(funds);
      })
      .then(() => {
        persistCache();
      })
      .catch((err) => console.error('[crawlerService] Enrichment failed:', err.message));

    return { funds, lastUpdated: getCacheTimestamp()! };
  } finally {
    crawling = false;
  }
}
