/**
 * Tupaia MediTrak
 * Copyright (c) 2023 Beyond Essential Systems Pty Ltd
 */

export const getColumns = ({ columns: columnKeys = [] }) => {
  const indexColumn = {
    Header: '#',
    id: 'index',
    accessor: (_row, i) => i + 1,
  };
  const columns = columnKeys.map(columnKey => {
    return {
      Header: columnKey,
      accessor: row => row[columnKey],
    };
  });

  return [indexColumn, ...columns];
};
