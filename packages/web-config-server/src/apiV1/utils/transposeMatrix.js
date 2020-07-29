/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

/* take an object with columns and rows and return an object with rows and columns switched */
export const transposeMatrix = ({ columns, rows }, rowHeaderKey = 'dataElement') => {
  // Set up a row per column, we'll fill data later
  const newRows = columns.map(() => {
    return { [rowHeaderKey]: '' }; // no row headers required
  });

  // set up a column per row
  const newColumns = rows.map(row => {
    return {
      key: row[rowHeaderKey],
      title: row[rowHeaderKey],
    };
  });

  // add the old row headers as the first row, so they become column headers
  const columnHeaderRow = {};
  rows.forEach(row => {
    const rowHeader = row[rowHeaderKey];
    columnHeaderRow[rowHeader] = rowHeader;
  });
  newRows.unshift({ [rowHeaderKey]: '', ...columnHeaderRow });

  // extract the data from each row into the index corresponding to its column in the new rows
  // e.g.
  // rows = [{ dataElement: 'bcd1', idxxx: 3, idyyy: 4 }, { dataElement: 'bcd2', idxxx: 5, idyyy: 6 }]
  // newRows = [{ dataElement: 'idxxx', bcd1: 3, bcd2: 5 }, { dataElement: 'idyyy', bcd1: 4, bcd2: 6 }]
  rows.forEach(row => {
    const rowHeader = row[rowHeaderKey];
    columns.forEach(({ key: columnKey }, index) => {
      newRows[index][rowHeader] = row[columnKey];
    });
  });

  return {
    columns: newColumns,
    rows: newRows,
  };
};
