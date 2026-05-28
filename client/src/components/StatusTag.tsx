import React from 'react';
import { Tag, Tooltip } from 'antd';
import { PurchaseStatus } from '../../../shared/types';

const statusConfig: Record<string, { color: string }> = {
  [PurchaseStatus.OPEN]: { color: 'green' },
  [PurchaseStatus.RESTRICTED]: { color: 'orange' },
  [PurchaseStatus.SUSPENDED]: { color: 'red' },
  [PurchaseStatus.CLOSED]: { color: 'default' },
  [PurchaseStatus.EXCHANGE_ONLY]: { color: 'blue' },
};

interface Props {
  status: PurchaseStatus;
  limit?: string | null;
}

const StatusTag: React.FC<Props> = ({ status, limit }) => {
  const cfg = statusConfig[status] || { color: 'default' };

  const tag = <Tag color={cfg.color}>{status}</Tag>;

  if (status === PurchaseStatus.RESTRICTED && limit) {
    return <Tooltip title={`限购金额: ${limit}`}>{tag}</Tooltip>;
  }

  return tag;
};

export default StatusTag;
