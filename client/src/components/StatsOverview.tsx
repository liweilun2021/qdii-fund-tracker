import React from 'react';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { QDIIFund } from '../../../shared/types';
import { PurchaseStatus } from '../../../shared/types';

interface Props {
  funds: QDIIFund[];
  loading: boolean;
}

const StatsOverview: React.FC<Props> = ({ funds, loading }) => {
  const total = funds.length;
  const open = funds.filter((f) => f.purchaseStatus === PurchaseStatus.OPEN).length;
  const restricted = funds.filter((f) => f.purchaseStatus === PurchaseStatus.RESTRICTED).length;
  const suspended = funds.filter((f) => f.purchaseStatus === PurchaseStatus.SUSPENDED).length;

  const items = [
    { label: 'QDII 基金总数', value: total, icon: <AppstoreOutlined />, theme: 'brand' as const, color: 'var(--text-primary)' },
    { label: '正常申购', value: open, icon: <CheckCircleOutlined />, theme: 'green' as const, color: 'var(--green)' },
    { label: '限制大额', value: restricted, icon: <ExclamationCircleOutlined />, theme: 'orange' as const, color: 'var(--orange)' },
    { label: '暂停申购', value: suspended, icon: <StopOutlined />, theme: 'red' as const, color: 'var(--red)' },
  ];

  return (
    <div className="stats-row">
      {items.map((item) => (
        <div key={item.label} className="stat-card">
          <div className={`stat-icon ${item.theme}`}>{item.icon}</div>
          <div className="stat-info">
            <div className="stat-label">{item.label}</div>
            <div className="stat-value" style={{ color: item.color }}>
              {loading ? '--' : item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
