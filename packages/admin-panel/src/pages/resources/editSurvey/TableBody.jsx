/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { TableBody as MuiTableBody, TableRow } from '@material-ui/core';
import { Cell, RowHeaderCell } from './Cells';

// This needs to be memoized to prevent re-rendering when the column is being resized
const TableCell = memo(({ cell, index }) => {
  const props = cell.getCellProps();

  return (
    <Cell {...props} as={index === 0 ? RowHeaderCell : undefined}>
      {cell.render('Cell')}
    </Cell>
  );
});

TableCell.propTypes = {
  cell: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

const Row = memo(({ row, prepareRow }) => {
  prepareRow(row);
  const rowProps = row.getRowProps();

  return (
    <TableRow {...rowProps}>
      {row.cells.map((cell, i) => (
        <TableCell key={cell.id} cell={cell} index={i} />
      ))}
    </TableRow>
  );
});

Row.propTypes = {
  row: PropTypes.object.isRequired,
  prepareRow: PropTypes.func.isRequired,
};

// This needs to be memoized to prevent re-rendering when the column is being resized
export const TableBody = memo(
  ({ getTableBodyProps, prepareRow, rows, columnWidths }) => {
    return (
      <MuiTableBody {...getTableBodyProps()}>
        {rows.map(row => (
          <Row key={row.id} row={row} prepareRow={prepareRow} columnWidths={columnWidths} />
        ))}
      </MuiTableBody>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.columnWidths === nextProps.columnWidths;
  },
);

TableBody.propTypes = {
  rows: PropTypes.array.isRequired,
  getTableBodyProps: PropTypes.func.isRequired,
  prepareRow: PropTypes.func.isRequired,
  columnWidths: PropTypes.array.isRequired,
};
