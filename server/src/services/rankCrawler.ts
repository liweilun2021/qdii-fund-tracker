import axios from 'axios';
import pLimit from 'p-limit';
import { config } from '../config';
import { parseRankResponse } from '../utils/parser';
import { QDIIFund, PurchaseStatus } from '../../../shared/types';
import { classifyRegion, classifyAssetType } from '../utils/classifier';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface FundCodeEntry {
  code: string;
  name: string;
  type: string;
}

/** Phase 1: Get all QDII fund codes from fundcode_search.js */
async function fetchAllQDIICodes(): Promise<FundCodeEntry[]> {
  const resp = await axios.get('http://fund.eastmoney.com/js/fundcode_search.js', {
    headers: {
      'User-Agent': config.crawl.userAgent,
      Referer: config.crawl.referer,
    },
    timeout: 15000,
    responseType: 'text',
  });

  const entries: FundCodeEntry[] = [];
  const regex = /\["(\d+)","[^"]*","([^"]*)","([^"]*)","[^"]*"\]/g;
  let match;
  while ((match = regex.exec(resp.data)) !== null) {
    const [, code, name, type] = match;
    if (name.includes('QDII')) {
      entries.push({ code, name, type });
    }
  }

  console.log(`[rankCrawler] Found ${entries.length} QDII fund codes from fundcode_search.js`);
  return entries;
}

/** Phase 2: Get bulk NAV + performance data from rankhandler (covers ~330 funds) */
async function fetchRankData(): Promise<Map<string, QDIIFund>> {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const params = new URLSearchParams({
    op: 'ph',
    dt: 'kf',
    ft: 'all',
    rs: '',
    gs: '0',
    sc: 'zzf',
    st: 'desc',
    sd: formatDate(oneYearAgo),
    ed: formatDate(today),
    pi: '1',
    pn: '30000',
    dx: '1',
  });

  const response = await axios.get(config.crawl.rankUrl, {
    params,
    headers: {
      Referer: config.crawl.referer,
      'User-Agent': config.crawl.userAgent,
    },
    timeout: 30000,
    responseType: 'text',
  });

  const allFunds = parseRankResponse(response.data);
  const fundMap = new Map<string, QDIIFund>();
  for (const fund of allFunds) {
    if (fund.name.includes('QDII')) {
      fundMap.set(fund.code, fund);
    }
  }

  console.log(`[rankCrawler] Got rank data for ${fundMap.size} QDII funds`);
  return fundMap;
}

/** Phase 3: For missing funds, fetch NAV from the lsjz API */
async function fetchMissingFundNAV(code: string): Promise<{ nav: number | null; accNav: number | null; navDate: string; dailyChange: number | null }> {
  try {
    const resp = await axios.get('https://api.fund.eastmoney.com/f10/lsjz', {
      params: { fundCode: code, pageIndex: 1, pageSize: 1 },
      headers: {
        'User-Agent': config.crawl.userAgent,
        Referer: 'https://fundf10.eastmoney.com/',
      },
      timeout: 10000,
    });

    const list = resp.data?.Data?.LSJZList;
    if (list && list.length > 0) {
      const item = list[0];
      return {
        nav: item.DWJZ ? parseFloat(item.DWJZ) : null,
        accNav: item.LJJZ ? parseFloat(item.LJJZ) : null,
        navDate: item.FSRQ || '',
        dailyChange: item.JZZZL ? parseFloat(item.JZZZL) : null,
      };
    }
  } catch {
    // ignore
  }
  return { nav: null, accNav: null, navDate: '', dailyChange: null };
}

export async function fetchQDIIFundList(): Promise<QDIIFund[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < config.crawl.retryCount; attempt++) {
    try {
      // Phase 1: Get complete QDII fund code list
      const allCodes = await fetchAllQDIICodes();

      // Phase 2: Get bulk performance data from rankhandler
      const rankMap = await fetchRankData();

      // Phase 3: Build complete list, filling in missing funds
      const missingCodes = allCodes.filter((e) => !rankMap.has(e.code));
      console.log(`[rankCrawler] ${missingCodes.length} funds missing from rankhandler, fetching NAV individually...`);

      const limit = pLimit(5);
      let completed = 0;
      const missingFunds = await Promise.all(
        missingCodes.map((entry) =>
          limit(async () => {
            const navData = await fetchMissingFundNAV(entry.code);
            completed++;
            if (completed % 30 === 0) {
              console.log(`[rankCrawler] NAV fetch progress: ${completed}/${missingCodes.length}`);
            }
            await sleep(200);

            const fund: QDIIFund = {
              code: entry.code,
              name: entry.name,
              type: entry.type,
              navDate: navData.navDate,
              nav: navData.nav,
              accNav: navData.accNav,
              dailyChange: navData.dailyChange,
              weekChange: null,
              monthChange: null,
              threeMonthChange: null,
              sixMonthChange: null,
              yearChange: null,
              ytdChange: null,
              purchaseStatus: PurchaseStatus.OPEN,
              redemptionStatus: '',
              purchaseLimit: null,
              feeRate: null,
              region: classifyRegion(entry.name),
              assetType: classifyAssetType(entry.name),
              holdings: [],
            };
            return fund;
          }),
        ),
      );

      const allFunds = [...rankMap.values(), ...missingFunds];
      console.log(`[rankCrawler] Total QDII funds: ${allFunds.length} (${rankMap.size} from rank + ${missingFunds.length} supplemented)`);
      return allFunds;
    } catch (err) {
      lastError = err as Error;
      console.error(`[rankCrawler] Attempt ${attempt + 1} failed:`, lastError.message);
      if (attempt < config.crawl.retryCount - 1) {
        await new Promise((r) => setTimeout(r, config.crawl.retryBaseDelay * Math.pow(2, attempt)));
      }
    }
  }

  throw new Error(`[rankCrawler] All ${config.crawl.retryCount} attempts failed: ${lastError?.message}`);
}
