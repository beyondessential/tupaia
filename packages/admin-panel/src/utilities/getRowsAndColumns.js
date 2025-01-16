export const getColumns = ({ columns: columnKeys = [] }) => {
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

export const getRows = ({ rows = [] }) => {
  const rowsWithIndexColumn = rows.map((row, index) => {
    return {
      // id starts at 1, in line with report server convention
      id: index + 1,
      ...row,
    };
  });
  return rowsWithIndexColumn;
};
