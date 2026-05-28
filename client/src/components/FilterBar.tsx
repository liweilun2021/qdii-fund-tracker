import React from 'react';
import { Tag } from 'antd';
import type { CategoriesResponse } from '../../../shared/types';
import type { Filters } from '../hooks/useFunds';

interface Props {
  categories: CategoriesResponse | null;
  filters: Filters;
  updateFilter: (updates: Partial<Filters>) => void;
}

const FilterBar: React.FC<Props> = ({ categories, filters, updateFilter }) => {
  if (!categories) return null;

  const handleRegionClick = (region: string) => {
    updateFilter({ region: filters.region === region ? undefined : region });
  };

  const handleAssetTypeClick = (assetType: string) => {
    updateFilter({ assetType: filters.assetType === assetType ? undefined : assetType });
  };

  return (
    <div className="filter-section">
      <div className="filter-row">
        <span className="filter-label">投资区域</span>
        <div className="filter-tags">
          <Tag.CheckableTag
            checked={!filters.region}
            onChange={() => updateFilter({ region: undefined })}
          >
            全部
          </Tag.CheckableTag>
          {categories.regions
            .filter((r) => r.count > 0)
            .map((r) => (
              <Tag.CheckableTag
                key={r.key}
                checked={filters.region === r.key}
                onChange={() => handleRegionClick(r.key)}
              >
                {r.label} ({r.count})
              </Tag.CheckableTag>
            ))}
        </div>
      </div>
      <div className="filter-row">
        <span className="filter-label">资产类型</span>
        <div className="filter-tags">
          <Tag.CheckableTag
            checked={!filters.assetType}
            onChange={() => updateFilter({ assetType: undefined })}
          >
            全部
          </Tag.CheckableTag>
          {categories.assetTypes
            .filter((a) => a.count > 0)
            .map((a) => (
              <Tag.CheckableTag
                key={a.key}
                checked={filters.assetType === a.key}
                onChange={() => handleAssetTypeClick(a.key)}
              >
                {a.label} ({a.count})
              </Tag.CheckableTag>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
