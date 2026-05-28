import React, { useState, useEffect, useMemo } from 'react';
import { AutoComplete, Input } from 'antd';
import { SearchOutlined, FireOutlined } from '@ant-design/icons';
import { fetchHoldingStocks, type HoldingStockItem } from '../api/fundApi';
import type { Filters } from '../hooks/useFunds';

interface Props {
  updateFilter: (updates: Partial<Filters>) => void;
  onHoldingStockSelect: (stock: { code: string; name: string } | null) => void;
  selectedStock: { code: string; name: string } | null;
}

function buildOption(s: HoldingStockItem) {
  return {
    value: s.code,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <b style={{ fontFamily: 'var(--font-mono)', minWidth: 52, display: 'inline-block' }}>{s.code}</b>
        <span style={{ flex: 1 }}>{s.name}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.fundCount}只基金</span>
      </span>
    ),
  };
}

const HoldingFilter: React.FC<Props> = ({ updateFilter, onHoldingStockSelect, selectedStock }) => {
  const [allStocks, setAllStocks] = useState<HoldingStockItem[]>([]);
  const [options, setOptions] = useState<{ value: string; label: React.ReactNode }[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    fetchHoldingStocks()
      .then(setAllStocks)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedStock) {
      setInputValue('');
      setOptions([]);
    }
  }, [selectedStock]);

  const hotOptions = useMemo(() => {
    if (allStocks.length === 0) return [];
    return [
      {
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-dim)', fontSize: 12, fontWeight: 600 }}>
            <FireOutlined style={{ color: 'var(--orange)' }} /> 热门持仓
          </span>
        ),
        options: allStocks.slice(0, 10).map(buildOption),
      },
    ];
  }, [allStocks]);

  const handleSearch = (text: string) => {
    setInputValue(text);
    if (!text) {
      setOptions([]);
      return;
    }
    const kw = text.toUpperCase();
    const matched = allStocks
      .filter((s) => s.code.toUpperCase().includes(kw) || s.name.includes(text))
      .slice(0, 20);
    setOptions(matched.map(buildOption));
  };

  const handleSelect = (value: string) => {
    const stock = allStocks.find((s) => s.code === value);
    if (stock) {
      setInputValue(`${stock.code} ${stock.name}`);
      updateFilter({ holdingStock: stock.code });
      onHoldingStockSelect({ code: stock.code, name: stock.name });
    }
  };

  const handleClear = () => {
    setInputValue('');
    setOptions([]);
    updateFilter({ holdingStock: undefined });
    onHoldingStockSelect(null);
  };

  const displayOptions = inputValue ? options : hotOptions;

  return (
    <AutoComplete
      style={{ width: 320 }}
      size="large"
      value={inputValue}
      options={displayOptions}
      onSearch={handleSearch}
      onSelect={handleSelect}
      onClear={handleClear}
      allowClear
    >
      <Input placeholder="按持仓股票筛选，如 NVDA、腾讯" suffix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />} size="large" />
    </AutoComplete>
  );
};

export default HoldingFilter;
