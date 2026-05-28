/** 申购状态 */
export enum PurchaseStatus {
  OPEN = '开放申购',
  RESTRICTED = '限大额',
  SUSPENDED = '暂停申购',
  CLOSED = '封闭期',
  EXCHANGE_ONLY = '场内买入',
}

/** 投资区域 */
export enum MarketRegion {
  US = '美股',
  HK = '港股',
  GLOBAL = '全球',
  JAPAN = '日本',
  INDIA = '印度',
  EUROPE = '欧洲',
  ASIA_PACIFIC = '亚太',
  EMERGING = '新兴市场',
  OTHER = '其他',
}

/** 资产类型 */
export enum AssetType {
  STOCK_INDEX = '股票指数',
  BOND = '债券',
  GOLD = '黄金',
  OIL = '原油',
  COMMODITY = '商品',
  REITS = 'REITs',
  TECH = '科技',
  HEALTHCARE = '医药',
  CONSUMER = '消费',
  MIXED = '混合',
  OTHER = '其他',
}

/** 持仓股票 */
export interface StockHolding {
  stockCode: string;
  stockName: string;
  percentage: number;
}

/** QDII 基金记录 */
export interface QDIIFund {
  code: string;
  name: string;
  type: string;

  navDate: string;
  nav: number | null;
  accNav: number | null;
  dailyChange: number | null;

  weekChange: number | null;
  monthChange: number | null;
  threeMonthChange: number | null;
  sixMonthChange: number | null;
  yearChange: number | null;
  ytdChange: number | null;

  purchaseStatus: PurchaseStatus;
  redemptionStatus: string;
  purchaseLimit: string | null;
  feeRate: string | null;

  region: MarketRegion;
  assetType: AssetType;

  holdings: StockHolding[];
}

/** 基金列表 API 响应 */
export interface FundListResponse {
  funds: QDIIFund[];
  totalCount: number;
  lastUpdated: string;
}

/** 分类 API 响应 */
export interface CategoriesResponse {
  regions: { key: MarketRegion; label: string; count: number }[];
  assetTypes: { key: AssetType; label: string; count: number }[];
}
