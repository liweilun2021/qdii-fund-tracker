import React, { useState } from 'react';
import { Button, Result, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useFunds } from './hooks/useFunds';
import StatsOverview from './components/StatsOverview';
import FilterBar from './components/FilterBar';
import SearchBar from './components/SearchBar';
import HoldingFilter from './components/HoldingFilter';
import FundTable from './components/FundTable';
import { refreshData } from './api/fundApi';

const App: React.FC = () => {
  const { funds, categories, loading, error, lastUpdated, filters, updateFilter, retry } =
    useFunds();
  const [selectedHoldingStock, setSelectedHoldingStock] = useState<{ code: string; name: string } | null>(null);

  const handleRefresh = async () => {
    await refreshData();
    retry();
  };

  const handleClearHolding = () => {
    updateFilter({ holdingStock: undefined });
    setSelectedHoldingStock(null);
  };

  const handleClearAll = () => {
    updateFilter({ region: undefined, assetType: undefined, search: undefined, holdingStock: undefined });
    setSelectedHoldingStock(null);
  };

  const hasActiveFilters = filters.region || filters.assetType || filters.search || filters.holdingStock;

  return (
    <>
      <div className="app-hero">
        <div className="app-hero-inner">
          <div>
            <h1>QDII 基金限额查询</h1>
            <p>实时查询申购状态、限购金额、净值涨跌与持仓数据</p>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            size="large"
            onClick={handleRefresh}
            loading={loading}
          >
            刷新数据
          </Button>
        </div>
      </div>

      <div className="app-content">
        <StatsOverview funds={funds} loading={loading} />

        <FilterBar categories={categories} filters={filters} updateFilter={updateFilter} />

        <div className="search-section">
          <div className="search-row">
            <SearchBar value={filters.search ?? ''} updateFilter={updateFilter} />
            <HoldingFilter
              updateFilter={updateFilter}
              onHoldingStockSelect={setSelectedHoldingStock}
              selectedStock={selectedHoldingStock}
            />
          </div>
          {hasActiveFilters && (
            <div className="active-filters">
              <span className="filter-label" style={{ minWidth: 'auto' }}>当前筛选</span>
              {filters.region && (
                <Tag closable onClose={() => updateFilter({ region: undefined })}>
                  区域: {filters.region}
                </Tag>
              )}
              {filters.assetType && (
                <Tag closable onClose={() => updateFilter({ assetType: undefined })}>
                  类型: {filters.assetType}
                </Tag>
              )}
              {filters.search && (
                <Tag closable onClose={() => updateFilter({ search: undefined })}>
                  搜索: {filters.search}
                </Tag>
              )}
              {selectedHoldingStock && (
                <Tag closable onClose={handleClearHolding} color="blue">
                  持仓: {selectedHoldingStock.name}
                </Tag>
              )}
              <Button type="link" size="small" onClick={handleClearAll} style={{ color: 'var(--brand)', fontWeight: 500 }}>
                清除全部
              </Button>
            </div>
          )}
        </div>

        {error ? (
          <Result status="error" title="加载失败" subTitle={error} extra={<Button onClick={retry}>重试</Button>} />
        ) : (
          <FundTable funds={funds} loading={loading} selectedHoldingStock={selectedHoldingStock} />
        )}

        {lastUpdated && (
          <footer className="app-footer">
            数据更新时间: {new Date(lastUpdated).toLocaleString('zh-CN')}
          </footer>
        )}
      </div>
    </>
  );
};

export default App;
