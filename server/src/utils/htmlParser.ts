import { PurchaseStatus } from '../../../shared/types';

export interface FundDetailInfo {
  purchaseStatus: PurchaseStatus;
  purchaseLimit: string | null;
  redemptionStatus: string;
}

export function extractFundDetail(html: string): FundDetailInfo {
  const result: FundDetailInfo = {
    purchaseStatus: PurchaseStatus.OPEN,
    purchaseLimit: null,
    redemptionStatus: '开放赎回',
  };

  // Extract from "交易状态：" section
  // Pattern: 交易状态：<span>限大额 </span>（<span>单日累计购买上限1.00万元</span>）<span>开放赎回</span>
  const statusMatch = html.match(/交易状态[：:]\s*<span[^>]*>(.*?)<\/span>/);
  if (statusMatch) {
    const statusText = statusMatch[1].trim();
    if (statusText.includes('暂停申购')) {
      result.purchaseStatus = PurchaseStatus.SUSPENDED;
    } else if (statusText.includes('限大额')) {
      result.purchaseStatus = PurchaseStatus.RESTRICTED;
    } else if (statusText.includes('封闭')) {
      result.purchaseStatus = PurchaseStatus.CLOSED;
    } else if (statusText.includes('场内')) {
      result.purchaseStatus = PurchaseStatus.EXCHANGE_ONLY;
    } else {
      result.purchaseStatus = PurchaseStatus.OPEN;
    }
  }

  // Extract purchase limit amount
  const limitMatch = html.match(
    /(?:单日累计购买上限|限购金额|申购上限|单日限额|日累计申购限额)[^\d]*(\d[\d,.]*(?:万)?元)/
  );
  if (limitMatch) {
    result.purchaseLimit = limitMatch[1];
  }

  // Extract redemption status
  const redemptionMatch = html.match(/(开放赎回|暂停赎回|封闭期)/);
  if (redemptionMatch) {
    result.redemptionStatus = redemptionMatch[1];
  }

  return result;
}
