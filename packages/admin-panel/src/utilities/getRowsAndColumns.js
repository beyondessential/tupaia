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

export const getReportPreviewColumns = ({ columns: columnKeys = [] }) => {
  const indexColumn = {
    field: 'id',
    headerName: '#',
    width: 100,
  };
  const columns = columnKeys.map(columnKey => {
    return {
      field: columnKey,
      headerName: columnKey,
      minWidth: 200,
      flex: 1,
    };
  });

  return [indexColumn, ...columns];
};

export const getReportPreviewRows = rows => {
  const rowsWithIndexColumn = rows.map((row, index) => {
    return {
      // id starts at 1, in line with report server convention
      id: index + 1,
      ...row,
    };
  });
  return rowsWithIndexColumn;
};
