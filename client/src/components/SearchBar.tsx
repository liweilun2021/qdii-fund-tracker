import React from 'react';
import { Input } from 'antd';
import type { Filters } from '../hooks/useFunds';

interface Props {
  value?: string;
  updateFilter: (updates: Partial<Filters>) => void;
}

const SearchBar: React.FC<Props> = ({ value, updateFilter }) => {
  return (
    <Input.Search
      placeholder="搜索基金代码或名称"
      allowClear
      size="large"
      value={value}
      onChange={(e) => updateFilter({ search: e.target.value || undefined })}
      style={{ width: 400 }}
    />
  );
};

export default SearchBar;
