import React, { useState, useEffect } from 'react';
import { AutoComplete, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { fetchHoldingStocks, type HoldingStockItem } from '../api/fundApi';
import type { Filters } from '../hooks/useFunds';

interface Props {
  updateFilter: (updates: Partial<Filters>) => void;
  onHoldingStockSelect: (stock: { code: string; name: string } | null) => void;
  selectedStock: { code: string; name: string } | null;
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

  // Sync input when parent clears the selection
  useEffect(() => {
    if (!selectedStock) {
      setInputValue('');
      setOptions([]);
    }
  }, [selectedStock]);

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
    setOptions(
      matched.map((s) => ({
        value: s.code,
        label: (
          <span>
            <b>{s.code}</b> {s.name}{' '}
            <span style={{ color: '#999' }}>({s.fundCount}只基金持有)</span>
          </span>
        ),
      })),
    );
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

  return (
    <AutoComplete
      style={{ width: 300 }}
      value={inputValue}
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      onClear={handleClear}
      allowClear
      placeholder="按持仓股票筛选，如 NVDA、腾讯"
    >
      <Input prefix={<SearchOutlined />} size="large" />
    </AutoComplete>
  );
};

export default HoldingFilter;
