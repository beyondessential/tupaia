/**
 * Tupaia MediTrak
 * Copyright (c) 2023 Beyond Essential Systems Pty Ltd
 */

const convertValueToPrimitive = val => {
  if (val === null) return val;
  switch (typeof val) {
    case 'object':
      return JSON.stringify(val);
    case 'function':
      return '[Function]';
    default:
      return val;
  }
};

export const getColumns = ({ columns: columnKeys = [] }) => {
  const indexColumn = {
    Header: '#',
    id: 'index',
    accessor: (_row, i) => i + 1,
  };
  const columns = columnKeys.map(columnKey => {
    return {
      Header: columnKey,
      accessor: row => convertValueToPrimitive(row[columnKey]),
    };
  });

  return [indexColumn, ...columns];
};

export const getReportPreviewDataColumns = ({ columns: columnKeys = [] }) => {
  const indexColumn = {
    headerName: '#',
    field: 'id',
    width: 50,
  };
  const columns = columnKeys.map(columnKey => {
    return {
      headerName: columnKey,
      field: columnKey,
      width: 200,
    };
  });

  return [indexColumn, ...columns];
};

export const getRowsWithIds = rows => {
  const rowsWithIds = rows.map((dataPoint, index) => ({ id: index + 1, ...dataPoint }));
  return rowsWithIds;
};
