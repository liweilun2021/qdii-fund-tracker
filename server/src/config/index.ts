export const config = {
  port: 3001,
  cacheTTL: 30 * 60 * 1000, // 30 minutes
  crawl: {
    rankUrl: 'http://fund.eastmoney.com/data/rankhandler.aspx',
    detailBaseUrl: 'https://fundf10.eastmoney.com/jbgk_',
    referer: 'http://fund.eastmoney.com/data/fundranking.html',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    detailConcurrency: 3,
    detailDelay: 300,
    retryCount: 3,
    retryBaseDelay: 1000,
  },
};
