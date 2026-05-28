import { MarketRegion, AssetType } from '../../../shared/types';

const regionRules: { region: MarketRegion; patterns: RegExp }[] = [
  { region: MarketRegion.US, patterns: /纳斯达克|纳指|标普|美国|美股|道琼斯|S&P|标准普尔/ },
  { region: MarketRegion.HK, patterns: /恒生|港股|港中小|香港|中国互联|H股|中华/ },
  { region: MarketRegion.JAPAN, patterns: /日本|日经|东证/ },
  { region: MarketRegion.INDIA, patterns: /印度/ },
  { region: MarketRegion.EUROPE, patterns: /欧洲|德国|法国|英国|欧元|DAX|STOXX/ },
  { region: MarketRegion.ASIA_PACIFIC, patterns: /亚太|亚洲|东南亚|越南|韩国/ },
  { region: MarketRegion.EMERGING, patterns: /新兴市场/ },
  { region: MarketRegion.GLOBAL, patterns: /全球|世界|国际|海外/ },
];

const assetTypeRules: { assetType: AssetType; patterns: RegExp }[] = [
  { assetType: AssetType.GOLD, patterns: /黄金|Gold|贵金属/i },
  { assetType: AssetType.OIL, patterns: /原油|油气|石油|能源/ },
  { assetType: AssetType.COMMODITY, patterns: /商品|大宗|有色金属|白银/ },
  { assetType: AssetType.REITS, patterns: /REITs|房地产|不动产/i },
  { assetType: AssetType.BOND, patterns: /债|利率|美元债|信用/ },
  { assetType: AssetType.TECH, patterns: /科技|互联网|半导体|芯片|人工智能|AI|信息技术/i },
  { assetType: AssetType.HEALTHCARE, patterns: /医药|医疗|健康|生物/ },
  { assetType: AssetType.CONSUMER, patterns: /消费/ },
  { assetType: AssetType.STOCK_INDEX, patterns: /指数|ETF|纳斯达克|标普|恒生|日经|DAX/i },
  { assetType: AssetType.MIXED, patterns: /混合|灵活配置|精选|优选/ },
];

export function classifyRegion(name: string): MarketRegion {
  for (const rule of regionRules) {
    if (rule.patterns.test(name)) return rule.region;
  }
  return MarketRegion.OTHER;
}

export function classifyAssetType(name: string): AssetType {
  for (const rule of assetTypeRules) {
    if (rule.patterns.test(name)) return rule.assetType;
  }
  return AssetType.OTHER;
}
