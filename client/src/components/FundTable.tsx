import React, { useMemo } from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { QDIIFund, StockHolding } from '../../../shared/types';
import StatusTag from './StatusTag';

interface Props {
  funds: QDIIFund[];
  loading: boolean;
  selectedHoldingStock?: { code: string; name: string } | null;
}

function renderChange(val: number | null) {
  if (val === null || val === undefined) return '-';
  const className = val > 0 ? 'change-positive' : val < 0 ? 'change-negative' : '';
  return <span className={className} style={{ whiteSpace: 'nowrap' }}>{val > 0 ? '+' : ''}{val.toFixed(2)}%</span>;
}

function numSorter(key: keyof QDIIFund) {
  return (a: QDIIFund, b: QDIIFund) => {
    const va = a[key] as number | null;
    const vb = b[key] as number | null;
    if (va === null && vb === null) return 0;
    if (va === null) return -1;
    if (vb === null) return 1;
    return va - vb;
  };
}

function parseLimitAmount(val: string | null): number | null {
  if (!val) return null;
  const match = val.match(/([\d,.]+)\s*(万)?元/);
  if (!match) return null;
  const num = parseFloat(match[1].replace(/,/g, ''));
  return match[2] ? num * 10000 : num;
}

function getHoldingPercentage(fund: QDIIFund, stockCode: string): number | null {
  const h = fund.holdings.find((h) => h.stockCode.toUpperCase() === stockCode.toUpperCase());
  return h ? h.percentage : null;
}

const baseColumns: ColumnsType<QDIIFund> = [
  {
    title: '基金代码',
    dataIndex: 'code',
    width: 90,
    fixed: 'left',
  },
  {
    title: '基金名称',
    dataIndex: 'name',
    width: 280,
    fixed: 'left',
    ellipsis: true,
  },
  {
    title: '申购状态',
    dataIndex: 'purchaseStatus',
    width: 100,
    render: (_, record) => <StatusTag status={record.purchaseStatus} limit={record.purchaseLimit} />,
    filters: [
      { text: '开放申购', value: '开放申购' },
      { text: '限大额', value: '限大额' },
      { text: '暂停申购', value: '暂停申购' },
      { text: '封闭期', value: '封闭期' },
    ],
    onFilter: (value, record) => record.purchaseStatus === value,
  },
  {
    title: '限购金额',
    dataIndex: 'purchaseLimit',
    width: 100,
    sorter: (a, b) => {
      const va = parseLimitAmount(a.purchaseLimit);
      const vb = parseLimitAmount(b.purchaseLimit);
      if (va === null && vb === null) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      return va - vb;
    },
    render: (val, record) => {
      if (record.purchaseStatus === '开放申购') return <span style={{ color: 'var(--text-muted)' }}>无限制</span>;
      return val || '-';
    },
  },
  {
    title: '最新净值',
    dataIndex: 'nav',
    width: 90,
    sorter: numSorter('nav'),
    render: (val) => (val !== null ? val.toFixed(4) : '-'),
  },
  {
    title: '日涨跌',
    dataIndex: 'dailyChange',
    width: 80,
    sorter: numSorter('dailyChange'),
    render: renderChange,
  },
  {
    title: '近1周',
    dataIndex: 'weekChange',
    width: 80,
    sorter: numSorter('weekChange'),
    render: renderChange,
  },
  {
    title: '近1月',
    dataIndex: 'monthChange',
    width: 80,
    sorter: numSorter('monthChange'),
    render: renderChange,
  },
  {
    title: '近3月',
    dataIndex: 'threeMonthChange',
    width: 80,
    sorter: numSorter('threeMonthChange'),
    render: renderChange,
  },
  {
    title: '近1年',
    dataIndex: 'yearChange',
    width: 80,
    sorter: numSorter('yearChange'),
    render: renderChange,
  },
  {
    title: '投资区域',
    dataIndex: 'region',
    width: 90,
    render: (val) => <Tag style={{ borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}>{val}</Tag>,
  },
  {
    title: '资产类型',
    dataIndex: 'assetType',
    width: 90,
    render: (val) => <Tag style={{ borderRadius: 4, border: '1px solid var(--brand-light)', color: 'var(--brand)', background: 'var(--brand-bg)' }}>{val}</Tag>,
  },
  {
    title: '手续费',
    dataIndex: 'feeRate',
    width: 80,
    render: (val) => val || '-',
  },
];

function renderHoldings(holdings: StockHolding[]) {
  if (!holdings || holdings.length === 0) return <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>暂无持仓数据</span>;
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>前十大持仓</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {holdings.map((h, i) => (
          <div
            key={h.stockCode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              background: 'var(--bg-card)',
              fontSize: 13,
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, minWidth: 16 }}>{i + 1}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: 12 }}>{h.stockCode}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{h.stockName}</span>
            <span style={{ color: 'var(--brand)', fontWeight: 700, fontSize: 12, marginLeft: 'auto' }}>{h.percentage.toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FundTable: React.FC<Props> = ({ funds, loading, selectedHoldingStock }) => {
  const columns = useMemo(() => {
    if (!selectedHoldingStock) return baseColumns;

    const holdingCol: ColumnsType<QDIIFund>[number] = {
      title: `${selectedHoldingStock.name}占比`,
      key: 'holdingPct',
      width: 110,
      sorter: (a, b) => {
        const va = getHoldingPercentage(a, selectedHoldingStock.code);
        const vb = getHoldingPercentage(b, selectedHoldingStock.code);
        if (va === null && vb === null) return 0;
        if (va === null) return 1;
        if (vb === null) return -1;
        return va - vb;
      },
      defaultSortOrder: 'descend',
      render: (_, record) => {
        const pct = getHoldingPercentage(record, selectedHoldingStock.code);
        if (pct === null) return '-';
        return <span style={{ fontWeight: 600, color: 'var(--brand)' }}>{pct.toFixed(2)}%</span>;
      },
    };

    // Insert after 基金名称 (index 1)
    return [...baseColumns.slice(0, 2), holdingCol, ...baseColumns.slice(2)];
  }, [selectedHoldingStock]);

  return (
    <div className="table-section">
      <Table<QDIIFund>
        columns={columns}
        dataSource={funds}
        rowKey="code"
        loading={loading}
        pagination={{ pageSize: 50, showSizeChanger: true, showTotal: (total) => `共 ${total} 只基金`, style: { padding: '0 16px' } }}
        scroll={{ x: selectedHoldingStock ? 1510 : 1400 }}
        size="small"
        expandable={{
          expandedRowRender: (record) => renderHoldings(record.holdings),
          rowExpandable: (record) => record.holdings && record.holdings.length > 0,
        }}
      />
    </div>
  );
};

export default FundTable;
