import { Router, Request, Response } from 'express';
import { getFunds, refreshFunds } from '../services/crawlerService';
import { MarketRegion, AssetType, QDIIFund, CategoriesResponse } from '../../../shared/types';

const router = Router();

router.get('/funds', async (req: Request, res: Response) => {
  try {
    const { region, assetType, search, status, holdingStock } = req.query;
    const { funds, lastUpdated } = await getFunds();

    let filtered = funds;

    if (region && region !== '全部') {
      filtered = filtered.filter((f) => f.region === region);
    }
    if (assetType && assetType !== '全部') {
      filtered = filtered.filter((f) => f.assetType === assetType);
    }
    if (status) {
      filtered = filtered.filter((f) => f.purchaseStatus === status);
    }
    if (search) {
      const keyword = (search as string).toLowerCase();
      filtered = filtered.filter(
        (f) => f.code.includes(keyword) || f.name.toLowerCase().includes(keyword),
      );
    }
    if (holdingStock) {
      const kw = (holdingStock as string).toUpperCase();
      filtered = filtered.filter((f) =>
        f.holdings.some(
          (h) => h.stockCode.toUpperCase() === kw,
        ),
      );
    }

    res.json({ funds: filtered, totalCount: filtered.length, lastUpdated });
  } catch (err) {
    console.error('[API] /funds error:', err);
    res.status(500).json({ error: 'Failed to fetch fund data' });
  }
});

router.get('/funds/categories', async (_req: Request, res: Response) => {
  try {
    const { funds } = await getFunds();

    const regionCounts = new Map<MarketRegion, number>();
    const assetTypeCounts = new Map<AssetType, number>();

    for (const fund of funds) {
      regionCounts.set(fund.region, (regionCounts.get(fund.region) || 0) + 1);
      assetTypeCounts.set(fund.assetType, (assetTypeCounts.get(fund.assetType) || 0) + 1);
    }

    const response: CategoriesResponse = {
      regions: Object.values(MarketRegion).map((r) => ({
        key: r,
        label: r,
        count: regionCounts.get(r) || 0,
      })),
      assetTypes: Object.values(AssetType).map((a) => ({
        key: a,
        label: a,
        count: assetTypeCounts.get(a) || 0,
      })),
    };

    res.json(response);
  } catch (err) {
    console.error('[API] /funds/categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/holdings/stocks', async (_req: Request, res: Response) => {
  try {
    const { funds } = await getFunds();
    const stockMap = new Map<string, { code: string; name: string; fundCount: number }>();

    for (const fund of funds) {
      for (const h of fund.holdings) {
        const key = h.stockCode.toUpperCase();
        const existing = stockMap.get(key);
        if (existing) {
          existing.fundCount++;
        } else {
          stockMap.set(key, { code: h.stockCode, name: h.stockName, fundCount: 1 });
        }
      }
    }

    const stocks = [...stockMap.values()].sort((a, b) => b.fundCount - a.fundCount);
    res.json({ stocks });
  } catch (err) {
    console.error('[API] /holdings/stocks error:', err);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

router.post('/funds/refresh', async (_req: Request, res: Response) => {
  try {
    await refreshFunds();
    res.json({ success: true, message: 'Refresh initiated' });
  } catch (err) {
    console.error('[API] /funds/refresh error:', err);
    res.status(500).json({ error: 'Failed to refresh data' });
  }
});

export default router;
