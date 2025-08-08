import { useCallback, useState } from 'react';
import { getSortByKey } from '@tupaia/utils';

const DIRECTION = {
  ASC: 'asc',
  DESC: 'desc',
};

const toggleOrder = order => (order === DIRECTION.DESC ? DIRECTION.ASC : DIRECTION.DESC);

/**
 * @param {string | undefined} initialOrderBy (Initial) key of a sorted column
 * @param {'asc' | 'desc'} initialOrder
 */
export const useTableSorting = (data, initialOrderBy, initialOrder = DIRECTION.ASC) => {
  const [orderBy, setOrderBy] = useState(initialOrderBy);
  const [order, setOrder] = useState(initialOrder);

  const ascending = order !== DIRECTION.DESC;
  const sortedData = [...data].sort(getSortByKey(orderBy, { ascending }));

  const sortColumn = useCallback(
    columnKey => {
      const newOrder = columnKey === orderBy ? toggleOrder(order) : DIRECTION.ASC;
      setOrderBy(columnKey);
      setOrder(newOrder);
    },
    [orderBy, order],
  );

  return { sortedData, order, orderBy, sortColumn };
};
