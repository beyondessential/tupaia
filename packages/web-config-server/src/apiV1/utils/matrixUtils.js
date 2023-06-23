import { getSortByKey } from '@tupaia/utils';

/* take an object with columns and rows and return an object with rows and columns switched */
export const transposeMatrix = ({ columns, rows }, rowHeaderKey = 'dataElement') => {
  const uniqueRowHeader = (text, prefix) => `${prefix}-${text}`;
  // Set up a row per column, we'll fill data later
  const newRows = columns.map(() => {
    return { [rowHeaderKey]: '' }; // no row headers required
  });

  // set up a column per row
  const newColumns = rows.map((row, rowIndex) => {
    // make column key unique (rows may not come with unique headers)
    return {
      key: uniqueRowHeader(row[rowHeaderKey], rowIndex),
      title: row[rowHeaderKey],
    };
  });

  // add the old row headers as the first row, so they become column headers
  const columnHeaderRow = {};
  rows.forEach((row, rowIndex) => {
    const newColumnKey = uniqueRowHeader(row[rowHeaderKey], rowIndex);
    const newColumnTitle = row[rowHeaderKey];
    columnHeaderRow[newColumnKey] = newColumnTitle;
  });
  newRows.unshift({ [rowHeaderKey]: '', ...columnHeaderRow });

  // extract the data from each row into the index corresponding to its column in the new rows
  // e.g.
  // rows = [{ dataElement: 'bcd1', idxxx: 3, idyyy: 4 }, { dataElement: 'bcd2', idxxx: 5, idyyy: 6 }]
  // newRows = [{ dataElement: 'idxxx', bcd1: 3, bcd2: 5 }, { dataElement: 'idyyy', bcd1: 4, bcd2: 6 }]
  rows.forEach((row, rowIndex) => {
    const rowHeader = uniqueRowHeader(row[rowHeaderKey], rowIndex);
    columns.forEach(({ key: columnKey }, index) => {
      newRows[index][rowHeader] = row[columnKey];
    });
  });

  return {
    columns: newColumns,
    rows: newRows,
  };
};

// Given table data of rows and columns and an array of column headers to sort by
// note that the column header may not exist in table data
// return table data with rows sorted by those columns in order specified
export const sortByColumns = ({ columns, rows }, columnsToSortBy = []) => {
  // No columns specified we're done return data
  if (columnsToSortBy.length < 1) return { columns, rows };

  const getRecursiveRowsOnKeysSorter = keyArray => {
    const resetKeys = () => [...keyArray];

    const recursivelyCompareValuesAscending = (a, b, keys = resetKeys()) => {
      if (keys.length < 1) return 0;
      const currentKey = keys[0];
      if (!b[currentKey]) return -1;
      if (!a[currentKey]) return 1;
      const sorter = getSortByKey(currentKey);
      if (sorter(a, b) > 0) return 1;
      if (sorter(a, b) < 0) return -1;
      return keys.length > 0 ? recursivelyCompareValuesAscending(a, b, keys.slice(1)) : 0;
    };

    return recursivelyCompareValuesAscending;
  };

  // sanitise the column list and find keys
  const columnKeysToSortBy = columnsToSortBy
    .map(sortHeader => {
      const columnFound = columns.find(column => column.title === sortHeader[0]);
      return columnFound ? columnFound.key : '';
    })
    .filter(key => key !== '');
  const sortedRows = rows.sort(getRecursiveRowsOnKeysSorter(columnKeysToSortBy));
  return { columns, rows: [...sortedRows] };
};
