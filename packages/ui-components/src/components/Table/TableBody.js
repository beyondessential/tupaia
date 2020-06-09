/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiTableBody from '@material-ui/core/TableBody';
import PropTypes from 'prop-types';
import { CondensedTableRow, TableRow as TableRowComponent } from './TableRow';
import { tableColumnShape } from './tableColumnShape';

export const TableBody = React.memo(({ data, columns, rowIdKey, TableRow }) => (
  <MuiTableBody>
    {data.map((rowData, rowIndex) => {
      const key = rowData[rowIdKey] || rowData[columns[0].key];
      return <TableRow rowData={rowData} rowIndex={rowIndex} key={key} columns={columns} />;
    })}
  </MuiTableBody>
));

TableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
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
