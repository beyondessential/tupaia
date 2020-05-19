/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiTableBody from '@material-ui/core/TableBody';
import PropTypes from 'prop-types';
import { ExpandableTableRow, CondensedTableRow } from './TableRow';
import { tableColumnShape } from './tableColumnShape';

export const ExpandableTableBody = React.memo(({ data, columns, rowIdKey, SubComponent }) => (
  <MuiTableBody>
    {data.map((rowData, rowIndex) => {
      const key = rowData[rowIdKey] || rowData[columns[0].key];
      return (
        <ExpandableTableRow
          data={data}
          rowIndex={rowIndex}
          key={key}
          columns={columns}
          SubComponent={SubComponent}
        />
      );
    })}
  </MuiTableBody>
));

ExpandableTableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  SubComponent: PropTypes.any,
  rowIdKey: PropTypes.string.isRequired,
};

ExpandableTableBody.defaultProps = {
  SubComponent: null,
};

export const TableBody = React.memo(({ data, rowIdKey, columns, StyledTableRow }) => {
  const Row = StyledTableRow || CondensedTableRow;
  return (
    <MuiTableBody>
      {data.map(rowData => {
        const key = rowData[rowIdKey] || rowData[columns[0].key];
        return <Row rowData={rowData} key={key} columns={columns} />;
      })}
    </MuiTableBody>
  );
});

TableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  rowIdKey: PropTypes.string.isRequired,
  StyledTableRow: PropTypes.any,
};

TableBody.defaultProps = {
  StyledTableRow: null,
};

export const CondensedTableBody = React.memo(({ data, rowIdKey, columns }) => (
  <TableBody StyledTableRow={CondensedTableRow} data={data} rowIdKey={rowIdKey} columns={columns} />
));

CondensedTableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  rowIdKey: PropTypes.string.isRequired,
};
