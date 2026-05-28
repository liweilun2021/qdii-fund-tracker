import axios from 'axios';
import pLimit from 'p-limit';
import { config } from '../config';
import { parseHoldingsHtml } from '../utils/holdingsParser';
import { updateFundInCache } from './cacheService';
import { QDIIFund } from '../../../shared/types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchFundHoldings(code: string): Promise<ReturnType<typeof parseHoldingsHtml>> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const resp = await axios.get(
        'https://fundf10.eastmoney.com/FundArchivesDatas.aspx',
        {
          params: { type: 'jjcc', code, topline: 10, year: '', month: '', rt: Math.random() },
          headers: {
            'User-Agent': config.crawl.userAgent,
            Referer: `https://fundf10.eastmoney.com/ccmx_${code}.html`,
          },
          timeout: 10000,
          responseType: 'text',
        },
      );
      return parseHoldingsHtml(resp.data);
    } catch {
      if (attempt === 0) await sleep(1000);
    }
  }
  return [];
}

export async function enrichFundHoldings(funds: QDIIFund[]): Promise<void> {
  console.log(`[holdingsCrawler] Fetching holdings for ${funds.length} funds...`);
  const limit = pLimit(5);
  let completed = 0;

  const tasks = funds.map((fund) =>
    limit(async () => {
      const holdings = await fetchFundHoldings(fund.code);
      fund.holdings = holdings;
      updateFundInCache(fund.code, { holdings });
      completed++;
      if (completed % 50 === 0) {
        console.log(`[holdingsCrawler] Progress: ${completed}/${funds.length}`);
      }
      await sleep(200);
    }),
  );

  await Promise.allSettled(tasks);
  console.log(`[holdingsCrawler] Complete (${completed}/${funds.length})`);
}
