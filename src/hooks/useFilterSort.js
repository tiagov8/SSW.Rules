import { useState, useEffect } from 'react';

export default function useFilterSort(filterRefs) {
  const [filters, setFilters] = useState(filterRefs);

  function ClearFilters() {
    setFilters([]);
  }

  return { filters, clear: ClearFilters, set: setFilters };
}
