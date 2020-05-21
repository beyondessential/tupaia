/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiTableBody from '@material-ui/core/TableBody';
import PropTypes from 'prop-types';
import { TableRow as TableRowComponent, CondensedTableRow, ExpandableTableRow } from './TableRow';
import { tableColumnShape } from './tableColumnShape';

export const ExpandableTableBody = React.memo(
  ({ data, columns, rowIdKey, TableRow, SubComponent }) => (
    <MuiTableBody>
      {data.map((rowData, rowIndex) => {
        const key = rowData[rowIdKey] || rowData[columns[0].key];
        return (
          <TableRow
            data={data}
            rowIndex={rowIndex}
            key={key}
            columns={columns}
            SubComponent={SubComponent}
          />
        );
      })}
    </MuiTableBody>
  ),
);

ExpandableTableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  TableRow: PropTypes.any,
  SubComponent: PropTypes.any,
  rowIdKey: PropTypes.string.isRequired,
};

ExpandableTableBody.defaultProps = {
  SubComponent: null,
  TableRow: ExpandableTableRow,
};

export const TableBody = React.memo(({ data, columns, rowIdKey, TableRow }) => {
  return (
    <MuiTableBody>
      {data.map((rowData, rowIndex) => {
        const key = rowData[rowIdKey] || rowData[columns[0].key];
        return <TableRow columns={columns} data={data} rowIndex={rowIndex} key={key} />;
      })}
    </MuiTableBody>
  );
});

TableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
  TableRow: PropTypes.any,
  rowIdKey: PropTypes.string.isRequired,
};

TableBody.defaultProps = {
  TableRow: TableRowComponent,
};

export const CondensedTableBody = React.memo(({ data, rowIdKey, columns }) => (
  <TableBody TableRow={CondensedTableRow} data={data} rowIdKey={rowIdKey} columns={columns} />
));

CondensedTableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
  rowIdKey: PropTypes.string.isRequired,
};
