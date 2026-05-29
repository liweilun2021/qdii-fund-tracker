import { QDIIFund, PurchaseStatus } from '../../../shared/types';
import { classifyRegion, classifyAssetType } from './classifier';

function parseNum(val: string): number | null {
  if (!val || val === '') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

export function parseRankResponse(responseText: string): QDIIFund[] {
  // Response format: var rankData = {datas:["...","...",...],allRecords:N,...}
  const datasMatch = responseText.match(/datas:\[([\s\S]*?)\],allRecords/);
  if (!datasMatch) {
    console.error('Failed to extract datas from rankhandler response');
    return [];
  }

  const rawDatas = datasMatch[1];
  // Each record is a quoted string separated by commas between records
  const records = rawDatas.match(/"([^"]*)"/g);
  if (!records) return [];

  const funds: QDIIFund[] = [];

  for (const record of records) {
    // Remove surrounding quotes
    const raw = record.slice(1, -1);
    const fields = raw.split(',');

    if (fields.length < 20) continue;

    // rankhandler.aspx field layout:
    // 0=code, 1=name, 2=pinyin, 3=navDate, 4=nav, 5=accNav,
    // 6=dailyChange%, 7=weekChange%, 8=monthChange%, 9=3monthChange%,
    // 10=6monthChange%, 11=1yearChange%, 12=2yearChange%, 13=3yearChange%,
    // 14=ytdChange%, 15=sinceInceptionChange%, 16=inceptionDate,
    // 17=flag, 18=totalReturn, 19=originalFeeRate, 20=discountedFeeRate, ...

    const name = fields[1];
    const fund: QDIIFund = {
      code: fields[0],
      name,
      type: '',

      navDate: fields[3],
      nav: parseNum(fields[4]),
      accNav: parseNum(fields[5]),
      dailyChange: parseNum(fields[6]),

      weekChange: parseNum(fields[7]),
      monthChange: parseNum(fields[8]),
      threeMonthChange: parseNum(fields[9]),
      sixMonthChange: parseNum(fields[10]),
      yearChange: parseNum(fields[11]),
      ytdChange: parseNum(fields[14]),

      // Purchase status will be enriched from detail page scraping
      purchaseStatus: PurchaseStatus.OPEN,
      redemptionStatus: '',
      purchaseLimit: null,
      feeRate: fields[20] || fields[19] || null,

      region: classifyRegion(name),
      assetType: classifyAssetType(name),

      holdings: [],
      holdingsDate: '',
    };

    funds.push(fund);
  }

  return funds;
}
