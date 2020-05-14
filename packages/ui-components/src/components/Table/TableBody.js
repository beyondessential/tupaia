/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiTableBody from '@material-ui/core/TableBody';
import PropTypes from 'prop-types';
import { TableRow, ExpandableTableRow } from './TableRow';
import { tableColumnShape } from './tableColumnShape';

export const TableBody = React.memo(({ data, columns, rowIdKey, SubComponent }) => (
  <MuiTableBody>
    {data.map(rowData => {
      const key = rowData[rowIdKey] || rowData[columns[0].key];
      return (
        <ExpandableTableRow
          rowData={rowData}
          key={key}
          columns={columns}
          SubComponent={SubComponent}
        />
      );
    })}
  </MuiTableBody>
));

TableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  SubComponent: PropTypes.any,
  rowIdKey: PropTypes.string.isRequired,
};

TableBody.defaultProps = {
  SubComponent: null,
};

export const CondensedTableBody = React.memo(({ data, rowIdKey, columns }) => (
  <MuiTableBody>
    {data.map(rowData => {
      const key = rowData[rowIdKey] || rowData[columns[0].key];
      return <TableRow rowData={rowData} key={key} columns={columns} variant="condensed" />;
    })}
  </MuiTableBody>
));

CondensedTableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  rowIdKey: PropTypes.string.isRequired,
};
