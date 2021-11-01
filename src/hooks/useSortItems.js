import { useState, useEffect } from 'react';

export default function useSortItems(filter, select, input) {
  const [value, setValue] = useState({
    filter: filter,
    select: select,
    input: input,
  });

  return value;
}
