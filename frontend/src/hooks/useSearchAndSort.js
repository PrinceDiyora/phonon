import { useState, useMemo } from 'react';

export function useSearchAndSort(data, searchFields = []) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const resolvePath = (obj, path) => path.split('.').reduce((o, p) => (o ? o[p] : null), obj);

  const processedData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => {
        return searchFields.some(field => {
          const val = resolvePath(item, field);
          if (val == null) return false;
          return String(val).toLowerCase().includes(lowerSearch);
        });
      });
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = resolvePath(a, sortConfig.key);
        const bVal = resolvePath(b, sortConfig.key);
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    processedData
  };
}
