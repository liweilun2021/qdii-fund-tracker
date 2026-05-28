import React from 'react';
import { Tooltip } from 'antd';
import { PurchaseStatus } from '../../../shared/types';

const statusStyles: Record<string, { bg: string; color: string }> = {
  [PurchaseStatus.OPEN]: { bg: 'var(--green-bg)', color: 'var(--green)' },
  [PurchaseStatus.RESTRICTED]: { bg: 'var(--orange-bg)', color: 'var(--orange)' },
  [PurchaseStatus.SUSPENDED]: { bg: 'var(--red-bg)', color: 'var(--red)' },
  [PurchaseStatus.CLOSED]: { bg: 'var(--bg-surface)', color: 'var(--text-dim)' },
  [PurchaseStatus.EXCHANGE_ONLY]: { bg: 'var(--brand-bg)', color: 'var(--brand)' },
};

interface Props {
  status: PurchaseStatus;
  limit?: string | null;
}

const StatusTag: React.FC<Props> = ({ status, limit }) => {
  const style = statusStyles[status] || statusStyles[PurchaseStatus.CLOSED];

  const tag = (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '20px',
        backgroundColor: style.bg,
        color: style.color,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );

  if (status === PurchaseStatus.RESTRICTED && limit) {
    return <Tooltip title={`限购金额: ${limit}`}>{tag}</Tooltip>;
  }

  return tag;
};

export default StatusTag;
