import axios from 'axios';
import pLimit from 'p-limit';
import { config } from '../config';
import { extractFundDetail } from '../utils/htmlParser';
import { updateFundInCache } from './cacheService';
import { QDIIFund } from '../../../shared/types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchFundDetail(code: string): Promise<ReturnType<typeof extractFundDetail> | null> {
  for (let attempt = 0; attempt < config.crawl.retryCount; attempt++) {
    try {
      const url = `${config.crawl.detailBaseUrl}${code}.html`;
      const resp = await axios.get(url, {
        headers: {
          'User-Agent': config.crawl.userAgent,
          Referer: `http://fund.eastmoney.com/${code}.html`,
        },
        timeout: 10000,
        responseType: 'text',
      });
      return extractFundDetail(resp.data);
    } catch (err) {
      if (attempt < config.crawl.retryCount - 1) {
        await sleep(config.crawl.retryBaseDelay * Math.pow(2, attempt));
      }
    }
  }
  return null;
}

export async function enrichFundDetails(funds: QDIIFund[]): Promise<void> {
  console.log(`[detailCrawler] Enriching ${funds.length} funds with purchase status...`);
  const limit = pLimit(config.crawl.detailConcurrency);
  let completed = 0;

  const tasks = funds.map((fund) =>
    limit(async () => {
      const detail = await fetchFundDetail(fund.code);
      if (detail) {
        fund.purchaseStatus = detail.purchaseStatus;
        fund.purchaseLimit = detail.purchaseLimit;
        fund.redemptionStatus = detail.redemptionStatus;
        updateFundInCache(fund.code, {
          purchaseStatus: detail.purchaseStatus,
          purchaseLimit: detail.purchaseLimit,
          redemptionStatus: detail.redemptionStatus,
        });
      }
      completed++;
      if (completed % 20 === 0) {
        console.log(`[detailCrawler] Progress: ${completed}/${funds.length}`);
      }
      await sleep(config.crawl.detailDelay);
    }),
  );

  await Promise.allSettled(tasks);
  console.log(`[detailCrawler] Enrichment complete (${completed}/${funds.length})`);
}
