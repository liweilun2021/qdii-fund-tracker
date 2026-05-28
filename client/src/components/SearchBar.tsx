import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { Filters } from '../hooks/useFunds';

interface Props {
  value?: string;
  updateFilter: (updates: Partial<Filters>) => void;
}

const SearchBar: React.FC<Props> = ({ value, updateFilter }) => {
  return (
    <Input
      placeholder="搜索基金代码或名称"
      allowClear
      size="large"
      value={value}
      suffix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
      onChange={(e) => updateFilter({ search: e.target.value || undefined })}
      style={{ width: 320 }}
    />
  );
};

export default SearchBar;
