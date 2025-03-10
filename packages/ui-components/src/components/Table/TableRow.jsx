import React from 'react';
import styled from 'styled-components';
import MuiTableCell from '@material-ui/core/TableCell';
import PropTypes from 'prop-types';
import MuiTableRow from '@material-ui/core/TableRow';
import { tableColumnShape } from './tableColumnShape';

export const TableCell = styled(MuiTableCell)`
  height: 70px;
  padding: 0.4rem 0.3rem;
  font-size: 0.9375rem;
  line-height: 1rem;
  min-width: 4rem;
  color: ${props => props.theme.palette.text.secondary};

  &:first-child {
    padding-left: 1.25rem;
  }
`;

export const TableRowCells = React.memo(({ columns, rowData, ExpandButton }) => {
  return columns.map(
    ({ key, accessor, CellComponent, width = null, align = 'center', cellColor }, index) => {
      const value = accessor ? accessor(rowData) : rowData[key];
      const displayValue = value === 0 ? '0' : value;
      const backgroundColor = typeof cellColor === 'function' ? cellColor(rowData) : cellColor;
      return (
        <TableCell
          background={backgroundColor}
          key={key}
          style={{ width, position: 'relative' }}
          align={align}
        >
          {CellComponent ? (
            <CellComponent {...rowData} displayValue={value} columnKey={key} />
          ) : (
            displayValue
          )}
          {index === columns.length - 1 && ExpandButton}
        </TableCell>
      );
    },
  );
});

TableRowCells.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  rowData: PropTypes.object.isRequired,
  ExpandButton: PropTypes.node,
};

TableRowCells.defaultProps = {
  ExpandButton: null,
};

const rowHoverColor = '#F1F1F1';

export const StyledTableRow = styled(MuiTableRow)`
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};

  &:hover {
    background: ${rowHoverColor};
  }
`;

export const TableRow = React.memo(({ columns, rowData, className, onRowClick }) => (
  <StyledTableRow className={className} onClick={onRowClick && (e => onRowClick(e, rowData))}>
    <TableRowCells columns={columns} rowData={rowData} />
  </StyledTableRow>
));

TableRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  rowData: PropTypes.object.isRequired,
  className: PropTypes.string,
  onRowClick: PropTypes.func,
};

TableRow.defaultProps = {
  className: '',
  onRowClick: () => {},
};

const condensedRowBackgroundColor = '#EFEFEF';

export const CondensedTableRow = styled(TableRow)`
  &:nth-of-type(even) {
    background: ${condensedRowBackgroundColor};

    &.MuiTableRow-root:hover {
      background: ${condensedRowBackgroundColor};
    }
  }

  .MuiTableCell-root {
    height: 60px;
    border: none;
  }
`;
