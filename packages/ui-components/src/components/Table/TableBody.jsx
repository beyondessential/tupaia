import React from 'react';
import styled from 'styled-components';
import MuiTableBody from '@material-ui/core/TableBody';
import PropTypes from 'prop-types';
import { CondensedTableRow, TableRow as TableRowComponent } from './TableRow';
import { tableColumnShape } from './tableColumnShape';

const StyledTableBody = styled(MuiTableBody)`
  pointer-events: ${props => (props.disabled ? 'none' : 'initial')};
  opacity: ${props => (props.disabled ? '0.5' : 1)};
`;

export const TableBody = React.memo(
  ({ data, columns, rowIdKey, TableRow, onRowClick, isFetching, className }) => (
    <StyledTableBody disabled={isFetching} className={className}>
      {data.map((rowData, rowIndex) => {
        const key = rowData[rowIdKey] || rowData[columns[0].key];
        return (
          <TableRow
            rowData={rowData}
            rowIndex={rowIndex}
            key={key}
            columns={columns}
            onRowClick={onRowClick}
          />
        );
      })}
    </StyledTableBody>
  ),
);

TableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  TableRow: PropTypes.any,
  isFetching: PropTypes.bool,
  rowIdKey: PropTypes.string.isRequired,
  onRowClick: PropTypes.func,
  className: PropTypes.string,
};

TableBody.defaultProps = {
  TableRow: TableRowComponent,
  isFetching: false,
  onRowClick: null,
  className: '',
};

export const CondensedTableBody = React.memo(({ data, rowIdKey, columns }) => (
  <TableBody TableRow={CondensedTableRow} data={data} rowIdKey={rowIdKey} columns={columns} />
));

CondensedTableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
  rowIdKey: PropTypes.string.isRequired,
};
